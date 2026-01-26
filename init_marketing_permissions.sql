-- 初始化营销系统权限数据
BEGIN;

-- 1. 查找或创建菜单组权限 (父级)
DO $$
DECLARE
    v_parent_id UUID;
    v_admin_role_id UUID;
    v_manager_role_id UUID;
BEGIN
    -- 获取设置或系统菜单作为父级（如果需要，或者直接创建顶级菜单）
    -- 这里我们直接创建顶级营销管理菜单
    INSERT INTO public.permissions (name, code, type, description)
    VALUES ('营销管理', 'view:marketing', 'MENU', '营销管理系统顶级菜单')
    ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO v_parent_id;

    -- 2. 创建子权限
    -- 优惠券管理
    INSERT INTO public.permissions (name, code, type, parent_id, description)
    VALUES ('优惠券管理', 'manage:coupons', 'MENU', v_parent_id, '管理优惠券的创建、分发与核销')
    ON CONFLICT (code) DO UPDATE SET parent_id = v_parent_id;

    -- 活动海报管理
    INSERT INTO public.permissions (name, code, type, parent_id, description)
    VALUES ('活动海报管理', 'manage:promotions', 'MENU', v_parent_id, '管理首页活动海报与跳转跳转逻辑')
    ON CONFLICT (code) DO UPDATE SET parent_id = v_parent_id;

    -- 3. 自动赋予超级管理员 (ADMIN) 与 经理 (MANAGER) 角色相关权限
    -- 获取 ADMIN 角色 ID
    SELECT id INTO v_admin_role_id FROM public.roles WHERE code = 'ADMIN';
    -- 获取 MANAGER 角色 ID
    SELECT id INTO v_manager_role_id FROM public.roles WHERE code = 'MANAGER';

    IF v_admin_role_id IS NOT NULL THEN
        -- 为 ADMIN 角色关联权限
        INSERT INTO public.role_permissions (role_id, permission_id)
        SELECT v_admin_role_id, id FROM public.permissions WHERE code IN ('view:marketing', 'manage:coupons', 'manage:promotions')
        ON CONFLICT DO NOTHING;
    END IF;

    IF v_manager_role_id IS NOT NULL THEN
        -- 为 MANAGER 角色关联权限
        INSERT INTO public.role_permissions (role_id, permission_id)
        SELECT v_manager_role_id, id FROM public.permissions WHERE code IN ('view:marketing', 'manage:coupons', 'manage:promotions')
        ON CONFLICT DO NOTHING;
    END IF;

END $$;

COMMIT;
