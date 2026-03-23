"use client"

import { use, useContext } from "react"
import { AuthContext } from "../contexts/auth-context"

/**
 * 使用认证上下文
 * 必须在 AuthProvider 内部使用
 */
export function useAuth() {
    const context = useContext(AuthContext)

    if (context === undefined) {
        throw new Error("useAuth 必须在 AuthProvider 内部使用")
    }

    return context
}
