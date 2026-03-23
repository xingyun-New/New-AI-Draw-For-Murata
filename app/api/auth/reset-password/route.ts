import { type NextRequest, NextResponse } from "next/server"
import { hashPassword, validatePasswordStrength } from "@/lib/auth/password"
import { query } from "@/lib/db"

/**
 * POST /api/auth/reset-password
 * 重置密码
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { token, newPassword } = body

        // 验证必填字段
        if (!token || !newPassword) {
            return NextResponse.json(
                { error: "令牌和新密码不能为空" },
                { status: 400 },
            )
        }

        // 验证密码强度
        const passwordValidation = validatePasswordStrength(newPassword)
        if (!passwordValidation.valid) {
            return NextResponse.json(
                { error: passwordValidation.errors.join(",") },
                { status: 400 },
            )
        }

        // 查询令牌
        const tokenResult = await query<{
            id: string
            user_id: string
            token: string
            expires_at: string
            used: boolean
        }>(
            `SELECT id, user_id, token, expires_at, used 
       FROM password_reset_tokens 
       WHERE token = $1`,
            [token],
        )

        if (tokenResult.rows.length === 0) {
            return NextResponse.json(
                { error: "无效的重置令牌" },
                { status: 400 },
            )
        }

        const resetToken = tokenResult.rows[0]

        // 检查令牌是否已使用
        if (resetToken.used) {
            return NextResponse.json(
                { error: "重置令牌已使用" },
                { status: 400 },
            )
        }

        // 检查令牌是否过期
        const expiresAt = new Date(resetToken.expires_at)
        if (expiresAt < new Date()) {
            return NextResponse.json(
                { error: "重置令牌已过期" },
                { status: 400 },
            )
        }

        // 加密新密码
        const passwordHash = await hashPassword(newPassword)

        // 更新密码并标记令牌为已使用
        await query(
            `UPDATE users 
       SET password_hash = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
            [passwordHash, resetToken.user_id],
        )

        await query(
            `UPDATE password_reset_tokens 
       SET used = TRUE 
       WHERE id = $1`,
            [resetToken.id],
        )

        return NextResponse.json({
            message: "密码重置成功",
        })
    } catch (error) {
        console.error("重置密码错误:", error)
        return NextResponse.json(
            { error: "重置失败，请稍后重试" },
            { status: 500 },
        )
    }
}
