// 测试不同的导出格式

// 格式 1: 默认导出
export default {
  async fetch(request) {
    console.log('health-test 被调用');
    return new Response(JSON.stringify({
      success: true,
      message: 'API is working (default export)',
      timestamp: new Date().toISOString(),
      format: 'default export'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
