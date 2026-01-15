import type { Role, AdminUser } from '../types';

/**
 * 角色权限配置
 * 定义每个角色的默认权限（备用）
 */
export const ROLE_PERMISSIONS: Record<Role, string[]> = {
    SUPER_ADMIN: ['*'],  // 超级管理员拥有所有权限

    ADMIN: [
        'view:all',
        'view:dashboard',      // 添加数据看板权限
        'manage:staff',
        'manage:departments',
        'manage:roles',
        'manage:permissions',
        'manage:canteens',
        'manage:products',
        'manage:orders',
        'manage:marketing',
        'view:analytics'
    ],

    CANTEEN_MANAGER: [
        'view:dashboard',      // 添加数据看板权限
        'view:canteen',        // 查看本食堂信息
        'manage:canteen',      // 管理本食堂信息
        'manage:products',     // 管理本食堂商品
        'manage:orders',       // 管理本食堂订单
        'view:analytics'       // 查看本食堂数据分析
    ],

    OPERATOR: [
        'view:dashboard',      // 添加数据看板权限
        'view:canteen',        // 查看本食堂信息
        'manage:products',     // 管理本食堂商品
        'view:orders',         // 查看本食堂订单
    ],

    VIEWER: [
        'view:dashboard',      // 添加数据看板权限
        'view:canteen',        // 查看本食堂信息
        'view:products',       // 查看本食堂商品
        'view:orders',         // 查看本食堂订单
    ]
};

/**
 * 检查用户是否拥有特定权限
 * @param user 当前用户
 * @param permission 权限代码（如 'manage:products'）
 * @returns 是否有权限
 */
export function hasPermission(user: AdminUser | null, permission: string): boolean {
    if (!user) return false;

    // 1. 优先使用用户实际拥有的权限列表
    if (user.permissions) {
        // 超级管理员有所有权限
        if (user.permissions.includes('*')) return true;
        // 检查是否有该权限
        return user.permissions.includes(permission);
    }

    // 2. 备用方案：使用角色默认权限（兼容旧数据）
    const userPermissions = ROLE_PERMISSIONS[user.role];
    if (!userPermissions) return false;

    // 超级管理员有所有权限
    if (userPermissions.includes('*')) return true;

    // 检查是否有该权限
    return userPermissions.includes(permission);
}

/**
 * 检查用户是否拥有任一权限（满足其中一个即可）
 * @param user 当前用户
 * @param permissions 权限列表
 * @returns 是否有权限
 */
export function hasAnyPermission(user: AdminUser | null, permissions: string[]): boolean {
    return permissions.some(p => hasPermission(user, p));
}

/**
 * 检查用户是否拥有所有权限（需全部满足）
 * @param user 当前用户
 * @param permissions 权限列表
 * @returns 是否有权限
 */
export function hasAllPermissions(user: AdminUser | null, permissions: string[]): boolean {
    return permissions.every(p => hasPermission(user, p));
}

/**
 * 检查用户角色
 * @param user 当前用户
 * @param role 角色
 * @returns 是否是该角色
 */
export function hasRole(user: AdminUser | null, role: Role): boolean {
    return user?.role === role;
}

/**
 * 检查用户是否是管理员角色（SUPER_ADMIN 或 ADMIN）
 * @param user 当前用户
 * @returns 是否是管理员
 */
export function isAdmin(user: AdminUser | null): boolean {
    return hasRole(user, 'SUPER_ADMIN') || hasRole(user, 'ADMIN');
}
