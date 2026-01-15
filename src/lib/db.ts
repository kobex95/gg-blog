import { createClient } from '@libsql/client';

// 从环境变量读取（服务器端使用 process.env）
const TURSO_DATABASE_URL = typeof process !== 'undefined' && process.env?.TURSO_DATABASE_URL
  ? process.env.TURSO_DATABASE_URL
  : import.meta.env.VITE_TURSO_DATABASE_URL || '';

const TURSO_AUTH_TOKEN = typeof process !== 'undefined' && process.env?.TURSO_AUTH_TOKEN
  ? process.env.TURSO_AUTH_TOKEN
  : import.meta.env.VITE_TURSO_AUTH_TOKEN || '';

export function getDbClient() {
  if (!TURSO_DATABASE_URL) {
    throw new Error('TURSO_DATABASE_URL 环境变量未设置');
  }

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
