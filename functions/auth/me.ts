import { getUserFromToken } from '../../src/lib/auth';

export async function onRequestGet({ request }: { request: Request }) {
  try {
    const authHeader = request.headers.get('Authorization');

    const user = await getUserFromToken(authHeader);

    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: '未授权',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        user,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Get user error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: '服务器错误，请稍后重试',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
