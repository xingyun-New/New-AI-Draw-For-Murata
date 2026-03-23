#!/bin/bash
# Linux 一键部署脚本 for Next AI Draw.io
# 使用方法：bash deploy.sh

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否安装了 Docker
check_docker() {
    print_info "检查 Docker 是否安装..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安装"
        read -p "是否现在安装 Docker？(y/N): " install_docker
        if [[ $install_docker =~ ^[Yy]$ ]]; then
            install_docker_func
        else
            print_error "请先手动安装 Docker"
            exit 1
        fi
    else
        print_success "Docker 已安装：$(docker --version)"
    fi
}

# 安装 Docker
install_docker_func() {
    print_info "正在安装 Docker..."
    
    # 检测 Linux 发行版
    if [ -f /etc/debian_version ]; then
        # Debian/Ubuntu
        sudo apt-get update
        sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
        sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
        sudo apt-get update
        sudo apt-get install -y docker-ce docker-ce-cli containerd.io
    elif [ -f /etc/redhat-release ]; then
        # RHEL/CentOS
        sudo yum install -y yum-utils
        sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
        sudo yum install -y docker-ce docker-ce-cli containerd.io
    else
        print_error "不支持的 Linux 发行版，请手动安装 Docker"
        exit 1
    fi
    
    # 启动 Docker
    sudo systemctl start docker
    sudo systemctl enable docker
    
    # 将当前用户添加到 docker 组（避免每次都用 sudo）
    sudo usermod -aG docker ${USER}
    
    print_success "Docker 安装完成"
    print_warning "请运行 'newgrp docker' 或重新登录以应用 docker 组权限"
}

# 检查 Docker Compose
check_docker_compose() {
    print_info "检查 Docker Compose..."
    if ! command -v docker-compose &> /dev/null; then
        print_warning "Docker Compose 未安装，正在安装..."
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
        print_success "Docker Compose 已安装：$(docker-compose --version)"
    else
        print_success "Docker Compose 已安装：$(docker-compose --version)"
    fi
}

# 克隆或更新代码
clone_or_update_repo() {
    print_info "准备代码..."
    
    if [ -d "next-ai-draw-io" ]; then
        print_warning "发现已存在的 next-ai-draw-io 目录"
        read -p "是否删除并重新克隆？(y/N): " overwrite
        if [[ $overwrite =~ ^[Yy]$ ]]; then
            rm -rf next-ai-draw-io
            clone_repo
        else
            print_info "进入现有目录..."
            cd next-ai-draw-io
            git pull origin main
        fi
    else
        clone_repo
    fi
}

# 克隆仓库
clone_repo() {
    print_info "从 GitHub 克隆仓库..."
    git clone https://github.com/DayuanJiang/next-ai-draw-io.git
    cd next-ai-draw-io
    print_success "代码克隆完成"
}

# 配置环境变量
configure_env() {
    print_info "配置环境变量..."
    
    if [ -f ".env" ]; then
        print_warning "已存在 .env 文件"
        read -p "是否重新配置？(y/N): " reconfigure
        if [[ ! $reconfigure =~ ^[Yy]$ ]]; then
            print_info "跳过配置，使用现有 .env 文件"
            return
        fi
    fi
    
    # 复制示例文件
    cp .env.docker .env
    
    print_info "请配置以下环境变量："
    echo ""
    echo "1) AI_PROVIDER: 选择 AI 提供商"
    echo "   可选值：openai, anthropic, google, deepseek, ollama, azure, bedrock 等"
    echo ""
    echo "2) AI_MODEL: 选择 AI 模型"
    echo "   示例：gpt-4o, claude-sonnet-4-5, gemini-2.0-flash 等"
    echo ""
    echo "3) API_KEY: 输入你的 API Key"
    echo ""
    
    # 使用编辑器打开 .env 文件
    if command -v nano &> /dev/null; then
        nano .env
    elif command -v vim &> /dev/null; then
        vim .env
    else
        print_warning "未找到 nano 或 vim，请手动编辑 .env 文件"
        print_info ".env 文件位置：$(pwd)/.env"
    fi
    
    # 检查是否配置了 API Key
    if ! grep -q "OPENAI_API_KEY=sk-" .env && ! grep -q "ANTHROPIC_API_KEY=sk-ant" .env; then
        print_warning "未检测到有效的 API Key，请确保在 .env 文件中配置"
    fi
    
    print_success "环境配置完成"
}

# 启动 draw.io 服务
start_drawio() {
    print_info "启动 draw.io 服务..."
    docker-compose -f docker-compose.drawio.yml up -d
    
    print_info "等待 draw.io 启动..."
    sleep 15
    
    # 检查容器状态
    if docker-compose -f docker-compose.drawio.yml ps | grep -q "drawio-server.*Up"; then
        print_success "draw.io 服务启动成功"
        print_info "访问地址：http://localhost:8080"
    else
        print_warning "draw.io 服务可能未正常启动，请检查日志"
        docker-compose -f docker-compose.drawio.yml logs
    fi
}

# 启动主应用
start_app() {
    print_info "启动 Next AI Draw.io 主应用..."
    docker-compose up -d
    
    print_info "等待应用启动..."
    sleep 20
    
    # 检查容器状态
    if docker-compose ps | grep -q "next-ai-draw-io.*Up"; then
        print_success "Next AI Draw.io 主应用启动成功"
        print_info "访问地址：http://localhost:3001"
    else
        print_warning "主应用可能未正常启动，请检查日志"
        docker-compose logs
    fi
}

# 显示访问信息
show_access_info() {
    echo ""
    echo "========================================"
    echo -e "${GREEN}  部署完成！${NC}"
    echo "========================================"
    echo ""
    echo "服务访问地址："
    echo -e "  ${CYAN}●${NC} Next AI Draw.io: http://localhost:3001"
    echo -e "  ${CYAN}●${NC} draw.io Server:   http://localhost:8080"
    echo ""
    echo "常用命令："
    echo -e "  ${YELLOW}●${NC} 查看日志：docker-compose logs -f"
    echo -e "  ${YELLOW}●${NC} 停止服务：bash scripts/03-stop-all.sh"
    echo -e "  ${YELLOW}●${NC} 重启服务：docker-compose restart"
    echo -e "  ${YELLOW}●${NC} 更新代码：git pull && docker-compose up -d --force-recreate"
    echo ""
    echo "配置文件位置："
    echo -e "  ${YELLOW}●${NC} .env - 环境变量配置"
    echo -e "  ${YELLOW}●${NC} docker-compose.yml - 主应用配置"
    echo -e "  ${YELLOW}●${NC} docker-compose.drawio.yml - draw.io 配置"
    echo ""
    echo "提示：在浏览器中打开 http://localhost:3001 开始使用"
    echo "========================================"
}

# 主函数
main() {
    echo ""
    echo "========================================"
    echo -e "${CYAN}  Next AI Draw.io 一键部署脚本${NC}"
    echo "========================================"
    echo ""
    
    # 检查 Docker
    check_docker
    
    # 检查 Docker Compose
    check_docker_compose
    
    # 克隆或更新代码
    clone_or_update_repo
    
    # 配置环境
    configure_env
    
    # 启动服务
    echo ""
    read -p "是否现在启动服务？(Y/n): " start_now
    if [[ ! $start_now =~ ^[Nn]$ ]]; then
        start_drawio
        start_app
        show_access_info
    else
        print_info "服务未启动"
        print_info "运行以下命令启动服务："
        echo "  cd next-ai-draw-io"
        echo "  bash scripts/01-start-drawio.sh"
        echo "  bash scripts/02-start-app.sh"
    fi
}

# 运行主函数
main
