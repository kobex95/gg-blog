import { getUserFromToken } from '../../src/lib/auth';
import { getDbClient, getEnvFromContext } from '../../src/lib/db';

export async function onRequestGet({ request, env }: { request: Request; env?: any }) {
  try {
    const authHeader = request.headers.get('Authorization');

    const { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } = getEnvFromContext(env);
    const db = getDbClient(TURSO_DATABASE_URL, TURSO_AUTH_TOKEN);

    const user = await getUserFromToken(authHeader, db);

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
