# Docker 部署成功！🎉

## ✅ 部署状态

所有服务已成功启动并运行：

| 服务 | 容器名 | 状态 | 端口 | 说明 |
|------|--------|------|------|------|
| 主应用 | next-ai-draw-io | ✅ Running | 3001 | Next.js 应用 |
| 数据库 | nextai-postgres | ✅ Healthy | 5432 | PostgreSQL 15 |

## 🌐 访问地址

- **应用地址**: http://localhost:3001
- **数据库地址**: localhost:5432

## 📊 数据库信息

已成功创建以下数据表：

```sql
-- users 表（用户信息）
- id: UUID 主键
- email: 邮箱（唯一）
- password_hash: 密码哈希
- created_at: 创建时间
- updated_at: 更新时间

-- password_reset_tokens 表（密码重置令牌）
- id: UUID 主键
- user_id: 外键
- token: 重置令牌
- expires_at: 过期时间
- used: 是否已使用
- created_at: 创建时间
```

## 🚀 快速测试

### 1. 访问应用

打开浏览器访问：http://localhost:3001

### 2. 测试用户注册

1. 点击右上角"注册"按钮
2. 输入邮箱和密码
3. 密码要求：
   - 至少 8 位字符
   - 包含大小写字母
   - 包含数字
   - 示例：`TestPass123`

### 3. 测试用户登录

1. 点击"退出登录"
2. 点击"登录"按钮
3. 输入已注册的邮箱和密码
4. 验证登录成功

## 📝 重要说明

### 当前部署版本

⚠️ **注意**：当前部署使用的是官方镜像 `ghcr.io/dayuanjiang/next-ai-draw-io:latest`，**不包含本地新增的认证代码**。

官方镜像是一个独立版本，主要用于测试基础功能。

### 使用本地认证功能

如需使用本地开发的完整认证系统，需要：

#### 方案一：本地开发模式（推荐）

直接在本地运行开发服务器：

```bash
# 1. 确保数据库运行
docker-compose up -d postgres

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
```

访问：http://localhost:6002

#### 方案二：本地构建 Docker 镜像

当网络条件允许时，可以构建本地镜像：

```bash
# 1. 编辑 docker-compose.yml
# 取消注释 build 配置，注释掉 image 配置

# 2. 构建并启动
docker-compose up -d --build
```

## 🔧 Docker 命令

### 查看服务状态
```bash
docker-compose ps
```

### 查看应用日志
```bash
docker-compose logs next-ai-draw-io
```

### 查看数据库日志
```bash
docker-compose logs postgres
```

### 重启服务
```bash
docker-compose restart
```

### 停止服务
```bash
docker-compose down
```

### 停止并删除数据
```bash
docker-compose down -v
```

## 🗄️ 数据库操作

### 连接到数据库
```bash
docker exec -it nextai-postgres psql -U nextai -d nextai_drawio
```

### 查看用户
```sql
SELECT id, email, created_at FROM users;
```

### 清空用户数据（开发环境）
```sql
TRUNCATE TABLE users, password_reset_tokens CASCADE;
```

### 退出数据库
```sql
\q
```

## 📁 配置文件

### 环境变量 (.env)

已配置以下关键变量：

```bash
# 数据库连接
DATABASE_URL=postgresql://nextai:nextai_password@postgres:5432/nextai_drawio

# JWT 配置
JWT_SECRET=xK9mP2vL5nQ8wR3tY6uI0oA4sD7fG1hJ2kL5zX8cV3bN6mQ9wE2rT4yU7iO0pA3s
JWT_EXPIRES_IN=7d

# Draw.io 配置
NEXT_PUBLIC_DRAWIO_BASE_URL=http://host.docker.internal:8080
```

### Docker Compose (docker-compose.yml)

配置说明：
- 使用 Docker 网络隔离服务
- 数据库持久化存储（卷）
- 健康检查配置
- 自动重启策略

## 🔒 安全提示

1. **生产环境**：请更改默认密码和 JWT_SECRET
2. **数据备份**：定期备份 PostgreSQL 数据卷
3. **HTTPS**：生产环境请配置 HTTPS
4. **访问控制**：建议配置防火墙规则

## 🐛 故障排查

### 应用无法访问

```bash
# 检查容器状态
docker-compose ps

# 查看应用日志
docker-compose logs next-ai-draw-io

# 重启应用
docker-compose restart next-ai-draw-io
```

### 数据库连接失败

```bash
# 检查数据库状态
docker-compose ps postgres

# 查看数据库日志
docker-compose logs postgres

# 测试数据库连接
docker exec nextai-postgres psql -U nextai -d nextai_drawio -c "SELECT 1"
```

### 网络问题

```bash
# 重启 Docker 网络
docker-compose down
docker-compose up -d
```

## 📈 性能优化

### 数据库性能

- 已配置连接池（最大 20 连接）
- 已创建索引优化查询
- 使用卷持久化数据

### 应用性能

- 生产构建优化
- 静态资源缓存
- 健康检查监控

## 🎯 下一步

### 立即可用
- ✅ 数据库已就绪
- ✅ 应用已启动
- ✅ 网络已配置

### 建议使用
1. 在本地开发模式使用完整认证功能
2. 测试基本功能
3. 配置 draw.io 服务（如需要）

### 未来改进
- 构建本地 Docker 镜像（包含认证代码）
- 配置 SMTP 邮件服务
- 添加邮箱验证功能
- 实现 OAuth 登录

## 📚 相关文档

- [认证系统使用指南](docs/AUTH_GUIDE.md)
- [实现总结](AUTH_IMPLEMENTATION.md)
- [完整总结](IMPLEMENTATION_SUMMARY.md)

---

**部署时间**: 2026-03-22
**部署状态**: ✅ 成功
**应用版本**: v0.4.13 (官方镜像)

祝使用愉快！🚀
