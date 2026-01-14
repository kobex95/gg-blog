import client from '../lib/db.js';
import { verifyToken, getTokenFromHeader } from '../lib/auth.js';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const category = url.searchParams.get('category');
    const tag = url.searchParams.get('tag');
    const search = url.searchParams.get('search');

    const offset = (page - 1) * limit;

    let whereClause = 'WHERE status = ?';
    let args: any[] = ['published'];

    if (category) {
      whereClause += ' AND category = ?';
      args.push(category);
    }

    if (tag) {
      whereClause += " AND tags LIKE ?";
      args.push(`%${tag}%`);
    }

    if (search) {
      whereClause += ' AND (title LIKE ? OR content LIKE ?)';
      args.push(`%${search}%`, `%${search}%`);
    }

    const postsResult = await client.execute({
      sql: `
        SELECT 
          p.*,
          u.username as author_name
        FROM posts p
        LEFT JOIN users u ON p.author_id = u.id
        ${whereClause}
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
      `,
      args: [...args, limit, offset],
    });

    const countResult = await client.execute({
      sql: `SELECT COUNT(*) as total FROM posts ${whereClause}`,
      args,
    });

    const total = (countResult.rows[0] as any).total;
    const totalPages = Math.ceil(Number(total) / limit);

    return Response.json({
      success: true,
      posts: postsResult.rows,
      pagination: {
        page,
        limit,
        total: total,
        totalPages: totalPages,
      },
    });
  } catch (error) {
    console.error('Get posts error:', error);
    return Response.json(
      { error: '获取文章列表失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const token = getTokenFromHeader(authHeader);
  const payload = verifyToken(token || '');

  if (!payload) {
    return Response.json(
      { error: '未授权访问' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { title, content, excerpt, category, tags, status } = body;

    if (!title || !content) {
      return Response.json(
        { error: '标题和内容不能为空' },
        { status: 400 }
      );
    }

    const result = await client.execute({
      sql: `
        INSERT INTO posts (title, content, excerpt, category, tags, status, author_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        title,
        content,
        excerpt || content.substring(0, 200),
        category,
        tags || '',
        status || 'published',
        payload.userId,
      ],
    });

    return Response.json({
      success: true,
      post: {
        id: result.lastInsertRowid,
        title,
        content,
        excerpt,
        category,
        tags,
        status,
      },
    });
  } catch (error) {
    console.error('Create post error:', error);
    return Response.json(
      { error: '创建文章失败' },
      { status: 500 }
    );
  }
}
