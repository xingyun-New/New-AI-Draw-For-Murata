-- 添加 model_configs 表
CREATE TABLE IF NOT EXISTS model_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider VARCHAR(100) NOT NULL,
    provider_name VARCHAR(255) NOT NULL,
    model_id VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    api_key TEXT NOT NULL,
    base_url TEXT,
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_model_configs_provider ON model_configs(provider);
CREATE INDEX IF NOT EXISTS idx_model_configs_enabled ON model_configs(is_enabled);
CREATE INDEX IF NOT EXISTS idx_model_configs_model_id ON model_configs(model_id);

-- 添加触发器自动更新 updated_at
CREATE TRIGGER update_model_configs_updated_at
    BEFORE UPDATE ON model_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 查询已配置的模型
SELECT id, provider, provider_name, model_id, display_name, base_url, is_enabled, created_at 
FROM model_configs 
WHERE is_enabled = true 
ORDER BY provider_name, display_name;
