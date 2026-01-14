import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hjdtkumfdzodjwceqywv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqZHRrdW1mZHpvZGp3Y2VxeXd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2ODgzNTMsImV4cCI6MjA4MzI2NDM1M30.i3Q_fWxtStOMqk2i3YofeiXNrVKgltN66jNy9I7dtFQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function onRequestGet() {
  try {
    const { data: tags, error } = await supabase
      .from('tags')
      .select('id, name, slug')
      .order('name');

    if (error) throw error;

    // 获取每个标签的文章数
    const tagsWithCount = await Promise.all(
      tags.map(async (tag) => {
        const { count } = await supabase
          .from('post_tags')
          .select('post_id', { count: 'exact', head: true })
          .eq('tag_id', tag.id);

        return {
          ...tag,
          post_count: count || 0
        };
      })
    );

    return Response.json({
      success: true,
      tags: tagsWithCount
    });
  } catch (error) {
    console.error('获取标签列表失败:', error);
    return Response.json({
      success: false,
      error: '获取标签列表失败'
    }, { status: 500 });
  }
}
