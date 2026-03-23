import { type NextRequest, NextResponse } from "next/server"
import { generateToken } from "@/lib/auth/jwt"
import { hashPassword, validatePasswordStrength } from "@/lib/auth/password"
import type { User } from "@/lib/auth/types"
import { query } from "@/lib/db"

/**
 * POST /api/auth/register
 * 用户注册
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

        // 验证邮箱格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "邮箱格式不正确" },
                { status: 400 },
            )
        }

        // 验证密码强度
        const passwordValidation = validatePasswordStrength(password)
        if (!passwordValidation.valid) {
            return NextResponse.json(
                { error: passwordValidation.errors.join("，") },
                { status: 400 },
            )
        }

        // 检查邮箱是否已存在
        const existingUser = await query<User>(
            "SELECT id, email FROM users WHERE email = $1",
            [email.toLowerCase()],
        )

        if (existingUser.rows.length > 0) {
            return NextResponse.json(
                { error: "该邮箱已被注册" },
                { status: 409 },
            )
        }

        // 加密密码
        const passwordHash = await hashPassword(password)

        // 创建用户
        const result = await query<User>(
            `INSERT INTO users (email, password_hash) 
       VALUES ($1, $2) 
       RETURNING id, email, role, created_at, updated_at`,
            [email.toLowerCase(), passwordHash],
        )

        const user = result.rows[0]

        // 生成 JWT token
        const token = generateToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        })

        return NextResponse.json(
            {
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                },
                token,
            },
            { status: 201 },
        )
    } catch (error) {
        console.error("注册错误:", error)
        return NextResponse.json(
            { error: "注册失败，请稍后重试" },
            { status: 500 },
        )
    }
}
