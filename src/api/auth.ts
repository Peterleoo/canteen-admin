import { supabase } from '../utils/supabase';
import type { LoginResponse, ApiResponse, AdminUser } from '../types/index';
import { mockLogin, mockGetCurrentUser, mockLogout } from './mock';

export interface LoginParams {
    email: string;
    username?: string; // 兼容 mock
    password: string;
}

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// 登录
export const login = async (data: LoginParams): Promise<ApiResponse<LoginResponse>> => {
    if (USE_MOCK) {
        return mockLogin(data.username || data.email, data.password) as Promise<ApiResponse<LoginResponse>>;
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
    });

    if (authError) {
        return { code: 401, message: authError.message, data: null as any };
    }

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

    if (profileError) {
        return { code: 500, message: profileError.message, data: null as any };
    }

    return {
        code: 200,
        message: '登录成功',
        data: {
            token: authData.session.access_token,
            user: {
                ...profile,
                role: profile.role as any,
                status: profile.status as any,
            } as AdminUser
        }
    };
};

// 登出
export const logout = async (): Promise<ApiResponse> => {
    if (USE_MOCK) {
        return mockLogout() as Promise<ApiResponse>;
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
        return { code: 500, message: error.message, data: null };
    }
    return { code: 200, message: '退出成功', data: null };
};

// 获取当前用户信息
export const getCurrentUser = async (): Promise<ApiResponse<AdminUser>> => {
    if (USE_MOCK) {
        return mockGetCurrentUser() as Promise<ApiResponse<AdminUser>>;
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { code: 401, message: '未登录', data: null as any };
    }

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (profileError) {
        return { code: 500, message: profileError.message, data: null as any };
    }

    return {
        code: 200,
        message: '获取成功',
        data: {
            ...profile,
            role: profile.role as any,
            status: profile.status as any,
        } as AdminUser
    };
};
