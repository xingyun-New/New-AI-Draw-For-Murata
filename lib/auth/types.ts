export interface User {
    id: string
    email: string
    role: "user" | "admin"
    created_at: string
    updated_at: string
}

export interface UserSession {
    id: string
    user_id: string
    session_name: string
    diagram_data: string | null
    messages: any | null
    created_at: string
    updated_at: string
}

export interface PasswordResetToken {
    id: string
    user_id: string
    token: string
    expires_at: string
    used: boolean
    created_at: string
}

export interface RegisterInput {
    email: string
    password: string
}

export interface LoginInput {
    email: string
    password: string
}

export interface ResetPasswordInput {
    token: string
    newPassword: string
}
