import React from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { hasPermission } from '../utils/rbac';

interface PermissionGuardProps {
    /**
     * 需要的权限代码（如 'manage:products'）
     */
    permission: string;

    /**
     * 无权限时显示的内容（默认不显示任何内容）
     */
    fallback?: React.ReactNode;

    /**
     * 子组件
     */
    children: React.ReactNode;
}

/**
 * 权限守卫组件
 * 根据用户权限决定是否渲染子组件
 * 
 * @example
 * <PermissionGuard permission="manage:departments">
 *   <Button onClick={handleDelete}>删除部门</Button>
 * </PermissionGuard>
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
    permission,
    fallback = null,
    children
}) => {
    const { user } = useAuthStore();

    // 检查权限
    if (!hasPermission(user, permission)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};

export default PermissionGuard;
