# EdgeOne Blog 项目结构说明

## 目录树

```
Blog/
├── node-functions/              # EdgeOne Pages Node Functions (后端API)
│   ├── auth/                    # 认证相关API
│   │   ├── login.ts            # 登录接口
│   │   └── verify.ts           # Token验证接口
│   ├── posts/                   # 文章管理API
│   │   ├── index.ts            # 文章列表和创建接口
│   │   └── [id].ts             # 文章详情、更新、删除接口
│   ├── categories/              # 分类API
│   │   └── index.ts            # 获取所有分类
│   ├── tags/                    # 标签API
│   │   └── index.ts            # 获取所有标签
│   └── init.ts                 # 数据库初始化接口
│
├── src/                        # 源代码目录
│   ├── layouts/                # Astro布局组件
│   │   └── Layout.astro       # 主布局（包含导航和页脚）
│   │
│   ├── pages/                  # 页面路由（自动生成路由）
│   │   ├── index.astro        # 首页（文章列表）
│   │   │
│   │   ├── post/              # 文章相关页面
│   │   │   └── [id].astro     # 文章详情页（动态路由）
│   │   │
│   │   ├── tags/              # 标签相关页面
│   │   │   ├── index.astro    # 所有标签列表页
│   │   │   └── [name].astro   # 单个标签的文章列表
│   │   │
│   │   ├── categories/        # 分类相关页面
│   │   │   ├── index.astro    # 所有分类列表页
│   │   │   └── [name].astro   # 单个分类的文章列表
│   │   │
│   │   └── admin/             # 管理后台
│   │       ├── index.astro    # 管理首页（登录和文章列表）
│   │       └── post/          # 文章管理
│   │           ├── new.astro # 创建新文章
│   │           └── [id].astro # 编辑文章
│   │
│   ├── lib/                    # 工具库和共享代码
│   │   ├── db.ts              # 数据库连接和初始化
│   │   ├── auth.ts            # 认证相关函数（JWT、密码哈希）
│   │   └── init-db.ts         # 数据库初始化逻辑
│   │
│   └── styles/                 # 样式文件
│       └── global.css         # 全局样式（包含Tailwind指令和自定义样式）
│
├── public/                     # 静态资源目录（直接复制到构建输出）
│   └── favicon.svg            # 网站图标
│
├── astro.config.mjs           # Astro配置文件
├── tsconfig.json              # TypeScript配置文件
├── tailwind.config.mjs        # Tailwind CSS配置文件
├── package.json               # 项目依赖和脚本
├── .gitignore                 # Git忽略文件配置
├── .env.example               # 环境变量示例文件
├── edgeone.config.json        # EdgeOne Pages部署配置
├── README.md                  # 项目说明文档
├── DEPLOYMENT.md              # 部署指南
├── API.md                     # API文档
└── PROJECT_STRUCTURE.md       # 本文件（项目结构说明）
```

## 核心模块说明

### 1. Node Functions (后端)

位于 `node-functions/` 目录，提供RESTful API：

#### 认证模块 (`node-functions/auth/`)
- **login.ts**: 处理管理员登录，验证密码，生成JWT token
- **verify.ts**: 验证JWT token有效性

#### 文章模块 (`node-functions/posts/`)
- **index.ts**: 
  - GET: 获取文章列表（支持分页、分类、标签、搜索）
  - POST: 创建新文章（需要认证）
- **[id].ts**: 动态路由
  - GET: 获取文章详情
  - PUT: 更新文章（需要认证）
  - DELETE: 删除文章（需要认证）

#### 分类和标签模块 (`node-functions/categories/`, `node-functions/tags/`)
- 提供分类和标签的列表接口

#### 初始化模块 (`node-functions/init.ts`)
- 首次部署时初始化数据库表和默认管理员

### 2. 前端页面 (`src/pages/`)

#### 公开页面
- **首页** (`index.astro`): 展示文章列表，支持实时搜索
- **文章详情** (`post/[id].astro`): 展示完整文章内容和Twikoo评论
- **标签页面** (`tags/index.astro`, `tags/[name].astro`): 标签列表和标签文章
- **分类页面** (`categories/index.astro`, `categories/[name].astro`): 分类列表和分类文章

#### 管理后台 (`admin/`)
- **管理首页** (`index.astro`): 登录界面和文章管理列表
- **创建文章** (`post/new.astro`): 创建新文章表单
- **编辑文章** (`post/[id].astro`): 编辑现有文章表单

