#!/usr/bin/env pwsh
# 03-stop-all.ps1 - 停止所有 Docker 服务

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  停止所有 Docker 服务" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Docker 是否运行
try {
    docker ps | Out-Null
} catch {
    Write-Host "❌ 错误：Docker 未运行或未安装" -ForegroundColor Red
    exit 1
}

Write-Host "📊 当前运行的容器:" -ForegroundColor Green
docker-compose ps
docker-compose -f docker-compose.drawio.yml ps

Write-Host ""
$confirm = Read-Host "确定要停止所有服务吗？(y/N)"

if ($confirm -eq "y" -or $confirm -eq "Y") {
    Write-Host ""
    Write-Host "🛑 停止 Next AI Draw.io..." -ForegroundColor Yellow
    docker-compose down
    
    Write-Host ""
    Write-Host "🛑 停止 draw.io..." -ForegroundColor Yellow
    docker-compose -f docker-compose.drawio.yml down
    
    Write-Host ""
    Write-Host "✅ 所有服务已停止" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ 操作已取消" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "提示：" -ForegroundColor Cyan
Write-Host "  - 启动 draw.io: .\scripts\01-start-drawio.ps1" -ForegroundColor White
Write-Host "  - 启动主应用：.\scripts\02-start-app.ps1" -ForegroundColor White
Write-Host ""
