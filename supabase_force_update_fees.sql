-- 1. 确保字段存在
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS subtotal NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS packing_fee NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;

-- 2. 核心补救：强制从 canteen 表把“所有历史订单”的费率给填上
--    注意：这里我们简单粗暴地认为历史订单都按当前食堂费率算（这也是没办法的办法，历史费率没存）
UPDATE orders o
SET
  -- 填打包费：取食堂默认打包费
  packing_fee = COALESCE(c.default_packaging_fee, 0),
  
  -- 填配送费：如果是外卖(DELIVERY)，取食堂配送费，否则为 0
  delivery_fee = CASE 
      WHEN o.delivery_method = 'DELIVERY' THEN COALESCE(c.delivery_fee, 0)
      ELSE 0 
  END
FROM canteens c
WHERE o.canteen_id = c.id;

-- 3. 最后再算一遍 Total
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
  + o.packing_fee
  + o.delivery_fee
  - COALESCE(o.discount_amount, 0);
