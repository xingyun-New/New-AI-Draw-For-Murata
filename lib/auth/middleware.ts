import { type NextRequest, NextResponse } from "next/server"
import type { JWTPayload } from "./jwt"
import { extractTokenFromHeader, verifyToken } from "./jwt"

/**
 * 认证中间件 - 验证请求中的 JWT token
 * 返回用户信息或 null（未认证）
 */
export async function authenticateRequest(
    request: NextRequest,
): Promise<JWTPayload | null> {
    // 从 header 中提取 token
    const authorization = request.headers.get("authorization")
    const token = extractTokenFromHeader(authorization)

    if (!token) {
        return null
    }

    // 验证 token
    const payload = verifyToken(token)
    return payload
}

/**
 * 创建未认证错误响应
 */
export function createUnauthorizedResponse(message = "未认证"): NextResponse {
    return NextResponse.json({ error: message }, { status: 401 })
}

/**
 * 创建错误响应
 */
export function createErrorResponse(
    message: string,
    status = 400,
): NextResponse {
    return NextResponse.json({ error: message }, { status })
}

/**
 * 创建成功响应
 */
export function createSuccessResponse<T>(data: T): NextResponse {
    return NextResponse.json(data)
}
