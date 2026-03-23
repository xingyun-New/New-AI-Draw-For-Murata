"use client"

import type { ReactNode } from "react"
import { AuthProvider } from "@/contexts/auth-context"

interface ClientProvidersProps {
    children: ReactNode
}

export function ClientProviders({ children }: ClientProvidersProps) {
    return <AuthProvider>{children}</AuthProvider>
}
