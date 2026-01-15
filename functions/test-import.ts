import { createClient } from '@libsql/client';

export async function onRequestGet({ env }: { env?: any }) {
  console.log('=== test-import 开始 ===');
  console.log('时间戳:', new Date().toISOString());

  try {
    console.log('1. 导入 @libsql/client 成功');
    console.log('2. createClient 函数:', typeof createClient);

    const { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } = (() => {
      const contextEnv = env || {};
      return {
        TURSO_DATABASE_URL: contextEnv.TURSO_DATABASE_URL || '',
        TURSO_AUTH_TOKEN: contextEnv.TURSO_AUTH_TOKEN || '',
      };
    })();

    console.log('3. TURSO_DATABASE_URL 存在:', !!TURSO_DATABASE_URL);
    console.log('4. TURSO_AUTH_TOKEN 存在:', !!TURSO_AUTH_TOKEN);

    console.log('5. 准备创建客户端...');
    const client = createClient({
      url: 'https://test.turso.io', // 使用测试 URL
      authToken: TURSO_AUTH_TOKEN || undefined,
    });

    console.log('6. 客户端创建成功');
    console.log('7. 客户端类型:', typeof client);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Import test successful',
        clientCreated: true,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('错误:', error);
    console.error('错误类型:', error?.constructor?.name);
    console.error('错误信息:', error instanceof Error ? error.message : String(error));

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Import test failed',
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
