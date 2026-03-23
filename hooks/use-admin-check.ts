"use client"

import { useAuth } from "./use-auth"

/**
 * 检查用户是否是管理员
 * 如果不是管理员，返回 false
 */
export function useAdminCheck() {
    const { user, isAdmin } = useAuth()

    const checkAdmin = () => {
        if (!user) {
            return false
        }
        return isAdmin
    }

    return {
        isAdmin: checkAdmin(),
        user,
    }
}
