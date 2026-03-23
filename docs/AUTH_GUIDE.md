# 用户认证系统使用指南

## 📋 功能概述

本项目现已集成完整的用户认证系统，支持以下功能：

- ✅ 用户注册（邮箱 + 密码）
- ✅ 用户登录
- ✅ 用户登出
- ✅ 密码重置（需配置 SMTP）
- ✅ JWT Token 认证
- ✅ 会话持久化（localStorage）
- ✅ 密码强度验证
- ✅ 邮箱格式验证

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 到 `.env` 并配置以下变量：

```bash
# 数据库连接（PostgreSQL）
DATABASE_URL=postgresql://nextai:nextai_password@localhost:5432/nextai_drawio

# JWT 配置
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long
JWT_EXPIRES_IN=7d

# 邮件配置（可选，用于密码重置）
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
# SMTP_FROM=noreply@nextai-drawio.com
```

**重要**：`JWT_SECRET` 至少需要 32 个字符，建议使用随机生成的安全密钥。

### 3. 启动数据库（Docker）

```bash
# 启动 PostgreSQL 和主应用
docker-compose up -d

# 查看数据库日志
docker-compose logs -f postgres

# 停止所有服务
docker-compose down
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:6002

## 📊 数据库结构

### users 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| email | VARCHAR(255) | 邮箱（唯一） |
| password_hash | VARCHAR(255) | 密码哈希 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### password_reset_tokens 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 外键（关联 users.id） |
| token | VARCHAR(255) | 重置令牌（唯一） |
| expires_at | TIMESTAMP | 过期时间 |
| used | BOOLEAN | 是否已使用 |
| created_at | TIMESTAMP | 创建时间 |

## 🔐 安全特性

### 密码安全
- 使用 bcrypt 加密（salt rounds: 10）
- 密码强度要求：
  - 至少 8 位字符
  - 包含小写字母
  - 包含大写字母
  - 包含数字

### JWT Token
- 默认 7 天过期
- 存储在客户端 localStorage
- 通过 Authorization header 传输

### 防护措施
- SQL 注入防护（参数化查询）
- 邮箱格式验证
- 密码强度验证
- 防止邮箱枚举攻击（忘记密码接口统一返回成功）

## 📱 API 接口

### POST /api/auth/register

用户注册

**请求体：**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**响应：**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "token": "jwt-token-here"
}
```

### POST /api/auth/login

用户登录

**请求体：**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**响应：** 同注册接口

### GET /api/auth/me

获取当前用户信息

**请求头：**
```
Authorization: Bearer <token>
```

**响应：**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

### POST /api/auth/logout

用户登出

**请求头：**
```
Authorization: Bearer <token>
```

### POST /api/auth/forgot-password

发送密码重置邮件

**请求体：**
```json
{
  "email": "user@example.com"
}
```

### POST /api/auth/reset-password

重置密码

**请求体：**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePass123"
}
```

## 🎨 UI 组件

### 认证按钮

在聊天面板右上角显示：
- 未登录：登录/注册按钮
- 已登录：用户菜单（邮箱 + 退出登录）

### 对话框组件

- `LoginDialog` - 登录对话框
- `RegisterDialog` - 注册对话框
- `ForgotPasswordDialog` - 忘记密码对话框

### 使用 Hook

```tsx
import { useAuth } from '@/hooks/use-auth'

function MyComponent() {
  const { user, token, isLoading, login, register, logout } = useAuth()
  
  // 使用认证状态
}
```

## 🔧 配置邮件服务（可选）

如需启用密码重置邮件功能，需配置 SMTP：

### Gmail 示例

1. 启用两步验证
2. 生成应用专用密码
3. 配置环境变量：

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@nextai-drawio.com
```

### 其他 SMTP 服务商

- SendGrid
- Mailgun
- Amazon SES
- 腾讯企业邮箱
- 网易企业邮箱

## 🐛 故障排查

### 数据库连接失败

1. 检查 PostgreSQL 是否运行：
   ```bash
   docker-compose ps
   ```

2. 检查数据库日志：
   ```bash
   docker-compose logs postgres
   ```

3. 验证连接字符串：
   ```bash
   psql postgresql://nextai:nextai_password@localhost:5432/nextai_drawio
   ```

### JWT 认证失败

1. 检查 `JWT_SECRET` 是否配置
2. 检查 token 是否过期
3. 清除浏览器 localStorage 重试

### 密码重置邮件未发送

1. 检查 SMTP 配置
2. 查看服务器日志
3. 检查垃圾邮件文件夹

## 📝 开发注意事项

### 本地开发

```bash
# 启动数据库
docker-compose up -d postgres

# 运行应用
npm run dev
```

### 生产部署

1. 使用强密码生成 `JWT_SECRET`
2. 配置生产数据库连接
3. 启用 HTTPS
4. 配置 SMTP 邮件服务
5. 设置数据库备份

### 数据库迁移

数据库初始化脚本位于 `scripts/init-db.sql`，Docker 容器首次启动时自动执行。

如需手动执行：

```bash
psql postgresql://nextai:nextai_password@localhost:5432/nextai_drawio -f scripts/init-db.sql
```

## 🔮 未来改进

- [ ] 邮箱验证
- [ ] 双因素认证（2FA）
- [ ] OAuth 登录（Google/GitHub）
- [ ] 用户资料管理
- [ ] 会话同步（多设备）
- [ ] 管理员后台
- [ ] 用户配额管理

## 📚 相关文档

- [Docker 部署指南](../DOCKER_DEPLOYMENT.md)
- [快速开始](../QUICK_START.md)
- [API 文档](../README.md)
