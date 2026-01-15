export async function onRequestGet() {
  const env = {
    TURSO_DATABASE_URL: typeof process !== 'undefined' && process.env?.TURSO_DATABASE_URL ? '✅ 已设置' : '❌ 未设置',
    TURSO_AUTH_TOKEN: typeof process !== 'undefined' && process.env?.TURSO_AUTH_TOKEN ? '✅ 已设置' : '❌ 未设置',
    JWT_SECRET: typeof process !== 'undefined' && process.env?.JWT_SECRET ? '✅ 已设置' : '❌ 未设置',
  };

  return new Response(
    JSON.stringify({
      success: true,
      environment: env,
      message: '环境变量检查完成',
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
