import client from '../lib/db.js';
import { verifyToken, getTokenFromHeader } from '../lib/auth.js';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const result = await client.execute({
      sql: `
        SELECT 
          p.*,
          u.username as author_name
        FROM posts p
        LEFT JOIN users u ON p.author_id = u.id
        WHERE p.id = ?
      `,
      args: [params.id],
    });

    if (result.rows.length === 0) {
      return Response.json(
        { error: '文章不存在' },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      post: result.rows[0],
    });
  } catch (error) {
    console.error('Get post error:', error);
    return Response.json(
      { error: '获取文章失败' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const authHeader = request.headers.get('Authorization');
  const token = getTokenFromHeader(authHeader);
  const payload = verifyToken(token);

  if (!payload) {
    return Response.json(
      { error: '未授权访问' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { title, content, excerpt, category, tags, status } = body;

    await client.execute({
      sql: `
        UPDATE posts 
        SET title = ?, content = ?, excerpt = ?, category = ?, tags = ?, status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      args: [
        title,
        content,
        excerpt || content.substring(0, 200),
        category,
        tags || '',
        status || 'published',
        params.id,
      ],
    });

    return Response.json({
      success: true,
      message: '文章更新成功',
    });
  } catch (error) {
    console.error('Update post error:', error);
    return Response.json(
      { error: '更新文章失败' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const authHeader = request.headers.get('Authorization');
  const token = getTokenFromHeader(authHeader);
  const payload = verifyToken(token);

  if (!payload) {
    return Response.json(
      { error: '未授权访问' },
      { status: 401 }
    );
  }

  try {
    await client.execute({
      sql: 'DELETE FROM posts WHERE id = ?',
      args: [params.id],
    });

    return Response.json({
      success: true,
      message: '文章删除成功',
    });
  } catch (error) {
    console.error('Delete post error:', error);
    return Response.json(
      { error: '删除文章失败' },
      { status: 500 }
    );
  }
}
