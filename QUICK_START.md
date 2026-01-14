# EdgeOne Blog 快速部署教程

本教程将指导您在10分钟内完成博客系统的部署。

## 第一步：准备服务

### 1.1 注册Turso数据库

1. 访问 [https://turso.tech](https://turso.tech)
2. 点击 "Sign Up" 注册账户
3. 登录后进入 Dashboard
4. 点击 "Create Database"
5. 输入数据库名称（如：`blog-db`）
6. 选择区域（推荐选择离您最近的区域）
7. 点击 "Create"

创建成功后，您会看到数据库连接信息，保存下来：
- **Database URL**: 类似 `libsql://xxx-username.turso.io`
- **Auth Token**: 点击 "Generate Token" 生成认证令牌

### 1.2 配置Twikoo评论（可选）

如果需要评论功能：

1. 访问 [https://twikoo.js.org](https://twikoo.js.org)
2. 选择部署平台（推荐Vercel）
3. 按照指引完成部署
4. 记录 **Environment ID**（类似：`https://twikoo.vercel.app/xxxxx`）

## 第二步：配置环境变量

### 2.1 创建 .env 文件

在项目根目录执行：

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# Linux/Mac
cp .env.example .env
```

### 2.2 编辑环境变量

打开 `.env` 文件，填入以下内容：

```env
# ============================================
# Turso数据库配置（必填）
# ============================================
# 从Turso Dashboard获取
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ============================================
# JWT配置（必填）
# ============================================
# 生成强随机密钥的方法见下方
JWT_SECRET=your-very-long-random-secret-key-change-this-in-production

# ============================================
# 管理员账户（必填）
# ============================================
# 建议修改默认用户名和密码
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password-here-at-least-12-characters

# ============================================
# Twikoo评论（可选）
# ============================================
# 如果不使用评论功能，可以留空或删除此行
PUBLIC_TWIKOO_ENV_ID=https://your-twikoo.vercel.app/xxxxx
```

### 2.3 生成强随机密钥

使用以下方法之一生成安全的JWT_SECRET：

#### 方法1：使用Node.js
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### 方法2：使用OpenSSL
```bash
openssl rand -hex 64
```

#### 方法3：在线生成器
访问 [https://www.random.org/strings/](https://www.random.org/strings/)
- Length: 64
- Characters: Alpha-numeric

将生成的密钥填入 `JWT_SECRET`。

### 2.4 设置管理员密码

管理员密码要求：
- 至少12位
- 包含大小写字母
- 包含数字
- 建议包含特殊字符

示例强密码：
```
MyP@ssw0rd!2025$ecure
```

## 第三步：本地测试

### 3.1 安装依赖

```bash
npm install
```

### 3.2 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看效果。

### 3.3 初始化数据库

打开新的终端窗口，执行：

```bash
# Windows PowerShell
Invoke-RestMethod -Uri "http://localhost:3000/api/init" -Method Post

# Linux/Mac
curl -X POST http://localhost:3000/api/init
```

如果看到响应 `{"success":true,"message":"数据库初始化成功"}`，说明初始化成功。

### 3.4 测试登录

1. 访问 http://localhost:3000/admin
2. 使用环境变量中配置的用户名和密码登录
3. 测试创建、编辑、删除文章功能

## 第四步：部署到EdgeOne Pages

### 4.1 方法A：通过EdgeOne控制台部署（推荐）

#### 步骤1：准备代码

确保代码已推送到Git仓库（GitHub/Gitee/GitLab等）：

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

#### 步骤2：在EdgeOne创建项目

1. 访问 [https://console.cloud.tencent.com/edgeone](https://console.cloud.tencent.com/edgeone)
2. 登录腾讯云账户
3. 进入 "Pages" 页面
4. 点击 "创建项目"

#### 步骤3：配置项目

在创建项目页面：

**选择部署方式**：
- 选择 "Git仓库"
- 选择您的Git托管平台（GitHub/Gitee）
- 授权EdgeOne访问您的仓库
- 选择要部署的仓库和分支

**构建设置**：
- 框架：选择 "Astro"
- 构建命令：`npm run build`
- 输出目录：`dist`
- Node Functions：勾选 "启用Node Functions"

#### 步骤4：配置环境变量

在项目配置页面，找到"环境变量"部分，逐个添加：

| 变量名 | 值 | 说明 |
|--------|---|------|
| TURSO_DATABASE_URL | libsql://xxx.turso.io | Turso数据库URL（不要加引号） |
| TURSO_AUTH_TOKEN | eyJhbGc... | Turso认证令牌（不要加引号） |
| JWT_SECRET | xxx | 您生成的随机密钥（不要加引号） |
| ADMIN_USERNAME | admin | 管理员用户名（建议修改） |
| ADMIN_PASSWORD | xxx | 管理员密码（不要加引号） |
| PUBLIC_TWIKOO_ENV_ID | https://xxx | Twikoo环境ID（可选） |

**重要提示**：
- ✅ 值中不要包含引号
- ✅ 确保复制粘贴完整
- ✅ 检查没有多余的空格

#### 步骤5：开始部署

点击"部署"按钮，等待构建完成（通常需要2-5分钟）。

### 4.2 方法B：通过EdgeOne CLI部署

#### 步骤1：安装CLI

```bash
npm install -g @edgeone/cli
```

#### 步骤2：登录

```bash
edgeone login
```

按照提示完成登录。

#### 步骤3：初始化项目

```bash
cd Blog
edgeone init
```

按照提示选择：
- 框架：Astro
- 是否启用Node Functions：Yes

#### 步骤4：部署

```bash
npm run build
edgeone deploy
```

#### 步骤5：配置环境变量

在EdgeOne控制台手动添加环境变量（参考方法A的步骤4）。

## 第五步：生产环境初始化

部署完成后：

1. 访问您的域名（如：`https://your-app.edgeone.com`）
2. 使用浏览器开发者工具或Postman发送POST请求到：
   ```
   https://your-app.edgeone.com/api/init
   ```

**使用浏览器开发者工具**：
1. 按 F12 打开开发者工具
2. 切换到 "Console" 标签
3. 输入以下代码：
   ```javascript
   fetch('/api/init', { method: 'POST' })
     .then(r => r.json())
     .then(d => console.log(d))
   ```
4. 回车执行
5. 查看响应，应为 `{"success":true,"message":"数据库初始化成功"}`

**使用Postman**：
1. 创建新请求
2. Method选择 POST
3. URL填入 `https://your-app.edgeone.com/api/init`
4. 点击 Send
5. 查看响应

## 第六步：测试部署

1. **访问首页**：打开您的域名，检查是否正常显示
2. **访问管理后台**：进入 `/admin`，使用管理员账户登录
3. **测试文章功能**：
   - 创建新文章
   - 编辑文章
   - 删除文章
4. **测试搜索**：在首页搜索框测试搜索功能
5. **测试分类和标签**：点击分类和标签链接
6. **测试评论**（如果配置了Twikoo）：在文章详情页测试评论

## 环境变量详细说明

### 必填变量

#### TURSO_DATABASE_URL
- **说明**：Turso数据库的连接URL
- **获取方式**：Turso Dashboard → 选择数据库 → 显示连接信息
- **格式**：`libsql://xxx-username.turso.io`
- **示例**：`libsql://blog-db-john.turso.io`

#### TURSO_AUTH_TOKEN
- **说明**：Turso数据库的认证令牌
- **获取方式**：Turso Dashboard → 选择数据库 → "Generate Token"
- **格式**：JWT格式的长字符串
- **示例**：`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **注意**：妥善保管，不要泄露

#### JWT_SECRET
- **说明**：用于签名和验证JWT令牌的密钥
- **要求**：至少64位的随机字符串
- **生成方法**：参考上文"2.3 生成强随机密钥"
- **示例**：`a1b2c3d4e5f6...` (64位十六进制)
- **注意**：生产环境必须使用强随机密钥

#### ADMIN_USERNAME
- **说明**：管理员登录用户名
- **默认值**：`admin`
- **建议**：修改为不易猜测的用户名
- **示例**：`myadmin` 或 `blog_master`

#### ADMIN_PASSWORD
- **说明**：管理员登录密码
- **要求**：至少12位，包含大小写、数字、特殊字符
- **建议**：使用密码管理器生成
- **示例**：`MyP@ssw0rd!2025$ecure`

### 可选变量

#### PUBLIC_TWIKOO_ENV_ID
- **说明**：Twikoo评论系统的环境ID
- **用途**：启用文章评论功能
- **获取方式**：部署Twikoo后获得
- **示例**：`https://twikoo.vercel.app/xxxxx`
- **注意**：如果不使用评论功能，可以留空

### EdgeOne特定变量（自动设置）

以下变量由EdgeOne自动设置，无需手动配置：

#### EDGEONE_API_TOKEN
- **说明**：EdgeOne API访问令牌
- **用途**：内部使用，用户无需关心

#### EDGEONE_REPO_SLUG
- **说明**：仓库标识
- **用途**：内部使用，用户无需关心

## 常见部署问题

### 问题1：环境变量未生效

**症状**：部署后无法连接数据库或登录失败

**解决方案**：
1. 检查环境变量名称是否正确（区分大小写）
2. 检查变量值是否完整（没有复制遗漏）
3. 确保变量值中没有引号
4. 重新部署项目

### 问题2：构建失败

**症状**：EdgeOne控制台显示构建错误

**解决方案**：
1. 本地运行 `npm run build` 测试
2. 检查依赖是否完整：`npm install`
3. 查看构建日志中的具体错误信息
4. 清除node_modules重新安装：
   ```bash
   rm -rf node_modules
   npm install
   ```

### 问题3：数据库连接失败

**症状**：访问网站时提示数据库错误

**解决方案**：
1. 确认TURSO_DATABASE_URL正确
2. 确认TURSO_AUTH_TOKEN有效
3. 检查Turso数据库是否处于活跃状态
4. 确认已调用 `/api/init` 初始化数据库

### 问题4：无法登录管理后台

**症状**：登录时提示用户名或密码错误

**解决方案**：
1. 确认已调用 `/api/init` 初始化数据库
2. 检查ADMIN_USERNAME和ADMIN_PASSWORD配置
3. 清除浏览器localStorage：
   - 按F12打开开发者工具
   - 切换到Application标签
   - 删除LocalStorage中的token
4. 尝试重新登录

### 问题5：Twikoo评论不显示

**症状**：文章详情页没有评论区域

**解决方案**：
1. 检查PUBLIC_TWIKOO_ENV_ID是否配置
2. 确认Twikoo环境正常运行
3. 按F12查看浏览器控制台错误
4. 确认已正确引用Twikoo的CDN脚本

## 安全检查清单

部署完成后，请完成以下安全检查：

- [ ] 已修改默认管理员密码
- [ ] 已使用强随机JWT_SECRET
- [ ] 已确认环境变量中没有敏感信息泄露
- [ ] 已测试登录功能
- [ ] 已确认HTTPS正常工作（EdgeOne默认启用）
- [ ] 已备份数据库连接信息

## 下一步

部署成功后，您可以：

1. **自定义样式**：修改 `src/styles/global.css`
2. **添加页面**：在 `src/pages/` 创建新页面
3. **扩展功能**：参考 `PROJECT_STRUCTURE.md`
4. **配置域名**：在EdgeOne控制台绑定自定义域名
5. **设置CDN**：EdgeOne Pages已自动配置

## 获取帮助

如遇到问题：

1. 查看 [DEPLOYMENT.md](DEPLOYMENT.md) 获取详细部署指南
2. 查看 [API.md](API.md) 了解API使用方法
3. 查看 [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) 了解项目结构
4. 在EdgeOne控制台查看部署日志
5. 提交Issue到项目仓库

## 资源链接

- [Astro文档](https://docs.astro.build)
- [EdgeOne Pages文档](https://docs.cnb.cool)
- [Turso文档](https://docs.turso.tech)
- [Twikoo文档](https://twikoo.js.org)
- [Tailwind CSS文档](https://tailwindcss.com)

祝您部署顺利！🎉
