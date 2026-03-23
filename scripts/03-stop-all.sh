#!/bin/bash
# 03-stop-all.sh - 停止所有 Docker 服务

set -e

echo "========================================"
echo "  停止所有 Docker 服务"
echo "========================================"
echo ""

# 检查 Docker 是否运行
if ! docker ps > /dev/null 2>&1; then
    echo "❌ 错误：Docker 未运行或未安装"
    exit 1
fi

echo "📊 当前运行的容器:"
docker-compose ps
docker-compose -f docker-compose.drawio.yml ps

echo ""
read -p "确定要停止所有服务吗？(y/N): " confirm

if [[ $confirm =~ ^[Yy]$ ]]; then
    echo ""
    echo "🛑 停止 Next AI Draw.io..."
    docker-compose down
    
    echo ""
    echo "🛑 停止 draw.io..."
    docker-compose -f docker-compose.drawio.yml down
    
    echo ""
    echo "✅ 所有服务已停止"
else
    echo ""
    echo "❌ 操作已取消"
fi

echo ""
echo "提示："
echo "  - 启动 draw.io: ./scripts/01-start-drawio.sh"
echo "  - 启动主应用：./scripts/02-start-app.sh"
echo ""
