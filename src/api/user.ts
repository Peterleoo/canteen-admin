import request from '../utils/request';
import type { User, ApiResponse, PaginationResponse } from '../types/index';
import {
    mockGetUsers,
    mockGetUserDetail,
    mockUpdateUserStatus,
    type UserQueryParams,
} from './mock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// 获取用户列表
export const getUsers = (params: UserQueryParams) => {
    if (USE_MOCK) {
        return mockGetUsers(params) as Promise<ApiResponse<PaginationResponse<User>>>;
    }
    return request.get<any, ApiResponse<PaginationResponse<User>>>('/users', { params });
};

// 获取用户详情
export const getUserDetail = (id: string) => {
    if (USE_MOCK) {
        return mockGetUserDetail(id) as Promise<ApiResponse<User & { addresses: any[] }>>;
    }
    return request.get<any, ApiResponse<User & { addresses: any[] }>>(`/users/${id}`);
};

// 更新用户状态
export const updateUserStatus = (id: string, status: 'ACTIVE' | 'INACTIVE' | 'BANNED') => {
    if (USE_MOCK) {
        return mockUpdateUserStatus(id, status) as Promise<ApiResponse<User>>;
    }
    return request.put<any, ApiResponse<User>>(`/users/${id}/status`, { status });
};
