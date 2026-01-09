import { supabase } from '../utils/supabase';// 1. 引入 supabase 客户端
import type { User, ApiResponse, PaginationResponse } from '../types/index';
import {
    mockGetUsers,
    mockGetUserDetail,
    mockUpdateUserStatus,
    type UserQueryParams,
} from './mock';

// 只有在环境变量明确设为 'false' 时才禁用 Mock
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// --- 工具函数：统一格式化 Supabase 的返回结果 ---
const wrapResponse = <T>(data: T | null, error: any): ApiResponse<T> => {
    if (error) {
        return { code: 500, message: error.message, data: null as any };
    }
    return { code: 200, message: 'success', data: data as T };
};

// 1. 获取用户列表
export const getUsers = async (params: UserQueryParams): Promise<ApiResponse<PaginationResponse<User>>> => {
    if (USE_MOCK) {
        return mockGetUsers(params) as Promise<ApiResponse<PaginationResponse<User>>>;
    }

    const { page = 1, pageSize = 10, keyword = '' } = params;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase.from('profiles').select('*', { count: 'exact' });

    // 如果有关键词，搜索用户名或邮箱
    if (keyword) {
        query = query.or(`username.ilike.%${keyword}%,email.ilike.%${keyword}%`);
    }

    const { data, error, count } = await query
        .range(from, to)
        .order('created_at', { ascending: false });

    return wrapResponse({
        data: (data || []) as User[],
        total: count || 0,
        page,
        pageSize
    }, error);
};

// 2. 获取用户详情
export const getUserDetail = async (id: string): Promise<ApiResponse<User & { addresses: any[] }>> => {
    if (USE_MOCK) {
        return mockGetUserDetail(id) as Promise<ApiResponse<User & { addresses: any[] }>>;
    }

    // 假设地址信息存储在 user_addresses 表中，通过外键关联
    const { data, error } = await supabase
        .from('profiles')
        .select('*, addresses:user_addresses(*)')
        .eq('id', id)
        .single();

    return wrapResponse(data, error);
};

// 3. 更新用户状态
export const updateUserStatus = async (id: string, status: 'ACTIVE' | 'INACTIVE' | 'BANNED'): Promise<ApiResponse<User>> => {
    if (USE_MOCK) {
        return mockUpdateUserStatus(id, status) as Promise<ApiResponse<User>>;
    }

    const { data, error } = await supabase
        .from('profiles')
        .update({ status: status.toLowerCase() }) // 确保数据库字段值大小写一致
        .eq('id', id)
        .select()
        .single();

    return wrapResponse(data, error);
};