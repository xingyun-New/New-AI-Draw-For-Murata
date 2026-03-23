import { afterAll, beforeAll, describe, expect, it } from "vitest"
import {
    hashPassword,
    validatePasswordStrength,
    verifyPassword,
} from "@/lib/auth/password"

describe("密码加密工具", () => {
    describe("hashPassword", () => {
        it("应该生成密码哈希", async () => {
            const password = "TestPass123"
            const hash = await hashPassword(password)

            expect(hash).toBeDefined()
            expect(hash.length).toBeGreaterThan(0)
            expect(hash).not.toBe(password)
        })

        it("应该为相同密码生成不同的哈希", async () => {
            const password = "TestPass123"
            const hash1 = await hashPassword(password)
            const hash2 = await hashPassword(password)

            expect(hash1).not.toBe(hash2)
        })
    })

    describe("verifyPassword", () => {
        it("应该验证正确的密码", async () => {
            const password = "TestPass123"
            const hash = await hashPassword(password)

            const isValid = await verifyPassword(password, hash)
            expect(isValid).toBe(true)
        })

        it("应该拒绝错误的密码", async () => {
            const password = "TestPass123"
            const hash = await hashPassword(password)

            const isValid = await verifyPassword("WrongPass456", hash)
            expect(isValid).toBe(false)
        })
    })

    describe("validatePasswordStrength", () => {
        it("应该通过强密码验证", () => {
            const result = validatePasswordStrength("TestPass123")
            expect(result.valid).toBe(true)
            expect(result.errors).toHaveLength(0)
        })

        it("应该拒绝太短的密码", () => {
            const result = validatePasswordStrength("T1a")
            expect(result.valid).toBe(false)
            expect(result.errors).toContain("密码长度至少 8 位")
        })

        it("应该拒绝缺少小写字母的密码", () => {
            const result = validatePasswordStrength("TESTPASS123")
            expect(result.valid).toBe(false)
            expect(result.errors).toContain("密码必须包含小写字母")
        })

        it("应该拒绝缺少大写字母的密码", () => {
            const result = validatePasswordStrength("testpass123")
            expect(result.valid).toBe(false)
            expect(result.errors).toContain("密码必须包含大写字母")
        })

        it("应该拒绝缺少数字的密码", () => {
            const result = validatePasswordStrength("TestPass")
            expect(result.valid).toBe(false)
            expect(result.errors).toContain("密码必须包含数字")
        })

        it("应该拒绝包含所有错误的密码", () => {
            const result = validatePasswordStrength("test")
            expect(result.valid).toBe(false)
            expect(result.errors.length).toBeGreaterThan(1)
        })
    })
})
