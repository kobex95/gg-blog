import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hjdtkumfdzodjwceqywv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqZHRrdW1mZHpvZGp3Y2VxeXd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2ODgzNTMsImV4cCI6MjA4MzI2NDM1M30.i3Q_fWxtStOMqk2i3YofeiXNrVKgltN66jNy9I7dtFQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function onRequestGet({ request }: { request: Request }) {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('posts')
      .select(`
        *,
        author:profiles(username, avatar_url),
        category:categories(name, slug)
      `)
      .eq('published', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    const { data: posts, error, count } = await query;

    if (error) {
      throw error;
    }

    // 为每个文章获取标签
    const postIds = posts?.map(p => p.id) || [];
    const { data: postTags } = await supabase
      .from('post_tags')
      .select('post_id, tags!inner(name, slug)')
      .in('post_id', postIds);

    // 组合标签到文章
    const postsWithTags = posts?.map(post => ({
      ...post,
      tags: postTags
        ?.filter((pt: any) => pt.post_id === post.id)
        .map((pt: any) => pt.tags?.name)
        .filter(Boolean)
        .join(',') || ''
    })) || [];

    return Response.json({
      success: true,
      posts: postsWithTags,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('获取文章列表失败:', error);
    return Response.json({
      success: false,
      error: '获取文章列表失败'
    }, { status: 500 });
  }
}

export async function onRequestPost({ request }: { request: Request }) {
  try {
    const { title, content, excerpt, category_id, tags, published } = await request.json();

    // 生成 slug
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    // 获取当前用户（简化版，实际需要从 session 获取）
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return Response.json({
        success: false,
        error: '未授权'
      }, { status: 401 });
    }

    // 创建文章
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        title,
        slug,
        content,
        excerpt,
        category_id,
        author_id: user.id,
        published: published || false
      })
      .select()
      .single();

    if (error) throw error;

    // 处理标签
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        // 查找或创建标签
        const { data: existingTag } = await supabase
          .from('tags')
          .select('id')
          .eq('name', tagName)
          .single();

        let tagId;
        if (existingTag) {
          tagId = existingTag.id;
        } else {
          const tagSlug = tagName
            .toLowerCase()
            .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
            .replace(/-+/g, '-');

          const { data: newTag } = await supabase
            .from('tags')
            .insert({ name: tagName, slug: tagSlug })
            .select('id')
            .single();
          tagId = newTag?.id;
        }

        // 关联文章和标签
        if (tagId) {
          await supabase
            .from('post_tags')
            .insert({ post_id: post.id, tag_id: tagId });
        }
      }
    }

    return Response.json({
      success: true,
      post
    });
  } catch (error) {
    console.error('创建文章失败:', error);
    return Response.json({
      success: false,
      error: '创建文章失败'
    }, { status: 500 });
  }
}
