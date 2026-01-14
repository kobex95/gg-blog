export function onRequestGet() {
  return Response.json({
    success: true,
    message: 'API is working',
    timestamp: new Date().toISOString(),
    environment: 'production'
  });
}
