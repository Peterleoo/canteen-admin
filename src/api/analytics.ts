import request from '../utils/request';
import type { ApiResponse } from '../types/index';
import {
    mockGetOverviewStats,
    mockGetRevenueTrend,
    mockGetOrderDistribution,
    mockGetProductRanking
} from './mock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// 经营概览
export const getOverviewStats = () => {
    if (USE_MOCK) {
        return mockGetOverviewStats() as Promise<ApiResponse<any>>;
    }
    return request.get<any, ApiResponse<any>>('/analytics/overview');
};

// 营收趋势
export const getRevenueTrend = (days: number = 7) => {
    if (USE_MOCK) {
        return mockGetRevenueTrend(days) as Promise<ApiResponse<any[]>>;
    }
    return request.get<any, ApiResponse<any[]>>('/analytics/trend', { params: { days } });
};

// 订单时段分布
export const getOrderDistribution = () => {
    if (USE_MOCK) {
        return mockGetOrderDistribution() as Promise<ApiResponse<any[]>>;
    }
    return request.get<any, ApiResponse<any[]>>('/analytics/distribution');
};

// 商品销售排行
export const getProductRanking = () => {
    if (USE_MOCK) {
        return mockGetProductRanking() as Promise<ApiResponse<any[]>>;
    }
    return request.get<any, ApiResponse<any[]>>('/analytics/ranking');
};
