-- 检查订单表的结构，特别是配送地址相关字段

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'orders' AND table_schema = 'public'
AND column_name IN ('address_id', 'address_detail');

-- 查看orders表的所有字段
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'orders' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 检查是否有触发器或函数与地址相关
SELECT
    t.tgname,
    c.relname AS table_name,
    t.tgtype,
    pg_get_functiondef(ft.oid) as function_def
FROM
    pg_trigger t
JOIN
    pg_class c ON t.tgrelid = c.oid
JOIN
    pg_proc ft ON t.tgfoid = ft.oid
WHERE
    c.relname = 'orders'
ORDER BY t.tgname;

-- 查看是否有订单创建相关的函数
SELECT
    proname,
    pg_get_functiondef(oid) as function_def
FROM
    pg_proc
WHERE
    proname LIKE '%order%' AND proname LIKE '%create%' OR proname LIKE '%insert%' OR proname LIKE '%add%'
ORDER BY proname;
