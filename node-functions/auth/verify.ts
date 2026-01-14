import { verifyToken, getTokenFromHeader } from '../lib/auth.js';

export default async function handler(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const token = getTokenFromHeader(authHeader);

  if (!token) {
    return Response.json(
      { error: '未提供认证令牌' },
      { status: 401 }
    );
  }

  const payload = verifyToken(token);

  if (!payload) {
    return Response.json(
      { error: '令牌无效或已过期' },
      { status: 401 }
    );
  }

  return Response.json({
    success: true,
    user: payload,
  });
}
