-- 营销系统数据库建表脚本
-- 包含：活动海报、优惠券定义、用户领券关系

-- 1. 活动海报表 (marketing_banners)
CREATE TABLE IF NOT EXISTS marketing_banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canteen_id UUID REFERENCES canteens(id) ON DELETE CASCADE, -- 所属食堂，null 则为全局全局
    image_url TEXT NOT NULL,                                   -- 图片地址
    title TEXT,                                                -- 标题
    subtitle TEXT,                                             -- 副标题/说明
    action_type TEXT DEFAULT 'NONE',                           -- 跳转类型: PRODUCT, CATEGORY, URL, NONE
    action_value TEXT,                                         -- 跳转参数: ID, 分类名, URL
    status TEXT DEFAULT 'ACTIVE',                              -- 状态: ACTIVE, INACTIVE
    sort_order INT DEFAULT 0,                                  -- 排序
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 优惠券定义表 (marketing_coupons)
CREATE TABLE IF NOT EXISTS marketing_coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canteen_id UUID REFERENCES canteens(id) ON DELETE CASCADE, -- 所属食堂
    name TEXT NOT NULL,                                        -- 优惠券名称
    description TEXT,                                          -- 描述/使用规则
    type TEXT DEFAULT 'FIXED',                                 -- 类型: FIXED(满减), PERCENT(折扣)
    value DECIMAL(10,2) NOT NULL,                              -- 优惠金额或折扣比例 (如 0.9 = 9折)
    min_spend DECIMAL(10,2) DEFAULT 0,                         -- 使用门槛金额
    start_at TIMESTAMPTZ,                                      -- 有效期开始
    end_at TIMESTAMPTZ,                                        -- 有效期结束
    total_stock INT DEFAULT -1,                                -- 发行总量 (-1 为不限)
    used_count INT DEFAULT 0,                                  -- 已使用数量
    received_count INT DEFAULT 0,                              -- 已领取数量
    status TEXT DEFAULT 'ACTIVE',                              -- 状态: ACTIVE, INACTIVE
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 用户领券关系表 (user_coupons)
CREATE TABLE IF NOT EXISTS user_coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,       -- 用户 ID
    coupon_id UUID REFERENCES marketing_coupons(id) ON DELETE CASCADE, -- 优惠券定义 ID
    status TEXT DEFAULT 'UNUSED',                              -- 状态: UNUSED, USED, EXPIRED
    used_at TIMESTAMPTZ,                                       -- 使用时间
    used_order_id UUID,                                        -- 关联订单 ID
    received_at TIMESTAMPTZ DEFAULT NOW(),                     -- 领取时间
    expires_at TIMESTAMPTZ                                     -- 实例过期时间 (冗余自定义表，方便查询)
);

-- 4. 基础索引
CREATE INDEX IF NOT EXISTS idx_banners_canteen ON marketing_banners(canteen_id);
CREATE INDEX IF NOT EXISTS idx_coupons_canteen ON marketing_coupons(canteen_id);
CREATE INDEX IF NOT EXISTS idx_user_coupons_user ON user_coupons(user_id);
CREATE INDEX IF NOT EXISTS idx_user_coupons_status ON user_coupons(status);

-- 增加优惠券领取计数的原子操作
CREATE OR REPLACE FUNCTION increment_coupon_received(coupon_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE marketing_coupons
  SET received_count = received_count + 1
  WHERE id = coupon_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. 触发器更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_marketing_banners_modtime
    BEFORE UPDATE ON marketing_banners
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_marketing_coupons_modtime
    BEFORE UPDATE ON marketing_coupons
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
