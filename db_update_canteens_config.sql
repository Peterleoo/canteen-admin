-- 更新食堂表结构，添加基础配置功能字段
begin;

-- 检查并添加自动化配置相关字段
DO $$ 
BEGIN
    -- 自动接单开关
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'canteens' AND column_name = 'is_auto_accept_orders') THEN
        ALTER TABLE public.canteens ADD COLUMN is_auto_accept_orders BOOLEAN NOT NULL DEFAULT FALSE;
        RAISE NOTICE 'Added column: is_auto_accept_orders';
    END IF;
    
    -- 自动接单延迟
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'canteens' AND column_name = 'auto_accept_delay') THEN
        ALTER TABLE public.canteens ADD COLUMN auto_accept_delay INTEGER DEFAULT 30; -- 默认30秒
        RAISE NOTICE 'Added column: auto_accept_delay';
    END IF;
    
    -- 工作日开始时间
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'canteens' AND column_name = 'weekday_open_time') THEN
        ALTER TABLE public.canteens ADD COLUMN weekday_open_time TEXT NOT NULL DEFAULT '08:00';
        RAISE NOTICE 'Added column: weekday_open_time';
    END IF;
    
    -- 工作日结束时间
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'canteens' AND column_name = 'weekday_close_time') THEN
        ALTER TABLE public.canteens ADD COLUMN weekday_close_time TEXT NOT NULL DEFAULT '20:00';
        RAISE NOTICE 'Added column: weekday_close_time';
    END IF;
    
    -- 周末开始时间
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'canteens' AND column_name = 'weekend_open_time') THEN
        ALTER TABLE public.canteens ADD COLUMN weekend_open_time TEXT NOT NULL DEFAULT '09:00';
        RAISE NOTICE 'Added column: weekend_open_time';
    END IF;
    
    -- 周末结束时间
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'canteens' AND column_name = 'weekend_close_time') THEN
        ALTER TABLE public.canteens ADD COLUMN weekend_close_time TEXT NOT NULL DEFAULT '18:00';
        RAISE NOTICE 'Added column: weekend_close_time';
    END IF;
    
    -- 库存预警阈值
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'canteens' AND column_name = 'stock_alert_threshold') THEN
        ALTER TABLE public.canteens ADD COLUMN stock_alert_threshold INTEGER NOT NULL DEFAULT 50;
        RAISE NOTICE 'Added column: stock_alert_threshold';
    END IF;
    
    -- 低库存通知开关
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'canteens' AND column_name = 'is_low_stock_notification') THEN
        ALTER TABLE public.canteens ADD COLUMN is_low_stock_notification BOOLEAN NOT NULL DEFAULT TRUE;
        RAISE NOTICE 'Added column: is_low_stock_notification';
    END IF;
    
    -- 通知邮箱列表
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'canteens' AND column_name = 'notification_emails') THEN
        ALTER TABLE public.canteens ADD COLUMN notification_emails TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Added column: notification_emails';
    END IF;
    
    -- 通知手机列表
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'canteens' AND column_name = 'notification_phones') THEN
        ALTER TABLE public.canteens ADD COLUMN notification_phones TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Added column: notification_phones';
    END IF;

END $$;

-- 更新现有数据的默认值
UPDATE public.canteens 
SET 
    is_auto_accept_orders = COALESCE(is_auto_accept_orders, FALSE),
    auto_accept_delay = COALESCE(auto_accept_delay, 30),
    weekday_open_time = COALESCE(weekday_open_time, '08:00'),
    weekday_close_time = COALESCE(weekday_close_time, '20:00'),
    weekend_open_time = COALESCE(weekend_open_time, '09:00'),
    weekend_close_time = COALESCE(weekend_close_time, '18:00'),
    stock_alert_threshold = COALESCE(stock_alert_threshold, 50),
    is_low_stock_notification = COALESCE(is_low_stock_notification, TRUE)
WHERE TRUE;

commit;