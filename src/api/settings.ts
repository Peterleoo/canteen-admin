import { supabase } from '../utils/supabase';
import type { ApiResponse, RoleConfig, Permission, AdminUser } from '../types/index';
import {
    mockGetRoles,
    mockUpdateRolePermissions,
    mockGetPermissions,
    mockCreateRole,
    mockUpdateRole,
    mockDeleteRole,
    mockCreateStaff,
    mockUpdateStaff,
    mockDeleteStaff
} from './mock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// 1. 获取所有角色
export const getRoles = async (): Promise<ApiResponse<RoleConfig[]>> => {
    if (USE_MOCK) return mockGetRoles();

    const { data: roles, error: rolesError } = await supabase
        .from('roles')
        .select('*, role_permissions(permission_id)');

    if (rolesError) return { code: 500, message: rolesError.message, data: [] };

    const formattedRoles = roles.map(role => ({
        ...role,
        permissions: role.role_permissions.map((rp: any) => rp.permission_id)
    })) as RoleConfig[];

    return { code: 200, message: '获取成功', data: formattedRoles };
};

// 2. 更新角色权限
export const updateRolePermissions = async (roleId: string, permissionIds: string[]): Promise<ApiResponse> => {
    if (USE_MOCK) return mockUpdateRolePermissions(roleId, permissionIds);

    const { error: deleteError } = await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', roleId);

    if (deleteError) return { code: 500, message: deleteError.message, data: null };

    const newPermissions = permissionIds.map(pid => ({
        role_id: roleId,
        permission_id: pid
    }));

    if (newPermissions.length > 0) {
        const { error: insertError } = await supabase
            .from('role_permissions')
            .insert(newPermissions);
        if (insertError) return { code: 500, message: insertError.message, data: null };
    }

    return { code: 200, message: '权限更新成功', data: null };
};

// 3. 获取所有权限点
export const getPermissions = async (): Promise<ApiResponse<Permission[]>> => {
    if (USE_MOCK) return mockGetPermissions();

    const { data, error } = await supabase
        .from('permissions')
        .select(`
            id,
            name,
            code,
            type,
            description,
            parentId:parent_id
        `)
        .order('type', { ascending: false });

    if (error) return { code: 500, message: error.message, data: [] };
    return { code: 200, message: '获取成功', data: data as any };
};

// 4. 获取员工列表 (修复后的函数)
export const getStaffs = async (): Promise<ApiResponse<AdminUser[]>> => {
    const { data, error } = await supabase
        .from('staffs')
        .select(`
            id,
            username,
            name,
            role,
            avatar:avatar_url,
            email,
            phone,
            status,
            created_at,
            department_id,
            department:departments (id, name)
        `)
        .neq('role', 'USER')
        .order('created_at', { ascending: false });

    if (error) return { code: 500, message: error.message, data: [] };

    return { code: 200, message: '获取成功', data: data as unknown as AdminUser[] };
};

// 5. 新增员工
export const createStaff = async (data: any): Promise<ApiResponse<any>> => {
    if (USE_MOCK) return mockCreateStaff(data);

    // 适配数据库字段映射
    const { avatar, ...rest } = data;
    const payload = {
        ...rest,
        avatar_url: avatar,
        id: crypto.randomUUID() // 测试环境手动分配 ID
    };

    const { data: newData, error } = await supabase
        .from('staffs')
        .insert([payload])
        .select()
        .single();

    if (error) return { code: 500, message: error.message, data: null };
    return { code: 200, message: '创建成功', data: newData };
};

// 6. 更新员工
export const updateStaff = async (id: string, data: any): Promise<ApiResponse<any>> => {
    if (USE_MOCK) return mockUpdateStaff(id, data);

    const { department, avatar, ...cleanData } = data;
    if (avatar) cleanData.avatar_url = avatar;

    const { data: updatedData, error } = await supabase
        .from('staffs')
        .update(cleanData)
        .eq('id', id)
        .select()
        .single();

    if (error) return { code: 500, message: error.message, data: null };
    return { code: 200, message: '更新成功', data: updatedData };
};

// 7. 删除员工
export const deleteStaff = async (id: string): Promise<ApiResponse> => {
    if (USE_MOCK) return mockDeleteStaff(id);
    const { error } = await supabase.from('staffs').delete().eq('id', id);
    if (error) return { code: 500, message: error.message, data: null };
    return { code: 200, message: '删除成功', data: null };
};


// --- 插入以下代码到 api/settings.ts ---

// 创建角色
export const createRole = async (data: Partial<RoleConfig>): Promise<ApiResponse<RoleConfig>> => {
    if (USE_MOCK) return mockCreateRole(data);

    const { permissions, ...roleData } = data;

    const { data: newRole, error } = await supabase
        .from('roles')
        .insert([roleData])
        .select()
        .single();

    if (error) return { code: 500, message: error.message, data: null as any };

    // 如果创建角色时带了权限，关联到中间表
    if (permissions && permissions.length > 0) {
        await updateRolePermissions(newRole.id, permissions);
    }

    return { code: 200, message: '创建成功', data: { ...newRole, permissions: permissions || [] } as RoleConfig };
};

// 更新角色
export const updateRole = async (id: string, data: Partial<RoleConfig>): Promise<ApiResponse<RoleConfig>> => {
    if (USE_MOCK) return mockUpdateRole(id, data);

    const { permissions, ...roleData } = data;

    const { data: updatedRole, error } = await supabase
        .from('roles')
        .update(roleData)
        .eq('id', id)
        .select()
        .single();

    if (error) return { code: 500, message: error.message, data: null as any };

    return { code: 200, message: '更新成功', data: { ...updatedRole, permissions: permissions || [] } as RoleConfig };
};

// 删除角色
export const deleteRole = async (id: string): Promise<ApiResponse> => {
    if (USE_MOCK) return mockDeleteRole(id);

    const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', id);

    if (error) return { code: 500, message: error.message, data: null };

    return { code: 200, message: '删除成功', data: null };
};

// ------------------------------------