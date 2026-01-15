export async function onRequestGet() {
  console.log('test-api 被调用');
  return new Response(
    JSON.stringify({
      success: true,
      message: 'API 路由测试成功',
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

export async function onRequestPost({ request }: { request: Request }) {
  console.log('test-api POST 被调用');
  const body = await request.json();
  return new Response(
    JSON.stringify({
      success: true,
      message: 'POST 测试成功',
      received: body,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
