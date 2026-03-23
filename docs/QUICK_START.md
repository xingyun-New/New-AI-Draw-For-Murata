# 🚀 快速部署命令

## Windows (PowerShell)

### 完整部署流程

```powershell
# 1️⃣ 启动 draw.io 服务器
.\scripts\01-start-drawio.ps1

# 2️⃣ 配置 API Key（会打开记事本）
notepad .env

# 3️⃣ 启动主应用
.\scripts\02-start-app.ps1

# 4️⃣ 访问应用
Start-Process http://localhost:3001
```

### 常用命令

```powershell
# 查看日志
docker-compose logs -f

# 停止所有服务
.\scripts\03-stop-all.ps1

# 重启服务
docker-compose restart

# 查看容器状态
docker-compose ps
```

---

## Linux / macOS (Bash)

### 完整部署流程

```bash
# 1️⃣ 启动 draw.io 服务器
bash scripts/01-start-drawio.sh

# 2️⃣ 配置 API Key
nano .env

# 3️⃣ 启动主应用
bash scripts/02-start-app.sh

# 4️⃣ 访问应用
# 在浏览器中打开 http://localhost:3001
```

### 常用命令

```bash
# 查看日志
docker-compose logs -f

# 停止所有服务
bash scripts/03-stop-all.sh

# 重启服务
docker-compose restart

# 查看容器状态
docker-compose ps
```

---

## 📋 配置文件说明

| 文件 | 说明 |
|------|------|
| `docker-compose.drawio.yml` | draw.io 服务器配置 |
| `docker-compose.yml` | Next AI Draw.io 主应用配置 |
| `.env.docker` | 环境配置示例 |
| `.env` | 实际环境配置（需自行创建） |

---

## 🔧 环境配置

编辑 `.env` 文件，配置你的 API Key：

```bash
# 选择 AI 提供商
AI_PROVIDER=openai

# AI 模型
AI_MODEL=gpt-4o

# API Key（必填）
OPENAI_API_KEY=sk-your-actual-api-key

# draw.io 地址（已配置好，无需修改）
NEXT_PUBLIC_DRAWIO_BASE_URL=http://host.docker.internal:8080
```

---

## 🌐 访问地址

- **Next AI Draw.io**: http://localhost:3001
- **draw.io Server**: http://localhost:8080

---

## ⚠️ 注意事项

1. **端口占用**: 
   - 3001 端口用于主应用
   - 8080 端口用于 draw.io
   - 如果端口被占用，请修改对应的 `docker-compose.yml` 文件

2. **Docker 要求**:
   - Docker Desktop 20.10+ (Windows/Mac)
   - Docker Engine 20.10+ (Linux)

3. **网络要求**:
   - 需要能访问 Docker Hub 拉取镜像
   - 如果网络慢，配置 Docker 镜像加速器

---

## 📖 详细文档

查看完整部署文档：[DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)
