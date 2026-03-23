import { type NextRequest, NextResponse } from "next/server"
import { authenticateRequest } from "@/lib/auth/middleware"
import type { UserSession } from "@/lib/auth/types"
import { query } from "@/lib/db"

interface RouteParams {
    params: Promise<{ id: string }>
}

/**
 * GET /api/sessions/[id]
 * 获取单个会话详情
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const payload = await authenticateRequest(request)

        if (!payload) {
            return NextResponse.json({ error: "未认证" }, { status: 401 })
        }

        const { id } = await params

        // 获取会话并验证所有权
        const result = await query<UserSession>(
            `SELECT id, user_id, session_name, diagram_data, messages, created_at, updated_at 
       FROM user_sessions 
       WHERE id = $1 AND user_id = $2`,
            [id, payload.userId],
        )

        if (result.rows.length === 0) {
            return NextResponse.json({ error: "会话不存在" }, { status: 404 })
        }

        return NextResponse.json({
            session: result.rows[0],
        })
    } catch (error) {
        console.error("获取会话详情错误:", error)
        return NextResponse.json({ error: "获取会话失败" }, { status: 500 })
    }
}

/**
 * PUT /api/sessions/[id]
 * 更新会话
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const payload = await authenticateRequest(request)

        if (!payload) {
            return NextResponse.json({ error: "未认证" }, { status: 401 })
        }

        const { id } = await params
        const body = await request.json()
        const { session_name, diagram_data, messages } = body

        // 验证会话所有权并更新
        const result = await query<UserSession>(
            `UPDATE user_sessions 
       SET session_name = COALESCE($1, session_name),
           diagram_data = COALESCE($2, diagram_data),
           messages = COALESCE($3, messages),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 AND user_id = $5
       RETURNING id, user_id, session_name, created_at, updated_at`,
            [
                session_name,
                diagram_data,
                messages ? JSON.stringify(messages) : null,
                id,
                payload.userId,
            ],
        )

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: "会话不存在或无权访问" },
                { status: 404 },
            )
        }

        return NextResponse.json({
            session: result.rows[0],
        })
    } catch (error) {
        console.error("更新会话错误:", error)
        return NextResponse.json({ error: "更新会话失败" }, { status: 500 })
    }
}

/**
 * DELETE /api/sessions/[id]
 * 删除会话
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const payload = await authenticateRequest(request)

        if (!payload) {
            return NextResponse.json({ error: "未认证" }, { status: 401 })
        }

        const { id } = await params

        // 验证会话所有权并删除
        const result = await query(
            `DELETE FROM user_sessions 
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
            [id, payload.userId],
        )

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: "会话不存在或无权访问" },
                { status: 404 },
            )
        }

        return NextResponse.json({
            message: "会话已删除",
        })
    } catch (error) {
        console.error("删除会话错误:", error)
        return NextResponse.json({ error: "删除会话失败" }, { status: 500 })
    }
}
