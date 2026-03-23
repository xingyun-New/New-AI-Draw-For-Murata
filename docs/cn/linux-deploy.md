# Linux 部署完整命令列表

本文档提供从 GitHub 拉取并部署 Next AI Draw.io 的完整命令列表。

---

## 🚀 方法一：一键部署脚本（推荐）

### 快速部署

```bash
# 1. 克隆仓库（如果还没有）
git clone https://github.com/DayuanJiang/next-ai-draw-io.git
cd next-ai-draw-io

# 2. 运行一键部署脚本
bash scripts/deploy-linux.sh
```

脚本会自动：
- ✅ 检查并安装 Docker
- ✅ 检查并安装 Docker Compose
- ✅ 克隆或更新代码
- ✅ 引导配置环境变量
- ✅ 启动所有服务

---

## 📋 方法二：手动分步部署

### 步骤 1: 安装 Docker

#### Ubuntu/Debian

```bash
# 更新包索引
sudo apt-get update

# 安装依赖
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common

# 添加 Docker GPG 密钥
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

# 添加 Docker 仓库
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

# 安装 Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io

# 启动 Docker
sudo systemctl start docker
sudo systemctl enable docker

# 验证安装
docker --version
```

#### CentOS/RHEL

```bash
# 安装 yum-utils
sudo yum install -y yum-utils

# 添加 Docker 仓库
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# 安装 Docker
sudo yum install -y docker-ce docker-ce-cli containerd.io

# 启动 Docker
sudo systemctl start docker
sudo systemctl enable docker

# 验证安装
docker --version
```

### 步骤 2: 安装 Docker Compose

```bash
# 下载 Docker Compose（最新版本）
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# 添加执行权限
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker-compose --version
```

### 步骤 3: 配置 Docker 权限（可选但推荐）

```bash
# 将当前用户添加到 docker 组
sudo usermod -aG docker ${USER}

# 应用组变更（或重新登录）
newgrp docker

# 测试无需 sudo 运行 docker
docker ps
```

### 步骤 4: 克隆项目代码

```bash
# 克隆仓库
git clone https://github.com/DayuanJiang/next-ai-draw-io.git

# 进入项目目录
cd next-ai-draw-io

# 查看可用分支
git branch -a

# 切换到最新稳定版本（可选）
git checkout $(git describe --tags `git rev-list --tags --max-count=1`)
```

### 步骤 5: 配置环境变量

```bash
# 复制环境配置示例
cp .env.docker .env

# 编辑环境变量（选择你喜欢的编辑器）
nano .env
# 或
vim .env
```

**必须配置的环境变量：**

```bash
# AI 提供商选择
AI_PROVIDER=openai

# AI 模型
AI_MODEL=gpt-4o

# API Key（替换为你的实际密钥）
OPENAI_API_KEY=sk-your-actual-api-key

# draw.io 地址（已配置好，无需修改）
NEXT_PUBLIC_DRAWIO_BASE_URL=http://host.docker.internal:8080
```

**支持的 AI 提供商：**
- `openai` - OpenAI (GPT-4, GPT-4o, o1, o3)
- `anthropic` - Anthropic (Claude 系列)
- `google` - Google AI (Gemini 系列)
- `vertexai` - Google Vertex AI
- `azure` - Azure OpenAI
- `deepseek` - DeepSeek
- `ollama` - Ollama (本地模型)
- `openrouter` - OpenRouter
- `siliconflow` - 硅基流动
- `bedrock` - AWS Bedrock

### 步骤 6: 启动 draw.io 服务

```bash
# 启动 draw.io 容器
docker-compose -f docker-compose.drawio.yml up -d

# 等待启动完成
sleep 15

# 检查容器状态
docker-compose -f docker-compose.drawio.yml ps

# 查看启动日志
docker-compose -f docker-compose.drawio.yml logs -f

# 测试 draw.io 是否可访问
curl -I http://localhost:8080
```

### 步骤 7: 启动主应用

```bash
# 启动 Next AI Draw.io 容器
docker-compose up -d

# 等待启动完成
sleep 20

# 检查容器状态
docker-compose ps

# 查看启动日志
docker-compose logs -f

# 测试应用是否可访问
curl -I http://localhost:3001
```

### 步骤 8: 访问应用

在浏览器中打开：
- **Next AI Draw.io**: http://localhost:3001
- **draw.io Server**: http://localhost:8080

---

## 🔧 常用管理命令

### 服务管理

```bash
# 启动所有服务
docker-compose up -d

# 启动 draw.io
docker-compose -f docker-compose.drawio.yml up -d

# 停止所有服务
docker-compose down

# 停止 draw.io
docker-compose -f docker-compose.drawio.yml down

# 重启服务
docker-compose restart

# 强制重启（重新创建容器）
docker-compose up -d --force-recreate

# 查看运行状态
docker-compose ps

# 查看资源使用
docker stats
```

### 日志查看

