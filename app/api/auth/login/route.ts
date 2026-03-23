import { type NextRequest, NextResponse } from "next/server"
import { generateToken } from "@/lib/auth/jwt"
import { verifyPassword } from "@/lib/auth/password"
import type { User } from "@/lib/auth/types"
import { query } from "@/lib/db"

/**
 * POST /api/auth/login
 * 用户登录
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password } = body

        // 验证必填字段
        if (!email || !password) {
            return NextResponse.json(
                { error: "邮箱和密码不能为空" },
                { status: 400 },
            )
        }

        // 查询用户
        const result = await query<User & { password_hash: string }>(
            "SELECT id, email, password_hash, role, created_at, updated_at FROM users WHERE email = $1",
            [email.toLowerCase()],
        )

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: "邮箱或密码错误" },
                { status: 401 },
            )
        }

        const dbUser = result.rows[0]

        // 验证密码
        const isValid = await verifyPassword(password, dbUser.password_hash)

        if (!isValid) {
            return NextResponse.json(
                { error: "邮箱或密码错误" },
                { status: 401 },
            )
        }

        // 生成 JWT token
        const token = generateToken({
            userId: dbUser.id,
            email: dbUser.email,
            role: dbUser.role,
        })

        return NextResponse.json({
            user: {
                id: dbUser.id,
                email: dbUser.email,
                role: dbUser.role,
            },
            token,
        })
    } catch (error) {
        console.error("登录错误:", error)
        return NextResponse.json(
            { error: "登录失败，请稍后重试" },
            { status: 500 },
        )
    }
}
