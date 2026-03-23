# 用户权限和会话隔离功能说明

## ✅ 已实现的功能

### 1. 用户会话隔离

**功能说明**：
- 每个用户只能查看和管理自己的会话历史
- 会话数据按用户 ID 隔离，确保隐私安全
- 支持会话的创建、读取、更新和删除

**API 接口**：
- `GET /api/sessions` - 获取当前用户的所有会话
- `POST /api/sessions` - 创建新会话
- `GET /api/sessions/[id]` - 获取单个会话详情
- `PUT /api/sessions/[id]` - 更新会话
- `DELETE /api/sessions/[id]` - 删除会话

**数据库表**：
```sql
user_sessions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,        -- 关联用户 ID
    session_name VARCHAR(255),     -- 会话名称
    diagram_data TEXT,             -- 图表 XML 数据
    messages JSONB,                -- 聊天消息历史
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

### 2. 管理员权限控制

**功能说明**：
- 只有管理员用户可以访问设置页面
- 普通用户无法查看或修改模型密钥和系统设置
- 管理员角色存储在数据库中

**角色类型**：
- `admin` - 管理员，可以访问所有设置
- `user` - 普通用户，只能使用基本功能

**权限检查**：
- 前端：使用 `useAdminCheck` Hook 检查管理员权限
- 后端：JWT Token 中包含角色信息
- UI：非管理员访问设置时显示权限提示

## 📊 数据库结构

### users 表扩展

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',  -- 新增：角色字段
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### 索引优化

```sql
-- 用户角色索引
CREATE INDEX idx_users_role ON users(role);

-- 会话用户索引
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);

-- 会话时间索引
CREATE INDEX idx_user_sessions_created_at ON user_sessions(created_at DESC);
```

## 🔧 使用方法

### 设置第一个管理员

1. **注册账户**
   - 访问 http://localhost:3001
   - 注册一个账户（例如：admin@example.com）

2. **执行管理员初始化脚本**
   ```bash
   # 编辑脚本，修改管理员邮箱
   # 编辑 scripts/init-admin.sql 中的 admin_email
   
   # 执行脚本
   docker exec -i nextai-postgres psql -U nextai -d nextai_drawio < scripts/init-admin.sql
   ```

3. **验证管理员身份**
   ```bash
   docker exec -it nextai-postgres psql -U nextai -d nextai_drawio -c "SELECT email, role FROM users;"
   ```

### 普通用户使用

1. **注册并登录**
   - 普通用户注册后默认为 `user` 角色
   - 可以正常使用 AI 图表生成功能
   - 只能查看和管理自己的会话

2. **访问限制**
   - 点击设置按钮时，如果不是管理员会显示权限提示
   - 无法访问模型配置和系统设置

## 🔐 安全特性

### 会话隔离
- ✅ 每个会话都关联到特定用户 ID
- ✅ API 强制检查会话所有权
- ✅ 删除会话时验证用户权限

### 权限控制
- ✅ JWT Token 包含角色信息
- ✅ 前端 UI 根据角色显示/隐藏功能
- ✅ 后端 API 可以扩展权限检查

### 数据保护
- ✅ 用户只能访问自己的数据
- ✅ 敏感操作需要管理员权限
- ✅ 密码 bcrypt 加密存储

## 📝 API 使用示例

### 创建会话

```typescript
const response = await fetch('/api/sessions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    session_name: '我的新会话'
  })
});

const data = await response.json();
// data.session.id, data.session.session_name
```

### 获取会话列表

```typescript
const response = await fetch('/api/sessions', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
// data.sessions = [{ id, session_name, created_at, ... }]
```

### 更新会话

```typescript
const response = await fetch(`/api/sessions/${sessionId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    session_name: '更新后的名称',
    diagram_data: xmlData,
    messages: messagesArray
  })
});
```

## 🎯 未来改进

- [ ] 会话分享功能（管理员可分享会话给特定用户）
- [ ] 会话导出/导入
- [ ] 批量删除会话
- [ ] 会话搜索和过滤
- [ ] 管理员后台界面
- [ ] 用户管理（管理员可管理其他用户）
- [ ] 角色权限细化（编辑者、查看者等）

## 📚 相关文件

### 后端 API
- `app/api/sessions/route.ts` - 会话列表和创建
- `app/api/sessions/[id]/route.ts` - 单个会话操作
- `app/api/auth/login/route.ts` - 登录（包含角色）
- `app/api/auth/register/route.ts` - 注册（默认 user 角色）

### 前端组件
- `components/settings-dialog.tsx` - 设置对话框（管理员检查）
- `hooks/use-admin-check.ts` - 管理员权限检查 Hook
- `contexts/auth-context.tsx` - 认证上下文（包含 isAdmin）

### 数据库
- `scripts/init-db.sql` - 数据库初始化（包含会话表）
- `scripts/init-admin.sql` - 管理员初始化脚本

### 类型定义
- `lib/auth/types.ts` - 用户和会话类型定义
- `lib/auth/jwt.ts` - JWT Token 生成和验证

---

**部署时间**: 2026-03-22
**部署状态**: ✅ 成功
**访问地址**: http://localhost:3001
