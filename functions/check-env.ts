export async function onRequestGet() {
  // 尝试多种方式读取环境变量
  const processEnv = typeof process !== 'undefined' ? process : null;
  const allEnvKeys = processEnv?.env ? Object.keys(processEnv.env).filter(k => k.includes('TURSO') || k.includes('JWT')) : [];

  // 尝试读取
  const env = {
    'process defined': typeof process !== 'undefined',
    'process.env defined': processEnv?.env !== undefined,
    'TURSO_DATABASE_URL (process.env)': processEnv?.env?.TURSO_DATABASE_URL ? '✅ 已设置' : '❌ 未设置',
    'TURSO_AUTH_TOKEN (process.env)': processEnv?.env?.TURSO_AUTH_TOKEN ? '✅ 已设置' : '❌ 未设置',
    'JWT_SECRET (process.env)': processEnv?.env?.JWT_SECRET ? '✅ 已设置' : '❌ 未设置',
    'VITE_TURSO_DATABASE_URL (process.env)': processEnv?.env?.VITE_TURSO_DATABASE_URL ? '✅ 已设置' : '❌ 未设置',
    'VITE_TURSO_AUTH_TOKEN (process.env)': processEnv?.env?.VITE_TURSO_AUTH_TOKEN ? '✅ 已设置' : '❌ 未设置',
    'VITE_JWT_SECRET (process.env)': processEnv?.env?.VITE_JWT_SECRET ? '✅ 已设置' : '❌ 未设置',
    '所有相关环境变量': allEnvKeys,
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
