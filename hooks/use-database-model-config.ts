"use client"

import { useCallback, useEffect, useState } from "react"
import { getApiEndpoint } from "@/lib/base-path"

export interface DatabaseModelConfig {
    id: string
    provider: string
    provider_name: string
    model_id: string
    display_name: string
    api_key?: string
    base_url?: string
    is_enabled: boolean
    created_at: string
    updated_at: string
}

interface UseDatabaseModelConfigReturn {
    configs: DatabaseModelConfig[]
    isLoading: boolean
    error: string | null
    refreshConfigs: () => Promise<void>
}

/**
 * 从数据库加载模型配置（只读，供所有用户使用）
 */
export function useDatabaseModelConfig(): UseDatabaseModelConfigReturn {
    const [configs, setConfigs] = useState<DatabaseModelConfig[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const loadConfigs = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await fetch(getApiEndpoint("/api/model-configs"))
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "加载模型配置失败")
            }

            setConfigs(data.configs || [])
        } catch (err) {
            console.error("加载模型配置错误:", err)
            setError(err instanceof Error ? err.message : "加载失败")
            setConfigs([])
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        loadConfigs()
    }, [loadConfigs])

    return {
        configs,
        isLoading,
        error,
        refreshConfigs: loadConfigs,
    }
}
