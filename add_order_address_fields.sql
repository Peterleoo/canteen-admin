-- 为订单表添加配送地址字段的SQL脚本

-- 检查现有地址表结构
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'user_addresses' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 检查订单表是否已经包含配送地址相关字段
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'orders' AND table_schema = 'public'
AND column_name IN ('address_id', 'address_detail', 'contact_name', 'contact_phone');

-- 更新订单表的地址关联信息，使用现有的user_addresses表
DO $$ 
BEGIN 
    -- 更新address_id字段的外键约束，从addresses改为user_addresses
    -- 先检查是否存在旧的外键约束
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'orders_address_id_fkey' 
               AND table_name = 'orders' AND table_schema = 'public') THEN 
        -- 删除旧的外键约束
        ALTER TABLE orders DROP CONSTRAINT orders_address_id_fkey;
    END IF;
    
    -- 添加或更新address_id字段，关联到user_addresses表
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE column_name = 'address_id' 
                   AND table_name = 'orders' AND table_schema = 'public') THEN 
        ALTER TABLE orders ADD COLUMN address_id UUID REFERENCES user_addresses(id) ON DELETE SET NULL;
    ELSE
        -- 更新现有字段的外键约束
        ALTER TABLE orders 
        ADD CONSTRAINT orders_address_id_fkey 
        FOREIGN KEY (address_id) 
        REFERENCES user_addresses(id) ON DELETE SET NULL;
    END IF;
    
    -- 添加配送地址详情字段（快照，防止地址表数据变更影响历史订单）
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE column_name = 'address_detail' 
                   AND table_name = 'orders' AND table_schema = 'public') THEN 
        ALTER TABLE orders ADD COLUMN address_detail TEXT;
    END IF;
    
    -- 添加联系人姓名字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE column_name = 'contact_name' 
                   AND table_name = 'orders' AND table_schema = 'public') THEN 
        ALTER TABLE orders ADD COLUMN contact_name TEXT;
    END IF;
    
    -- 添加联系人电话字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE column_name = 'contact_phone' 
                   AND table_name = 'orders' AND table_schema = 'public') THEN 
        ALTER TABLE orders ADD COLUMN contact_phone TEXT;
    END IF;
END $$;

-- 查看更新后的订单表结构
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'orders' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 查看现有的user_addresses表结构
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'user_addresses' AND table_schema = 'public'
ORDER BY ordinal_position;
