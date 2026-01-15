/**
 * 创建管理员用户的脚本
 * 
 * 使用方法：
 * 1. 安装依赖: npm install
 * 2. 运行脚本: node scripts/create-admin.js
 * 
 * 参数：
 * --username: 管理员用户名 (默认: admin)
 * --password: 管理员密码 (默认: admin123)
 * 
 * 示例：
 * node scripts/create-admin.js --username=admin --password=securepassword
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hjdtkumfdzodjwceqywv.supabase.co';

// 注意：这个脚本需要使用 service_role key 才能创建用户
// 你需要在 Supabase 控制台获取 service_role key
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!serviceRoleKey) {
  console.error('错误: 请设置 SUPABASE_SERVICE_ROLE_KEY 环境变量');
  console.error('可以从 Supabase 控制台的 Settings > API 中获取');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  const args = process.argv.slice(2);
  const usernameArg = args.find(arg => arg.startsWith('--username='));
  const passwordArg = args.find(arg => arg.startsWith('--password='));

  const username = usernameArg ? usernameArg.split('=')[1] : 'admin';
  const password = passwordArg ? passwordArg.split('=')[1] : 'admin123';
  const email = `${username}@blog.local`;

  console.log(`创建管理员用户: ${username}`);
  console.log(`邮箱: ${email}`);
  console.log(`密码: ${password}`);

  try {
    // 1. 创建 Auth 用户
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        username: username,
        role: 'admin'
      }
    });

    if (authError) {
      console.error('创建用户失败:', authError.message);
      throw authError;
    }

    console.log('✅ Auth 用户创建成功');

    // 2. 在 profiles 表中创建用户资料
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        username: username,
        full_name: username,
        role: 'admin',
        avatar_url: null,
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('创建用户资料失败:', profileError.message);
      throw profileError;
    }

    console.log('✅ 用户资料创建成功');
    console.log('\n管理员账户创建完成！');
    console.log('登录信息:');
    console.log(`  用户名: ${username}`);
    console.log(`  密码: ${password}`);
    console.log(`\n请妥善保管这些凭据。`);

  } catch (error) {
    console.error('\n❌ 创建管理员失败:', error);
    process.exit(1);
  }
}

createAdminUser();
