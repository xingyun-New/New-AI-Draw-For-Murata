# 🚀 本地开发模式启动指南

## 📋 说明

由于 Docker 官方镜像不包含本地开发的认证功能，需要在**本地开发模式**下运行才能使用注册登录功能。

## ✅ 前提条件

1. **数据库已运行**
   - PostgreSQL 容器已在运行
   - 端口：5432
   - 数据库：nextai_drawio
   - 用户：nextai
   - 密码：nextai_password

2. **依赖已安装**
   ```bash
   npm install
   ```
   注意：首次安装可能需要较长时间（5-15 分钟），请耐心等待

##  启动步骤

### 方式一：自动启动（推荐）

运行快速设置脚本：

**Windows PowerShell:**
```powershell
.\scripts\setup-auth.ps1
```

**完成后启动开发服务器:**
```bash
npm run dev
```

### 方式二：手动启动

**1. 确保数据库运行**
```bash
docker-compose up -d postgres
```

**2. 安装依赖**
```bash
npm install
```

**3. 启动开发服务器**
```bash
npm run dev
```

**4. 访问应用**
打开浏览器访问：http://localhost:6002

## 🔐 测试认证功能

### 1. 注册账号

1. 访问 http://localhost:6002
2. 点击右上角"注册"按钮
3. 输入邮箱和密码
   - 密码要求：至少 8 位，包含大小写字母和数字
   - 示例：`TestPass123`
4. 点击"注册"按钮
5. 注册成功后自动登录

### 2. 登录账号

1. 点击"退出登录"
2. 点击"登录"按钮
3. 输入邮箱和密码
4. 点击"登录"按钮
5. 登录成功

### 3. 忘记密码

1. 点击登录对话框中的"忘记密码？"
2. 输入注册邮箱
3. 点击"发送重置链接"
4. 查看控制台输出重置令牌（开发环境）

## 📊 数据库操作

### 查看用户
```bash
docker exec -it nextai-postgres psql -U nextai -d nextai_drawio -c "SELECT * FROM users;"
```

### 清空用户数据
```bash
docker exec -it nextai-postgres psql -U nextai -d nextai_drawio -c "TRUNCATE TABLE users, password_reset_tokens CASCADE;"
```

## 🔧 常用命令

### 启动数据库
```bash
docker-compose up -d postgres
```

### 停止数据库
```bash
docker-compose down
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
npm start
```

## 🌐 访问地址

| 服务 | 地址 | 说明 |
|------|------|------|
| 开发服务器 | http://localhost:6002 | 本地开发模式 |
| Docker 应用 | http://localhost:3001 | 官方镜像（无认证功能） |
| 数据库 | localhost:5432 | PostgreSQL |

## ⚠️ 注意事项

### 端口说明
- **开发模式**: 6002 (npm run dev)
- **Docker 模式**: 3001 (docker-compose)

### 功能对比

| 功能 | 开发模式 | Docker 模式 |
|------|---------|-----------|
| 用户注册 | ✅ 支持 | ❌ 不支持 |
| 用户登录 | ✅ 支持 | ❌ 不支持 |
| 密码重置 | ✅ 支持 | ❌ 不支持 |
| AI 图表生成 | ✅ 支持 | ✅ 支持 |
| 会话历史 | ✅ 支持 | ✅ 支持 |

### 环境变量

确保 `.env` 文件包含以下配置：

```bash
# 数据库连接
DATABASE_URL=postgresql://nextai:nextai_password@localhost:5432/nextai_drawio

# JWT 配置
JWT_SECRET=xK9mP2vL5nQ8wR3tY6uI0oA4sD7fG1hJ2kL5zX8cV3bN6mQ9wE2rT4yU7iO0pA3s
JWT_EXPIRES_IN=7d
```

## 🐛 故障排查

### 问题 1：数据库连接失败

**症状**: 启动时报数据库连接错误

**解决方案**:
```bash
# 检查数据库是否运行
docker-compose ps postgres

# 重启数据库
docker-compose restart postgres

# 等待几秒后启动应用
Start-Sleep -Seconds 5
npm run dev
```

### 问题 2：端口被占用

**症状**: 启动时报端口 6002 已被占用

**解决方案**:
```bash
# 查找占用端口的进程
netstat -ano | findstr :6002

# 杀死进程（替换 PID）
taskkill /PID <PID> /F

# 或者修改端口
npm run dev -- --port 6003
```

### 问题 3：npm install 卡住

**症状**: npm install 长时间无响应

**解决方案**:
```bash
# 清理缓存
npm cache clean --force

# 删除 node_modules
Remove-Item -Recurse -Force node_modules

# 删除 package-lock.json
Remove-Item package-lock.json

# 重新安装
npm install
```

### 问题 4：认证功能不显示

**症状**: 界面没有显示登录/注册按钮

**解决方案**:
1. 确认启动的是开发服务器（端口 6002）
2. 清除浏览器缓存
3. 硬刷新页面（Ctrl+Shift+R）
4. 检查控制台是否有错误

## 📚 相关文档

- [认证系统完整文档](docs/AUTH_GUIDE.md)
- [实现总结](IMPLEMENTATION_SUMMARY.md)
- [Docker 部署指南](DOCKER_DEPLOYMENT.md)

## 🎉 成功标志

当您看到以下内容时，说明启动成功：

1. ✅ 浏览器访问 http://localhost:6002
2. ✅ 右上角显示"登录"和"注册"按钮
3. ✅ 可以成功注册和登录
4. ✅ 登录后显示用户菜单

---

**开发愉快！** 🚀

如有问题，请查看控制台日志或查阅文档。
