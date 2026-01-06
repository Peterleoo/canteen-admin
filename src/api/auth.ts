import request from '../utils/request';
import type { LoginResponse, ApiResponse } from '../types/index';
import { mockLogin, mockGetCurrentUser, mockLogout } from './mock';

export interface LoginParams {
    username: string;
    password: string;
}

// 是否使用 Mock 数据
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// 登录
export const login = (data: LoginParams) => {
    if (USE_MOCK) {
        return mockLogin(data.username, data.password) as Promise<ApiResponse<LoginResponse>>;
    }
    return request.post<any, ApiResponse<LoginResponse>>('/auth/login', data);
};

// 登出
export const logout = () => {
    if (USE_MOCK) {
        return mockLogout() as Promise<ApiResponse>;
    }
    return request.post<any, ApiResponse>('/auth/logout');
};

// 获取当前用户信息
export const getCurrentUser = () => {
    if (USE_MOCK) {
        return mockGetCurrentUser() as Promise<ApiResponse>;
    }
    return request.get<any, ApiResponse>('/auth/current');
};
