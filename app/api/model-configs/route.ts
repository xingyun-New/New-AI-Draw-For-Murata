import { type NextRequest, NextResponse } from "next/server"
import { authenticateRequest } from "@/lib/auth/middleware"
import { pool, query } from "@/lib/db"

/**
 * GET /api/model-configs
 * 获取所有已配置的模型（公开，不需要认证）
 */
export async function GET() {
    if (!pool) {
        return NextResponse.json({ configs: [] })
    }

    try {
        const result = await query(
            `SELECT id, provider, provider_name, model_id, display_name, api_key, base_url, 
              is_enabled, created_at, updated_at 
       FROM model_configs 
       WHERE is_enabled = true 
       ORDER BY provider_name, display_name`,
        )

        const configs = result.rows.map((row: any) => ({
            ...row,
            api_key: row.api_key ? "***" : null,
        }))

        return NextResponse.json({
            configs,
        })
    } catch (error: any) {
        if (error?.code === "42P01") {
            return NextResponse.json({ configs: [] })
        }
        console.error("获取模型配置错误:", error)
        return NextResponse.json({ configs: [] })
    }
}

/**
 * POST /api/model-configs
 * 创建新的模型配置（仅管理员）
 */
export async function POST(request: NextRequest) {
    try {
        const payload = await authenticateRequest(request)

        if (!payload || payload.role !== "admin") {
            return NextResponse.json(
                { error: "需要管理员权限" },
                { status: 403 },
            )
        }

        const body = await request.json()
        const {
            provider,
            provider_name,
            model_id,
            display_name,
            api_key,
            base_url,
            is_enabled = true,
        } = body

        // 验证必填字段
        if (!provider || !model_id || !api_key) {
            return NextResponse.json({ error: "缺少必填字段" }, { status: 400 })
        }

        const result = await query(
            `INSERT INTO model_configs 
       (provider, provider_name, model_id, display_name, api_key, base_url, is_enabled) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id, provider, provider_name, model_id, display_name, base_url, 
                 is_enabled, created_at, updated_at`,
            [
                provider,
                provider_name,
                model_id,
                display_name || model_id,
                api_key,
                base_url || null,
                is_enabled,
            ],
        )

        return NextResponse.json(
            {
                config: result.rows[0],
            },
            { status: 201 },
        )
    } catch (error) {
        console.error("创建模型配置错误:", error)
        return NextResponse.json({ error: "创建模型配置失败" }, { status: 500 })
    }
}
