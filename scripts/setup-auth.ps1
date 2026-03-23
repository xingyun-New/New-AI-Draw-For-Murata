# 用户认证系统快速设置脚本
# 使用方法：.\scripts\setup-auth.ps1

param(
    [switch]$Help,
    [switch]$SkipDocker
)

if ($Help) {
    Write-Host @"
用户认证系统快速设置脚本

用法:
  .\scripts\setup-auth.ps1 [-SkipDocker]

选项:
  -SkipDocker    跳过 Docker 数据库设置（如果已有 PostgreSQL）

示例:
  .\scripts\setup-auth.ps1              # 完整设置
  .\scripts\setup-auth.ps1 -SkipDocker  # 跳过 Docker 设置
"@
    exit 0
}

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  用户认证系统快速设置" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# 1. 检查 .env 文件
Write-Host "[1/4] 检查环境变量配置..." -ForegroundColor Yellow

if (!(Test-Path ".env")) {
    Write-Host "  创建 .env 文件..." -ForegroundColor Green
    Copy-Item "env.example" ".env"
    
    # 生成随机 JWT_SECRET
    $jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
    
    # 更新 .env 文件
    $envContent = Get-Content ".env" -Raw
    $envContent = $envContent -replace "# DATABASE_URL=.*", "DATABASE_URL=postgresql://nextai:nextai_password@localhost:5432/nextai_drawio"
    $envContent = $envContent -replace "# JWT_SECRET=.*", "JWT_SECRET=$jwtSecret"
    $envContent = $envContent -replace "# JWT_EXPIRES_IN=.*", "JWT_EXPIRES_IN=7d"
    
    Set-Content ".env" $envContent
    Write-Host "  ✓ .env 文件已创建并配置" -ForegroundColor Green
} else {
    Write-Host "  ✓ .env 文件已存在" -ForegroundColor Green
}

# 2. 检查 Docker
if (!$SkipDocker) {
    Write-Host ""
    Write-Host "[2/4] 配置 Docker 数据库..." -ForegroundColor Yellow
    
    $dockerStatus = docker-compose ps 2>&1
    
    if ($dockerStatus -match "postgres") {
        Write-Host "  ✓ PostgreSQL 容器已运行" -ForegroundColor Green
    } else {
        Write-Host "  启动 PostgreSQL 容器..." -ForegroundColor Cyan
        docker-compose up -d postgres
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ PostgreSQL 容器已启动" -ForegroundColor Green
            Write-Host "  等待数据库初始化..." -ForegroundColor Cyan
            Start-Sleep -Seconds 5
        } else {
            Write-Host "  ✗ Docker 启动失败，请检查 Docker 是否安装并运行" -ForegroundColor Red
            exit 1
        }
    }
} else {
    Write-Host ""
    Write-Host "[2/4] 跳过 Docker 设置（使用现有 PostgreSQL）" -ForegroundColor Yellow
}

# 3. 安装依赖
Write-Host ""
Write-Host "[3/4] 安装依赖包..." -ForegroundColor Yellow

$packageJson = Get-Content "package.json" -Raw
$requiredPackages = @("bcryptjs", "jsonwebtoken", "pg")
$missingPackages = @()

foreach ($pkg in $requiredPackages) {
    if ($packageJson -notmatch "`"$pkg`"") {
        $missingPackages += $pkg
    }
}

if ($missingPackages.Count -gt 0) {
    Write-Host "  安装缺失的包：$($missingPackages -join ', ')" -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ 依赖包安装完成" -ForegroundColor Green
    } else {
        Write-Host "  ✗ 依赖包安装失败" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ✓ 所有依赖包已安装" -ForegroundColor Green
}

# 4. 验证配置
Write-Host ""
Write-Host "[4/4] 验证配置..." -ForegroundColor Yellow

# 检查数据库连接
Write-Host "  测试数据库连接..." -ForegroundColor Cyan
try {
    $testQuery = docker exec nextai-postgres psql -U nextai -d nextai_drawio -c "SELECT 1" 2>&1
    if ($testQuery -match "1 row") {
        Write-Host "  ✓ 数据库连接正常" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ 数据库连接可能有问题，请手动检查" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ⚠ 无法测试数据库连接" -ForegroundColor Yellow
}

# 显示配置信息
Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  设置完成！" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "下一步:" -ForegroundColor Yellow
Write-Host "  1. 启动开发服务器：npm run dev" -ForegroundColor White
Write-Host "  2. 访问：http://localhost:6002" -ForegroundColor White
Write-Host "  3. 点击右上角'注册'按钮创建账号" -ForegroundColor White
Write-Host ""
Write-Host "重要提示:" -ForegroundColor Yellow
Write-Host "  - 密码要求：至少 8 位，包含大小写字母和数字" -ForegroundColor White
Write-Host "  - JWT_SECRET 已自动生成并保存在 .env 文件" -ForegroundColor White
Write-Host "  - 如需配置邮件服务，请编辑 .env 文件添加 SMTP 配置" -ForegroundColor White
Write-Host ""
Write-Host "查看完整文档：docs/AUTH_GUIDE.md" -ForegroundColor Cyan
Write-Host ""
