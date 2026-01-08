import { supabase } from '../utils/supabase';
import type { Permission, RoleConfig, ApiResponse } from '../types/index';
import {
    mockGetRoles,
    mockUpdateRolePermissions,
    mockGetPermissions,
    mockCreateRole,
    mockUpdateRole,
    mockDeleteRole,
    mockGetSystemConfig,
    mockUpdateSystemConfig,
    mockGetStaffs,
    mockCreateStaff,
    mockUpdateStaff,
    mockDeleteStaff
} from './mock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// 获取所有角色
export const getRoles = async (): Promise<ApiResponse<RoleConfig[]>> => {
    if (USE_MOCK) {
        return mockGetRoles();
    }

    const { data: roles, error: rolesError } = await supabase
        .from('roles')
        .select('*, role_permissions(permission_id)');

    if (rolesError) {
        return { code: 500, message: rolesError.message, data: [] };
    }

    const formattedRoles = roles.map(role => ({
        ...role,
        permissions: role.role_permissions.map((rp: any) => rp.permission_id)
    })) as RoleConfig[];

    return { code: 200, message: '获取成功', data: formattedRoles };
};

// 更新角色权限
export const updateRolePermissions = async (roleId: string, permissionIds: string[]): Promise<ApiResponse> => {
    if (USE_MOCK) {
        return mockUpdateRolePermissions(roleId, permissionIds);
    }

    const { error: deleteError } = await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', roleId);

    if (deleteError) {
        return { code: 500, message: deleteError.message, data: null };
    }

    const newPermissions = permissionIds.map(pid => ({
        role_id: roleId,
        permission_id: pid
    }));

    if (newPermissions.length > 0) {
        const { error: insertError } = await supabase
            .from('role_permissions')
            .insert(newPermissions);

        if (insertError) {
            return { code: 500, message: insertError.message, data: null };
        }
    }

    return { code: 200, message: '权限更新成功', data: null };
};

// 获取所有权限点
export const getPermissions = async (): Promise<ApiResponse<Permission[]>> => {
    if (USE_MOCK) {
        return mockGetPermissions();
    }

    const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('type', { ascending: false });

    if (error) {
        return { code: 500, message: error.message, data: [] };
    }

    return { code: 200, message: '获取成功', data: data as Permission[] };
};

// 创建角色
export const createRole = async (data: Partial<RoleConfig>): Promise<ApiResponse<RoleConfig>> => {
    if (USE_MOCK) {
        return mockCreateRole(data);
    }

    const { permissions, ...roleData } = data;

    const { data: newRole, error } = await supabase
        .from('roles')
        .insert([roleData])
        .select()
        .single();

    if (error) {
        return { code: 500, message: error.message, data: null as any };
    }

    if (permissions && permissions.length > 0) {
        await updateRolePermissions(newRole.id, permissions);
    }

    return { code: 200, message: '创建成功', data: { ...newRole, permissions: permissions || [] } as RoleConfig };
};

// 更新角色
export const updateRole = async (id: string, data: Partial<RoleConfig>): Promise<ApiResponse<RoleConfig>> => {
    if (USE_MOCK) {
        return mockUpdateRole(id, data);
    }

    const { permissions, ...roleData } = data;

    const { data: updatedRole, error } = await supabase
        .from('roles')
        .update(roleData)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return { code: 500, message: error.message, data: null as any };
    }

    return { code: 200, message: '更新成功', data: { ...updatedRole, permissions: permissions || [] } as RoleConfig };
};

// 删除角色
export const deleteRole = async (id: string): Promise<ApiResponse> => {
    if (USE_MOCK) {
        return mockDeleteRole(id);
    }

    const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', id);

    if (error) {
        return { code: 500, message: error.message, data: null };
    }

    return { code: 200, message: '删除成功', data: null };
};

// 获取员工列表
export const getStaffs = async (): Promise<ApiResponse<any[]>> => {
    if (USE_MOCK) {
        return mockGetStaffs();
    }

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        return { code: 500, message: error.message, data: [] };
    }

    return { code: 200, message: '获取成功', data: data as any[] };
};

// 新增员工
export const createStaff = async (data: any): Promise<ApiResponse<any>> => {
    if (USE_MOCK) {
        return mockCreateStaff(data);
    }

    // 注意：Supabase 生产环境通常使用 Supabase Auth Admin API 创建用户
    // 这里简单处理为插入 profiles 表（假设用户已在 Auth 系统或仅展示信息）
    const { data: newData, error } = await supabase
        .from('profiles')
        .insert([data])
        .select()
        .single();

    if (error) {
        return { code: 500, message: error.message, data: null };
    }

    return { code: 200, message: '创建成功', data: newData };
};

// 更新员工
export const updateStaff = async (id: string, data: any): Promise<ApiResponse<any>> => {
    if (USE_MOCK) {
        return mockUpdateStaff(id, data);
    }

    const { data: updatedData, error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return { code: 500, message: error.message, data: null };
    }

    return { code: 200, message: '更新成功', data: updatedData };
};

// 删除员工
export const deleteStaff = async (id: string): Promise<ApiResponse> => {
    if (USE_MOCK) {
        return mockDeleteStaff(id);
    }

    const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

    if (error) {
        return { code: 500, message: error.message, data: null };
    }

    return { code: 200, message: '删除成功', data: null };
};

// 系统配置相关
export const getSystemConfig = async (): Promise<ApiResponse<any>> => {
    if (USE_MOCK) {
        return mockGetSystemConfig();
    }

    const { data, error } = await supabase
        .from('system_configs')
        .select('*');

    if (error) {
        return { code: 500, message: error.message, data: {} };
    }

    const config = data.reduce((acc, curr) => {
        acc[curr.config_key] = curr.config_value;
        return acc;
    }, {});

    return { code: 200, message: '获取成功', data: config };
};

export const updateSystemConfig = async (config: any): Promise<ApiResponse> => {
    if (USE_MOCK) {
        return mockUpdateSystemConfig(config);
    }

    const entries = Object.entries(config).map(([key, value]) => ({
        config_key: key,
        config_value: value,
        updated_at: new Date().toISOString()
    }));

    for (const entry of entries) {
        await supabase
            .from('system_configs')
            .upsert(entry);
    }

    return { code: 200, message: '更新成功', data: null };
};