```bash
# 查看所有日志（实时）
docker-compose logs -f

# 查看主应用日志
docker-compose logs -f next-ai-draw-io

# 查看 draw.io 日志
docker-compose -f docker-compose.drawio.yml logs -f drawio

# 查看最近 100 行日志
docker-compose logs --tail=100

# 查看特定时间后的日志
docker-compose logs --since="2026-03-21T10:00:00"
```

### 容器操作

```bash
# 进入容器 shell
docker-compose exec next-ai-draw-io /bin/sh

# 进入 draw.io 容器
docker-compose -f docker-compose.drawio.yml exec drawio /bin/sh

# 重启单个容器
docker-compose restart next-ai-draw-io

# 停止单个容器
docker-compose stop next-ai-draw-io

# 删除容器（不删除数据卷）
docker-compose rm
```

### 更新和维护

```bash
# 拉取最新代码
git pull origin main

# 重新构建并启动
docker-compose up -d --build --force-recreate

# 更新 Docker 镜像
docker-compose pull

# 清理未使用的镜像
docker image prune -a

# 清理未使用的卷（谨慎！会删除持久化数据）
docker volume prune
```

### 完全清理

```bash
# 停止并删除所有容器和网络
docker-compose down

# 删除数据卷（会丢失所有数据！）
docker-compose down -v

# 删除所有相关镜像
docker rmi ghcr.io/dayuanjiang/next-ai-draw-io:latest
docker rmi jgraph/drawio:latest
```

---

## 📊 故障排查命令

### 问题 1: 容器无法启动

```bash
# 查看容器状态
docker-compose ps

# 查看详细错误信息
docker-compose logs

# 检查端口占用
sudo netstat -tulpn | grep :3001
sudo netstat -tulpn | grep :8080

# 查看 Docker 日志
sudo journalctl -u docker.service -n 50
```

### 问题 2: 网络连接问题

```bash
# 检查 Docker 网络
docker network ls

# 检查容器网络配置
docker inspect next-ai-draw-io

# 测试容器内网络
docker-compose exec next-ai-draw-io ping -c 4 host.docker.internal

# 测试 draw.io 连接
curl http://host.docker.internal:8080
```

### 问题 3: 权限问题

```bash
# 检查 Docker 组权限
groups

# 检查文件权限
ls -la .env
ls -la docker-compose.yml

# 修复权限
sudo chown -R ${USER}:${USER} .
```

### 问题 4: 资源不足

```bash
# 查看资源使用
docker stats

# 查看磁盘空间
df -h

# 清理 Docker 资源
docker system prune -a

# 查看容器资源限制
docker inspect next-ai-draw-io | grep -A 10 HostConfig
```

---

## 🔐 安全配置

### 配置防火墙

```bash
# Ubuntu (UFW)
sudo ufw allow 3001/tcp
sudo ufw allow 8080/tcp
sudo ufw status

# CentOS (firewalld)
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --reload
```

### 配置 HTTPS（使用 Nginx）

```bash
# 安装 Nginx
sudo apt-get install -y nginx  # Ubuntu/Debian
# 或
sudo yum install -y nginx  # CentOS/RHEL

# 创建 Nginx 配置
sudo nano /etc/nginx/sites-available/next-ai-draw-io
```

Nginx 配置示例：

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# 启用配置
sudo ln -s /etc/nginx/sites-available/next-ai-draw-io /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

---

## 📈 性能优化

### 调整容器资源限制

编辑 `docker-compose.yml`：

```yaml
services:
  next-ai-draw-io:
    # ... 其他配置 ...
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### 优化 Docker 镜像

```bash
# 定期清理未使用的镜像
docker image prune -a

# 使用更小的基础镜像（如果需要自定义）
# 在 Dockerfile 中使用 alpine 版本
```

---

## 📝 快速参考卡片

```bash
# ==================== 快速部署 ====================
git clone https://github.com/DayuanJiang/next-ai-draw-io.git
cd next-ai-draw-io
bash scripts/deploy-linux.sh

# ==================== 启动服务 ====================
bash scripts/01-start-drawio.sh
bash scripts/02-start-app.sh

# ==================== 停止服务 ====================
bash scripts/03-stop-all.sh

# ==================== 查看日志 ====================
docker-compose logs -f

# ==================== 更新代码 ====================
git pull
docker-compose up -d --force-recreate

# ==================== 访问地址 ====================
# Next AI Draw.io: http://localhost:3001
# draw.io Server: http://localhost:8080
```

---

## 📖 相关文档

- [快速开始](./QUICK_START.md)
- [完整部署指南](./DOCKER_DEPLOYMENT.md)
- [AI 提供商配置](./docs/en/ai-providers.md)
- [故障排查](./docs/en/FAQ.md)

---

## 🆘 获取帮助

如果遇到问题：

1. 查看日志：`docker-compose logs -f`
2. 检查 FAQ：[FAQ](./docs/en/FAQ.md)
3. 提交 Issue：[GitHub Issues](https://github.com/DayuanJiang/next-ai-draw-io/issues)
4. 查看讨论：[GitHub Discussions](https://github.com/DayuanJiang/next-ai-draw-io/discussions)

---

*最后更新：2026-03-21*
