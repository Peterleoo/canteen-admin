import { supabase } from '../utils/supabase';
import type { Canteen, ApiResponse } from '../types/index';
import {
    mockGetCanteens,
    mockGetCanteenDetail,
    mockUpdateCanteen,
    mockUpdateCanteenStatus,
    mockCreateCanteen,
    mockDeleteCanteen
} from './mock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// 获取所有食堂
export const getCanteens = async (): Promise<ApiResponse<Canteen[]>> => {
    if (USE_MOCK) {
        return mockGetCanteens();
    }

    const { data, error } = await supabase
        .from('canteens')
        .select('*')
        .order('created_at', { ascending: false });

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
