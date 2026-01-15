-- 将订单表关联到用户表的SQL脚本

-- 1. 先检查orders表的当前结构
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'orders' AND table_schema = 'public';

-- 2. 检查orders表的外键约束
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE
    constraint_type = 'FOREIGN KEY'
    AND tc.table_name='orders';

-- 3. 迁移现有订单的user_id，确保它们存在于users表中

-- 首先，将orders表中不存在于users表中的user_id设置为NULL
UPDATE orders 
SET user_id = NULL 
WHERE user_id IS NOT NULL 
AND NOT EXISTS (SELECT 1 FROM users WHERE users.id = orders.user_id);

-- 先删除旧的外键约束（如果存在）
DO $$ 
BEGIN 
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'orders_user_id_fkey' 
        AND table_name = 'orders'
    ) THEN 
        ALTER TABLE orders DROP CONSTRAINT orders_user_id_fkey;
    END IF;
END $$;

-- 添加新的外键约束，将user_id关联到users表
ALTER TABLE orders 
ADD CONSTRAINT orders_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES users(id) ON DELETE SET NULL;

-- 4. 检查并处理重复的打包费字段

-- 只在packing_fee字段存在时才查询和处理
DO $$ 
BEGIN 
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE column_name = 'packing_fee' 
        AND table_name = 'orders' AND table_schema = 'public'
    ) THEN 
        -- 查看packing_fee和packaging_fee字段的数据类型和值
        SELECT 
            COUNT(*) AS total_records,
            COUNT(packing_fee) AS packing_fee_not_null,
            COUNT(packaging_fee) AS packaging_fee_not_null,
            AVG(CASE WHEN packing_fee IS NOT NULL THEN packing_fee ELSE 0 END) AS avg_packing_fee,
            AVG(CASE WHEN packaging_fee IS NOT NULL THEN packaging_fee ELSE 0 END) AS avg_packaging_fee
        FROM orders;
        
        -- 先确保packaging_fee有值，从packing_fee复制数据（如果packaging_fee为空）
        UPDATE orders 
        SET packaging_fee = COALESCE(packaging_fee, packing_fee) 
        WHERE packaging_fee IS NULL AND packing_fee IS NOT NULL;
        
        -- 删除packing_fee字段
        ALTER TABLE orders DROP COLUMN packing_fee;
    END IF;
END $$;

-- 5. 确保delivery_fee字段存在且类型正确
ALTER TABLE orders 
ALTER COLUMN delivery_fee 
SET DATA TYPE numeric(10,2),
ALTER COLUMN delivery_fee 
SET DEFAULT 0.00;

-- 6. 确保packaging_fee字段存在且类型正确
ALTER TABLE orders 
ALTER COLUMN packaging_fee 
SET DATA TYPE numeric(10,2),
ALTER COLUMN packaging_fee 
SET DEFAULT 0.00;

-- 7. 更新现有订单的delivery_fee和packaging_fee
-- 根据canteen_id从canteens表获取默认的配送费和打包费
UPDATE orders o
SET 
    delivery_fee = CASE 
        WHEN o.delivery_method = 'DELIVERY' THEN COALESCE(o.delivery_fee, c.delivery_fee) 
        ELSE 0 
    END,
    packaging_fee = COALESCE(o.packaging_fee, c.default_packaging_fee)
FROM canteens c
WHERE o.canteen_id = c.id;

-- 8. 重新创建订单费用计算触发器（如果需要）
CREATE OR REPLACE FUNCTION fn_set_order_fees()
RETURNS TRIGGER AS $$
BEGIN
    -- 根据 orders 表里的 canteen_id，去 canteens 表查费率
    -- 并自动填入到即将生成的这行 orders 记录中
    SELECT 
        default_packaging_fee, 
        CASE WHEN NEW.delivery_method = 'DELIVERY' THEN delivery_fee ELSE 0 END 
    INTO 
        NEW.packaging_fee, 
        NEW.delivery_fee 
    FROM canteens 
    WHERE id = NEW.canteen_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 确保触发器存在
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.triggers 
        WHERE trigger_name = 'trigger_set_order_fees' 
        AND event_object_table = 'orders'
    ) THEN 
        CREATE TRIGGER trigger_set_order_fees 
        BEFORE INSERT ON orders 
        FOR EACH ROW 
        EXECUTE FUNCTION fn_set_order_fees();
    END IF;
END $$;

-- 9. 验证修改结果
SELECT 
    constraint_name,
    table_name,
    column_name,
    foreign_table_name,
    foreign_column_name
FROM (
    SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
    FROM
        information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
    WHERE
        constraint_type = 'FOREIGN KEY'
        AND tc.table_name='orders'
) AS fk_info;

-- 10. 验证字段是否存在
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'orders' AND table_schema = 'public'
AND column_name IN ('user_id', 'delivery_fee', 'packaging_fee');

-- 11. 测试插入一个订单，验证外键约束是否生效
-- 先确保有一个用户和食堂
INSERT INTO users (username, name, email, role, status) 
VALUES ('test_order_user', '测试用户', 'test_order@example.com', 'USER', 'ACTIVE') 
ON CONFLICT (username) DO NOTHING;

-- 假设食堂表中已有ID为1的食堂
INSERT INTO orders (
    user_id, 
    canteen_id, 
    delivery_method, 
    status, 
    total, 
    subtotal
) VALUES (
    (SELECT id FROM users WHERE username = 'test_order_user'), 
    1, 
    'DELIVERY', 
    'PENDING', 
    0, 
    0
) 
RETURNING id, user_id, canteen_id, delivery_fee, packaging_fee;

-- 12. 清理测试数据
DELETE FROM orders WHERE user_id = (SELECT id FROM users WHERE username = 'test_order_user');
