# EdgeOne Blog API 文档

## 基础信息

- **Base URL**: `https://your-domain.edgeone.com` 或 `http://localhost:3000` (开发环境)
- **认证方式**: Bearer Token (JWT)
- **数据格式**: JSON

## 认证系统

### POST /api/auth/login

管理员登录

**请求体**:
```json
{
  "username": "admin",
  "password": "your-password"
}
```

**响应** (200):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin"
  }
}
```

**错误响应** (401):
```json
{
  "error": "用户名或密码错误"
}
```

### GET /api/auth/verify

验证Token有效性

**请求头**:
```
Authorization: Bearer {token}
```

**响应** (200):
```json
{
  "success": true,
  "user": {
    "userId": 1,
    "username": "admin"
  }
}
```

**错误响应** (401):
```json
{
  "error": "令牌无效或已过期"
}
```

## 文章管理

### GET /api/posts

获取文章列表

**查询参数**:
- `page` (可选): 页码，默认 1
- `limit` (可选): 每页数量，默认 10
- `category` (可选): 按分类筛选
- `tag` (可选): 按标签筛选
- `search` (可选): 搜索关键词

**示例请求**:
```
GET /api/posts?page=1&limit=10&category=技术
GET /api/posts?search=Astro
```

**响应** (200):
```json
{
  "success": true,
  "posts": [
    {
      "id": 1,
      "title": "文章标题",
      "content": "文章内容",
      "excerpt": "文章摘要",
      "category": "技术",
      "tags": "JavaScript,Astro",
      "status": "published",
      "created_at": "2025-01-15T10:00:00.000Z",
      "updated_at": "2025-01-15T10:00:00.000Z",
      "author_name": "admin"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

### GET /api/posts/:id

获取文章详情

**示例请求**:
```
GET /api/posts/1
```

**响应** (200):
```json
{
  "success": true,
  "post": {
    "id": 1,
    "title": "文章标题",
    "content": "完整文章内容",
    "excerpt": "文章摘要",
    "category": "技术",
    "tags": "JavaScript,Astro",
    "status": "published",
    "created_at": "2025-01-15T10:00:00.000Z",
    "updated_at": "2025-01-15T10:00:00.000Z",
    "author_name": "admin"
  }
}
```

**错误响应** (404):
```json
{
  "error": "文章不存在"
}
```

### POST /api/posts

创建新文章（需要认证）

**请求头**:
```
Authorization: Bearer {token}
```

**请求体**:
```json
{
  "title": "新文章标题",
  "content": "文章内容，支持HTML标签",
  "excerpt": "可选的文章摘要",
  "category": "技术",
  "tags": "JavaScript,Astro,前端",
  "status": "published"
}
```

**响应** (200):
```json
{
  "success": true,
  "post": {
    "id": 2,
    "title": "新文章标题",
    "content": "文章内容，支持HTML标签",
    "excerpt": "可选的文章摘要",
    "category": "技术",
    "tags": "JavaScript,Astro,前端",
    "status": "published"
  }
}
```

**错误响应** (400):
```json
{
  "error": "标题和内容不能为空"
}
```

### PUT /api/posts/:id

更新文章（需要认证）

**请求头**:
```
Authorization: Bearer {token}
```

**请求体**:
```json
{
  "title": "更新后的标题",
  "content": "更新后的内容",
  "excerpt": "更新后的摘要",
  "category": "生活",
  "tags": "生活,随笔",
  "status": "published"
}
```

**响应** (200):
```json
{
  "success": true,
  "message": "文章更新成功"
}
```

### DELETE /api/posts/:id

删除文章（需要认证）

**请求头**:
```
Authorization: Bearer {token}
```

**响应** (200):
```json
{
  "success": true,
  "message": "文章删除成功"
}
```

## 分类管理

### GET /api/categories

获取所有分类及文章数量

**响应** (200):
```json
{
  "success": true,
  "categories": [
    {
      "category": "技术",
      "post_count": 30
    },
    {
      "category": "生活",
      "post_count": 15
    }
  ]
}
```

## 标签管理

### GET /api/tags

获取所有标签及文章数量

**响应** (200):
```json
{
  "success": true,
  "tags": [
    {
      "name": "JavaScript",
      "slug": "javascript",
      "post_count": 20
    },
    {
      "name": "Astro",
      "slug": "astro",
      "post_count": 15
    }
  ]
}
```

## 系统管理

### POST /api/init

初始化数据库（仅在首次部署时使用）

**注意**: 此接口不需要认证，但部署完成后应移除或限制访问

**响应** (200):
```json
{
  "success": true,
  "message": "数据库初始化成功"
}
```

**错误响应** (500):
```json
{
  "success": false,
  "error": "初始化失败: xxx"
}
```

## 错误码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权或Token无效 |
| 404 | 资源不存在 |
| 405 | 请求方法不允许 |
| 500 | 服务器内部错误 |

## 通用错误响应格式

```json
{
  "error": "错误描述信息"
}
```

## 通用成功响应格式

```json
{
  "success": true,
  // 其他数据字段...
}
```

## 使用示例

### JavaScript (Fetch)

```javascript
// 登录
async function login(username, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
  const data = await response.json();
  if (data.success) {
    localStorage.setItem('token', data.token);
    return data.user;
  }
  throw new Error(data.error);
}

// 获取文章列表
async function getPosts(page = 1, limit = 10) {
  const response = await fetch(`/api/posts?page=${page}&limit=${limit}`);
  const data = await response.json();
  return data;
}

// 创建文章（需要认证）
async function createPost(postData) {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(postData),
  });
  const data = await response.json();
  if (data.success) {
    return data.post;
  }
  throw new Error(data.error);
}
```

### cURL

```bash
# 登录
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your-password"}'

# 获取文章列表
curl http://localhost:3000/api/posts

# 创建文章（需要token）
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title":"新文章",
    "content":"文章内容",
    "category":"技术"
  }'

# 更新文章（需要token）
curl -X PUT http://localhost:3000/api/posts/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"title":"更新后的标题"}'

# 删除文章（需要token）
curl -X DELETE http://localhost:3000/api/posts/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 速率限制

当前版本未实现速率限制，生产环境建议添加：

- 登录接口：每分钟最多5次
- 公开API：每分钟最多100次
- 需要认证的API：每分钟最多50次

## 安全建议

1. **始终使用HTTPS**：EdgeOne Pages默认提供
2. **保护JWT Secret**：使用强随机字符串
3. **设置Token过期时间**：当前设置为7天
4. **输入验证**：所有输入都应经过验证和清理
5. **SQL注入防护**：使用参数化查询（已实现）
6. **XSS防护**：前端渲染时转义HTML（已实现）

## 版本历史

- v1.0.0 (2025-01-15): 初始版本
