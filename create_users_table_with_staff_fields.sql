-- 创建与员工表字段一致的用户表SQL脚本

-- 1. 创建用户表，字段与staffs表一致
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    avatar TEXT,
    role TEXT NOT NULL CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'CANTEEN_MANAGER', 'OPERATOR', 'VIEWER', 'USER')),
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'BANNED')),
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. 创建更新时间触发器函数（如果不存在）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. 为users表添加更新时间触发器
CREATE TRIGGER set_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 4. 可选：为user表添加一些示例数据
INSERT INTO users (
    username, 
    name, 
    email, 
    phone, 
    avatar, 
    role, 
    status
) VALUES (
    'test_user', 
    '测试用户', 
    'user@example.com', 
    '13800138000', 
    'https://api.dicebear.com/7.x/avataaars/svg?seed=testuser', 
    'USER', 
    'ACTIVE'
) ON CONFLICT (username) DO NOTHING;

-- 5. 验证创建结果
SELECT 'users' AS table_name, COUNT(*) AS record_count FROM users;

-- 6. 显示表结构，确认创建成功
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default 
FROM 
    information_schema.columns 
WHERE 
    table_name = 'users';

-- 7. 显示表的约束信息
SELECT 
    constraint_name, 
    constraint_type 
FROM 
    information_schema.table_constraints 
WHERE 
    table_name = 'users';