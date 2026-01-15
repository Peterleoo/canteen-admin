-- 刷新所有已存在订单的配送费和打包费等金额
-- 1. 首先检查calculate_order_amounts函数是否存在
SELECT EXISTS (
    SELECT 1 
    FROM pg_proc p 
    JOIN pg_namespace n ON p.pronamespace = n.oid 
    WHERE n.nspname = 'public' AND p.proname = 'calculate_order_amounts'
) AS function_exists;

-- 2. 如果函数不存在，先创建它（如果已存在则忽略）
CREATE OR REPLACE FUNCTION calculate_order_amounts(order_id_param integer)
RETURNS void AS $$
DECLARE
    v_subtotal numeric(10,2);
    v_packaging_fee numeric(10,2);
    v_delivery_fee numeric(10,2);
    v_discount_amount numeric(10,2);
    v_delivery_method text;
    v_canteen_id integer;
    v_canteen_delivery_fee numeric(10,2);
    v_canteen_free_delivery_threshold numeric(10,2);
    v_canteen_default_packaging_fee numeric(10,2);
    v_total numeric(10,2);
BEGIN
    -- 1. 获取订单的基本信息
    SELECT 
        o.delivery_method,
        o.canteen_id,
        o.discount_amount
    INTO 
        v_delivery_method,
        v_canteen_id,
        v_discount_amount
    FROM orders o
    WHERE o.id = order_id_param;
    
    -- 2. 计算商品小计
    SELECT COALESCE(SUM(oi.price * oi.quantity), 0.00)
    INTO v_subtotal
    FROM order_items oi
    WHERE oi.order_id = order_id_param;
    
    -- 3. 获取食堂配置的完整信息
    SELECT 
        COALESCE(c.delivery_fee, 0.00) AS delivery_fee,
        COALESCE(c.free_delivery_threshold, 0.00) AS free_delivery_threshold,
        COALESCE(c.default_packaging_fee, 0.00) AS default_packaging_fee
    INTO 
        v_canteen_delivery_fee,
        v_canteen_free_delivery_threshold,
        v_canteen_default_packaging_fee
    FROM (VALUES (v_canteen_id)) AS v(canteen_id)
    LEFT JOIN canteens c ON v.canteen_id = c.id;
    
    -- 4. 确定打包费
    v_packaging_fee := v_canteen_default_packaging_fee;
    
    -- 5. 计算配送费
    IF v_delivery_method = 'DELIVERY' THEN
        -- 外送订单：先使用食堂基础配送费
        v_delivery_fee := v_canteen_delivery_fee;
        
        -- 判断是否免配送费
        IF v_subtotal >= v_canteen_free_delivery_threshold THEN
            v_delivery_fee := 0.00;
        END IF;
    ELSE
        -- 自提订单：配送费为0
        v_delivery_fee := 0.00;
    END IF;
    
    -- 确保配送费有默认值
    v_delivery_fee := COALESCE(v_delivery_fee, 0.00);
    
    -- 6. 计算订单总额
    v_total := v_subtotal + v_packaging_fee + v_delivery_fee - v_discount_amount;
    v_total := GREATEST(v_total, 0.00);
    
    -- 7. 更新订单金额字段
    UPDATE orders
    SET 
        subtotal = v_subtotal,
        packaging_fee = v_packaging_fee,
        delivery_fee = v_delivery_fee,
        total = v_total
    WHERE id = order_id_param;
END;
$$ LANGUAGE plpgsql;

-- 3. 执行刷新操作，为所有订单重新计算金额
-- 先统计需要处理的订单数量
SELECT COUNT(*) AS total_orders FROM orders;

-- 执行刷新操作
DO $$
DECLARE
    order_rec record;
    updated_count integer := 0;
BEGIN
    FOR order_rec IN SELECT id FROM orders LOOP
        PERFORM calculate_order_amounts(order_rec.id);
        updated_count := updated_count + 1;
    END LOOP;
    RAISE NOTICE '成功更新了 % 个订单的金额', updated_count;
END;
$$ LANGUAGE plpgsql;

-- 4. 验证刷新结果
-- 检查所有订单的金额计算是否正确
SELECT 
    COUNT(*) AS total_orders,
    COUNT(CASE 
        WHEN total = (subtotal + packaging_fee + delivery_fee - COALESCE(discount_amount, 0)) 
        THEN 1 
    END) AS correct_orders,
    COUNT(CASE 
        WHEN total <> (subtotal + packaging_fee + delivery_fee - COALESCE(discount_amount, 0)) 
        THEN 1 
    END) AS incorrect_orders
FROM orders;

-- 5. 查看详细的刷新结果，按食堂分组
SELECT 
    c.id AS 食堂ID,
    c.name AS 食堂名称,
    COUNT(o.id) AS 订单数量,
    SUM(o.delivery_fee) AS 总配送费,
    SUM(o.packaging_fee) AS 总打包费,
    SUM(o.total) AS 总金额
FROM orders o
JOIN canteens c ON o.canteen_id = c.id
GROUP BY c.id, c.name
ORDER BY c.name;

-- 6. 查看前10个订单的详细刷新结果
SELECT 
    o.id AS 订单ID,
    c.name AS 食堂名称,
    o.delivery_method AS 配送方式,
    o.subtotal AS 商品小计,
    o.packaging_fee AS 打包费,
    o.delivery_fee AS 配送费,
    COALESCE(o.discount_amount, 0) AS 优惠金额,
    o.total AS 订单总额,
    (o.subtotal + o.packaging_fee + o.delivery_fee - COALESCE(o.discount_amount, 0)) AS 计算总额,
    CASE 
        WHEN o.total = (o.subtotal + o.packaging_fee + o.delivery_fee - COALESCE(o.discount_amount, 0)) 
        THEN '✓ 正确' 
        ELSE '✗ 错误' 
    END AS 状态
FROM orders o
JOIN canteens c ON o.canteen_id = c.id
ORDER BY o.created_at DESC
LIMIT 10;

-- 7. 如果需要，还可以添加一个手动触发的函数，用于单个或多个订单的刷新
CREATE OR REPLACE FUNCTION refresh_order_fees(order_ids integer[])
RETURNS void AS $$
DECLARE
    order_id integer;
BEGIN
    FOREACH order_id IN ARRAY order_ids LOOP
        PERFORM calculate_order_amounts(order_id);
    END LOOP;
    RAISE NOTICE '成功刷新了 % 个订单的金额', array_length(order_ids, 1);
END;
$$ LANGUAGE plpgsql;