-- 更新订单费用计算触发器，以支持满额免运费逻辑

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
        COALESCE(free_delivery_threshold, 0) -- 确保为数字，默认为0
    INTO 
        v_default_packaging_fee, 
        v_canteen_delivery_fee,
        v_free_delivery_threshold
    FROM canteens 
    WHERE id = NEW.canteen_id;
    
    -- 2. 设置打包费 (总是使用食堂默认打包费，或者保留前端传入的值? 原逻辑是覆盖)
    -- 这里我们改进一下：如果前端没传(NULL)，则用默认值；如果传了，就用前端的(这允许前端计算特殊的打包费)
    -- 但为了保持与原逻辑一致且修复Bug，我们先假设打包费固定。
    -- 不过，鉴于前端可能也计算了，我们最好尊重前端传入的值（如果非NULL）。
    -- 但原逻辑是: INTO NEW.packaging_fee ... FROM canteens. 即强制覆盖。
    -- 我们保留强制覆盖逻辑，但修复配送费部分。
    
    NEW.packaging_fee := v_default_packaging_fee;

    -- 3. 计算配送费
    IF NEW.delivery_method = 'DELIVERY' THEN
        -- 检查是否满足免配送费门槛 (门槛大于0 且 小计金额 >= 门槛)
        IF v_free_delivery_threshold > 0 AND NEW.subtotal >= v_free_delivery_threshold THEN
            NEW.delivery_fee := 0;
        ELSE
            NEW.delivery_fee := v_canteen_delivery_fee;
        END IF;
    ELSE
        -- 自提无配送费
        NEW.delivery_fee := 0;
    END IF;

    -- 4. 重新计算总价? 
    -- 这一步很关键。如果前端传来的 Total 包含了旧的配送费，而这里把配送费改了，Total 就不准了。
    -- Total = Subtotal + Packaging + Delivery - Discount
    -- 我们应该根据新的费用重新计算 Total，以保证数据一致性。
    NEW.total := GREATEST(0, NEW.subtotal + NEW.packaging_fee + NEW.delivery_fee - COALESCE(NEW.discount_amount, 0));

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 提示用户：此函数替换后，现有的触发器 trigger_set_order_fees 会自动调用新逻辑，无需重新创建触发器。
