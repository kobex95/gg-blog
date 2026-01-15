import { execSync } from 'child_process';

console.log('开始编译 functions 目录的 TypeScript 文件...');

try {
  execSync('npx tsc -p functions/tsconfig.json', { stdio: 'inherit' });
  console.log('TypeScript 编译完成');
} catch (error) {
  console.error('TypeScript 编译失败:', error);
  process.exit(1);
}
