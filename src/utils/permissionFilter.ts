import { supabase } from './supabase';
import type { AdminUser } from '../types/index';

/**
 * 菜单项配置类型
 */
export interface MenuConfigItem {
    key: string;
    icon?: React.ReactNode;
    label: string;
    permission?: string;
    children?: MenuConfigItem[];
    requiresChildren?: boolean;
}

/**
 * 检查用户是否为超级管理员
 * 超级管理员不受部门限制，可以查看所有数据
 */
export function isSuperAdmin(user: AdminUser | null): boolean {
    return user?.role === 'SUPER_ADMIN';
}

/**
 * 获取当前用户可访问的食堂 ID 列表
 * @param userId 用户 ID
 * @returns 食堂 ID 数组，超级管理员返回 null（表示无限制）
 */
export async function getUserAccessibleCanteenIds(userId: string): Promise<string[] | null> {
    // 1. 获取用户信息和角色
    const { data: profile, error: profileError } = await supabase
        .from('staffs')
        .select('role, department_id')
        .eq('id', userId)
        .single();

    if (profileError || !profile) {
        console.error('获取用户信息失败:', profileError);
        return [];
    }

    // 2. 超级管理员和管理员可以访问所有食堂
    if (profile.role === 'SUPER_ADMIN' || profile.role === 'ADMIN') {
        return null;
    }

    // 3. 如果用户没有分配部门，返回空数组（无权限）
    if (!profile.department_id) {
        return [];
    }

    // 4. 查询该部门关联的食堂
    const { data: canteenRelations, error: relationError } = await supabase
        .from('department_canteens')
        .select('canteen_id')
        .eq('department_id', profile.department_id);

    if (relationError) {
        console.error('获取部门食堂关联失败:', relationError);
        return [];
    }

    // 5. 提取食堂 ID 列表
    return canteenRelations?.map(r => r.canteen_id) || [];
}

/**
 * 为查询添加食堂权限过滤条件
 * @param query Supabase 查询对象
 * @param userId 当前用户 ID
 * @param canteenIdField 食堂 ID 字段名（默认 'canteen_id'）
 * @returns 添加了权限过滤的查询对象
 */
export async function applyCanteenFilter(
    query: any,
    userId: string,
    canteenIdField: string = 'canteen_id'
): Promise<any> {
    const accessibleCanteenIds = await getUserAccessibleCanteenIds(userId);

    // 如果是超级管理员（返回 null），不添加过滤条件
    if (accessibleCanteenIds === null) {
        return query;
    }

    // 如果没有可访问的食堂，添加一个永远不匹配的条件
    if (accessibleCanteenIds.length === 0) {
        return query.eq(canteenIdField, '00000000-0000-0000-0000-000000000000'); // 不存在的 UUID
    }

    // 添加食堂 ID 过滤条件
    return query.in(canteenIdField, accessibleCanteenIds);
}

/**
 * 检查用户是否有权访问指定食堂
 * @param userId 用户 ID
 * @param canteenId 食堂 ID
 * @returns 是否有权限
 */
export async function canAccessCanteen(userId: string, canteenId: string): Promise<boolean> {
    const accessibleCanteenIds = await getUserAccessibleCanteenIds(userId);

    // 超级管理员可以访问所有食堂
    if (accessibleCanteenIds === null) {
        return true;
    }

    // 检查食堂 ID 是否在可访问列表中
    return accessibleCanteenIds.includes(canteenId);
}

/**
 * 获取用户有权访问的菜单项
 * @param menuItems 所有菜单项
 * @param permissions 用户权限列表
 * @returns 有权访问的菜单项
 */
export const filterMenuByPermission = (menuItems: MenuConfigItem[], permissions: string[]): MenuConfigItem[] => {
    return menuItems.filter(item => {
        // 超级管理员显示所有菜单
        if (permissions.includes('*')) {
            if (item.children) {
                item.children = filterMenuByPermission(item.children, permissions);
            }
            return true;
        }

        // 检查菜单项是否需要权限
        if (!item.permission) {
            // 没有配置权限的菜单项，默认允许访问
            if (item.children) {
                item.children = filterMenuByPermission(item.children, permissions);
                return item.children.length > 0;
            }
            return true;
        }

        // 检查是否有权限
        const hasAccess = permissions.includes(item.permission);
        if (hasAccess && item.children) {
            item.children = filterMenuByPermission(item.children, permissions);
            return item.children.length > 0 || !item.requiresChildren;
        }

        return hasAccess;
    });
};
