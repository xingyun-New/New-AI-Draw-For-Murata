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

interface RegisterDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSwitchToLogin: () => void
}

export function RegisterDialog({
    open,
    onOpenChange,
    onSwitchToLogin,
}: RegisterDialogProps) {
    const { register } = useAuth()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        // 验证密码匹配
        if (password !== confirmPassword) {
            setError("两次输入的密码不一致")
            return
        }

        setIsLoading(true)

        try {
            await register(email, password)
            onOpenChange(false)
            setEmail("")
            setPassword("")
            setConfirmPassword("")
        } catch (err) {
            setError(err instanceof Error ? err.message : "注册失败")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>注册账号</DialogTitle>
                    <DialogDescription>
                        创建账号以使用 AI 图表生成工具
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
                            <Label htmlFor="register-email">邮箱</Label>
                            <Input
                                id="register-email"
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="register-password">密码</Label>
                            <Input
                                id="register-password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                                minLength={8}
                            />
                            <p className="text-xs text-gray-500">
                                密码要求：至少 8 位，包含大小写字母和数字
                            </p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="register-confirm">确认密码</Label>
                            <Input
                                id="register-confirm"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                required
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onSwitchToLogin}
                        >
                            已有账号？登录
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "注册中..." : "注册"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
