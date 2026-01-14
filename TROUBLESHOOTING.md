# API 连接问题诊断和解决方案

## 问题描述

管理后台登录时显示："网络错误，请稍后重试"，但页面本身已成功部署。

## 问题原因

### 最可能的原因

**EdgeOne Pages 的 Node Functions 路由未正确配置**

虽然 `node-functions/` 目录中的文件已正确创建并导出了 `handler` 函数，但 EdgeOne Pages 可能：
1. 没有识别到这些文件
2. 没有正确映射到 `/api/*` 路径
3. 需要特定的配置或文件结构

## 诊断步骤

### 第一步：测试 API 是否可访问

在浏览器中访问以下 URL：

```
https://your-app.edgeone.com/api/health
```

**预期结果**：
- ✅ 成功：`{"success":true,"message":"API is working","timestamp":"..."}`
- ❌ 失败：404 Not Found 或其他错误

### 第二步：检查 EdgeOne 构建日志

在 EdgeOne 控制台查看最新的构建日志，查找：

1. **Node Functions 相关的错误信息**
2. 是否提到 `node-functions` 目录的处理
3. 是否有部署成功的确认

### 第三步：打开浏览器开发者工具

1. 按 `F12` 打开开发者工具
2. 切换到 `Console` 标签
3. 登录时查看网络请求
4. 找到 `/api/auth/login` 的请求
5. 查看错误信息（404、500 等）

## 解决方案

### 方案 A：重新部署项目（推荐）

1. **在 EdgeOne 控制台**：
   - 找到您的项目
   - 点击"重新部署"或"重新构建"
   
2. **等待构建完成**（通常 2-3 分钟）

3. **测试 API 健康检查**：
   - 访问 `https://your-app.edgeone.com/api/health`
   - 检查是否返回成功响应

4. **测试登录功能**

### 方案 B：检查 EdgeOne Pages 配置

确认 EdgeOne Pages 项目设置：

1. **Node Functions 是否已启用**
   - 在项目设置中确认"启用 Node Functions"选项已勾选
   
2. **路由配置**
   - 检查是否有特殊的路由配置需要设置
   - 确认根路径设置正确

3. **环境变量**
   - 确认所有必需的环境变量都已设置
   - 特别是 `TURSO_DATABASE_URL` 和 `TURSO_AUTH_TOKEN`

### 方案 C：检查 node-functions 文件

确认文件结构正确：

```
node-functions/
├── auth/
│   ├── login.ts       ✅ 导出 default handler
│   └── verify.ts      ✅ 导出 default handler
├── posts/
│   ├── index.ts       ✅ 导出 default handler
│   └── [id].ts       ✅ 导出 default handler
├── categories/
│   └── index.ts      ✅ 导出 default handler
├── tags/
│   └── index.ts       ✅ 导出 default handler
├── init.ts            ✅ 导出 default handler
├── health.ts          ✅ 导出 default handler（新增）
└── lib/
    ├── auth.ts        ✅ 工具库
    ├── db.ts          ✅ 工具库
    └── init-db.ts     ✅ 工具库
```

### 方案 D：联系 EdgeOne 支持

如果以上方案都不奏效：

1. 在 EdgeOne 控制台提交工单
2. 或通过其他渠道联系 EdgeOne 技术支持
3. 说明：Node Functions 文件存在但无法访问 API 路由

## 临时替代方案

在 API 问题解决前，您可以使用以下方式管理博客：

### 方式 1：直接操作 Turso 数据库

1. 在 [Turso Dashboard](https://turso.tech) 中直接操作数据库
2. 手动添加、编辑文章（需要 SQL 知识）
3. 虽然不推荐长期使用，但可以作为临时方案

### 方式 2：使用其他部署平台

如果 EdgeOne Pages 的 Node Functions 持续无法工作，考虑：

1. **Vercel** - 完全支持 Node.js
2. **Netlify** - 支持 Serverless Functions
3. **Cloudflare Pages** - 支持边缘计算

## 代码验证

### 所有 Node Functions 都正确导出 handler

每个文件都使用正确的导出格式：

```typescript
export default async function handler(request: Request) {
  // 处理逻辑
  return Response.json({ ... });
}
```

### API 端点列表

部署后应该可以访问以下端点：

- `/api/health` - 健康检查（新增）
- `/api/auth/login` - 管理员登录
- `/api/auth/verify` - Token 验证
- `/api/posts` - 文章列表和创建
- `/api/posts/:id` - 文章详情、更新、删除
- `/api/categories` - 分类列表
- `/api/tags` - 标签列表
- `/api/init` - 数据库初始化

## 快速测试脚本

在浏览器控制台运行以下代码来全面测试：

```javascript
async function testAllEndpoints() {
  const endpoints = [
    '/api/health',
    '/api/auth/login',
    '/api/posts',
    '/api/categories',
    '/api/tags'
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint);
      const status = response.status;
      results.push({
        endpoint,
        status,
        statusText: status === 200 ? '✅' : '❌'
      });
    } catch (error) {
      results.push({
        endpoint,
        status: 'ERROR',
        statusText: '❌',
        error: error.message
      });
    }
  }
  
  console.table(results);
  
  const successCount = results.filter(r => r.status === 200).length;
  alert(`测试完成：${successCount}/${results.length} 个端点可用`);
}

testAllEndpoints();
```

## 后续步骤

### 1. 立即测试

- 访问 `/api/health` 测试基本连接
- 尝试登录功能
- 记录所有错误信息

### 2. 收集诊断信息

- 浏览器控制台的错误信息
- EdgeOne 控制台的构建日志
- 网络请求的详细状态

### 3. 根据测试结果采取行动

**如果 `/api/health` 可访问，但其他 API 不可用**：
→ 说明是路由配置问题，需要联系 EdgeOne 支持

**如果 `/api/health` 不可访问**：
→ 说明 Node Functions 整体未部署，需要重新部署

## 需要帮助？

请将以下信息提供给技术支持：

1. **域名**：`https://your-app.edgeone.com`
2. **健康检查结果**：访问 `/api/health` 的响应
3. **浏览器控制台错误**：完整的错误信息
4. **EdgeOne 构建日志**：最新的构建输出
5. **期望行为**：您期望看到的 vs 实际看到的

## 预防措施

为了避免将来出现类似问题：

1. **在开发环境先测试**：确保所有 API 正常工作后再部署
2. **添加健康检查端点**：已添加 `/api/health` 用于监控
3. **使用 API 错误处理**：前端已实现，但需要后端正确响应
4. **配置日志记录**：在 Node Functions 中添加更详细的日志
5. **使用环境变量**：确保所有配置都正确设置

---

**文档更新时间**：2025-01-15
**适用版本**：EdgeOne Blog v1.0.0
