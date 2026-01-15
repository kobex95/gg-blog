import { createClient } from '@libsql/client';

// EdgeOne Pages Functions 环境变量
let TURSO_DATABASE_URL = '';
let TURSO_AUTH_TOKEN = '';

// 在 EdgeOne Pages 中，环境变量在运行时注入
// 通过 global 或其他方式访问
if (typeof global !== 'undefined' && global.process && global.process.env) {
  TURSO_DATABASE_URL = global.process.env.TURSO_DATABASE_URL || global.process.env.VITE_TURSO_DATABASE_URL || '';
  TURSO_AUTH_TOKEN = global.process.env.TURSO_AUTH_TOKEN || global.process.env.VITE_TURSO_AUTH_TOKEN || '';
  console.log('从 global.process.env 读取环境变量');
} else if (typeof process !== 'undefined' && process.env) {
  TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL || process.env.VITE_TURSO_DATABASE_URL || '';
  TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN || process.env.VITE_TURSO_AUTH_TOKEN || '';
  console.log('从 process.env 读取环境变量');
}

// 如果仍然没有，尝试通过 API Context 传递的环境变量
// 这需要在每个 API 函数中动态获取

export function getDbClient(dbUrl?: string, authToken?: string) {
  // 优先使用传入的参数
  const url = dbUrl || TURSO_DATABASE_URL;
  const token = authToken || TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error('TURSO_DATABASE_URL 环境变量未设置。请检查 EdgeOne Pages 环境变量配置。');
  }

  console.log('创建 Turso 客户端，URL:', url.substring(0, 20) + '...');

  return createClient({
    url: url,
    authToken: token || undefined,
  });
}

// 从上下文中获取环境变量（供 API 函数使用）
export function getEnvFromContext(context: any): { TURSO_DATABASE_URL: string; TURSO_AUTH_TOKEN: string; JWT_SECRET: string } {
  const env = context?.env || {};

  return {
    TURSO_DATABASE_URL: env.TURSO_DATABASE_URL || env.VITE_TURSO_DATABASE_URL || TURSO_DATABASE_URL,
    TURSO_AUTH_TOKEN: env.TURSO_AUTH_TOKEN || env.VITE_TURSO_AUTH_TOKEN || TURSO_AUTH_TOKEN,
    JWT_SECRET: env.JWT_SECRET || env.VITE_JWT_SECRET || 'default-secret-change-in-production',
  };
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

export const db = getDbClient();
