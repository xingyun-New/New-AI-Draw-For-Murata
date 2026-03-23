#!/bin/bash

# 用户认证系统快速设置脚本
# 使用方法：./scripts/setup-auth.sh

set -e

# 颜色定义
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "======================================"
echo -e "${CYAN}  用户认证系统快速设置${NC}"
echo "======================================"
echo ""

# 1. 检查 .env 文件
echo -e "${YELLOW}[1/4] 检查环境变量配置...${NC}"

if [ ! -f ".env" ]; then
    echo -e "  ${GREEN}创建 .env 文件...${NC}"
    cp env.example .env
    
    # 生成随机 JWT_SECRET
    JWT_SECRET=$(openssl rand -base64 48 | tr -dc 'a-zA-Z0-9' | head -c 64)
    
    # 更新 .env 文件
    sed -i.bak "s|# DATABASE_URL=.*|DATABASE_URL=postgresql://nextai:nextai_password@localhost:5432/nextai_drawio|g" .env
    sed -i.bak "s|# JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|g" .env
    sed -i.bak "s|# JWT_EXPIRES_IN=.*|JWT_EXPIRES_IN=7d|g" .env
    rm -f .env.bak 2>/dev/null || true
    
    echo -e "  ${GREEN}✓ .env 文件已创建并配置${NC}"
else
    echo -e "  ${GREEN}✓ .env 文件已存在${NC}"
fi

# 2. 检查 Docker
if [ "$1" != "--skip-docker" ]; then
    echo ""
    echo -e "${YELLOW}[2/4] 配置 Docker 数据库...${NC}"
    
    if docker-compose ps | grep -q "postgres"; then
        echo -e "  ${GREEN}✓ PostgreSQL 容器已运行${NC}"
    else
        echo -e "  ${CYAN}启动 PostgreSQL 容器...${NC}"
        docker-compose up -d postgres
        
        if [ $? -eq 0 ]; then
            echo -e "  ${GREEN}✓ PostgreSQL 容器已启动${NC}"
            echo -e "  ${CYAN}等待数据库初始化...${NC}"
            sleep 5
        else
            echo -e "  ${RED}✗ Docker 启动失败，请检查 Docker 是否安装并运行${NC}"
            exit 1
        fi
    fi
else
    echo ""
    echo -e "${YELLOW}[2/4] 跳过 Docker 设置（使用现有 PostgreSQL）${NC}"
fi

# 3. 安装依赖
echo ""
echo -e "${YELLOW}[3/4] 安装依赖包...${NC}"

if ! grep -q '"bcryptjs"' package.json; then
    echo -e "  ${CYAN}安装依赖包...${NC}"
    npm install
    echo -e "  ${GREEN}✓ 依赖包安装完成${NC}"
else
    echo -e "  ${GREEN}✓ 所有依赖包已安装${NC}"
fi

# 4. 验证配置
echo ""
echo -e "${YELLOW}[4/4] 验证配置...${NC}"

# 检查数据库连接
echo -e "  ${CYAN}测试数据库连接...${NC}"
if docker exec nextai-postgres psql -U nextai -d nextai_drawio -c "SELECT 1" 2>/dev/null | grep -q "1 row"; then
    echo -e "  ${GREEN}✓ 数据库连接正常${NC}"
else
    echo -e "  ${YELLOW}⚠ 数据库连接可能有问题，请手动检查${NC}"
fi

# 显示配置信息
echo ""
echo "======================================"
echo -e "${GREEN}  设置完成！${NC}"
echo "======================================"
echo ""
echo -e "${YELLOW}下一步:${NC}"
echo -e "  1. 启动开发服务器：${CYAN}npm run dev${NC}"
echo -e "  2. 访问：${CYAN}http://localhost:6002${NC}"
echo -e "  3. 点击右上角'注册'按钮创建账号"
echo ""
echo -e "${YELLOW}重要提示:${NC}"
echo -e "  - 密码要求：至少 8 位，包含大小写字母和数字"
echo -e "  - JWT_SECRET 已自动生成并保存在 .env 文件"
echo -e "  - 如需配置邮件服务，请编辑 .env 文件添加 SMTP 配置"
echo ""
echo -e "${CYAN}查看完整文档：docs/AUTH_GUIDE.md${NC}"
echo ""
