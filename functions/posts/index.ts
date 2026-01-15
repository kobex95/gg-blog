import { getDbClient, getEnvFromContext } from '../../src/lib/db';
import { getUserFromToken } from '../../src/lib/auth';

export async function onRequestGet({ request, env }: { request: Request; env?: any }) {
  try {
    console.log('开始获取文章列表...');

    const { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } = getEnvFromContext(env);
    const db = getDbClient(TURSO_DATABASE_URL, TURSO_AUTH_TOKEN);

    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    console.log('查询参数:', { search, page, limit, offset });

    let sql = `
      SELECT
        p.*,
        u.username as author_name,
        u.avatar_url as author_avatar,
        c.name as category_name
      FROM posts p
      LEFT JOIN profiles u ON p.author_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.published = 1
    `;

    const args: any[] = [];

    if (search) {
      sql += ' AND p.title LIKE ?';
      args.push(`%${search}%`);
    }

    sql += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    args.push(limit, offset);

    console.log('执行 SQL 查询:', sql);
    console.log('查询参数:', args);

    const postsResult = await db.execute({ sql, args });
    console.log('查询结果行数:', postsResult.rows.length);

    // 获取总数
    let countSql = 'SELECT COUNT(*) as total FROM posts WHERE published = 1';
    const countArgs: any[] = [];

    if (search) {
      countSql += ' AND title LIKE ?';
      countArgs.push(`%${search}%`);
    }

    const countResult = await db.execute({ sql: countSql, args: countArgs });
    const total = countResult.rows[0].total as number;
    console.log('总数:', total);

    // 为每个文章获取标签
    const postIds = postsResult.rows.map((p: any) => p.id);

    let tagsResult: any = { rows: [] };
    if (postIds.length > 0) {
      tagsResult = await db.execute({
        sql: `
          SELECT pt.post_id, t.name as tag_name
          FROM post_tags pt
          JOIN tags t ON pt.tag_id = t.id
          WHERE pt.post_id IN (${postIds.map(() => '?').join(',')})
        `,
        args: postIds,
      });
    }

    // 组合标签到文章
    const postsWithTags = postsResult.rows.map((post: any) => {
      const postTags = tagsResult.rows
        .filter((pt: any) => pt.post_id === post.id)
        .map((pt: any) => pt.tag_name);

      return {
        ...post,
        tags: postTags.join(','),
        category: post.category_name || null,
        author: {
          username: post.author_name,
          avatar_url: post.author_avatar,
        },
      };
    });

    console.log('返回文章数:', postsWithTags.length);

    return new Response(JSON.stringify({
      success: true,
      posts: postsWithTags,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('获取文章列表失败:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: '获取文章列表失败',
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function onRequestPost({ request, env }: { request: Request; env?: any }) {
  try {
    const { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } = getEnvFromContext(env);
    const db = getDbClient(TURSO_DATABASE_URL, TURSO_AUTH_TOKEN);

    const { title, content, excerpt, category_id, tags, published } =
      await request.json();

    // 生成 slug
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    // 从请求中获取用户（简化版）
    const authHeader = request.headers.get('Authorization');
    const user = await getUserFromToken(authHeader, db);

    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: '未授权',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 创建文章
    const result = await db.execute({
      sql: `
        INSERT INTO posts (title, slug, content, excerpt, category_id, author_id, published, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        title,
        slug,
        content,
        excerpt || null,
        category_id || null,
        user.id,
        published ? 1 : 0,
        new Date().toISOString(),
        new Date().toISOString(),
      ],
    });

    const postId = (result as any).meta?.last_row_id || (result as any).rows[0]?.id;

    // 处理标签
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        // 查找或创建标签
        const tagResult = await db.execute({
          sql: 'SELECT id FROM tags WHERE name = ?',
          args: [tagName],
        });

        let tagId;
        if (tagResult.rows.length > 0) {
          tagId = tagResult.rows[0].id;
        } else {
          const tagSlug = tagName
            .toLowerCase()
            .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
            .replace(/-+/g, '-');

          const newTagResult = await db.execute({
            sql: 'INSERT INTO tags (name, slug) VALUES (?, ?)',
            args: [tagName, tagSlug],
          });
          tagId = (newTagResult as any).meta?.last_row_id || (newTagResult as any).rows[0]?.id;
        }

        // 关联文章和标签
        if (tagId) {
          await db.execute({
            sql: 'INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)',
            args: [postId, tagId],
          });
        }
      }
    }

    // 获取创建的文章
    const postResult = await db.execute({
      sql: `
        SELECT
          p.*,
          u.username as author_name,
          u.avatar_url as author_avatar,
          c.name as category_name
        FROM posts p
        LEFT JOIN profiles u ON p.author_id = u.id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = ?
      `,
      args: [postId],
    });

    return new Response(
      JSON.stringify({
        success: true,
        post: {
          ...postResult.rows[0],
          category: postResult.rows[0].category_name || null,
          author: {
            username: postResult.rows[0].author_name,
            avatar_url: postResult.rows[0].author_avatar,
          },
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('创建文章失败:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: '创建文章失败',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
