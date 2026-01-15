import { createClient } from '@libsql/client';

// 从上下文中获取环境变量（供 API 函数使用）
export function getEnvFromContext(context: any): { TURSO_DATABASE_URL: string; TURSO_AUTH_TOKEN: string; JWT_SECRET: string } {
  // 支持两种调用方式：
  // 1. getEnvFromContext(env) - 直接传入 env 对象
  // 2. getEnvFromContext({ env }) - 传入完整上下文
  const env = context?.env || context || {};

  console.log('getEnvFromContext: env keys:', Object.keys(env).filter(k => k.includes('TURSO') || k.includes('JWT')));

  const result = {
    TURSO_DATABASE_URL: env.TURSO_DATABASE_URL || env.VITE_TURSO_DATABASE_URL || '',
    TURSO_AUTH_TOKEN: env.TURSO_AUTH_TOKEN || env.VITE_TURSO_AUTH_TOKEN || '',
    JWT_SECRET: env.JWT_SECRET || env.VITE_JWT_SECRET || 'default-secret-change-in-production',
  };

  console.log('getEnvFromContext result:', {
    hasTURSO_DATABASE_URL: !!result.TURSO_DATABASE_URL,
    hasTURSO_AUTH_TOKEN: !!result.TURSO_AUTH_TOKEN,
    hasJWT_SECRET: !!result.JWT_SECRET,
  });

  return result;
}

// 获取数据库客户端
export function getDbClient(dbUrl?: string, authToken?: string) {
  // 优先使用传入的参数
  const url = dbUrl;
  const token = authToken;

  console.log('getDbClient called with:', {
    hasUrl: !!url,
    hasToken: !!token,
    urlPrefix: url ? url.substring(0, 30) + '...' : 'none',
  });

  if (!url) {
    throw new Error('TURSO_DATABASE_URL 环境变量未设置。请检查 EdgeOne Pages 环境变量配置。');
  }

  console.log('创建 Turso 客户端...');

  try {
    const client = createClient({
      url: url,
      authToken: token || undefined,
    });

    console.log('Turso 客户端创建成功');
    return client;
  } catch (error) {
    console.error('创建 Turso 客户端失败:', error);
    throw new Error(`无法连接到数据库: ${error instanceof Error ? error.message : String(error)}`);
  }
}


// 类型定义
export interface Post {
  id?: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author_id: number;
  category_id: number | null;
  published: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface PostTag {
  post_id: number;
  tag_id: number;
}

export interface Profile {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  full_name: string;
  avatar_url: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}
