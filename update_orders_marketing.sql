-- 为订单表增加优惠券关联并提供核销函数
BEGIN;

-- 0. 修正 user_coupons 中的 used_order_id 类型以匹配 orders.id (serial/integer)
-- 先删除可能存在的约束（如果有）并修改类型
ALTER TABLE IF EXISTS public.user_coupons 
ALTER COLUMN used_order_id TYPE INTEGER USING NULL; 

-- 1. 为 orders 表增加 coupon_id 字段
ALTER TABLE IF EXISTS public.orders 
ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES public.marketing_coupons(id) ON DELETE SET NULL;

-- 2. 创建优惠券核销函数 (RPC)
-- 用于在下单成功后，将 user_coupons 状态标记为 USED，并让 marketing_coupons 的使用计数 +1
CREATE OR REPLACE FUNCTION use_marketing_coupon(
    user_coupon_id_param UUID,
    order_id_param INTEGER
)
RETURNS VOID AS $$
DECLARE
    v_coupon_id UUID;
    v_status TEXT;
BEGIN
    -- 获取领券实例的状态和对应的优惠券定义ID
    SELECT status, coupon_id INTO v_status, v_coupon_id
    FROM public.user_coupons
    WHERE id = user_coupon_id_param
    FOR UPDATE; -- 行锁，防止并发问题

    -- 检查是否可用
    IF v_status != 'UNUSED' THEN
        RAISE EXCEPTION '该优惠券已被使用或已过期';
    END IF;

    -- 1. 更新用户领券状态
    UPDATE public.user_coupons
    SET 
        status = 'USED',
        used_at = NOW(),
        used_order_id = order_id_param
    WHERE id = user_coupon_id_param;

    -- 2. 更新原券定义的使用计数
    UPDATE public.marketing_coupons
    SET used_count = used_count + 1
    WHERE id = v_coupon_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
