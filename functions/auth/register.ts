import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hjdtkumfdzodjwceqywv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqZHRrdW1mZHpvZGp3Y2VxeXd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2ODgzNTMsImV4cCI6MjA4MzI2NDM1M30.i3Q_fWxtStOMqk2i3YofeiXNrVKgltN66jNy9I7dtFQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function onRequestPost({ request }: { request: Request }) {
  try {
    const { username, email, password, role = 'user' } = await request.json();

    if (!username || !email || !password) {
      return new Response(JSON.stringify({
        success: false,
        error: '用户名、邮箱和密码不能为空'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (password.length < 6) {
      return new Response(JSON.stringify({
        success: false,
        error: '密码至少需要6位'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 检查用户名是否已存在
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single();

    if (existingProfile) {
      return new Response(JSON.stringify({
        success: false,
        error: '用户名已被使用'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 注册用户
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          username: username,
          role: role
        }
      }
    });

    if (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message || '注册失败'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!data.user) {
      return new Response(JSON.stringify({
        success: false,
        error: '注册失败，请重试'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 在 profiles 表中创建用户资料
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        username: username,
        full_name: username,
        email: email,
        role: role,
        avatar_url: null,
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('创建用户资料失败:', profileError);
      // 继续执行，因为用户已创建
    }

    return new Response(JSON.stringify({
      success: true,
      message: '注册成功',
      user: {
        id: data.user.id,
        email: data.user.email,
        username: username
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Register error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: '服务器错误，请稍后重试'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
