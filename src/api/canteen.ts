import request from '../utils/request';
import type { Canteen, ApiResponse } from '../types/index';
import {
    mockGetCanteens,
    mockGetCanteenDetail,
    mockUpdateCanteen,
    mockUpdateCanteenStatus,
    mockCreateCanteen,
    mockDeleteCanteen,
} from './mock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// 获取食堂列表
export const getCanteens = () => {
    if (USE_MOCK) {
        return mockGetCanteens() as Promise<ApiResponse<Canteen[]>>;
    }
    return request.get<any, ApiResponse<Canteen[]>>('/canteens');
};

// 获取食堂详情
export const getCanteenDetail = (id: string) => {
    if (USE_MOCK) {
        return mockGetCanteenDetail(id) as Promise<ApiResponse<Canteen>>;
    }
    return request.get<any, ApiResponse<Canteen>>(`/canteens/${id}`);
};

// 更新食堂信息
export const updateCanteen = (id: string, data: Partial<Canteen>) => {
    if (USE_MOCK) {
        return mockUpdateCanteen(id, data) as Promise<ApiResponse<Canteen>>;
    }
    return request.put<any, ApiResponse<Canteen>>(`/canteens/${id}`, data);
};

// 更新食堂状态
export const updateCanteenStatus = (id: string, status: 'OPEN' | 'CLOSED' | 'BUSY') => {
    if (USE_MOCK) {
        return mockUpdateCanteenStatus(id, status) as Promise<ApiResponse<Canteen>>;
    }
    return request.put<any, ApiResponse<Canteen>>(`/canteens/${id}/status`, { status });
};

// 新增食堂
export const createCanteen = (data: Partial<Canteen>) => {
    if (USE_MOCK) {
        return mockCreateCanteen(data) as Promise<ApiResponse<Canteen>>;
    }
    return request.post<any, ApiResponse<Canteen>>('/canteens', data);
};

// 删除食堂
export const deleteCanteen = (id: string) => {
    if (USE_MOCK) {
        return mockDeleteCanteen(id) as Promise<ApiResponse<any>>;
    }
    return request.delete<any, ApiResponse<any>>(`/canteens/${id}`);
};
