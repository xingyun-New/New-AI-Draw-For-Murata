import { randomBytes } from "crypto"
import { type NextRequest, NextResponse } from "next/server"
import { authenticateRequest } from "@/lib/auth/middleware"
import { query } from "@/lib/db"

/**
 * POST /api/auth/forgot-password
 * 发送密码重置邮件
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email } = body

        // 验证邮箱
        if (!email) {
            return NextResponse.json({ error: "邮箱不能为空" }, { status: 400 })
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "邮箱格式不正确" },
                { status: 400 },
            )
        }

        // 查询用户
        const userResult = await query<{ id: string; email: string }>(
            "SELECT id, email FROM users WHERE email = $1",
            [email.toLowerCase()],
        )

        // 即使用户不存在也返回成功（防止邮箱枚举攻击）
        if (userResult.rows.length === 0) {
            return NextResponse.json({
                message: "如果该邮箱已注册，重置邮件将发送至此",
            })
        }

        const user = userResult.rows[0]

        // 生成重置令牌
        const resetToken = randomBytes(32).toString("hex")
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 小时后过期

        // 存储令牌到数据库
        await query(
            `INSERT INTO password_reset_tokens (user_id, token, expires_at) 
       VALUES ($1, $2, $3)`,
            [user.id, resetToken, expiresAt.toISOString()],
        )

        // TODO: 发送邮件
        // 需要配置 SMTP 服务器
        // 重置链接：${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}

        console.log("密码重置令牌已生成:", {
            userId: user.id,
            email: user.email,
            resetToken, // 生产环境不要打印
            expiresAt,
        })

        return NextResponse.json({
            message: "如果该邮箱已注册，重置邮件将发送至此",
        })
    } catch (error) {
        console.error("发送重置邮件错误:", error)
        return NextResponse.json(
            { error: "发送失败，请稍后重试" },
            { status: 500 },
        )
    }
}
