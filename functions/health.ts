export async function onRequestGet() {
  return new Response(JSON.stringify({
    success: true,
    message: 'API is working',
    timestamp: new Date().toISOString(),
    environment: 'production'
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
