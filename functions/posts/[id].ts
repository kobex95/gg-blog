import { getDbClient, getEnvFromContext } from '../../src/lib/db';

export async function onRequestGet({ params, env }: { params: { id: string }; env?: any }) {
  try {
    const { id } = params;
    const { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } = getEnvFromContext(env);
    const db = getDbClient(TURSO_DATABASE_URL, TURSO_AUTH_TOKEN);

    const result = await db.execute({
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
      args: [id],
    });

    if (result.rows.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: '文章不存在',
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const post = result.rows[0];

    // 获取标签
    const tagsResult = await db.execute({
      sql: `
        SELECT t.name
        FROM post_tags pt
        JOIN tags t ON pt.tag_id = t.id
        WHERE pt.post_id = ?
      `,
      args: [id],
    });

    const tags = tagsResult.rows.map((t: any) => t.name).join(',');

    // 增加阅读量
    await db.execute({
      sql: 'UPDATE posts SET view_count = view_count + 1 WHERE id = ?',
      args: [id],
    });

    return new Response(
      JSON.stringify({
        success: true,
        post: {
          ...post,
          tags,
          category: post.category_name || null,
          author_name: post.author_name || '匿名',
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('获取文章详情失败:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: '获取文章详情失败',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function onRequestPut({ request, params, env }: { request: Request; params: { id: string }; env?: any }) {
  try {
    const { id } = params;
    const { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } = getEnvFromContext(env);
    const db = getDbClient(TURSO_DATABASE_URL, TURSO_AUTH_TOKEN);
    const { title, content, excerpt, category_id, published } = await request.json();

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const result = await db.execute({
      sql: `
        UPDATE posts
        SET title = ?, slug = ?, content = ?, excerpt = ?, category_id = ?, published = ?, updated_at = ?
        WHERE id = ?
      `,
      args: [
        title,
        slug,
        content,
        excerpt || null,
        category_id || null,
        published ? 1 : 0,
        new Date().toISOString(),
        id,
      ],
    });

    return new Response(
      JSON.stringify({
        success: true,
        post: result.rows[0],
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('更新文章失败:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: '更新文章失败',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function onRequestDelete({ params, env }: { params: { id: string }; env?: any }) {
  try {
    const { id } = params;
    const { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } = getEnvFromContext(env);
    const db = getDbClient(TURSO_DATABASE_URL, TURSO_AUTH_TOKEN);

    await db.execute({
      sql: 'DELETE FROM posts WHERE id = ?',
      args: [id],
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: '文章已删除',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('删除文章失败:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: '删除文章失败',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
