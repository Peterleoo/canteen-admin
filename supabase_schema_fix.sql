-- =============================================
-- part 1: 订单插入前，自动填充费率 (Trigger on orders)
-- =============================================

CREATE OR REPLACE FUNCTION public.fn_set_order_fees()
RETURNS TRIGGER AS $$
DECLARE
  canteen_record RECORD;
BEGIN
  -- 1. 查询该订单所属食堂的费率配置
  SELECT default_packaging_fee, delivery_fee 
  INTO canteen_record
  FROM canteens
  WHERE id = NEW.canteen_id;

  -- 2. 自动填入打包费 (如果前端没传)
  IF NEW.packing_fee IS NULL THEN
    NEW.packing_fee := COALESCE(canteen_record.default_packaging_fee, 0);
  END IF;

  -- 3. 自动填入配送费 (仅当配送方式为 DELIVERY 时)
  IF NEW.delivery_fee IS NULL THEN
    IF NEW.delivery_method = 'DELIVERY' THEN
      NEW.delivery_fee := COALESCE(canteen_record.delivery_fee, 0);
    ELSE
      NEW.delivery_fee := 0;
    END IF;
  END IF;

  -- 4. 初始化金额字段，防止 NULL 计算
  NEW.subtotal := 0; -- 初始商品小计为 0，等待 order_items 插入后更新
  NEW.discount_amount := COALESCE(NEW.discount_amount, 0);
  
  -- 5. 计算初始 Total (此时没有商品，只有费率)
  NEW.total := NEW.subtotal + NEW.packing_fee + NEW.delivery_fee - NEW.discount_amount;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 绑定 Trigger：在插入订单前执行
DROP TRIGGER IF EXISTS trigger_set_order_fees ON orders;
CREATE TRIGGER trigger_set_order_fees
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_set_order_fees();


-- =============================================
-- Part 2: 核心修复 - 子表驱动父表更新 (Trigger on order_items)
-- =============================================

CREATE OR REPLACE FUNCTION public.fn_update_order_total()
RETURNS TRIGGER AS $$
DECLARE
  target_order_id INTEGER; -- 假设 order_items.order_id 是 integer
  current_items_sum NUMERIC;
BEGIN
  -- 1. 确定受影响的 父订单ID
  IF (TG_OP = 'DELETE') THEN
    target_order_id := OLD.order_id;
  ELSE
    target_order_id := NEW.order_id;
  END IF;

  -- 2. 实时计算：当前该订单下所有商品的总额
  SELECT COALESCE(SUM(price * quantity), 0)
  INTO current_items_sum
  FROM order_items
  WHERE order_id = target_order_id;

  -- 3. 更新父表 orders
  -- 公式：Total = 商品小计(subtotal) + 打包费 + 配送费 - 优惠
  UPDATE orders
  SET 
    subtotal = current_items_sum,
    total = current_items_sum 
            + COALESCE(packing_fee, 0) 
            + COALESCE(delivery_fee, 0) 
            - COALESCE(discount_amount, 0),
    updated_at = NOW()
  WHERE id = target_order_id;

  RETURN NULL; -- AFTER 触发器不需要返回值
END;
$$ LANGUAGE plpgsql;

-- 绑定 Trigger：每当商品增/删/改数量时，自动重算订单总价
DROP TRIGGER IF EXISTS trigger_update_order_total ON order_items;
CREATE TRIGGER trigger_update_order_total
  AFTER INSERT OR UPDATE OR DELETE ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_update_order_total();
