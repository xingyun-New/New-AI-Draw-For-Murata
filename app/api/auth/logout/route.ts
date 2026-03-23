import { NextResponse } from "next/server"

/**
 * POST /api/auth/logout
 * 用户登出
 * 注意：JWT 是无状态的，登出主要在客户端清除 token
 * 如需实现 token 黑名单，可在此添加数据库逻辑
 */
export async function POST() {
    // 如果未来需要实现 token 黑名单，可以：
    // 1. 从 header 中提取 token
    // 2. 将 token 添加到黑名单表
    // 3. 在 middleware.ts 中检查黑名单

    return NextResponse.json({
        message: "登出成功",
    })
}
