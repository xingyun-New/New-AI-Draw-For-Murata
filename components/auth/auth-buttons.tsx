"use client"

import { LogIn, UserPlus } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { ForgotPasswordDialog } from "./forgot-password-dialog"
import { LoginDialog } from "./login-dialog"
import { RegisterDialog } from "./register-dialog"
import { UserMenu } from "./user-menu"

export function AuthButtons() {
    const { user } = useAuth()
    const [showLogin, setShowLogin] = useState(false)
    const [showRegister, setShowRegister] = useState(false)
    const [showForgotPassword, setShowForgotPassword] = useState(false)

    // 如果已登录，显示用户菜单
    if (user) {
        return <UserMenu />
    }

    // 未登录，显示登录/注册按钮
    return (
        <>
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowLogin(true)}
                    className="gap-2"
                >
                    <LogIn className="w-4 h-4" />
                    <span className="hidden sm:inline">登录</span>
                </Button>
                <Button
                    variant="default"
                    size="sm"
                    onClick={() => setShowRegister(true)}
                    className="gap-2"
                >
                    <UserPlus className="w-4 h-4" />
                    <span className="hidden sm:inline">注册</span>
                </Button>
            </div>

            {/* 登录对话框 */}
            <LoginDialog
                open={showLogin}
                onOpenChange={setShowLogin}
                onSwitchToRegister={() => {
                    setShowLogin(false)
                    setShowRegister(true)
                }}
                onForgotPassword={() => {
                    setShowLogin(false)
                    setShowForgotPassword(true)
                }}
            />

            {/* 注册对话框 */}
            <RegisterDialog
                open={showRegister}
                onOpenChange={setShowRegister}
                onSwitchToLogin={() => {
                    setShowRegister(false)
                    setShowLogin(true)
                }}
            />

            {/* 忘记密码对话框 */}
            <ForgotPasswordDialog
                open={showForgotPassword}
                onOpenChange={setShowForgotPassword}
            />
        </>
    )
}
