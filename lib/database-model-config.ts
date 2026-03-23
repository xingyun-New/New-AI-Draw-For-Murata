import { pool, query } from "@/lib/db"

export interface DatabaseModelRecord {
    id: string
    provider: string
    model_id: string
    api_key: string
    base_url: string | null
}

/**
 * Load a shared model row from PostgreSQL (credentials stay server-side).
 * ID is the model_configs.id UUID (without db: prefix).
 */
export async function findDatabaseModelById(
    uuid: string,
): Promise<DatabaseModelRecord | null> {
    if (!pool || !uuid || typeof uuid !== "string") {
        return null
    }

    try {
        const result = await query<DatabaseModelRecord>(
            `SELECT id, provider, model_id, api_key, base_url
             FROM model_configs
             WHERE id = $1 AND is_enabled = true`,
            [uuid],
        )
        const row = result.rows[0]
        if (!row) return null
        return {
            ...row,
            provider: String(row.provider).trim().toLowerCase(),
        }
    } catch (e) {
        console.error(
            "[database-model-config] findDatabaseModelById failed:",
            e,
        )
        return null
    }
}
