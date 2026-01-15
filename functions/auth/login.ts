import { db } from '../../src/lib/db';
import { verifyPassword, generateToken } from '../../src/lib/auth';

export async function onRequestPost({ request }: { request: Request }) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({
          success: false,
          error: '邮箱和密码不能为空',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 查找用户
    const result = await db.execute({
      sql: 'SELECT id, username, email, password_hash, role, avatar_url FROM profiles WHERE email = ?',
      args: [email],
    });

    if (result.rows.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: '邮箱或密码错误',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const user = result.rows[0] as any;

    // 验证密码
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return new Response(
        JSON.stringify({
          success: false,
          error: '邮箱或密码错误',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 生成 token
    const token = generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      avatar_url: user.avatar_url,
    });

    return new Response(
      JSON.stringify({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          avatar: user.avatar_url,
          role: user.role,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: '服务器错误，请稍后重试',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
