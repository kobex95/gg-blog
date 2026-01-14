import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hjdtkumfdzodjwceqywv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqZHRrdW1mZHpvZGp3Y2VxeXd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2ODgzNTMsImV4cCI6MjA4MzI2NDM1M30.i3Q_fWxtStOMqk2i3YofeiXNrVKgltN66jNy9I7dtFQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function onRequestGet() {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('id, name, slug, description')
      .order('name');

    if (error) throw error;

    // 获取每个分类的文章数
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const { count } = await supabase
          .from('posts')
          .select('id', { count: 'exact', head: true })
          .eq('category_id', category.id);

        return {
          ...category,
          post_count: count || 0
        };
      })
    );

    return Response.json({
      success: true,
      categories: categoriesWithCount
    });
  } catch (error) {
    console.error('获取分类列表失败:', error);
    return Response.json({
      success: false,
      error: '获取分类列表失败'
    }, { status: 500 });
  }
}
