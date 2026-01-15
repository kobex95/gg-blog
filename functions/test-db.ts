import { getDbClient, getEnvFromContext } from '../src/lib/db';

export async function onRequestGet({ env }: { env?: any }) {
  try {
    console.log('测试数据库连接...');

    const { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } = getEnvFromContext(env);
    const db = getDbClient(TURSO_DATABASE_URL, TURSO_AUTH_TOKEN);

    // 测试查询
    const result = await db.execute({
      sql: 'SELECT COUNT(*) as count FROM profiles',
      args: [],
    });

    console.log('数据库查询结果:', result);

    return new Response(
      JSON.stringify({
        success: true,
        message: '数据库连接成功',
        data: {
          profilesCount: result.rows[0].count,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('数据库连接测试失败:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    return new Response(
      JSON.stringify({
        success: false,
        error: '数据库连接失败',
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

