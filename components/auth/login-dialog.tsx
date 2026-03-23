"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/use-auth"

interface LoginDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSwitchToRegister: () => void
    onForgotPassword: () => void
}

export function LoginDialog({
    open,
    onOpenChange,
    onSwitchToRegister,
    onForgotPassword,
}: LoginDialogProps) {
    const { login } = useAuth()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        try {
            await login(email, password)
            onOpenChange(false)
            setEmail("")
            setPassword("")
        } catch (err) {
            setError(err instanceof Error ? err.message : "登录失败")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>登录</DialogTitle>
                    <DialogDescription>
                        登录以继续使用 AI 图表生成工具
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        {error && (
                            <div className="text-sm text-red-500 bg-red-50 p-3 rounded">
                                {error}
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="login-email">邮箱</Label>
                            <Input
                                id="login-email"
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="login-password">密码</Label>
                                <Button
                                    type="button"
                                    variant="link"
                                    className="h-auto p-0 text-sm"
                                    onClick={onForgotPassword}
                                >
                                    忘记密码？
                                </Button>
                            </div>
                            <Input
                                id="login-password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onSwitchToRegister}
                        >
                            还没有账号？注册
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "登录中..." : "登录"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
