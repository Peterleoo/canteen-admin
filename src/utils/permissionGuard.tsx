import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { hasPermission } from './rbac';
import { message } from 'antd';

// 定义路由与权限的映射关系
const routePermissionMap: Record<string, string> = {
    '/': 'view:dashboard',
    '/dashboard': 'view:dashboard',
    '/products': 'manage:products',
    '/orders': 'manage:orders',
    '/users': 'manage:users',
    '/canteens': 'manage:canteens',
    '/marketing/coupons': 'manage:coupons',
    '/marketing/promotions': 'manage:promotions',
    '/analytics': 'view:analytics',
    '/settings/staff': 'manage:staff',
    '/settings/departments': 'manage:departments',
    '/settings/roles': 'manage:roles',
    '/settings/permissions': 'view:permissions',
    '/settings/config': 'manage:config',
};

/**
 * 路由守卫组件，检查用户是否有权限访问当前路径
 */
export const PermissionGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, user } = useAuthStore();
    const location = useLocation();
    const pathname = location.pathname;

    // 未登录用户重定向到登录页
    if (!isAuthenticated) {
        window.location.href = '/login';
        return null;
    }

    // 获取当前路径需要的权限
    const requiredPermission = routePermissionMap[pathname];
    
    // 如果路径不需要权限，直接允许访问
    if (!requiredPermission) {
        return <>{children}</>;
    }

    // 检查用户是否有权限访问当前路径
    const hasAccess = hasPermission(user, requiredPermission);
    if (!hasAccess) {
        // 显示吐司提示
        message.error('您没有权限访问该页面');
        
        // 延迟重定向，确保用户能看到提示
        setTimeout(() => {
            window.location.href = '/';
        }, 1500);
        
        return null;
    }

    return <>{children}</>;
};


