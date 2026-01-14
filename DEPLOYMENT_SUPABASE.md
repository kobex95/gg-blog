# Supabase 部署指南

本项目已从 Turso 迁移到 Supabase，使用 Supabase 的数据库和认证服务。

## 环境变量配置

在 EdgeOne Pages 项目中配置以下环境变量：

```bash
# Supabase 配置（必需）
VITE_SUPABASE_URL=https://hjdtkumfdzodjwceqywv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqZHRrdW1mZHpvZGp3Y2VxeXd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2ODgzNTMsImV4cCI6MjA4MzI2NDM1M30.i3Q_fWxtStOMqk2i3YofeiXNrVKgltN66jNy9I7dtFQ

# Twikoo 评论（可选）
PUBLIC_TWIKOO_ENV_ID=your-twikoo-env-id
```

## 数据库结构

项目使用 Supabase PostgreSQL 数据库，包含以下表：

### Public Schema
- `posts` - 文章表
- `categories` - 分类表
- `tags` - 标签表
- `post_tags` - 文章标签关联表
- `profiles` - 用户资料表
- `comments` - 评论表

### Auth Schema（Supabase 系统表）
- `users` - 用户认证信息
- `sessions` - 会话管理
- 等其他 Supabase Auth 表

## API 端点

项目使用 EdgeOne Pages Functions 提供以下 API：

### 文章 API
- `GET /api/posts` - 获取文章列表
- `POST /api/posts` - 创建文章（需要认证）
- `GET /api/posts/:id` - 获取文章详情
- `PUT /api/posts/:id` - 更新文章（需要认证）
- `DELETE /api/posts/:id` - 删除文章（需要认证）

### 分类 API
- `GET /api/categories` - 获取分类列表

### 标签 API
- `GET /api/tags` - 获取标签列表

### 健康检查
- `GET /api/health` - API 健康检查

## 部署到 EdgeOne Pages

1. **推送到 GitHub**
   ```bash
   git add .
   git commit -m "迁移到 Supabase"
   git push
   ```

2. **在 EdgeOne Pages 控制台配置**
   - 连接 GitHub 仓库
   - 配置环境变量
   - 触发构建和部署

3. **验证部署**
   - 访问健康检查：`https://your-domain.com/api/health`
   - 访问首页：`https://your-domain.com`

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

## Supabase 管理控制台

访问 https://supabase.com/dashboard/project/hjdtkumfdzodjwceqywv 管理：
- 数据库表
- 用户和认证
- API 密钥
- 实时日志

## 注意事项

1. **环境变量安全性**
   - 不要在代码中硬编码敏感信息
   - 在生产环境使用 Service Role Key（仅在服务端）

2. **数据库权限**
   - 使用 Row Level Security (RLS) 保护数据
   - 为不同用户角色设置适当的权限

3. **认证流程**
   - 使用 Supabase Auth 进行用户认证
   - 管理后台需要登录才能访问
