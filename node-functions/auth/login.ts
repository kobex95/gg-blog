import client from '../lib/db.js';
import { verifyPassword, generateToken } from '../lib/auth.js';

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return Response.json(
        { error: '用户名和密码不能为空' },
        { status: 400 }
      );
    }

    const result = await client.execute({
      sql: 'SELECT * FROM users WHERE username = ?',
      args: [username],
    });

    if (result.rows.length === 0) {
      return Response.json(
        { error: '用户名或密码错误' },
        { status: 401 }
      );
    }

    const user = result.rows[0] as any;
    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      return Response.json(
        { error: '用户名或密码错误' },
        { status: 401 }
      );
    }

    const token = generateToken({
      userId: user.id,
      username: user.username,
    });

    return Response.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return Response.json(
      { error: '登录失败' },
      { status: 500 }
    );
  }
}
