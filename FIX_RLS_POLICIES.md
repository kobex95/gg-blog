# 修复 Supabase RLS 策略

## 问题

API 返回 500 错误是因为 Supabase 的 RLS（行级安全策略）阻止了匿名用户查询数据。

## 解决方案

需要在 Supabase 控制台执行 SQL 脚本以设置正确的 RLS 策略。

## 步骤

### 1. 打开 Supabase SQL Editor

1. 登录 Supabase 控制台：https://supabase.com/dashboard
2. 选择你的项目
3. 点击左侧菜单的 **SQL Editor**
4. 点击 **New query** 创建新查询

### 2. 执行 SQL 脚本

1. 打开项目根目录的 `fix-rls-policies.sql` 文件
2. 复制整个 SQL 脚本内容
3. 粘贴到 SQL Editor 中
4. 点击 **Run** 执行

### 3. 验证

执行完成后，访问 API 测试页面：
```
https://你的域名/test-api
```

现在应该能看到所有 API 都返回 200 OK。

## SQL 脚本说明

脚本将创建以下策略：

### Posts 表
- ✅ 所有人可以读取已发布的文章
- ✅ 认证用户可以创建自己的文章
- ✅ 认证用户可以更新自己的文章
- ✅ 认证用户可以删除自己的文章

### Categories 表
- ✅ 所有人可以读取分类

### Tags 表
- ✅ 所有人可以读取标签

### Profiles 表
- ✅ 所有人可以读取用户资料（用于显示作者信息）
- ✅ 认证用户可以更新自己的资料

### Post_Tags 表
- ✅ 所有人可以读取文章标签关联

### Comments 表
- ✅ 所有人可以读取评论
- ✅ 认证用户可以创建自己的评论
- ✅ 认证用户可以删除自己的评论

## 注意事项

- RLS 策略确保数据安全，只允许合法的访问
- 只有 `published = true` 的文章对所有人可见
- 用户只能修改自己的数据

## 故障排除

如果执行后仍有问题：

1. 检查 SQL Editor 的执行日志，看是否有错误
2. 确认 Supabase Anon Key 是否正确
3. 检查表是否存在：在 Table Editor 中查看所有表
4. 查看具体的错误信息：
   - 在浏览器按 F12 打开开发者工具
   - 查看 Network 标签页中 API 请求的响应
