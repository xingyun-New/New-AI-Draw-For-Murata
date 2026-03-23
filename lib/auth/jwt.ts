import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d"

if (!JWT_SECRET) {
    console.warn("JWT_SECRET 未设置，认证功能将不可用")
}

export interface JWTPayload {
    userId: string
    email: string
    role: "user" | "admin"
}

/**
 * 生成 JWT Token
 */
export function generateToken(payload: JWTPayload): string {
    if (!JWT_SECRET) {
        throw new Error("JWT_SECRET 未配置")
    }

    return jwt.sign(payload as object, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    } as jwt.SignOptions)
}

/**
 * 验证 JWT Token
 */
export function verifyToken(token: string): JWTPayload | null {
    if (!JWT_SECRET) {
        throw new Error("JWT_SECRET 未配置")
    }

    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return null
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return null
        }
        throw error
    }
}

/**
 * 从 Authorization header 提取 token
 */
export function extractTokenFromHeader(
    authorization?: string | null,
): string | null {
    if (!authorization) {
        return null
    }

    const parts = authorization.split(" ")
    if (parts.length !== 2 || parts[0] !== "Bearer") {
        return null
    }

    return parts[1]
}
