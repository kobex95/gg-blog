import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from './db';

// 从环境变量读取
function getEnvValue(key: string): string {
  if (typeof process !== 'undefined' && process.env) {
    const value = process.env[key] || process.env[`VITE_${key}`] || '';
    if (value) {
      console.log(`从 process.env 读取到 ${key}`);
      return value;
    }
  }

  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const value = import.meta.env[`VITE_${key}`] || '';
    if (value) {
      console.log(`从 import.meta.env 读取到 ${key}`);
      return value;
    }
  }

  console.warn(`环境变量 ${key} 未设置，使用默认值`);
  return 'your-secret-key-change-this-in-production';
}

const JWT_SECRET = getEnvValue('JWT_SECRET');

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  avatar_url: string | null;
}

export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
}

// 生成 JWT token
export function generateToken(user: User): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// 验证 JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

// 哈希密码
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

// 验证密码
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// 从请求中获取用户
export async function getUserFromToken(authHeader: string | null): Promise<User | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    return null;
  }

  const result = await db.execute({
    sql: 'SELECT id, username, email, role, avatar_url FROM profiles WHERE id = ?',
    args: [payload.userId],
  });

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0] as any;
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    role: row.role,
    avatar_url: row.avatar_url,
  };
}
