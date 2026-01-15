export async function onRequestGet({ env }: { env?: any }) {
  console.log('上下文对象:', JSON.stringify(Object.keys(env || {})));

  // 尝试从上下文读取环境变量
  const contextEnv = env || {};

  const result = {
    'process defined': typeof process !== 'undefined',
    'global defined': typeof global !== 'undefined',
    'global.process defined': typeof global !== 'undefined' && typeof global.process !== 'undefined',
    'env object exists': env !== undefined,
    'env object keys': Object.keys(contextEnv),
    'TURSO_DATABASE_URL': contextEnv.TURSO_DATABASE_URL ? '✅ 已设置' : '❌ 未设置',
    'TURSO_AUTH_TOKEN': contextEnv.TURSO_AUTH_TOKEN ? '✅ 已设置' : '❌ 未设置',
    'JWT_SECRET': contextEnv.JWT_SECRET ? '✅ 已设置' : '❌ 未设置',
    'VITE_TURSO_DATABASE_URL': contextEnv.VITE_TURSO_DATABASE_URL ? '✅ 已设置' : '❌ 未设置',
    'VITE_TURSO_AUTH_TOKEN': contextEnv.VITE_TURSO_AUTH_TOKEN ? '✅ 已设置' : '❌ 未设置',
    'VITE_JWT_SECRET': contextEnv.VITE_JWT_SECRET ? '✅ 已设置' : '❌ 未设置',
  };

  return new Response(
    JSON.stringify({
      success: true,
      environment: result,
      message: '环境变量检查完成',
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
