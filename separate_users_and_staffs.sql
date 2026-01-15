-- 将员工管理与用户剥离的SQL脚本
-- 1. 先备份当前的数据（可选）
-- CREATE TABLE profiles_backup AS SELECT * FROM profiles;

-- 2. 创建前台用户表（canteen app注册用户）
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    avatar TEXT,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'BANNED', 'INACTIVE')),
    total_orders INTEGER DEFAULT 0,
    total_spent NUMERIC(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. 创建后台员工表
CREATE TABLE IF NOT EXISTS staffs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    avatar TEXT,
    role TEXT NOT NULL CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'CANTEEN_MANAGER', 'OPERATOR', 'VIEWER')),
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. 创建权限表（如果不存在）
CREATE TABLE IF NOT EXISTS permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('MENU', 'BUTTON')),
    parent_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. 创建角色表（如果不存在）
CREATE TABLE IF NOT EXISTS roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. 创建角色权限关联表（如果不存在）
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. 创建员工角色关联表（如果需要细粒度的角色管理）
CREATE TABLE IF NOT EXISTS staff_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_id UUID REFERENCES staffs(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. 更新orders表，确保它关联到users表而不是profiles表
-- 先添加一个新的user_id列，然后迁移数据，最后删除旧的外键约束
ALTER TABLE orders ADD COLUMN IF NOT EXISTS app_user_id UUID;

-- 9. 创建外键约束，确保orders表关联到users表
ALTER TABLE orders 
ADD CONSTRAINT fk_orders_app_user 
FOREIGN KEY (app_user_id) 
REFERENCES users(id) ON DELETE SET NULL;

-- 10. 创建更新时间触发器（可选）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为users表添加触发器
CREATE TRIGGER set_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 为staffs表添加触发器
CREATE TRIGGER set_staffs_updated_at
BEFORE UPDATE ON staffs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 11. 初始化管理员账号（可选）
INSERT INTO staffs (
    username, 
    name, 
    email, 
    role, 
    status
) VALUES (
    'admin', 
    '系统管理员', 
    'admin@canteen.com', 
    'SUPER_ADMIN', 
    'ACTIVE'
) ON CONFLICT (username) DO NOTHING;

-- 12. 创建示例前台用户（可选）
INSERT INTO users (
    username, 
    email, 
    phone, 
    status
) VALUES (
    'test_user', 
    'user@canteen.com', 
    '13800138000', 
    'ACTIVE'
) ON CONFLICT (username) DO NOTHING;

-- 13. 验证创建结果
SELECT 'users' AS table_name, COUNT(*) AS record_count FROM users;
SELECT 'staffs' AS table_name, COUNT(*) AS record_count FROM staffs;
SELECT 'orders' AS table_name, COUNT(*) AS record_count FROM orders;

-- 14. 清理旧的profiles表（可选，建议在确认数据迁移完成后执行）
-- DROP TABLE IF EXISTS profiles;

-- 15. 创建视图，方便查询（可选）
CREATE OR REPLACE VIEW user_order_summary AS
SELECT 
    u.id AS user_id,
    u.username,
    u.email,
    COUNT(o.id) AS total_orders,
    COALESCE(SUM(o.total), 0) AS total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.app_user_id
GROUP BY u.id, u.username, u.email;