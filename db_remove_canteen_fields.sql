-- 删除食堂表中不需要的配置字段
begin;

-- 检查并删除不需要的字段
DO $$ 
BEGIN
    -- 删除打包费开关
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'canteens' AND column_name = 'is_packaging_fee_enabled') THEN
        ALTER TABLE public.canteens DROP COLUMN is_packaging_fee_enabled;
        RAISE NOTICE 'Dropped column: is_packaging_fee_enabled';
    END IF;
    
    -- 删除配送规则
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'canteens' AND column_name = 'delivery_rules') THEN
        ALTER TABLE public.canteens DROP COLUMN delivery_rules;
        RAISE NOTICE 'Dropped column: delivery_rules';
    END IF;
    
    -- 删除每日最大配送量
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'canteens' AND column_name = 'max_daily_deliveries') THEN
        ALTER TABLE public.canteens DROP COLUMN max_daily_deliveries;
        RAISE NOTICE 'Dropped column: max_daily_deliveries';
    END IF;
    
    -- 删除预计配送时间
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'canteens' AND column_name = 'delivery_time_estimate') THEN
        ALTER TABLE public.canteens DROP COLUMN delivery_time_estimate;
        RAISE NOTICE 'Dropped column: delivery_time_estimate';
    END IF;
    
    -- 删除通知邮箱列表
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'canteens' AND column_name = 'notification_emails') THEN
        ALTER TABLE public.canteens DROP COLUMN notification_emails;
        RAISE NOTICE 'Dropped column: notification_emails';
    END IF;
    
    -- 删除特殊营业时间
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'canteens' AND column_name = 'special_hours') THEN
        ALTER TABLE public.canteens DROP COLUMN special_hours;
        RAISE NOTICE 'Dropped column: special_hours';
    END IF;
END $$;

commit;