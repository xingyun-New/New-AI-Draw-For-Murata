"use client"

import {
    createContext,
    type ReactNode,
    useCallback,
    useEffect,
    useState,
} from "react"

export interface User {
    id: string
    email: string
    role: "user" | "admin"
}

interface AuthContextType {
    user: User | null
    token: string | null
    isLoading: boolean
    login: (email: string, password: string) => Promise<void>
    register: (email: string, password: string) => Promise<void>
    logout: () => Promise<void>
    updateUser: (user: Partial<User>) => void
    isAdmin: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
    children: ReactNode
}

const TOKEN_KEY = "auth_token"
const USER_KEY = "auth_user"

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // 初始化时从 localStorage 恢复认证状态
    useEffect(() => {
        try {
            const storedToken = localStorage.getItem(TOKEN_KEY)
            const storedUser = localStorage.getItem(USER_KEY)

            if (storedToken && storedUser) {
                setToken(storedToken)
                setUser(JSON.parse(storedUser))
            }
        } catch (error) {
            console.error("恢复认证状态失败:", error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    // 登录
    const login = useCallback(async (email: string, password: string) => {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || "登录失败")
        }

        const { user: userData, token: authToken } = data

        setToken(authToken)
        setUser(userData)
        localStorage.setItem(TOKEN_KEY, authToken)
        localStorage.setItem(USER_KEY, JSON.stringify(userData))
    }, [])

    // 注册
    const register = useCallback(async (email: string, password: string) => {
        const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || "注册失败")
        }

        const { user: userData, token: authToken } = data

        setToken(authToken)
        setUser(userData)
        localStorage.setItem(TOKEN_KEY, authToken)
        localStorage.setItem(USER_KEY, JSON.stringify(userData))
    }, [])

    // 登出
    const logout = useCallback(async () => {
        try {
            // 调用服务端登出接口（可选，用于 token 黑名单）
            await fetch("/api/auth/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            })
        } catch (error) {
            console.error("登出接口调用失败:", error)
        } finally {
            setToken(null)
            setUser(null)
            localStorage.removeItem(TOKEN_KEY)
            localStorage.removeItem(USER_KEY)
        }
    }, [token])

    // 更新用户信息
    const updateUser = useCallback((updatedUser: Partial<User>) => {
        setUser((prev) => {
            if (!prev) return null
            const newUser = { ...prev, ...updatedUser }
            localStorage.setItem(USER_KEY, JSON.stringify(newUser))
            return newUser
        })
    }, [])

    // 检查是否是管理员
    const isAdmin = user?.role === "admin"

    const value: AuthContextType = {
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        isAdmin,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
