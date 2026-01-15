-- 创建自动接单触发器函数
begin;

-- 1. 创建自动接单触发器函数
CREATE OR REPLACE FUNCTION auto_accept_order()
RETURNS TRIGGER AS $$
DECLARE
    v_is_auto_accept BOOLEAN;
    v_auto_accept_delay INTEGER;
BEGIN
    -- 检查订单所属食堂是否开启了自动接单
    SELECT is_auto_accept_orders, auto_accept_delay
    INTO v_is_auto_accept, v_auto_accept_delay
    FROM canteens
    WHERE id = NEW.canteen_id;
    
    -- 如果食堂开启了自动接单
    IF v_is_auto_accept THEN
        -- 如果设置了延迟，则创建延迟任务
        IF v_auto_accept_delay > 0 THEN
            -- 使用PostgreSQL的pg_sleep延迟执行（仅在测试环境使用，生产环境建议使用pg_cron等调度工具）
            -- 注意：在生产环境中，长时间的pg_sleep会阻塞事务，建议使用异步任务队列
            PERFORM pg_sleep(v_auto_accept_delay / 1000.0);
        END IF;
        
        -- 自动更新订单状态为准备中
        NEW.status = 'PREPARING'::order_status_type;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. 为orders表添加自动接单触发器
CREATE TRIGGER trigger_auto_accept_order
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION auto_accept_order();

commit;

-- 3. 为现有订单添加自动接单处理函数（用于处理已存在的待处理订单）
CREATE OR REPLACE FUNCTION process_pending_orders()
RETURNS VOID AS $$
DECLARE
    order_rec RECORD;
    v_is_auto_accept BOOLEAN;
BEGIN
    -- 处理所有待处理状态的订单
    FOR order_rec IN SELECT id, canteen_id FROM orders WHERE status = 'PENDING'::order_status_type LOOP
        -- 检查订单所属食堂是否开启了自动接单
        SELECT is_auto_accept_orders
        INTO v_is_auto_accept
        FROM canteens
        WHERE id = order_rec.canteen_id;
        
        -- 如果食堂开启了自动接单，更新订单状态
        IF v_is_auto_accept THEN
            UPDATE orders
            SET status = 'PREPARING'::order_status_type,
                updated_at = NOW()
            WHERE id = order_rec.id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 4. 创建一个手动执行的函数，用于测试和手动触发自动接单
CREATE OR REPLACE FUNCTION trigger_auto_accept_for_order(order_id INTEGER)
RETURNS VOID AS $$
DECLARE
    v_canteen_id INTEGER;
    v_is_auto_accept BOOLEAN;
    v_auto_accept_delay INTEGER;
BEGIN
    -- 获取订单所属食堂ID
    SELECT canteen_id INTO v_canteen_id FROM orders WHERE id = order_id;
    
    -- 检查食堂是否开启了自动接单
    SELECT is_auto_accept_orders, auto_accept_delay
    INTO v_is_auto_accept, v_auto_accept_delay
    FROM canteens
    WHERE id = v_canteen_id;
    
    -- 如果食堂开启了自动接单
    IF v_is_auto_accept THEN
        -- 如果设置了延迟，则延迟执行
        IF v_auto_accept_delay > 0 THEN
            PERFORM pg_sleep(v_auto_accept_delay / 1000.0);
        END IF;
        
        -- 更新订单状态为准备中
        UPDATE orders
        SET status = 'PREPARING'::order_status_type,
            updated_at = NOW()
        WHERE id = order_id;
    END IF;
END;
$$ LANGUAGE plpgsql;