import request from '../utils/request';
import type { ApiResponse, AdminUser } from '../types/index';
import {
    mockGetStaffs,
    mockCreateStaff,
    mockUpdateStaff,
    mockDeleteStaff,
    mockGetSystemConfig,
    mockUpdateSystemConfig,
    mockGetRoles,
    mockUpdateRolePermissions,
    mockGetPermissions,
    mockCreateRole,
    mockUpdateRole,
    mockDeleteRole,
} from './mock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// 获取员工列表
export const getStaffs = () => {
    if (USE_MOCK) {
        return mockGetStaffs() as Promise<ApiResponse<AdminUser[]>>;
    }
    return request.get<any, ApiResponse<AdminUser[]>>('/settings/staffs');
};

// 新增员工
export const createStaff = (data: Partial<AdminUser>) => {
    if (USE_MOCK) {
        return mockCreateStaff(data) as Promise<ApiResponse<AdminUser>>;
    }
    return request.post<any, ApiResponse<AdminUser>>('/settings/staffs', data);
};

// 更新员工信息
export const updateStaff = (id: string, data: Partial<AdminUser>) => {
    if (USE_MOCK) {
        return mockUpdateStaff(id, data) as Promise<ApiResponse<AdminUser>>;
    }
    return request.put<any, ApiResponse<AdminUser>>(`/settings/staffs/${id}`, data);
};

// 删除员工
export const deleteStaff = (id: string) => {
    if (USE_MOCK) {
        return mockDeleteStaff(id) as Promise<ApiResponse<any>>;
    }
    return request.delete<any, ApiResponse<any>>(`/settings/staffs/${id}`);
};

// 获取系统全局配置
export const getSystemConfig = () => {
    if (USE_MOCK) {
        return mockGetSystemConfig() as Promise<ApiResponse<any>>;
    }
    return request.get<any, ApiResponse<any>>('/settings/config');
};

// 更新系统全局配置
export const updateSystemConfig = (data: any) => {
    if (USE_MOCK) {
        return mockUpdateSystemConfig(data) as Promise<ApiResponse<any>>;
    }
    return request.put<any, ApiResponse<any>>('/settings/config', data);
};

// 获取角色列表
export const getRoles = () => {
    if (USE_MOCK) {
        return mockGetRoles() as Promise<ApiResponse<any[]>>;
    }
    return request.get<any, ApiResponse<any[]>>('/settings/roles');
};

// 创建角色
export const createRole = (data: any) => {
    if (USE_MOCK) {
        return mockCreateRole(data) as Promise<ApiResponse<any>>;
    }
    return request.post<any, ApiResponse<any>>('/settings/roles', data);
};

// 更新角色信息
export const updateRole = (id: string, data: any) => {
    if (USE_MOCK) {
        return mockUpdateRole(id, data) as Promise<ApiResponse<any>>;
    }
    return request.put<any, ApiResponse<any>>(`/settings/roles/${id}`, data);
};

// 删除角色
export const deleteRole = (id: string) => {
    if (USE_MOCK) {
        return mockDeleteRole(id) as Promise<ApiResponse<any>>;
    }
    return request.delete<any, ApiResponse<any>>(`/settings/roles/${id}`);
};

// 更新角色权限
export const updateRolePermissions = (roleId: string, permissions: string[]) => {
    if (USE_MOCK) {
        return mockUpdateRolePermissions(roleId, permissions) as Promise<ApiResponse<any>>;
    }
    return request.post<any, ApiResponse<any>>(`/settings/roles/${roleId}/permissions`, { permissions });
};

// 获取所有权限点
export const getPermissions = () => {
    if (USE_MOCK) {
        return mockGetPermissions() as Promise<ApiResponse<any[]>>;
    }
    return request.get<any, ApiResponse<any[]>>('/settings/permissions');
};
