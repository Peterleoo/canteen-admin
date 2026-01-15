-- 添加食堂管理按钮权限

-- 1. 先查找食堂管理菜单的父级权限ID
DO $$
DECLARE
    canteen_menu_id UUID;
BEGIN
    -- 查找食堂管理菜单权限
    SELECT id INTO canteen_menu_id FROM permissions WHERE code = 'manage:canteens';
    
    -- 如果找到父级权限，则添加按钮权限
    IF canteen_menu_id IS NOT NULL THEN
        -- 添加新增食堂权限
        INSERT INTO permissions (name, code, type, parent_id, description) 
        VALUES ('新增食堂', 'canteen:create', 'BUTTON', canteen_menu_id, '允许新增食堂') 
        ON CONFLICT (code) DO NOTHING;
        
        -- 添加编辑食堂权限
        INSERT INTO permissions (name, code, type, parent_id, description) 
        VALUES ('编辑食堂', 'canteen:edit', 'BUTTON', canteen_menu_id, '允许编辑食堂信息') 
        ON CONFLICT (code) DO NOTHING;
        
        -- 添加配置食堂权限
        INSERT INTO permissions (name, code, type, parent_id, description) 
        VALUES ('配置食堂', 'canteen:config', 'BUTTON', canteen_menu_id, '允许配置食堂参数') 
        ON CONFLICT (code) DO NOTHING;
        
        -- 添加删除食堂权限
        INSERT INTO permissions (name, code, type, parent_id, description) 
        VALUES ('删除食堂', 'canteen:delete', 'BUTTON', canteen_menu_id, '允许删除食堂') 
        ON CONFLICT (code) DO NOTHING;
    ELSE
        -- 如果没有找到父级权限，则添加为顶级权限
        -- 添加新增食堂权限
        INSERT INTO permissions (name, code, type, description) 
        VALUES ('新增食堂', 'canteen:create', 'BUTTON', '允许新增食堂') 
        ON CONFLICT (code) DO NOTHING;
        
        -- 添加编辑食堂权限
        INSERT INTO permissions (name, code, type, description) 
        VALUES ('编辑食堂', 'canteen:edit', 'BUTTON', '允许编辑食堂信息') 
        ON CONFLICT (code) DO NOTHING;
        
        -- 添加配置食堂权限
        INSERT INTO permissions (name, code, type, description) 
        VALUES ('配置食堂', 'canteen:config', 'BUTTON', '允许配置食堂参数') 
        ON CONFLICT (code) DO NOTHING;
        
        -- 添加删除食堂权限
        INSERT INTO permissions (name, code, type, description) 
        VALUES ('删除食堂', 'canteen:delete', 'BUTTON', '允许删除食堂') 
        ON CONFLICT (code) DO NOTHING;
    END IF;
END $$;

-- 2. 验证添加结果
SELECT * FROM permissions WHERE code LIKE 'canteen:%' OR code = 'manage:canteens';
