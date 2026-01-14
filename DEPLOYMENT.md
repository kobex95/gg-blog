# EdgeOne Blog 部署指南

## 部署前准备

### 1. 创建Turso数据库

访问 [https://turso.tech](https://turso.tech) 注册并创建数据库：

```bash
# 安装Turso CLI
npm install -g turso

# 登录
turso auth login

# 创建数据库
turso db create blog

# 获取数据库连接信息
turso db show blog --url
turso db tokens create blog
```

保存以下信息：
- 数据库URL（类似：`libsql://xxx.turso.io`）
- 认证令牌

### 2. 设置Twikoo评论（可选）

1. 访问 [Twikoo官网](https://twikoo.js.org/)
2. 按照指引创建环境
3. 保存环境ID（ENV_ID）

### 3. 准备EdgeOne账户

确保已开通EdgeOne Pages服务。

## 部署步骤

### 步骤1：配置环境变量

在本地创建 `.env` 文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# Turso数据库
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token

# JWT密钥（必须修改为强随机字符串）
JWT_SECRET=your-very-long-random-secret-key-change-this

# 管理员账户
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password-here

# Twikoo评论
PUBLIC_TWIKOO_ENV_ID=your-twikoo-env-id
```

### 步骤2：本地测试

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000 测试功能。

### 步骤3：初始化数据库

在本地开发环境，发送POST请求到：

```bash
curl -X POST http://localhost:3000/api/init
```

或使用Postman等工具发送POST请求到 `http://localhost:3000/api/init`

### 步骤4：构建项目

```bash
npm run build
```

### 步骤5：部署到EdgeOne Pages

#### 方法A：通过EdgeOne控制台部署

1. 登录 [EdgeOne控制台](https://console.cloud.tencent.com/edgeone)
2. 进入"Pages"页面
3. 点击"创建项目"
4. 选择"直接上传"或连接Git仓库
5. 配置构建设置：
   - 框架：Astro
   - 构建命令：`npm run build`
   - 输出目录：`dist`
   - 启用Node Functions：是

6. 配置环境变量：
   - 在"环境变量"页面添加所有 `.env` 中的变量
   - 重要：不要在环境变量值中包含引号

7. 点击"部署"

#### 方法B：通过EdgeOne CLI部署

```bash
# 安装EdgeOne CLI（如未安装）
npm install -g @edgeone/cli

# 登录
edgeone login

# 初始化配置
edgeone init

# 部署
npm run build && edgeone deploy
```

### 步骤6：生产环境初始化

部署成功后，访问你的域名并发送POST请求到：

```
https://your-domain.edgeone.com/api/init
```

使用浏览器开发者工具或Postman发送POST请求。

### 步骤7：测试部署

1. 访问网站首页，检查是否正常显示
2. 访问 `/admin` 登录管理后台
3. 测试文章创建、编辑、删除功能
4. 检查评论系统是否正常工作

## 环境变量配置详情

在EdgeOne控制台配置以下环境变量：

| 变量名 | 说明 | 必填 | 示例值 |
|--------|------|------|--------|
| TURSO_DATABASE_URL | Turso数据库URL | 是 | `libsql://xxx.turso.io` |
| TURSO_AUTH_TOKEN | Turso数据库认证令牌 | 是 | `eyJh...` |
| JWT_SECRET | JWT密钥（强随机字符串） | 是 | `your-very-long-random-secret-key-2025...` |
| ADMIN_USERNAME | 管理员用户名 | 否（默认admin） | `admin` |
| ADMIN_PASSWORD | 管理员密码 | 是 | `your-secure-password` |
| PUBLIC_TWIKOO_ENV_ID | Twikoo环境ID | 否 | `your-env-id` |

## 常见问题排查

### 问题1：数据库连接失败

**原因**：数据库URL或认证令牌错误

**解决方案**：
1. 检查TURSO_DATABASE_URL和TURSO_AUTH_TOKEN是否正确
2. 确认Turso数据库处于活跃状态（免费版有休眠限制）
3. 在Turso控制台测试数据库连接

### 问题2：无法登录管理后台

**原因**：管理员账户未初始化或密码错误

**解决方案**：
1. 确认已调用 `/api/init` 初始化数据库
2. 检查环境变量ADMIN_USERNAME和ADMIN_PASSWORD
3. 清除浏览器localStorage中的旧token

### 问题3：Node Functions返回500错误

**原因**：代码运行时错误或依赖未安装

**解决方案**：
1. 查看EdgeOne控制台日志
2. 确认package.json中所有依赖都正确配置
3. 检查环境变量是否正确配置

### 问题4：评论功能不显示

**原因**：Twikoo环境ID未配置或Twikoo服务异常

**解决方案**：
1. 检查PUBLIC_TWIKOO_ENV_ID环境变量
2. 确认Twikoo环境正常运行
3. 查看浏览器控制台是否有错误信息

### 问题5：构建失败

**原因**：依赖安装问题或代码错误

**解决方案**：
1. 本地运行 `npm run build` 测试构建
2. 检查是否有TypeScript类型错误
3. 清除node_modules重新安装：`rm -rf node_modules && npm install`

## 性能优化建议

### 1. 启用图片优化

在Astro配置中启用图片优化：

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import { image } from '@astrojs/image';

export default defineConfig({
  integrations: [react(), tailwind(), image()],
  // ...
});
```

### 2. 配置CDN

EdgeOne Pages默认提供全球CDN加速，无需额外配置。

### 3. 启用静态生成

文章列表等页面可以配置为静态生成以提升性能。

### 4. 数据库查询优化

- 为常用查询字段添加索引
- 使用LIMIT分页
- 避免N+1查询

## 备份和恢复

### Turso数据库备份

```bash
# 备份数据库到文件
turso db shell blog --command "SELECT * FROM posts;" > backup_posts.json

# 恢复数据库
turso db shell blog < restore.sql
```

### 环境变量备份

定期备份EdgeOne控制台的环境变量配置。

## 监控和日志

### EdgeOne监控

1. 在EdgeOne控制台查看访问统计
2. 监控Node Functions的错误日志
3. 设置告警通知

### 性能监控

集成Web Vitals监控：

```javascript
// src/layouts/Layout.astro
<script>
  if (import.meta.env.PROD) {
    // 性能监控代码
  }
</script>
```

## 安全建议

1. **定期更新依赖**：运行 `npm audit` 检查安全问题
2. **使用强密码**：管理员密码至少12位，包含大小写字母、数字和符号
3. **限制API访问**：考虑添加速率限制
4. **启用HTTPS**：EdgeOne Pages默认启用
5. **定期备份**：定期备份数据库和环境配置
6. **监控异常访问**：查看访问日志，发现异常及时处理

## 更新和维护

### 更新依赖

```bash
# 检查过时的包
npm outdated

# 更新依赖
npm update

# 重新构建
npm run build
```

### 重新部署

代码更新后，EdgeOne Pages会自动触发重新部署。

## 技术支持

如遇到问题，请参考：
- [Astro文档](https://docs.astro.build)
- [EdgeOne Pages文档](https://docs.cnb.cool)
- [Turso文档](https://docs.turso.tech)
- [Twikoo文档](https://twikoo.js.org)

或提交Issue到项目仓库。
