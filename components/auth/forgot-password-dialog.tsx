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

interface ForgotPasswordDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ForgotPasswordDialog({
    open,
    onOpenChange,
}: ForgotPasswordDialogProps) {
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        try {
            const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "发送失败")
            }

            setSuccess(true)
            setEmail("")
        } catch (err) {
            setError(err instanceof Error ? err.message : "发送失败")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>重置密码</DialogTitle>
                    <DialogDescription>
                        输入您的邮箱，我们将发送密码重置链接
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        {error && (
                            <div className="text-sm text-red-500 bg-red-50 p-3 rounded">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="text-sm text-green-600 bg-green-50 p-3 rounded">
                                如果该邮箱已注册，重置邮件将发送至此。请检查您的邮箱。
                            </div>
                        )}

                        {!success && (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="forgot-email">邮箱</Label>
                                    <Input
                                        id="forgot-email"
                                        type="email"
                                        placeholder="your@email.com"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="text-xs text-gray-500">
                                    <p>提示：</p>
                                    <ul className="list-disc list-inside mt-1 space-y-1">
                                        <li>检查垃圾邮件文件夹</li>
                                        <li>重置链接 24 小时后过期</li>
                                        <li>如果未收到邮件，请联系管理员</li>
                                    </ul>
                                </div>
                            </>
                        )}
                    </div>

                    <DialogFooter>
                        {!success ? (
                            <>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                >
                                    取消
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? "发送中..." : "发送重置链接"}
                                </Button>
                            </>
                        ) : (
                            <Button
                                type="button"
                                onClick={() => onOpenChange(false)}
                            >
                                完成
                            </Button>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
