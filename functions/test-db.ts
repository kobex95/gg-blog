import { getDbClient, getEnvFromContext } from '../src/lib/db';

export async function onRequestGet({ env }: { env?: any }) {
  console.log('开始测试数据库连接...');
  console.log('env 对象:', env ? Object.keys(env).filter(k => k.includes('TURSO') || k.includes('JWT')) : 'env 为空');

  try {
    const { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } = getEnvFromContext(env);
    console.log('TURSO_DATABASE_URL:', TURSO_DATABASE_URL ? TURSO_DATABASE_URL.substring(0, 30) + '...' : '未设置');
    console.log('TURSO_AUTH_TOKEN:', TURSO_AUTH_TOKEN ? '已设置' : '未设置');

    if (!TURSO_DATABASE_URL) {
      console.error('TURSO_DATABASE_URL 为空');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'TURSO_DATABASE_URL 环境变量未设置',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('创建数据库客户端...');
    const db = getDbClient(TURSO_DATABASE_URL, TURSO_AUTH_TOKEN);

    console.log('执行测试查询...');
    // 测试查询
    const result = await db.execute({
      sql: 'SELECT COUNT(*) as count FROM profiles',
      args: [],
    });

    console.log('数据库查询结果:', result);
    console.log('行数:', result.rows?.length);

    return new Response(
      JSON.stringify({
        success: true,
        message: '数据库连接成功',
        data: {
          profilesCount: result.rows[0]?.count || 0,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('数据库连接测试失败:', error);
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    return new Response(
      JSON.stringify({
        success: false,
        error: '数据库连接失败',
        details: error instanceof Error ? error.message : String(error),
        errorType: error?.constructor?.name,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}


