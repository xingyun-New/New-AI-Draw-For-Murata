import { type NextRequest, NextResponse } from "next/server"
import { authenticateRequest } from "@/lib/auth/middleware"
import type { UserSession } from "@/lib/auth/types"
import { query } from "@/lib/db"

/**
 * GET /api/sessions
 * 获取当前用户的所有会话
 */
export async function GET(request: NextRequest) {
    try {
        const payload = await authenticateRequest(request)

        if (!payload) {
            return NextResponse.json({ error: "未认证" }, { status: 401 })
        }

        // 只获取当前用户的会话
        const result = await query<UserSession>(
            `SELECT id, user_id, session_name, created_at, updated_at 
       FROM user_sessions 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
            [payload.userId],
        )

        return NextResponse.json({
            sessions: result.rows,
        })
    } catch (error) {
        console.error("获取会话列表错误:", error)
        return NextResponse.json({ error: "获取会话失败" }, { status: 500 })
    }
}

/**
 * POST /api/sessions
 * 创建新会话
 */
export async function POST(request: NextRequest) {
    try {
        const payload = await authenticateRequest(request)

        if (!payload) {
            return NextResponse.json({ error: "未认证" }, { status: 401 })
        }

        const body = await request.json()
        const { session_name = "新会话" } = body

        const result = await query<UserSession>(
            `INSERT INTO user_sessions (user_id, session_name) 
       VALUES ($1, $2) 
       RETURNING id, user_id, session_name, created_at, updated_at`,
            [payload.userId, session_name],
        )

        return NextResponse.json(
            {
                session: result.rows[0],
            },
            { status: 201 },
        )
    } catch (error) {
        console.error("创建会话错误:", error)
        return NextResponse.json({ error: "创建会话失败" }, { status: 500 })
    }
}
