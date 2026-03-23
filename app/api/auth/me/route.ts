import { type NextRequest, NextResponse } from "next/server"
import { authenticateRequest } from "@/lib/auth/middleware"

/**
 * GET /api/auth/me
 * 获取当前登录用户信息
 */
export async function GET(request: NextRequest) {
    try {
        const payload = await authenticateRequest(request)

        if (!payload) {
            return NextResponse.json({ error: "未认证" }, { status: 401 })
        }

        return NextResponse.json({
            user: {
                id: payload.userId,
                email: payload.email,
            },
        })
    } catch (error) {
        console.error("获取用户信息错误:", error)
        return NextResponse.json({ error: "获取用户信息失败" }, { status: 500 })
    }
}
