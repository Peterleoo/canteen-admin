import { supabase } from '../utils/supabase';
import type { Order, OrderStatusType, ApiResponse } from '../types/index';
import { getUserAccessibleCanteenIds } from '../utils/permissionFilter';
import {
    mockGetOrders,
    mockGetOrderDetail,
    mockUpdateOrderStatus,
    mockBatchCancelOrders
} from './mock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// 1. 获取订单列表（支持权限过滤）
export const getOrders = async (params: {
    page: number;
    pageSize: number;
    status?: OrderStatusType;
    keyword?: string;
    userId?: string;  // 用于权限过滤
}) => {
    if (USE_MOCK) return mockGetOrders(params);

    // 重点修改：添加 users(*) 获取用户信息
    let query = supabase
        .from('orders')
        .select('*, canteens(*), users(*), order_items(*)', { count: 'exact' });

    // 权限过滤：根据用户部门限制可查看的订单
    if (params.userId) {
        const accessibleCanteenIds = await getUserAccessibleCanteenIds(params.userId);
        if (accessibleCanteenIds !== null) {
            if (accessibleCanteenIds.length > 0) {
                query = query.in('canteen_id', accessibleCanteenIds);
            } else {
                // 无权限访问任何食堂的订单
                return { code: 200, message: '获取成功', data: { list: [], total: 0 } };
            }
        }
    }

    if (params.status) query = query.eq('status', params.status);

    if (params.keyword) {
        const isNum = /^\d+$/.test(params.keyword);
        if (isNum) {
            // 既然是查订单号，管理端通常是想精准查找
            // 我们可以只锁定 id 查询，不再关联 remark 以免类型冲突
            query = query.eq('id', parseInt(params.keyword));
        } else {
            // 非数字则查备注
            query = query.ilike('remark', `%${params.keyword}%`);
        }
    }

    const from = (params.page - 1) * params.pageSize;
    const to = from + params.pageSize - 1;

    const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) {
        return { code: 500, message: error.message, data: { list: [], total: 0 } };
    }

    return {
        code: 200,
        message: '获取成功',
        data: {
            list: data || [], // 建议统一叫 list，避免 data.data 这种写法
            total: count || 0
        }
    };
};

// 2. 获取详细订单
export const getOrderDetail = async (id: string): Promise<ApiResponse<Order>> => {
    if (USE_MOCK) return mockGetOrderDetail(id);

    // 重点修改：添加 order_items(*) 获取商品清单，users(*) 获取用户信息
    const { data, error } = await supabase
        .from('orders')
        .select('*, canteens(*), users(*), order_items(*)')
        .eq('id', id)
        .single();

    if (error) {
        return { code: 500, message: error.message, data: null as any };
    }

    return { code: 200, message: '获取成功', data: data as any };
};

// 更新订单状态
export const updateOrderStatus = async (id: string, status: OrderStatusType): Promise<ApiResponse<Order>> => {
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
