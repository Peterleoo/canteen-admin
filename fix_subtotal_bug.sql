-- ！！！紧急修复脚本！！！
-- 现象：订单的 subtotal 被重置为 0，导致免运费逻辑失效，且总价计算错误。
-- 原因：trigger_order_insert 触发器在 INSERT 前执行了错误的逻辑（可能试图从空的子表计算总价），覆盖了前端传入的正确金额。
-- 解决方案：删除该有问题的触发器。前端已经计算了正确的 subtotal，或者后续的 update_user_order_stats 会处理统计。

-- 1. 删除有害触发器
DROP TRIGGER IF EXISTS trigger_order_insert ON orders;

-- 2. 再次确保费用计算触发器是最新的（支持满额免运费）
-- （这里重复一下 fn_set_order_fees 的定义，防止用户之前没执行 update_trigger_free_delivery.sql）

CREATE OR REPLACE FUNCTION fn_set_order_fees()
RETURNS TRIGGER AS $$
DECLARE
    v_canteen_delivery_fee numeric;
    v_free_delivery_threshold numeric;
    v_default_packaging_fee numeric;
BEGIN
    -- 1. 获取食堂的费率设置
    SELECT 
        default_packaging_fee, 
        delivery_fee,
        COALESCE(free_delivery_threshold, 0)
    INTO 
        v_default_packaging_fee, 
        v_canteen_delivery_fee,
        v_free_delivery_threshold
    FROM canteens 
    WHERE id = NEW.canteen_id;
    
    -- 2. 设置打包费
    NEW.packaging_fee := v_default_packaging_fee;

    -- 3. 计算配送费 (基于 subtotal 判断免运费)
    IF NEW.delivery_method = 'DELIVERY' THEN
        -- 如果 subtotal 为 0（且不是免费订单），说明数据异常，但在本函数中我们只能基于现有值判断
        IF v_free_delivery_threshold > 0 AND NEW.subtotal >= v_free_delivery_threshold THEN
            NEW.delivery_fee := 0;
        ELSE
            NEW.delivery_fee := v_canteen_delivery_fee;
        END IF;
    ELSE
        NEW.delivery_fee := 0;
    END IF;

    -- 4. 重新计算 Total
    NEW.total := GREATEST(0, NEW.subtotal + NEW.packaging_fee + NEW.delivery_fee - COALESCE(NEW.discount_amount, 0));

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
