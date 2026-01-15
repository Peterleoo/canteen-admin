-- 为用户表添加订单统计字段的SQL脚本

-- 1. 先检查用户表的当前结构
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users' AND table_schema = 'public';

-- 2. 为用户表添加订单统计字段
-- 如果字段不存在，则添加
DO $$ 
BEGIN 
    -- 添加订单总数字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE column_name = 'total_orders' 
                   AND table_name = 'users' AND table_schema = 'public') THEN 
        ALTER TABLE users ADD COLUMN total_orders INTEGER DEFAULT 0;
    END IF;
    
    -- 添加总消费字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE column_name = 'total_spent' 
                   AND table_name = 'users' AND table_schema = 'public') THEN 
        ALTER TABLE users ADD COLUMN total_spent NUMERIC(10,2) DEFAULT 0.00;
    END IF;
    
    -- 添加客单价字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE column_name = 'avg_order_value' 
                   AND table_name = 'users' AND table_schema = 'public') THEN 
        ALTER TABLE users ADD COLUMN avg_order_value NUMERIC(10,2) DEFAULT 0.00;
    END IF;
END $$;

-- 3. 创建函数，用于更新用户的订单统计信息
CREATE OR REPLACE FUNCTION update_user_order_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- 根据订单ID获取用户ID
    DECLARE 
        user_id UUID;
    BEGIN
        -- 根据触发器类型获取用户ID
        IF TG_OP IN ('INSERT', 'UPDATE') THEN
            user_id := NEW.user_id;
        ELSIF TG_OP = 'DELETE' THEN
            user_id := OLD.user_id;
        END IF;
        
        -- 如果用户ID为空，直接返回
        IF user_id IS NULL THEN
            IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
                RETURN NEW;
            ELSE
                RETURN OLD;
            END IF;
        END IF;
        
        -- 更新用户的订单统计信息
        UPDATE users 
        SET 
            total_orders = COALESCE((SELECT COUNT(*) FROM orders WHERE orders.user_id = users.id AND orders.status != 'CANCELLED'), 0),
            total_spent = COALESCE((SELECT SUM(total) FROM orders WHERE orders.user_id = users.id AND orders.status != 'CANCELLED'), 0.00),
            avg_order_value = CASE 
                WHEN COALESCE((SELECT COUNT(*) FROM orders WHERE orders.user_id = users.id AND orders.status != 'CANCELLED'), 0) > 0 
                THEN COALESCE((SELECT SUM(total) FROM orders WHERE orders.user_id = users.id AND orders.status != 'CANCELLED'), 0.00) / 
                     COALESCE((SELECT COUNT(*) FROM orders WHERE orders.user_id = users.id AND orders.status != 'CANCELLED'), 1)
                ELSE 0.00
            END
        WHERE users.id = user_id;
        
        -- 返回新行或旧行，根据触发器类型
        IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
            RETURN NEW;
        ELSE
            RETURN OLD;
        END IF;
    END;
END;
$$ LANGUAGE plpgsql;

-- 4. 为orders表添加触发器，在订单变化时更新用户统计信息
-- 先检查触发器是否已存在
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_trigger 
                   WHERE tgname = 'trigger_update_user_order_stats' 
                   AND NOT tgisinternal) THEN 
        -- 为INSERT操作添加触发器
        CREATE TRIGGER trigger_update_user_order_stats
        AFTER INSERT OR UPDATE OR DELETE ON orders
        FOR EACH ROW
        EXECUTE FUNCTION update_user_order_stats();
    END IF;
END $$;

-- 5. 初始化现有用户的订单统计信息
UPDATE users 
SET 
    total_orders = COALESCE((SELECT COUNT(*) FROM orders WHERE orders.user_id = users.id AND orders.status != 'CANCELLED'), 0),
    total_spent = COALESCE((SELECT SUM(total) FROM orders WHERE orders.user_id = users.id AND orders.status != 'CANCELLED'), 0.00),
    avg_order_value = CASE 
        WHEN COALESCE((SELECT COUNT(*) FROM orders WHERE orders.user_id = users.id AND orders.status != 'CANCELLED'), 0) > 0 
        THEN COALESCE((SELECT SUM(total) FROM orders WHERE orders.user_id = users.id AND orders.status != 'CANCELLED'), 0.00) / 
             COALESCE((SELECT COUNT(*) FROM orders WHERE orders.user_id = users.id AND orders.status != 'CANCELLED'), 1)
        ELSE 0.00
    END;

-- 6. 验证添加结果
SELECT 
    u.id,
    u.username,
    u.name,
    u.total_orders,
    u.total_spent,
    u.avg_order_value,
    -- 同时查询实际订单数据进行对比
    (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id AND o.status != 'CANCELLED') AS actual_orders,
    (SELECT COALESCE(SUM(total), 0) FROM orders o WHERE o.user_id = u.id AND o.status != 'CANCELLED') AS actual_spent
FROM users u
ORDER BY u.total_spent DESC
LIMIT 10;
