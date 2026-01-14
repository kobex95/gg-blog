import client from '../lib/db.js';

export async function GET(request: Request) {
  try {
    const result = await client.execute({
      sql: 'SELECT * FROM tags ORDER BY post_count DESC',
    });

    // 同时从posts中获取所有标签
    const postsResult = await client.execute({
      sql: `
        SELECT DISTINCT 
          TRIM(tags) as tag
        FROM posts 
        WHERE tags IS NOT NULL AND tags != ''
        ORDER BY tag
      `,
    });

    // 解析和统计标签
    const tagCount = new Map<string, number>();
    for (const row of postsResult.rows as any[]) {
      if (row.tag) {
        const tags = row.tag.split(',').map((t: string) => t.trim()).filter((t: string) => t);
        for (const tag of tags) {
          tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
        }
      }
    }

    const uniqueTags = Array.from(tagCount.entries()).map(([name, post_count]) => ({
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      post_count,
    }));

    return Response.json({
      success: true,
      tags: uniqueTags,
    });
  } catch (error) {
    console.error('Get tags error:', error);
    return Response.json(
      { error: '获取标签失败' },
      { status: 500 }
    );
  }
}
