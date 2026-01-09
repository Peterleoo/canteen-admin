-- 添加所有可能缺失的字段
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS subtotal NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS packing_fee NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;

-- 再次运行批量修复历史数据
UPDATE orders o
SET 
  subtotal = (
    SELECT COALESCE(SUM(price * quantity), 0) 
    FROM order_items 
    WHERE order_id = o.id
  ),
  total = (
    SELECT COALESCE(SUM(price * quantity), 0) 
    FROM order_items 
    WHERE order_id = o.id
  ) 
  + COALESCE(o.packing_fee, 0) 
  + COALESCE(o.delivery_fee, 0) 
  - COALESCE(o.discount_amount, 0);
