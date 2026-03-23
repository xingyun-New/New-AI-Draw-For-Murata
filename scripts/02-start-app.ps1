#!/usr/bin/env pwsh
# 02-start-app.ps1 - 启动 Next AI Draw.io 主应用

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  启动 Next AI Draw.io 主应用" -ForegroundColor Cyan
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

# 检查 .env 文件是否存在
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  警告：未找到 .env 文件" -ForegroundColor Yellow
    Write-Host "正在从 .env.docker 创建..." -ForegroundColor Yellow
    Copy-Item ".env.docker" ".env"
    Write-Host "请编辑 .env 文件配置你的 API Key" -ForegroundColor Cyan
    Write-Host ""
    
    # 尝试打开记事本
    try {
        notepad .env
        Write-Host "配置完成后按任意键继续..." -ForegroundColor Green
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    } catch {
        Write-Host "或者手动编辑 .env 文件" -ForegroundColor Yellow
    }
}

# 检查 .env 中的 API Key 配置
$envContent = Get-Content ".env"
$hasApiKey = $envContent | Select-String "OPENAI_API_KEY=sk-"

if (-not $hasApiKey) {
    Write-Host "⚠️  警告：未检测到有效的 API Key 配置" -ForegroundColor Yellow
    Write-Host "请在 .env 文件中配置 OPENAI_API_KEY" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "📦 检查应用镜像..." -ForegroundColor Green
docker-compose images

Write-Host ""
Write-Host "🚀 启动 Next AI Draw.io 容器..." -ForegroundColor Green
docker-compose up -d

Write-Host ""
Write-Host "⏳ 等待应用启动..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host ""
Write-Host "📊 检查容器状态..." -ForegroundColor Green
docker-compose ps

Write-Host ""
Write-Host "🔍 查看启动日志..." -ForegroundColor Green
docker-compose logs --tail=30

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✅ Next AI Draw.io 已启动！" -ForegroundColor Green
Write-Host "  🌐 访问地址：http://localhost:3001" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "提示：" -ForegroundColor Yellow
Write-Host "  - 查看日志：docker-compose logs -f" -ForegroundColor White
Write-Host "  - 停止服务：.\scripts\03-stop-all.ps1" -ForegroundColor White
Write-Host "  - 重启服务：docker-compose restart" -ForegroundColor White
Write-Host ""

# 询问是否打开浏览器
$response = Read-Host "是否在浏览器中打开应用？(Y/n)"
if ($response -ne "n" -and $response -ne "N") {
    Start-Process "http://localhost:3001"
}
