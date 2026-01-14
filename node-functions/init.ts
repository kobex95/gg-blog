/**
 * EdgeOne Pages 数据库初始化端点
 * 访问 /api/init 来初始化数据库
 */

import { initializeDatabase } from './lib/init-db.js';

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const result = await initializeDatabase();
    
    if (result.success) {
      return Response.json({
        success: true,
        message: result.message,
      });
    } else {
      return Response.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Init database error:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '初始化失败',
      },
      { status: 500 }
    );
  }
}
