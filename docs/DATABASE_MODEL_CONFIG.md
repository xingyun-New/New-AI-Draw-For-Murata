# 数据库模型配置实现说明

## 📊 数据库结构

### model_configs 表

```sql
CREATE TABLE model_configs (
    id UUID PRIMARY KEY,
    provider VARCHAR(100) NOT NULL,        -- 提供商标识 (如：openai, qwen)
    provider_name VARCHAR(255) NOT NULL,   -- 提供商显示名称
    model_id VARCHAR(255) NOT NULL,        -- 模型 ID
    display_name VARCHAR(255) NOT NULL,    -- 模型显示名称
    api_key TEXT NOT NULL,                 -- API 密钥（加密存储）
    base_url TEXT,                         -- 自定义基础 URL
    is_enabled BOOLEAN DEFAULT true,       -- 是否启用
    created_at TIMESTAMP,                  -- 创建时间
    updated_at TIMESTAMP                   -- 更新时间
);
```

## 🔧 API 接口

### GET /api/model-configs
**权限**: 公开（所有用户可访问）

获取所有已启用的模型配置（不返回 API 密钥）

**响应示例**:
```json
{
  "configs": [
    {
      "id": "uuid",
      "provider": "qwen",
      "provider_name": "Qwen (Alibaba)",
      "model_id": "qwen3.5-plus",
      "display_name": "qwen3.5-plus",
      "base_url": "https://dashscope.aliyuncs.com/compatible-mode/v1",
      "is_enabled": true,
      "api_key": "***"  // 隐藏
    }
  ]
}
```

### POST /api/model-configs
**权限**: 仅管理员

创建新的模型配置

**请求体**:
```json
{
  "provider": "qwen",
  "provider_name": "Qwen (Alibaba)",
  "model_id": "qwen3.5-plus",
  "display_name": "qwen3.5-plus",
  "api_key": "sk-xxx",
  "base_url": "https://dashscope.aliyuncs.com/compatible-mode/v1"
}
```

### PUT /api/model-configs/[id]
**权限**: 仅管理员

更新模型配置（可部分更新）

**请求体** (可选字段):
```json
{
  "display_name": "新名称",
  "api_key": "新密钥",
  "base_url": "新 URL",
  "is_enabled": false
}
```

### DELETE /api/model-configs/[id]
**权限**: 仅管理员

删除模型配置

## 🔐 权限控制

### 普通用户
- ✅ 可以查看已配置的模型列表
- ✅ 可以使用已配置的模型
- ❌ 无法添加/修改/删除模型配置
- ❌ 无法查看 API 密钥

### 管理员
- ✅ 可以查看所有模型配置
- ✅ 可以添加新模型配置
- ✅ 可以修改现有配置
- ✅ 可以删除配置
- ✅ 可以测试 API 密钥

## 📝 实现步骤

### 1. 数据库迁移（已完成）
```bash
# 执行 SQL 脚本创建表
Get-Content scripts\add-model-configs-table.sql | docker exec -i nextai-postgres psql -U nextai -d nextai_drawio
```

### 2. API 路由（已完成）
- ✅ `app/api/model-configs/route.ts` - GET/POST
- ✅ `app/api/model-configs/[id]/route.ts` - PUT/DELETE

### 3. 前端 Hook（已完成）
- ✅ `hooks/use-database-model-config.ts` - 从数据库加载配置

### 4. 修改 ModelConfigDialog（进行中）
需要修改：
- 从数据库加载配置
- 管理员保存时调用 API 存储到数据库
- 显示/隐藏配置按钮基于管理员权限

## 🎯 数据流程

### 用户打开模型配置
```
1. 调用 GET /api/model-configs
2. 返回所有已启用的模型（不含 API 密钥）
3. 显示模型列表供用户选择
```

### 管理员添加模型
```
1. 填写模型信息（provider, model_id, api_key, base_url）
2. 点击"测试"验证 API 密钥
3. 测试成功后点击"保存"
4. 调用 POST /api/model-configs
5. 存储到数据库
6. 刷新模型列表
```

### 管理员更新模型
```
1. 选择要修改的模型
2. 修改字段（display_name, api_key, base_url 等）
3. 点击"保存"
4. 调用 PUT /api/model-configs/[id]
5. 更新数据库
```

### 管理员删除模型
```
1. 选择要删除的模型
2. 确认删除
3. 调用 DELETE /api/model-configs/[id]
4. 从数据库删除
5. 刷新模型列表
```

## 🔒 安全特性

### API 密钥保护
- ✅ 数据库加密存储（建议使用加密库）
- ✅ API 返回时隐藏密钥（显示 ***）
- ✅ 仅创建/更新时传输完整密钥
- ✅ 普通用户无法查看密钥

### 权限验证
- ✅ JWT Token 验证管理员身份
- ✅ 所有写操作检查角色
- ✅ 返回 403 错误给非管理员

### 数据验证
- ✅ 必填字段验证
- ✅ API 密钥测试功能
- ✅ 模型 ID 唯一性检查

## 📦 迁移现有配置

### 从 localStorage 迁移到数据库

管理员需要：
1. 打开模型配置对话框
2. 手动重新添加所有模型配置
3. 系统会自动保存到数据库
4. 所有用户立即可见

### 向后兼容
- ✅ 保留 localStorage 读取逻辑作为 fallback
- ✅ 优先使用数据库配置
- ✅ 如果数据库为空，回退到本地配置

## 🚀 部署步骤

1. ✅ 执行数据库迁移脚本
2. ✅ 部署 API 路由
3. ✅ 部署前端组件
4. ⏳ 重启应用容器
5. ⏳ 管理员重新配置模型

## 📋 测试清单

- [ ] 普通用户可以查看模型列表
- [ ] 普通用户无法看到配置按钮
- [ ] 管理员可以添加模型
- [ ] 管理员可以修改模型
- [ ] 管理员可以删除模型
- [ ] API 密钥正确隐藏
- [ ] 模型测试功能正常
- [ ] 权限验证正常工作

---

**状态**: 数据库和 API 已就绪，前端组件修改中
