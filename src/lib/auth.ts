import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from './db';

// 默认 JWT_SECRET
const DEFAULT_JWT_SECRET = 'your-secret-key-change-this-in-production';

// 从环境变量读取或使用默认值
export function getJWTSecret(env?: any): string {
  if (env?.JWT_SECRET) {
    console.log('从 env 读取到 JWT_SECRET');
    return env.JWT_SECRET;
  }
  if (env?.VITE_JWT_SECRET) {
    console.log('从 env 读取到 VITE_JWT_SECRET');
    return env.VITE_JWT_SECRET;
  }
  if (typeof process !== 'undefined' && process.env?.JWT_SECRET) {
    console.log('从 process.env 读取到 JWT_SECRET');
    return process.env.JWT_SECRET;
  }
  console.warn('JWT_SECRET 未设置，使用默认值');
  return DEFAULT_JWT_SECRET;
}

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
export function generateToken(user: User, secret = DEFAULT_JWT_SECRET): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

// 验证 JWT token
export function verifyToken(token: string, secret = DEFAULT_JWT_SECRET): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, secret) as JWTPayload;
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
export async function getUserFromToken(authHeader: string | null, dbClient = db): Promise<User | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    return null;
  }

  const result = await dbClient.execute({
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
