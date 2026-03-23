import { Pool, type PoolClient } from "pg"

// 全局变量用于在热重载时保持数据库连接
const globalForPg = globalThis as unknown as {
    pool: Pool | null
}

// 从环境变量创建连接池配置
function createPool() {
    const connectionString = process.env.DATABASE_URL

    if (!connectionString) {
        console.warn("DATABASE_URL 未设置，数据库功能将不可用")
        return null
    }

    return new Pool({
        connectionString,
        max: 20, // 最大连接数
        idleTimeoutMillis: 30000, // 空闲连接超时
        connectionTimeoutMillis: 2000, // 连接超时
    })
}

// 创建或获取数据库连接池
export const pool: Pool | null = globalForPg.pool ?? createPool()

// 在开发环境中保存连接池到全局变量
if (process.env.NODE_ENV === "development") {
    globalForPg.pool = pool
}

// 数据库查询辅助函数
export async function query<T = any>(
    text: string,
    params?: any[],
): Promise<{ rows: T[] }> {
    if (!pool) {
        throw new Error("数据库未连接")
    }

    const start = Date.now()
    try {
        const result = await pool.query(text, params)
        const duration = Date.now() - start
        console.log("执行查询", {
            text: text.split("\n")[0],
            duration,
            rows: result.rowCount,
        })
        return { rows: result.rows as T[] }
    } catch (error) {
        console.error("数据库查询错误", { text: text.split("\n")[0], error })
        throw error
    }
}

// 事务执行辅助函数
export async function withTransaction<T>(
    fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
    if (!pool) {
        throw new Error("数据库未连接")
    }

    const client = await pool.connect()
    try {
        await client.query("BEGIN")
        const result = await fn(client)
        await client.query("COMMIT")
        return result
    } catch (error) {
        await client.query("ROLLBACK")
        throw error
    } finally {
        client.release()
    }
}

// 测试数据库连接
export async function testConnection(): Promise<boolean> {
    if (!pool) {
        return false
    }

    try {
        await query("SELECT NOW()")
        return true
    } catch {
        return false
    }
}
