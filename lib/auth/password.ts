import bcrypt from "bcryptjs"

const SALT_ROUNDS = 10

/**
 * 对密码进行哈希加密
 */
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * 验证密码
 */
export async function verifyPassword(
    password: string,
    passwordHash: string,
): Promise<boolean> {
    return bcrypt.compare(password, passwordHash)
}

/**
 * 验证密码强度
 * 要求：至少 8 位，包含大小写字母和数字
 */
export function validatePasswordStrength(password: string): {
    valid: boolean
    errors: string[]
} {
    const errors: string[] = []

    if (password.length < 8) {
        errors.push("密码长度至少 8 位")
    }

    if (!/[a-z]/.test(password)) {
        errors.push("密码必须包含小写字母")
    }

    if (!/[A-Z]/.test(password)) {
        errors.push("密码必须包含大写字母")
    }

    if (!/[0-9]/.test(password)) {
        errors.push("密码必须包含数字")
    }

    return {
        valid: errors.length === 0,
        errors,
    }
}
