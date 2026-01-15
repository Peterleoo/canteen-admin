-- 将profiles表重命名为staffs表的SQL脚本

-- 1. 先备份当前的数据（可选）
-- CREATE TABLE profiles_backup AS SELECT * FROM profiles;

-- 2. 重命名表
ALTER TABLE IF EXISTS profiles RENAME TO staffs;

-- 3. 更新所有引用profiles表的外键约束
-- 先查找所有引用profiles表的外键约束
DO $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN (
        SELECT 
            tc.constraint_name,
            tc.table_name,
            kcu.column_name
        FROM 
            information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name
        WHERE 
            tc.constraint_type = 'FOREIGN KEY'
            AND kcu.referenced_table_name = 'staffs' -- 这里使用新表名，因为ALTER TABLE已经重命名了
    )
    LOOP
        -- 不需要修改外键约束，因为ALTER TABLE RENAME会自动更新引用
        -- 这里只是打印信息，方便确认
        RAISE NOTICE '外键约束 % 已自动更新，引用staffs表', rec.constraint_name;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 4. 更新所有引用profiles表的触发器函数
-- 查找所有可能引用profiles表的触发器函数
DO $$
DECLARE
    rec RECORD;
    new_definition TEXT;
BEGIN
    FOR rec IN (
        SELECT 
            p.oid,
            p.proname AS function_name,
            pg_get_functiondef(p.oid) AS function_definition
        FROM 
            pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE 
            n.nspname = 'public'
            AND pg_get_functiondef(p.oid) LIKE '%profiles%'
    )
    LOOP
        -- 替换函数定义中的profiles为staffs
        new_definition := REPLACE(rec.function_definition, 'profiles', 'staffs');
        
        -- 重新创建函数
        EXECUTE new_definition;
        
        RAISE NOTICE '函数 % 已更新，将profiles替换为staffs', rec.function_name;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 5. 更新所有引用profiles表的视图
-- 查找所有引用profiles表的视图
DO $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN (
        SELECT 
            v.oid,
            v.relname AS view_name,
            pg_get_viewdef(v.oid) AS view_definition
        FROM 
            pg_views v
        WHERE 
            v.schemaname = 'public'
            AND v.view_definition LIKE '%profiles%'
    )
    LOOP
        -- 替换视图定义中的profiles为staffs
        EXECUTE 'CREATE OR REPLACE VIEW ' || rec.view_name || ' AS ' || REPLACE(rec.view_definition, 'profiles', 'staffs');
        
        RAISE NOTICE '视图 % 已更新，将profiles替换为staffs', rec.view_name;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 6. 验证重命名结果
SELECT 'staffs' AS table_name, COUNT(*) AS record_count FROM staffs;

-- 7. 显示表结构，确认重命名成功
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default 
FROM 
    information_schema.columns 
WHERE 
    table_name = 'staffs';

-- 显示表的约束信息
SELECT 
    constraint_name, 
    constraint_type 
FROM 
    information_schema.table_constraints 
WHERE 
    table_name = 'staffs';

-- 8. 检查是否有任何引用了old表名的对象
SELECT 
    relname AS object_name,
    relkind AS object_type
FROM 
    pg_class c
    JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE 
    n.nspname = 'public'
    AND c.relkind IN ('r', 'v', 'f', 't') -- 表、视图、函数、触发器
    AND pg_get_definition(c.oid) LIKE '%profiles%';

-- 9. 创建前台用户表（canteen app注册用户）
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

-- 10. 创建更新时间触发器
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

-- 11. 初始化示例前台用户
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