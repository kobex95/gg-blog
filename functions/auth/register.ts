import { db } from '../../src/lib/db';
import { hashPassword, generateToken } from '../../src/lib/auth';

export async function onRequestPost({ request }: { request: Request }) {
  try {
    console.log('开始注册...');

    const { username, email, password, role = 'user' } = await request.json();

    console.log('注册参数:', { username, email, role });

    if (!username || !email || !password) {
      return new Response(
        JSON.stringify({
          success: false,
          error: '用户名、邮箱和密码不能为空',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (password.length < 6) {
      return new Response(
        JSON.stringify({
          success: false,
          error: '密码至少需要6位',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 检查用户名是否已存在
    console.log('检查用户名是否存在...');
    const usernameResult = await db.execute({
      sql: 'SELECT id FROM profiles WHERE username = ?',
      args: [username],
    });

    if (usernameResult.rows.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: '用户名已被使用',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 检查邮箱是否已存在
    console.log('检查邮箱是否存在...');
    const emailResult = await db.execute({
      sql: 'SELECT id FROM profiles WHERE email = ?',
      args: [email],
    });

    if (emailResult.rows.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: '邮箱已被使用',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 哈希密码
    console.log('哈希密码...');
    const passwordHash = await hashPassword(password);

    // 创建用户
    console.log('插入用户数据...');
    const insertSql = `
      INSERT INTO profiles (username, email, password_hash, full_name, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    console.log('插入 SQL:', insertSql);

    const result = await db.execute({
      sql: insertSql,
      args: [
        username,
        email,
        passwordHash,
        username,
        role,
        new Date().toISOString(),
        new Date().toISOString(),
      ],
    });

    console.log('插入结果:', result);

    const userId = (result as any).meta?.last_row_id || (result as any).rows[0]?.id;
    console.log('用户 ID:', userId);

    // 生成 token
    console.log('生成 token...');
    const token = generateToken({
      id: userId,
      email: email,
      username: username,
      role: role,
      avatar_url: null,
    });

    console.log('注册成功');

    return new Response(
      JSON.stringify({
        success: true,
        message: '注册成功',
        token,
        user: {
          id: userId,
          email: email,
          username: username,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Register error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    return new Response(
      JSON.stringify({
        success: false,
        error: '服务器错误，请稍后重试',
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
