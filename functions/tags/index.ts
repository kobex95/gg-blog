import { db } from '../../src/lib/db';

export async function onRequestGet() {
  try {
    const result = await db.execute({
      sql: 'SELECT id, name, slug FROM tags ORDER BY name',
      args: [],
    });

    const tags = result.rows;

    // 获取每个标签的文章数
    const tagsWithCount = await Promise.all(
      tags.map(async (tag: any) => {
        const countResult = await db.execute({
          sql: 'SELECT COUNT(*) as count FROM post_tags WHERE tag_id = ?',
          args: [tag.id],
        });

        return {
          ...tag,
          post_count: countResult.rows[0].count || 0,
        };
      })
    );

    return new Response(
      JSON.stringify({
        success: true,
        tags: tagsWithCount,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('获取标签列表失败:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: '获取标签列表失败',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
