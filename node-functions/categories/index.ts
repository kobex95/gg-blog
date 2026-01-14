import client from '../lib/db.js';

export async function GET(_request: Request) {
  try {
    const result = await client.execute({
      sql: `
        SELECT 
          category,
          COUNT(*) as post_count
        FROM posts 
        WHERE category IS NOT NULL AND category != '' AND status = 'published'
        GROUP BY category
        ORDER BY post_count DESC
      `,
    });

    return Response.json({
      success: true,
      categories: result.rows,
    });
  } catch (error) {
    console.error('Get categories error:', error);
    return Response.json(
      { error: '获取分类失败' },
      { status: 500 }
    );
  }
}
