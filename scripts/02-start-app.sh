#!/bin/bash
# 02-start-app.sh - 启动 Next AI Draw.io 主应用

set -e

echo "========================================"
echo "  启动 Next AI Draw.io 主应用"
echo "========================================"
echo ""

# 检查 Docker 是否运行
if ! docker ps > /dev/null 2>&1; then
    echo "❌ 错误：Docker 未运行或未安装"
    echo "请先启动 Docker 或安装 Docker"
    exit 1
fi

# 检查 .env 文件是否存在
if [ ! -f ".env" ]; then
    echo "⚠️  警告：未找到 .env 文件"
    echo "正在从 .env.docker 创建..."
    cp .env.docker .env
    echo "请编辑 .env 文件配置你的 API Key"
    echo ""
    
    # 尝试使用默认编辑器
    if command -v nano &> /dev/null; then
        nano .env
    elif command -v vim &> /dev/null; then
        vim .env
    else
        echo "请使用文本编辑器编辑 .env 文件"
    fi
fi

# 检查 .env 中的 API Key 配置
if ! grep -q "OPENAI_API_KEY=sk-" .env; then
    echo "⚠️  警告：未检测到有效的 API Key 配置"
    echo "请在 .env 文件中配置 OPENAI_API_KEY"
    echo ""
fi

echo "📦 检查应用镜像..."
docker-compose images

echo ""
echo "🚀 启动 Next AI Draw.io 容器..."
docker-compose up -d

echo ""
echo "⏳ 等待应用启动..."
sleep 15

echo ""
echo "📊 检查容器状态..."
docker-compose ps

echo ""
echo "🔍 查看启动日志..."
docker-compose logs --tail=30

echo ""
echo "========================================"
echo "  ✅ Next AI Draw.io 已启动！"
echo "  🌐 访问地址：http://localhost:3001"
echo "========================================"
echo ""
echo "提示："
echo "  - 查看日志：docker-compose logs -f"
echo "  - 停止服务：./scripts/03-stop-all.sh"
echo "  - 重启服务：docker-compose restart"
echo ""

# 询问是否打开浏览器
if command -v xdg-open &> /dev/null; then
    read -p "是否在浏览器中打开应用？(Y/n): " response
    if [[ ! $response =~ ^[Nn]$ ]]; then
        xdg-open "http://localhost:3001"
    fi
elif command -v open &> /dev/null; then
    read -p "是否在浏览器中打开应用？(Y/n): " response
    if [[ ! $response =~ ^[Nn]$ ]]; then
        open "http://localhost:3001"
    fi
fi
