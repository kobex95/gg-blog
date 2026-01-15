import { createClient } from '@libsql/client';

// 从环境变量读取（服务器端使用 process.env，EdgeOne Pages 支持）
function getEnvValue(key: string): string {
  // 尝试 process.env（服务器端）
  if (typeof process !== 'undefined' && process.env) {
    const value = process.env[key] || process.env[`VITE_${key}`] || '';
    if (value) {
      console.log(`从 process.env 读取到 ${key}:`, value.substring(0, 20) + '...');
      return value;
    }
  }

  // 尝试 import.meta.env（客户端构建）
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const value = import.meta.env[`VITE_${key}`] || '';
    if (value) {
      console.log(`从 import.meta.env 读取到 ${key}:`, value.substring(0, 20) + '...');
      return value;
    }
  }

  console.warn(`环境变量 ${key} 未设置`);
  return '';
}

const TURSO_DATABASE_URL = getEnvValue('TURSO_DATABASE_URL');
const TURSO_AUTH_TOKEN = getEnvValue('TURSO_AUTH_TOKEN');

export function getDbClient() {
  if (!TURSO_DATABASE_URL) {
    throw new Error('TURSO_DATABASE_URL 环境变量未设置');
  }

  console.log('创建 Turso 客户端，URL:', TURSO_DATABASE_URL.substring(0, 20) + '...');

  return createClient({
    url: TURSO_DATABASE_URL,
    authToken: TURSO_AUTH_TOKEN || undefined,
  });
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
