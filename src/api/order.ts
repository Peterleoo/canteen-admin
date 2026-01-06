import request from '../utils/request';
import type { Order, ApiResponse, PaginationResponse, OrderStatus } from '../types/index';
import {
    mockGetOrders,
    mockUpdateOrderStatus,
    type OrderQueryParams,
} from './mock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// 获取订单列表
export const getOrders = (params: OrderQueryParams) => {
    if (USE_MOCK) {
        return mockGetOrders(params) as Promise<ApiResponse<PaginationResponse<Order>>>;
    }
    return request.get<any, ApiResponse<PaginationResponse<Order>>>('/orders', { params });
};

// 更新订单状态
export const updateOrderStatus = (id: string, status: OrderStatus) => {
    if (USE_MOCK) {
        return mockUpdateOrderStatus(id, status) as Promise<ApiResponse<Order>>;
    }
    return request.put<any, ApiResponse<Order>>(`/orders/${id}/status`, { status });
};
