import { type NextRequest, NextResponse } from "next/server"
import { authenticateRequest } from "@/lib/auth/middleware"
import { query } from "@/lib/db"

interface RouteParams {
    params: Promise<{ id: string }>
}

/**
 * PUT /api/model-configs/[id]
 * 更新模型配置（仅管理员）
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const payload = await authenticateRequest(request)

        if (!payload || payload.role !== "admin") {
            return NextResponse.json(
                { error: "需要管理员权限" },
                { status: 403 },
            )
        }

        const { id } = await params
        const body = await request.json()
        const { provider_name, display_name, api_key, base_url, is_enabled } =
            body

        // 构建更新语句（只更新提供的字段）
        const updates: string[] = []
        const values: any[] = []
        let paramIndex = 1

        if (provider_name !== undefined) {
            updates.push(`provider_name = $${paramIndex++}`)
            values.push(provider_name)
        }
        if (display_name !== undefined) {
            updates.push(`display_name = $${paramIndex++}`)
            values.push(display_name)
        }
        if (api_key !== undefined) {
            updates.push(`api_key = $${paramIndex++}`)
            values.push(api_key)
        }
        if (base_url !== undefined) {
            updates.push(`base_url = $${paramIndex++}`)
            values.push(base_url)
        }
        if (is_enabled !== undefined) {
            updates.push(`is_enabled = $${paramIndex++}`)
            values.push(is_enabled)
        }

        if (updates.length === 0) {
            return NextResponse.json(
                { error: "没有要更新的字段" },
                { status: 400 },
            )
        }

        updates.push(`updated_at = CURRENT_TIMESTAMP`)
        values.push(id)

        const result = await query(
            `UPDATE model_configs 
       SET ${updates.join(", ")} 
       WHERE id = $${paramIndex}
       RETURNING id, provider, provider_name, model_id, display_name, base_url, 
                 is_enabled, created_at, updated_at`,
            values,
        )

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: "模型配置不存在" },
                { status: 404 },
            )
        }

        return NextResponse.json({
            config: result.rows[0],
        })
    } catch (error) {
        console.error("更新模型配置错误:", error)
        return NextResponse.json({ error: "更新模型配置失败" }, { status: 500 })
    }
}

/**
 * DELETE /api/model-configs/[id]
 * 删除模型配置（仅管理员）
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const payload = await authenticateRequest(request)

        if (!payload || payload.role !== "admin") {
            return NextResponse.json(
                { error: "需要管理员权限" },
                { status: 403 },
            )
        }

        const { id } = await params

        const result = await query(
            `DELETE FROM model_configs WHERE id = $1 RETURNING id`,
            [id],
        )

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: "模型配置不存在" },
                { status: 404 },
            )
        }

        return NextResponse.json({
            message: "模型配置已删除",
        })
    } catch (error) {
        console.error("删除模型配置错误:", error)
        return NextResponse.json({ error: "删除模型配置失败" }, { status: 500 })
    }
}
