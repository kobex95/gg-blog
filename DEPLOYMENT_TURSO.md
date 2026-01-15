# Turso 数据库部署指南

## 前置准备

### 1. 创建 Turso 账户

1. 访问 https://turso.tech
2. 注册并登录
3. 创建新项目（或使用默认项目）

### 2. 创建数据库

1. 在 Turso Dashboard 点击 "Create Database"
2. 数据库名称：例如 `blog-db`
3. 选择区域：选择离你最近的区域（如 `ams`、`fra`、`ewr`）
4. 点击创建

### 3. 获取数据库凭证

1. 点击新创建的数据库
2. 查看 "Connection details"
3. 复制以下信息：
   - **Database URL**（如：`libsql://xxx.turso.io`）
   - **Auth Token**（需要点击 "Generate token"）

### 4. 初始化数据库表结构

在 Turso Shell 中执行以下步骤：

1. 打开数据库的 Shell
2. 或者本地使用 Turso CLI：
   ```bash
   turso db shell blog-db
   ```
3. 复制项目根目录的 `init-turso.sql` 内容
4. 粘贴到 Shell 中并执行

### 5. 创建管理员账户

使用初始化页面创建管理员：
1. 访问 `https://你的域名/init`
2. 填写管理员信息
3. 点击创建

## EdgeOne Pages 配置

### 1. 添加环境变量

在 EdgeOne Pages 控制台添加以下环境变量：

```bash
# 必需
VITE_TURSO_DATABASE_URL=libsql://your-database-url.turso.io
VITE_TURSO_AUTH_TOKEN=your-auth-token
VITE_JWT_SECRET=your-secure-secret-key

# 可选
PUBLIC_TWIKOO_ENV_ID=your-twikoo-env-id
```

### 2. JWT 密钥安全

生产环境中，JWT 密钥应该是一个强随机字符串：
- 至少 32 字符
- 包含字母、数字和特殊字符
- 不要在代码中硬编码

生成安全密钥的方法：
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 或使用在线工具
https://www.uuidgenerator.net/guid
```

## 本地开发

### 1. 设置环境变量

创建 `.env` 文件（在项目根目录）：
```bash
# 本地开发可以使用文件数据库
VITE_TURSO_DATABASE_URL=file:local.db

# 或连接到 Turso 数据库
VITE_TURSO_DATABASE_URL=libsql://your-database-url.turso.io
VITE_TURSO_AUTH_TOKEN=your-auth-token

# JWT 密钥
VITE_JWT_SECRET=dev-secret-key
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发服务器

```bash
npm run dev
```

## 数据库管理

### 使用 Turso CLI

1. 安装 CLI：
   ```bash
   npm install -g turso
   ```

2. 登录：
   ```bash
   turso auth login
   ```

3. 常用命令：
   ```bash
   # 查看数据库列表
   turso db list

   # 打开 Shell
   turso db shell blog-db

   # 查看表结构
   turso db shell blog-db
   .schema

   # 备份数据库
   turso db shell blog-db
   .dump > backup.sql

   # 导入数据
   turso db shell blog-db
   .read backup.sql
   ```

### 使用 Web Dashboard

1. 访问 https://turso.tech
2. 点击你的数据库
3. 查看、编辑或查询数据
4. 查看数据库性能指标

## API 端点

### 认证相关
- `POST /auth/register` - 用户注册
- `POST /auth/login` - 用户登录
- `GET /auth/me` - 获取当前用户（需要 Authorization header）

### 文章相关
- `GET /posts` - 获取文章列表
- `GET /posts/:id` - 获取文章详情
- `POST /posts` - 创建文章（需要认证）
- `PUT /posts/:id` - 更新文章（需要认证）
- `DELETE /posts/:id` - 删除文章（需要认证）

### 其他
- `GET /categories` - 获取分类列表
- `GET /tags` - 获取标签列表
- `GET /health` - 健康检查

## 安全注意事项

1. **JWT 密钥**
   - 不要提交到版本控制
   - 使用强随机字符串
   - 定期更换密钥

2. **数据库凭证**
   - 不要在前端代码中暴露
   - 使用环境变量存储
   - 定期轮换 Auth Token

3. **密码安全**
   - 使用 bcrypt 哈希存储
   - 强制最小长度（6 位）
   - 建议复杂度要求

## 故障排除

### 1. 连接失败

**问题**：API 返回 "TURSO_DATABASE_URL 环境变量未设置"

**解决**：
- 检查 EdgeOne Pages 环境变量配置
- 重新部署项目
- 查看构建日志

### 2. Token 验证失败

**问题**：登录后 API 返回 401

**解决**：
- 检查 VITE_JWT_SECRET 是否一致
- 清除浏览器 localStorage
- 重新登录

### 3. 数据库查询错误

**问题**：API 返回 500

**解决**：
- 检查表结构是否正确
- 在 Turso Shell 中测试 SQL
- 查看浏览器控制台错误

## 性能优化

1. **启用缓存**
   - Turso 支持 Redis 缓存
   - 配置缓存策略减少查询

2. **索引优化**
   - 已在 init-turso.sql 中创建索引
   - 根据查询模式添加更多索引

3. **连接池**
   - 使用单个数据库连接实例
   - 避免频繁创建/销毁连接

## 监控

- Turso Dashboard 提供实时监控
- 查看查询性能
- 监控数据库大小
- 设置告警通知
