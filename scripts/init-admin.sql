-- 管理员初始化脚本
-- 用于设置第一个管理员账户
-- 使用方法：docker exec -i nextai-postgres psql -U nextai -d nextai_drawio < scripts/init-admin.sql

-- 将第一个注册用户设置为管理员（如果还没有管理员）
-- 注意：请手动修改下面的邮箱为您的管理员邮箱
DO $$
DECLARE
    admin_email VARCHAR := 'admin@example.com'; -- 请修改为您的管理员邮箱
    user_count INTEGER;
BEGIN
    -- 检查是否已有管理员
    SELECT COUNT(*) INTO user_count FROM users WHERE role = 'admin';
    
    IF user_count = 0 THEN
        -- 如果没有管理员，尝试将指定邮箱的用户设置为管理员
        UPDATE users 
        SET role = 'admin', updated_at = CURRENT_TIMESTAMP
        WHERE email = admin_email;
        
        IF FOUND THEN
            RAISE NOTICE '成功将 % 设置为管理员', admin_email;
        ELSE
            RAISE NOTICE '未找到邮箱为 % 的用户，请先注册该邮箱', admin_email;
        END IF;
    ELSE
        RAISE NOTICE '系统中已有管理员，无需初始化';
    END IF;
END $$;

-- 查询所有管理员
SELECT id, email, role, created_at FROM users WHERE role = 'admin';
