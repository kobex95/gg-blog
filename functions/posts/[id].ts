import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hjdtkumfdzodjwceqywv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqZHRrdW1mZHpvZGp3Y2VxeXd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2ODgzNTMsImV4cCI6MjA4MzI2NDM1M30.i3Q_fWxtStOMqk2i3YofeiXNrVKgltN66jNy9I7dtFQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function onRequestGet({ params }) {
  try {
    const { id } = params;

    const { data: post, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles(username, avatar_url),
        category:categories(name, slug)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    // 获取标签
    const { data: postTags } = await supabase
      .from('post_tags')
      .select('tags(name, slug)')
      .eq('post_id', id);

    const tags = postTags?.map(pt => pt.tags?.name).filter(Boolean).join(',') || '';

    // 增加阅读量
    await supabase
      .from('posts')
      .update({ view_count: (post.view_count || 0) + 1 })
      .eq('id', id);

    return Response.json({
      success: true,
      post: {
        ...post,
        tags,
        category: post.category?.name || null,
        author_name: post.author?.username || '匿名'
      }
    });
  } catch (error) {
    console.error('获取文章详情失败:', error);
    return Response.json({
      success: false,
      error: '获取文章详情失败'
    }, { status: 500 });
  }
}

export async function onRequestPut({ request, params }) {
  try {
    const { id } = params;
    const { title, content, excerpt, category_id, tags, published } = await request.json();

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const { data: post, error } = await supabase
      .from('posts')
      .update({
        title,
        slug,
        content,
        excerpt,
        category_id,
        published: published || false
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return Response.json({
      success: true,
      post
    });
  } catch (error) {
    console.error('更新文章失败:', error);
    return Response.json({
      success: false,
      error: '更新文章失败'
    }, { status: 500 });
  }
}

export async function onRequestDelete({ params }) {
  try {
    const { id } = params;

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return Response.json({
      success: true,
      message: '文章已删除'
    });
  } catch (error) {
    console.error('删除文章失败:', error);
    return Response.json({
      success: false,
      error: '删除文章失败'
    }, { status: 500 });
  }
}
