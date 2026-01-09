-- =============================================
-- 1. 数据清洗与字段统一
-- =============================================

-- 先把 packaging_fee (旧) 的值 迁移到 packing_fee (新)
-- 只有当新字段是0而旧字段有值时才迁移，防止覆盖新数据
UPDATE orders 
SET packing_fee = packaging_fee 
WHERE (packing_fee IS NULL OR packing_fee = 0) 
  AND (packaging_fee IS NOT NULL AND packaging_fee > 0);

-- 安全起见，我们暂不 DROP COLUMN packaging_fee，但后续代码只认 packing_fee。

-- =============================================
-- 2. 清理冲突触发器 (Trigger Cleanup)
-- =============================================

-- 删除所有旧的、可能冲突的触发器
DROP TRIGGER IF EXISTS tr_sync_canteen_fees ON orders;
DROP TRIGGER IF EXISTS tr_update_order_total ON orders;
DROP TRIGGER IF EXISTS trigger_set_order_fees ON orders; -- 删掉重加，确保最新

-- 同时也删除绑在 order_items 上的旧触发器 (如果有)
DROP TRIGGER IF EXISTS trigger_update_order_total ON order_items; 

-- =============================================
-- 3. 重建标准逻辑 (Part 1: 填费率)
-- =============================================
CREATE OR REPLACE FUNCTION public.fn_set_order_fees()
RETURNS TRIGGER AS $$
DECLARE
  canteen_record RECORD;
BEGIN
  -- 查费率
  SELECT default_packaging_fee, delivery_fee 
  INTO canteen_record
  FROM canteens
  WHERE id = NEW.canteen_id;

  -- 统一用 packing_fee
  IF NEW.packing_fee IS NULL OR NEW.packing_fee = 0 THEN
    NEW.packing_fee := COALESCE(canteen_record.default_packaging_fee, 0);
  END IF;

  -- 配送费
  IF NEW.delivery_fee IS NULL OR NEW.delivery_fee = 0 THEN
    IF NEW.delivery_method = 'DELIVERY' THEN
      NEW.delivery_fee := COALESCE(canteen_record.delivery_fee, 0);
    ELSE
      NEW.delivery_fee := 0;
    END IF;
  END IF;
  
  -- 顺手把 packaging_fee (旧字段) 也填上，保持兼容性
  NEW.packaging_fee := NEW.packing_fee;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_order_fees
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_set_order_fees();

-- =============================================
-- 4. 重建标准逻辑 (Part 2: 算总价)
-- 注意：这个必须绑在 order_items 表上！
-- =============================================
CREATE OR REPLACE FUNCTION public.fn_update_order_total()
RETURNS TRIGGER AS $$
DECLARE
  target_order_id INTEGER; 
  current_items_sum NUMERIC;
BEGIN
  IF (TG_OP = 'DELETE') THEN target_order_id := OLD.order_id;
  ELSE target_order_id := NEW.order_id;
  END IF;

  SELECT COALESCE(SUM(price * quantity), 0) INTO current_items_sum
  FROM order_items WHERE order_id = target_order_id;

  UPDATE orders
  SET 
    subtotal = current_items_sum,
    -- 核心公式：Total = Items + Packing + Delivery - Discount
    total = current_items_sum + COALESCE(packing_fee, 0) + COALESCE(delivery_fee, 0) - COALESCE(discount_amount, 0),
    updated_at = NOW()
  WHERE id = target_order_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_order_total
  AFTER INSERT OR UPDATE OR DELETE ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_update_order_total();

-- =============================================
-- 5. 再次强制刷新历史数据 (Final Refresh)
-- =============================================
-- 确保所有历史订单现在的 total 都是对的
UPDATE orders o
SET 
  subtotal = (SELECT COALESCE(SUM(price*quantity),0) FROM order_items WHERE order_id=o.id),
  total = (SELECT COALESCE(SUM(price*quantity),0) FROM order_items WHERE order_id=o.id) 
          + COALESCE(packing_fee, 0) 
          + COALESCE(delivery_fee, 0) 
          - COALESCE(discount_amount, 0);
