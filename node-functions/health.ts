export default async function handler() {
  return Response.json({
    success: true,
    message: 'API is working',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
}
