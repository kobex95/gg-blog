import { db } from '../../src/lib/db';

export async function onRequestGet() {
  try {
    const result = await db.execute({
      sql: 'SELECT id, name, slug, description FROM categories ORDER BY name',
      args: [],
    });

    const categories = result.rows;

    // 获取每个分类的文章数
    const categoriesWithCount = await Promise.all(
      categories.map(async (category: any) => {
        const countResult = await db.execute({
          sql: 'SELECT COUNT(*) as count FROM posts WHERE category_id = ?',
          args: [category.id],
        });

        return {
          ...category,
          post_count: countResult.rows[0].count || 0,
        };
      })
    );

    return new Response(
      JSON.stringify({
        success: true,
        categories: categoriesWithCount,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('获取分类列表失败:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: '获取分类列表失败',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
