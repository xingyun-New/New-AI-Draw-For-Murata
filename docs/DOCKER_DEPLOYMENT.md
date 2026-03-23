# Docker 部署完整指南

本指南介绍如何将 Next AI Draw.io 和 draw.io 部署到独立的 Docker 容器中。

## 📋 目录结构

```
next-ai-draw-io/
├── docker-compose.drawio.yml    # draw.io 服务器配置
├── docker-compose.yml           # Next AI Draw.io 主应用配置
├── .env.docker                  # 环境配置示例
└── scripts/
    ├── 01-start-drawio.ps1      # Windows: 启动 draw.io
    ├── 02-start-app.ps1         # Windows: 启动主应用
    ├── 03-stop-all.ps1          # Windows: 停止所有服务
    ├── 01-start-drawio.sh       # Linux/Mac: 启动 draw.io
    ├── 02-start-app.sh          # Linux/Mac: 启动主应用
    └── 03-stop-all.sh           # Linux/Mac: 停止所有服务
```

---

## 🚀 快速开始

### 方法一：使用启动脚本（推荐）

#### Windows (PowerShell)

```powershell
# 1. 启动 draw.io 服务器
.\scripts\01-start-drawio.ps1

# 2. 配置 API Key（编辑 .env 文件）
notepad .env

# 3. 启动 Next AI Draw.io 主应用
.\scripts\02-start-app.ps1

# 4. 访问应用
Start-Process http://localhost:3001

# 5. 查看日志
docker-compose logs -f
```

#### Linux / macOS (Bash)

```bash
# 1. 启动 draw.io 服务器
bash scripts/01-start-drawio.sh

# 2. 配置 API Key（编辑 .env 文件）
nano .env

# 3. 启动 Next AI Draw.io 主应用
bash scripts/02-start-app.sh

# 4. 查看日志
docker-compose logs -f
```

### 方法二：手动命令

```bash
# 步骤 1: 启动 draw.io 服务器
docker-compose -f docker-compose.drawio.yml up -d

# 步骤 2: 等待 draw.io 就绪 (约 30 秒)
docker-compose -f docker-compose.drawio.yml ps

# 步骤 3: 配置 .env 文件
cp .env.docker .env
# 编辑 .env 文件，设置你的 API Key

# 步骤 4: 启动 Next AI Draw.io 主应用
docker-compose up -d

# 步骤 5: 检查服务状态
docker-compose ps

# 步骤 6: 查看日志
docker-compose logs -f
```

---

## 🔧 配置说明

### 1. draw.io 配置 (`docker-compose.drawio.yml`)

**端口配置：**
- 默认端口：`8080`
- 修改方法：在 `docker-compose.drawio.yml` 中更改 `ports: ["8080:8080"]`

**持久化存储：**
- 配置文件：`drawio-config` volume
- 导出文件：`drawio-export` volume

**环境变量：**
```yaml
environment:
  - DRAWIO_BASE_URL=http://localhost:8080
  - DRAWIO_CORS_ENABLE=true  # 必须启用，允许跨域访问
  - DRAWIO_LOG_LEVEL=info
```

### 2. Next AI Draw.io 配置 (`docker-compose.yml`)

**端口配置：**
- 默认端口：`3001`
- 修改方法：在 `docker-compose.yml` 中更改 `ports: ["3001:3000"]`

**draw.io 连接配置：**

**场景 A：draw.io 在同一台机器（默认配置）**
```yaml
environment:
  NEXT_PUBLIC_DRAWIO_BASE_URL: http://host.docker.internal:8080
extra_hosts:
  - "host.docker.internal:host-gateway"
```

**场景 B：draw.io 在远程服务器**
```yaml
environment:
  NEXT_PUBLIC_DRAWIO_BASE_URL: http://your-drawio-server.com:8080
```

**场景 C：draw.io 在同一 Docker 网络**
```yaml
# 需要在两个 docker-compose 文件中使用相同的网络
networks:
  - drawio-network

# 然后在 docker-compose.yml 中：
environment:
  NEXT_PUBLIC_DRAWIO_BASE_URL: http://drawio:8080
```

### 3. 环境文件 (`.env`)

**必填配置：**
```bash
# AI 提供商选择
AI_PROVIDER=openai

# AI 模型
AI_MODEL=gpt-4o

# API Key（必须替换）
OPENAI_API_KEY=sk-your-actual-api-key

# draw.io 地址
NEXT_PUBLIC_DRAWIO_BASE_URL=http://host.docker.internal:8080
```

**支持的 AI 提供商：**
- `openai` - OpenAI (GPT-4, GPT-4o, o1, o3 等)
- `anthropic` - Anthropic (Claude 系列)
- `google` / `vertexai` - Google (Gemini 系列)
- `azure` - Azure OpenAI
- `deepseek` - DeepSeek
- `ollama` - Ollama (本地模型)
- `openrouter` - OpenRouter
- `siliconflow` - 硅基流动
- `bedrock` - AWS Bedrock

