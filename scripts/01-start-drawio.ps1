#!/usr/bin/env pwsh
# 01-start-drawio.ps1 - 启动 draw.io 服务器

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  启动 draw.io 服务器" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Docker 是否运行
try {
    docker ps | Out-Null
} catch {
    Write-Host "❌ 错误：Docker 未运行或未安装" -ForegroundColor Red
    Write-Host "请先启动 Docker Desktop 或安装 Docker" -ForegroundColor Yellow
    exit 1
}

Write-Host "📦 检查 draw.io 镜像..." -ForegroundColor Green
docker-compose -f docker-compose.drawio.yml images

Write-Host ""
Write-Host "🚀 启动 draw.io 容器..." -ForegroundColor Green
docker-compose -f docker-compose.drawio.yml up -d

Write-Host ""
Write-Host "⏳ 等待 draw.io 启动..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "📊 检查容器状态..." -ForegroundColor Green
docker-compose -f docker-compose.drawio.yml ps

Write-Host ""
Write-Host "🔍 查看启动日志..." -ForegroundColor Green
docker-compose -f docker-compose.drawio.yml logs --tail=20

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✅ draw.io 服务器已启动！" -ForegroundColor Green
Write-Host "  🌐 访问地址：http://localhost:8080" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "下一步：" -ForegroundColor Yellow
Write-Host "  1. 编辑 .env 文件配置 API Key" -ForegroundColor White
Write-Host "  2. 运行 .\scripts\02-start-app.ps1 启动主应用" -ForegroundColor White
Write-Host ""
