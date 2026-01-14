/**
 * 数据库初始化脚本
 * 使用方法：在Node Functions中首次运行前调用此函数
 */

import { initDB, createDefaultAdmin } from './db.js';

export async function initializeDatabase() {
  try {
    console.log('开始初始化数据库...');

    await initDB();
    console.log('数据库表创建成功');

    await createDefaultAdmin();
    console.log('默认管理员账户创建成功');

    console.log('数据库初始化完成');
    return { success: true, message: '数据库初始化成功' };
  } catch (error) {
    console.error('数据库初始化失败:', error);
    return { success: false, error: error instanceof Error ? error.message : '未知错误' };
  }
}