---

## 📝 常用命令

### 服务管理

```bash
# 启动 draw.io
docker-compose -f docker-compose.drawio.yml up -d

# 启动主应用
docker-compose up -d

# 启动所有服务
docker-compose -f docker-compose.drawio.yml up -d && docker-compose up -d

# 停止 draw.io
docker-compose -f docker-compose.drawio.yml down

# 停止主应用
docker-compose down

# 停止所有服务
docker-compose -f docker-compose.drawio.yml down && docker-compose down

# 重启服务
docker-compose restart
```

### 日志查看

```bash
# 查看主应用日志
docker-compose logs -f

# 查看 draw.io 日志
docker-compose -f docker-compose.drawio.yml logs -f

# 查看所有日志
docker-compose logs -f next-ai-draw-io
docker-compose -f docker-compose.drawio.yml logs -f drawio
```

### 状态检查

```bash
# 检查容器状态
docker-compose ps
docker-compose -f docker-compose.drawio.yml ps

# 检查容器健康状态
docker inspect --format='{{.State.Health.Status}}' next-ai-draw-io
docker inspect --format='{{.State.Health.Status}}' drawio-server

# 查看资源使用
docker stats drawio-server next-ai-draw-io
```

### 清理和维护

```bash
# 清理未使用的镜像
docker image prune -a

# 清理未使用的卷（谨慎使用！会删除持久化数据）
docker volume prune

# 删除所有相关容器和网络
docker-compose -f docker-compose.drawio.yml down -v
docker-compose down -v
```

---

## 🔍 故障排查

### 问题 1: draw.io 无法启动

```bash
# 检查端口是否被占用
netstat -ano | findstr :8080

# 查看 draw.io 日志
docker-compose -f docker-compose.drawio.yml logs

# 重新启动
docker-compose -f docker-compose.drawio.yml down
docker-compose -f docker-compose.drawio.yml up -d
```

### 问题 2: 主应用无法连接 draw.io

```bash
# 测试 draw.io 是否可访问
curl http://localhost:8080

# 检查容器网络
docker network ls
docker network inspect drawio-network

# 检查 .env 配置
cat .env | grep DRAWIO
```

### 问题 3: API Key 配置错误

```bash
# 检查 .env 文件
cat .env

# 重启应用以应用新配置
docker-compose down
docker-compose up -d

# 查看启动日志
docker-compose logs | grep -i "error\|key\|provider"
```

### 问题 4: 跨域问题 (CORS)

确保 draw.io 配置中启用了 CORS：
```yaml
environment:
  - DRAWIO_CORS_ENABLE=true
```

检查浏览器控制台是否有 CORS 错误。

---

## 🌐 远程部署配置

### 部署 draw.io 到远程服务器

**服务器 A (draw.io):**

```bash
# docker-compose.drawio.yml
services:
  drawio:
    image: jgraph/drawio:latest
    ports:
      - "8080:8080"
    environment:
      - DRAWIO_BASE_URL=http://your-server-ip:8080
      - DRAWIO_CORS_ENABLE=true
```

**服务器 B (Next AI Draw.io):**

```yaml
# docker-compose.yml
services:
  next-ai-draw-io:
    environment:
      NEXT_PUBLIC_DRAWIO_BASE_URL: http://your-server-a-ip:8080
```

### 使用 Nginx 反向代理

如果需要 HTTPS 或自定义域名：

```nginx
# /etc/nginx/sites-available/drawio
server {
    listen 443 ssl;
    server_name drawio.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

然后在 `.env` 中配置：
```bash
NEXT_PUBLIC_DRAWIO_BASE_URL=https://drawio.yourdomain.com
```

---

## 📊 性能优化

### 内存配置

**draw.io (Java 应用):**
```yaml
environment:
  - JAVA_OPTS=-Xmx2g -Xms512m
```

**Next AI Draw.io (Node.js 应用):**
```yaml
environment:
  - NODE_OPTIONS=--max-old-space-size=2048
```

### 增加并发连接数

```yaml
# draw.io 配置
environment:
  - DRAWIO_MAX_CONNECTIONS=100
  - DRAWIO_CONNECTION_TIMEOUT=30000
```

---

## 🔐 安全建议

1. **使用 HTTPS**: 生产环境务必使用 HTTPS
2. **配置防火墙**: 只开放必要端口
3. **API Key 保护**: 不要将 `.env` 文件提交到版本控制
4. **定期更新**: 保持 Docker 镜像最新
   ```bash
   docker-compose pull
   docker-compose up -d --force-recreate
   ```

---

## 📞 技术支持

- 项目 GitHub: https://github.com/DayuanJiang/next-ai-draw-io
- draw.io 文档：https://github.com/jgraph/drawio
- Docker 文档：https://docs.docker.com/

---

*最后更新：2026-03-21*
