// 测试命名导出

export async function onRequestGet() {
  console.log('health-v2 onRequestGet 被调用');
  return new Response(JSON.stringify({
    success: true,
    message: 'API is working (named export)',
    timestamp: new Date().toISOString(),
    format: 'onRequestGet'
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
