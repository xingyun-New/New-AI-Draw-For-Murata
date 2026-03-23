#!/bin/bash
# 01-start-drawio.sh - 启动 draw.io 服务器

set -e

echo "========================================"
echo "  启动 draw.io 服务器"
echo "========================================"
echo ""

# 检查 Docker 是否运行
if ! docker ps > /dev/null 2>&1; then
    echo "❌ 错误：Docker 未运行或未安装"
    echo "请先启动 Docker 或安装 Docker"
    exit 1
fi

echo "📦 检查 draw.io 镜像..."
docker-compose -f docker-compose.drawio.yml images

echo ""
echo "🚀 启动 draw.io 容器..."
docker-compose -f docker-compose.drawio.yml up -d

echo ""
echo "⏳ 等待 draw.io 启动..."
sleep 10

echo ""
echo "📊 检查容器状态..."
docker-compose -f docker-compose.drawio.yml ps

echo ""
echo "🔍 查看启动日志..."
docker-compose -f docker-compose.drawio.yml logs --tail=20

echo ""
echo "========================================"
echo "  ✅ draw.io 服务器已启动！"
echo "  🌐 访问地址：http://localhost:8080"
echo "========================================"
echo ""
echo "下一步："
echo "  1. 编辑 .env 文件配置 API Key"
echo "  2. 运行 ./scripts/02-start-app.sh 启动主应用"
echo ""
