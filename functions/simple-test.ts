export async function onRequestGet({ env }: { env?: any }) {
  console.log('=== simple-test 开始 ===');
  console.log('时间戳:', new Date().toISOString());
  console.log('env 是否存在:', !!env);

  const testResult = {
    timestamp: new Date().toISOString(),
    message: 'Simple test success',
    envKeys: env ? Object.keys(env) : [],
    test: {
      string: 'hello',
      number: 123,
      boolean: true,
      array: [1, 2, 3],
      object: { a: 1, b: 2 },
    },
  };

  console.log('准备返回结果:', JSON.stringify(testResult));
  console.log('=== simple-test 结束 ===');

  return new Response(
    JSON.stringify({
      success: true,
      data: testResult,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
