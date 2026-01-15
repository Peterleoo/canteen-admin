import { supabase } from '../utils/supabase';
import type { Canteen, ApiResponse } from '../types/index';
import { getUserAccessibleCanteenIds } from '../utils/permissionFilter';
import {
    mockGetCanteens,
    mockGetCanteenDetail,
    mockUpdateCanteen,
    mockUpdateCanteenStatus,
    mockCreateCanteen,
    mockDeleteCanteen
} from './mock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// 获取所有食堂（根据用户部门权限过滤）
export const getCanteens = async (userId?: string): Promise<ApiResponse<Canteen[]>> => {
    if (USE_MOCK) {
        return mockGetCanteens();
    }

    let query = supabase
        .from('canteens')
        .select('*')
        .order('created_at', { ascending: false });

    // 如果提供了 userId，应用权限过滤
    if (userId) {
        const accessibleCanteenIds = await getUserAccessibleCanteenIds(userId);

        // null 表示超级管理员，可访问所有食堂
        if (accessibleCanteenIds !== null) {
            if (accessibleCanteenIds.length > 0) {
                query = query.in('id', accessibleCanteenIds);
            } else {
                // 无权限访问任何食堂，返回空数组
                return { code: 200, message: '获取成功', data: [] };
            }
        }
    }

    const { data, error } = await query;

    if (error) {
        return { code: 500, message: error.message, data: [] };
    }

    return { code: 200, message: '获取成功', data: data as Canteen[] };
};

// 获取食堂详情
export const getCanteenDetail = async (id: string): Promise<ApiResponse<Canteen>> => {
    if (USE_MOCK) {
        return mockGetCanteenDetail(id);
    }

    const { data, error } = await supabase
        .from('canteens')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        return { code: 500, message: error.message, data: null as any };
    }

    return { code: 200, message: '获取成功', data: data as Canteen };
};

// 更新食堂信息
export const updateCanteen = async (id: string, data: Partial<Canteen>): Promise<ApiResponse<Canteen>> => {
    if (USE_MOCK) {
        return mockUpdateCanteen(id, data);
    }

    const { data: updatedData, error } = await supabase
        .from('canteens')
        .update(data)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return { code: 500, message: error.message, data: null as any };
    }

    return { code: 200, message: '更新成功', data: updatedData as Canteen };
};

// 更新食堂状态
export const updateCanteenStatus = async (id: string, status: 'OPEN' | 'CLOSED' | 'BUSY'): Promise<ApiResponse<Canteen>> => {
    if (USE_MOCK) {
        return mockUpdateCanteenStatus(id, status);
    }
    return updateCanteen(id, { status });
};

// 创建食堂
export const createCanteen = async (data: Partial<Canteen>): Promise<ApiResponse<Canteen>> => {
    if (USE_MOCK) {
        return mockCreateCanteen(data);
    }

    const { data: newData, error } = await supabase
        .from('canteens')
        .insert([data])
        .select()
        .single();

    if (error) {
        return { code: 500, message: error.message, data: null as any };
    }

    return { code: 200, message: '创建成功', data: newData as Canteen };
};

// 删除食堂
export const deleteCanteen = async (id: string): Promise<ApiResponse> => {
    if (USE_MOCK) {
        return mockDeleteCanteen(id);
    }

    const { error } = await supabase
        .from('canteens')
        .delete()
        .eq('id', id);

    if (error) {
        return { code: 500, message: error.message, data: null };
    }

    return { code: 200, message: '删除成功', data: null };
};
/**
 * 切换配送服务开关
 */
export const toggleDeliveryService = async (id: string, active: boolean) => {
    return updateCanteen(id, { is_delivery_active: active });
};

/**
 * 批量更新配送费用配置
 */
export const updateDeliveryConfig = async (
    id: string,
    config: {
        delivery_fee: number;
        min_delivery_amount: number;
        free_delivery_threshold: number;
    }
) => {
    return updateCanteen(id, config);
};
