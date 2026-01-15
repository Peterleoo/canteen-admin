import { supabase } from '../utils/supabase';
import type { Department, Canteen, ApiResponse } from '../types/index';
import {
    mockGetDepartments,
    mockGetDepartmentDetail,
    mockCreateDepartment,
    mockUpdateDepartment,
    mockDeleteDepartment
} from './mock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// ======================== 部门 CRUD ========================

/**
 * 获取部门列表（包含关联的食堂信息）
 */
export const getDepartments = async (): Promise<ApiResponse<Department[]>> => {
    if (USE_MOCK) {
        return mockGetDepartments();
    }

    const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        return { code: 500, message: error.message, data: [] };
    }

    // 为每个部门查询关联的食堂
    const departmentsWithCanteens = await Promise.all(
        (data || []).map(async (dept) => {
            const { data: relations } = await supabase
                .from('department_canteens')
                .select('canteen_id')
                .eq('department_id', dept.id);

            return {
                ...dept,
                canteen_ids: relations?.map(r => r.canteen_id) || []
            } as Department;
        })
    );

    return { code: 200, message: '获取成功', data: departmentsWithCanteens };
};

/**
 * 获取部门详情（包含关联的食堂对象）
 */
export const getDepartmentDetail = async (id: string): Promise<ApiResponse<Department & { canteens: Canteen[] }>> => {
    if (USE_MOCK) {
        return mockGetDepartmentDetail(id) as any;
    }

    const { data: dept, error: deptError } = await supabase
        .from('departments')
        .select('*')
        .eq('id', id)
        .single();

    if (deptError || !dept) {
        return { code: 500, message: deptError?.message || '部门不存在', data: null as any };
    }

    // 查询关联的食堂（包含完整信息）
    const { data: relations } = await supabase
        .from('department_canteens')
        .select('canteen_id')
        .eq('department_id', id);

    const canteenIds = relations?.map(r => r.canteen_id) || [];
    let canteens: Canteen[] = [];

    if (canteenIds.length > 0) {
        const { data: canteenData } = await supabase
            .from('canteens')
            .select('*')
            .in('id', canteenIds);
        canteens = canteenData || [];
    }

    return {
        code: 200,
        message: '获取成功',
        data: {
            ...dept,
            canteen_ids: canteenIds,
            canteens
        } as any
    };
};

/**
 * 创建部门
 */
export const createDepartment = async (data: Partial<Department>): Promise<ApiResponse<Department>> => {
    if (USE_MOCK) {
        return mockCreateDepartment(data);
    }

    const { data: newDept, error } = await supabase
        .from('departments')
        .insert([{
            name: data.name,
            description: data.description,
            status: data.status || 'ACTIVE'
        }])
        .select()
        .single();

    if (error) {
        return { code: 500, message: error.message, data: null as any };
    }

    return { code: 200, message: '创建成功', data: newDept as Department };
};

/**
 * 更新部门信息
 */
export const updateDepartment = async (id: string, data: Partial<Department>): Promise<ApiResponse<Department>> => {
    if (USE_MOCK) {
        return mockUpdateDepartment(id, data);
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    updateData.updated_at = new Date().toISOString();

    const { data: updatedDept, error } = await supabase
        .from('departments')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return { code: 500, message: error.message, data: null as any };
    }

    return { code: 200, message: '更新成功', data: updatedDept as Department };
};

/**
 * 删除部门（需检查是否有员工关联）
 */
export const deleteDepartment = async (id: string): Promise<ApiResponse> => {
    if (USE_MOCK) {
        return mockDeleteDepartment(id);
    }

    // 1. 检查是否有员工关联
    const { count, error: countError } = await supabase
        .from('staffs')
        .select('*', { count: 'exact', head: true })
        .eq('department_id', id);

    if (countError) {
        return { code: 500, message: countError.message, data: null };
    }

    if (count && count > 0) {
        return {
            code: 400,
            message: `该部门下还有 ${count} 名员工，无法删除。请先将员工转移到其他部门。`,
            data: null
        };
    }

    // 2. 删除部门（外键级联会自动删除 department_canteens 中的关联记录）
    const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', id);

    if (error) {
        return { code: 500, message: error.message, data: null };
    }

    return { code: 200, message: '删除成功', data: null };
};

// ======================== 部门与食堂关联管理 ========================

/**
 * 获取部门关联的食堂 ID 列表
 */
export const getDepartmentCanteenIds = async (departmentId: string): Promise<ApiResponse<string[]>> => {
    const { data, error } = await supabase
        .from('department_canteens')
        .select('canteen_id')
        .eq('department_id', departmentId);

    if (error) {
        return { code: 500, message: error.message, data: [] };
    }

    return { code: 200, message: '获取成功', data: data?.map(r => r.canteen_id) || [] };
};

/**
 * 更新部门的食堂关联
 * @param departmentId 部门 ID
 * @param canteenIds 新的食堂 ID 列表
 */
export const updateDepartmentCanteens = async (
    departmentId: string,
    canteenIds: string[]
): Promise<ApiResponse> => {
    if (USE_MOCK) {
        return { code: 200, message: '更新成功（Mock）', data: null };
    }

    try {
        // 1. 删除旧的关联
        const { error: deleteError } = await supabase
            .from('department_canteens')
            .delete()
            .eq('department_id', departmentId);

        if (deleteError) {
            return { code: 500, message: deleteError.message, data: null };
        }

        // 2. 如果有新的关联，批量插入
        if (canteenIds.length > 0) {
            const newRelations = canteenIds.map(canteenId => ({
                department_id: departmentId,
                canteen_id: canteenId
            }));

            const { error: insertError } = await supabase
                .from('department_canteens')
                .insert(newRelations);

            if (insertError) {
                return { code: 500, message: insertError.message, data: null };
            }
        }

        return { code: 200, message: '更新成功', data: null };
    } catch (error: any) {
        return { code: 500, message: error.message, data: null };
    }
};