### 3. 布局 (`src/layouts/`)

#### Layout.astro
主布局组件，包含：
- 顶部导航栏（首页、标签、分类、管理）
- 页面内容插槽
- 底部页脚
- 全局JavaScript（认证状态检查）

### 4. 工具库 (`src/lib/`)

#### db.ts
- 创建数据库连接（使用@libsql/client）
- 定义数据库表结构
- 创建默认管理员函数

#### auth.ts
- JWT token生成和验证
- 密码哈希和验证（使用bcryptjs）
- 从请求头提取token

#### init-db.ts
- 数据库初始化流程
- 错误处理和日志记录

### 5. 样式 (`src/styles/`)

#### global.css
- Tailwind CSS指令
- 自定义全局样式
- Twikoo评论组件样式

## 路由系统

### Astro文件路由

Astro使用文件系统路由：

```
src/pages/index.astro         → /
src/pages/post/[id].astro    → /post/1, /post/2, ...
src/pages/tags/index.astro   → /tags
src/pages/tags/[name].astro  → /tags/javascript, ...
```

### Node Functions路由

EdgeOne Pages Node Functions自动映射为API路由：

```
node-functions/auth/login.ts          → /api/auth/login
node-functions/posts/index.ts         → /api/posts
node-functions/posts/[id].ts         → /api/posts/1, ...
node-functions/categories/index.ts    → /api/categories
node-functions/tags/index.ts         → /api/tags
node-functions/init.ts                → /api/init
```

## 数据库结构

### users表
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### posts表
```sql
CREATE TABLE posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  category TEXT,
  tags TEXT,
  status TEXT DEFAULT 'published',
  author_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id)
)
```

### tags表
```sql
CREATE TABLE tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  post_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## 环境变量

| 变量名 | 说明 | 必填 |
|--------|------|------|
| TURSO_DATABASE_URL | Turso数据库连接URL | 是 |
| TURSO_AUTH_TOKEN | Turso数据库认证令牌 | 是 |
| JWT_SECRET | JWT密钥 | 是 |
| ADMIN_USERNAME | 管理员用户名 | 否（默认admin） |
| ADMIN_PASSWORD | 管理员密码 | 是 |
| PUBLIC_TWIKOO_ENV_ID | Twikoo环境ID | 否 |

## 构建流程

1. **开发模式** (`npm run dev`):
   - 启动Astro开发服务器
   - 支持热重载
   - 访问 http://localhost:3000

2. **生产构建** (`npm run build`):
   - 运行类型检查
   - 构建前端资源到 `dist/`
   - 准备Node Functions

3. **部署到EdgeOne Pages**:
   - 上传构建产物
   - 配置Node Functions
   - 设置环境变量

## 扩展指南

### 添加新API

1. 在 `node-functions/` 下创建新文件
2. 导出 `handler` 函数
3. 自动映射为 `/api/路径`

示例：
```typescript
// node-functions/health.ts
export default async function handler(request: Request) {
  return Response.json({ status: 'ok' });
}
// → /api/health
```

### 添加新页面

1. 在 `src/pages/` 下创建 `.astro` 文件
2. Astro自动生成路由

### 添加新数据库表

1. 在 `src/lib/db.ts` 中添加表创建SQL
2. 在 `src/lib/init-db.ts` 中调用初始化
3. 创建对应的API接口

## 性能优化

1. **前端优化**:
   - Astro零JavaScript默认加载
   - 图片优化（可集成@astrojs/image）
   - 代码分割

2. **后端优化**:
   - 数据库查询优化
   - 使用缓存（可集成Redis）
   - CDN加速

3. **EdgeOne优势**:
   - 全球边缘节点
   - 自动HTTPS
   - 智能路由

## 安全措施

1. **认证**:
   - JWT token认证
   - 密码bcrypt哈希
   - Token过期机制

2. **输入验证**:
   - 所有输入验证
   - SQL参数化查询
   - XSS防护

3. **环境安全**:
   - 环境变量保护
   - 生产环境配置分离
   - 定期更新依赖

## 维护建议

1. **定期备份数据库**
2. **更新依赖**: `npm update`
3. **监控日志**: 查看EdgeOne控制台
4. **性能优化**: 使用Astro和EdgeOne的优化工具

## 学习资源

- [Astro文档](https://docs.astro.build)
- [EdgeOne Pages文档](https://docs.cnb.cool)
- [Turso文档](https://docs.turso.tech)
- [Tailwind CSS文档](https://tailwindcss.com)
