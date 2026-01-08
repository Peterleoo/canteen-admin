import { supabase } from '../utils/supabase';
import type { Order, OrderStatus, ApiResponse } from '../types/index';
import {
    mockGetOrders,
    mockGetOrderDetail,
    mockUpdateOrderStatus,
    mockBatchCancelOrders
} from './mock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// 获取订单列表
export const getOrders = async (params: {
    page: number;
    pageSize: number;
    status?: OrderStatus;
    keyword?: string;
}) => {
    if (USE_MOCK) {
        return mockGetOrders(params);
    }

    let query = supabase
        .from('orders')
        .select('*, canteens(*)', { count: 'exact' });

    if (params.status) {
        query = query.eq('status', params.status);
    }

    if (params.keyword) {
        query = query.or(`id.ilike.%${params.keyword}%,remark.ilike.%${params.keyword}%`);
    }

    const from = (params.page - 1) * params.pageSize;
    const to = from + params.pageSize - 1;

    const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) {
        return { code: 500, message: error.message, data: { data: [], total: 0 } };
    }

    return {
        code: 200,
        message: '获取成功',
        data: {
            data: data as any[],
            total: count || 0
        }
    };
};

// 获取详细订单
export const getOrderDetail = async (id: string): Promise<ApiResponse<Order>> => {
    if (USE_MOCK) {
        return mockGetOrderDetail(id);
    }

    const { data, error } = await supabase
        .from('orders')
        .select('*, canteens(*)')
        .eq('id', id)
        .single();

    if (error) {
        return { code: 500, message: error.message, data: null as any };
    }

    return { code: 200, message: '获取成功', data: data as any };
};

// 更新订单状态
export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<ApiResponse<Order>> => {
    if (USE_MOCK) {
        return mockUpdateOrderStatus(id, status);
    }

    const { data, error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return { code: 500, message: error.message, data: null as any };
    }

    return { code: 200, message: '状态更新成功', data: data as any };
};

// 批量取消订单
export const batchCancelOrders = async (ids: string[], reason: string): Promise<ApiResponse> => {
    if (USE_MOCK) {
        return mockBatchCancelOrders(ids, reason);
    }

    const { error } = await supabase
        .from('orders')
        .update({
            status: '已取消',
            cancel_reason: reason,
            updated_at: new Date().toISOString()
        })
        .in('id', ids);

    if (error) {
        return { code: 500, message: error.message, data: null };
    }

    return { code: 200, message: '批量取消成功', data: null };
};
