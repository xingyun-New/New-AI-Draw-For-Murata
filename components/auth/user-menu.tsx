"use client"

import { LogOut, Settings, User } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useAuth } from "@/hooks/use-auth"

export function UserMenu() {
    const { user, logout } = useAuth()
    const [open, setOpen] = useState(false)

    if (!user) {
        return null
    }

    const handleLogout = async () => {
        try {
            await logout()
        } catch (error) {
            console.error("登出失败:", error)
        } finally {
            setOpen(false)
        }
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    className="flex items-center gap-2 px-3"
                >
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                        {user.email.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline-block text-sm max-w-[150px] truncate">
                        {user.email}
                    </span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56" align="end">
                <div className="grid gap-3">
                    <div className="space-y-1">
                        <h4 className="text-sm font-medium">用户菜单</h4>
                        <p className="text-xs text-gray-500 truncate">
                            {user.email}
                        </p>
                    </div>
                    <div className="grid gap-2">
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-2"
                            onClick={() => {
                                // TODO: 打开用户设置
                                console.log("打开用户设置")
                            }}
                        >
                            <Settings className="w-4 h-4" />
                            设置
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-2 text-red-600 hover:text-red-700"
                            onClick={handleLogout}
                        >
                            <LogOut className="w-4 h-4" />
                            退出登录
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
