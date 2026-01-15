import { supabase } from '../utils/supabase';
import type { LoginResponse, ApiResponse, AdminUser } from '../types/index';
import { mockLogin, mockGetCurrentUser, mockLogout } from './mock';
import { ROLE_PERMISSIONS } from '../utils/rbac';

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

    // 1. 获取用户基本信息
    let profile: any = null;
    try {
        const { data: profileData, error: profileError } = await supabase
                .from('staffs')
                .select('*')
                .eq('id', authData.user.id)
                .single();

        if (profileError) {
            // 如果没有找到profile记录，使用authData.user创建一个基础profile
            if (profileError.code === 'PGRST116') {
                console.warn('用户通过身份验证，但在staffs表中没有找到记录，创建基础profile');
                // 创建基础profile对象
                profile = {
                    id: authData.user.id,
                    username: authData.user.email?.split('@')[0] || 'user',
                    name: authData.user.email?.split('@')[0] || '用户',
                    email: authData.user.email,
                    role: 'VIEWER', // 默认角色
                    status: 'ACTIVE',
                    created_at: new Date().toISOString(),
                    role_id: null // 没有角色关联
                };
            } else {
                return { code: 500, message: profileError.message, data: null as any };
            }
        } else {
            profile = profileData;
        }
    } catch (error) {
        console.error('获取用户基本信息错误:', error);
        // 创建基础profile对象
        profile = {
            id: authData.user.id,
            username: authData.user.email?.split('@')[0] || 'user',
            name: authData.user.email?.split('@')[0] || '用户',
            email: authData.user.email,
            role: 'VIEWER', // 默认角色
            status: 'ACTIVE',
            created_at: new Date().toISOString(),
            role_id: null // 没有角色关联
        };
    }

    // 2. 获取用户角色的权限列表
    let permissionCodes: string[] = [];
    
    // 超级管理员直接拥有所有权限
    if (profile.role === 'SUPER_ADMIN') {
        permissionCodes = ['*'];
    }
    // 检查role_id是否存在且有效
    else if (profile.role_id) {
        try {
            const { data: permissions, error: permissionsError } = await supabase
                .from('role_permissions')
                .select('permissions(code)')
                .eq('role_id', profile.role_id)
                .returns<{ permissions: { code: string } }[]>();

            if (permissionsError) {
                return { code: 500, message: permissionsError.message, data: null as any };
            }

            // 提取权限代码列表，处理空结果情况
            if (permissions && permissions.length > 0) {
                permissionCodes = permissions.map(p => p.permissions.code);
            }
        } catch (error) {
            // 处理查询错误，比如当没有找到记录时
            console.error('获取权限列表错误:', error);
            // 继续执行，尝试使用role code获取权限
            permissionCodes = [];
        }
    } 
    // 如果role_id不存在，但role存在，尝试根据role code获取role_id
    else if (profile.role) {
        try {
            // 根据role code获取role_id
            const { data: role, error: roleError } = await supabase
                .from('roles')
                .select('id')
                .eq('code', profile.role)
                .single();

            if (roleError) {
                console.error('获取角色ID错误:', roleError);
            } else if (role) {
                // 使用获取到的role_id查询权限列表
                const { data: permissions, error: permissionsError } = await supabase
                    .from('role_permissions')
                    .select('permissions(code)')
                    .eq('role_id', role.id)
                    .returns<{ permissions: { code: string } }[]>();

                if (permissionsError) {
                    console.error('获取权限列表错误:', permissionsError);
                } else if (permissions && permissions.length > 0) {
                    permissionCodes = permissions.map(p => p.permissions.code);
                    console.log(`根据角色${profile.role}获取到权限列表:`, permissionCodes);
                } else {
                    console.warn(`角色${profile.role}没有配置权限`);
                    // 使用默认的权限配置
                    permissionCodes = ROLE_PERMISSIONS[profile.role as import('../types').Role] || [];
                }
            }
        } catch (error) {
            console.error('根据role code获取权限错误:', error);
            // 使用默认的权限配置
            permissionCodes = ROLE_PERMISSIONS[profile.role as import('../types').Role] || [];
        }
    }
    // 如果既没有role_id也没有role，使用默认的VIEWER权限
    else {
        console.warn('用户没有分配角色，使用默认的VIEWER权限');
        permissionCodes = ROLE_PERMISSIONS['VIEWER'] || [];
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
                permissions: permissionCodes
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

    // 获取用户基本信息
    let profile: any = null;
    try {
        const { data: profileData, error: profileError } = await supabase
            .from('staffs')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError) {
            // 如果没有找到profile记录，使用user创建一个基础profile
            if (profileError.code === 'PGRST116') {
                console.warn('用户通过身份验证，但在staffs表中没有找到记录，创建基础profile');
                // 创建基础profile对象
                profile = {
                    id: user.id,
                    username: user.email?.split('@')[0] || 'user',
                    name: user.email?.split('@')[0] || '用户',
                    email: user.email,
                    role: 'VIEWER', // 默认角色
                    status: 'ACTIVE',
                    created_at: new Date().toISOString(),
                    role_id: null // 没有角色关联
                };
            } else {
                return { code: 500, message: profileError.message, data: null as any };
            }
        } else {
            profile = profileData;
        }
    } catch (error) {
        console.error('获取用户基本信息错误:', error);
        // 创建基础profile对象
        profile = {
            id: user.id,
            username: user.email?.split('@')[0] || 'user',
            name: user.email?.split('@')[0] || '用户',
            email: user.email,
            role: 'VIEWER', // 默认角色
            status: 'ACTIVE',
            created_at: new Date().toISOString(),
            role_id: null // 没有角色关联
        };
    }

    // 获取用户角色的权限列表
    let permissionCodes: string[] = [];
    
    // 超级管理员直接拥有所有权限
    if (profile.role === 'SUPER_ADMIN') {
        permissionCodes = ['*'];
    }
    // 检查role_id是否存在且有效
    else if (profile.role_id) {
        try {
            const { data: permissions, error: permissionsError } = await supabase
                .from('role_permissions')
                .select('permissions(code)')
                .eq('role_id', profile.role_id)
                .returns<{ permissions: { code: string } }[]>();

            if (permissionsError) {
                return { code: 500, message: permissionsError.message, data: null as any };
            }

            // 提取权限代码列表，处理空结果情况
            if (permissions && permissions.length > 0) {
                permissionCodes = permissions.map(p => p.permissions.code);
            }
        } catch (error) {
            // 处理查询错误，比如当没有找到记录时
            console.error('获取权限列表错误:', error);
            // 继续执行，尝试使用role code获取权限
            permissionCodes = [];
        }
    } 
    // 如果role_id不存在，但role存在，尝试根据role code获取role_id
    else if (profile.role) {
        try {
            // 根据role code获取role_id
            const { data: role, error: roleError } = await supabase
                .from('roles')
                .select('id')
                .eq('code', profile.role)
                .single();

            if (roleError) {
                console.error('获取角色ID错误:', roleError);
            } else if (role) {
                // 使用获取到的role_id查询权限列表
                const { data: permissions, error: permissionsError } = await supabase
                    .from('role_permissions')
                    .select('permissions(code)')
                    .eq('role_id', role.id)
                    .returns<{ permissions: { code: string } }[]>();

                if (permissionsError) {
                    console.error('获取权限列表错误:', permissionsError);
                } else if (permissions && permissions.length > 0) {
                    permissionCodes = permissions.map(p => p.permissions.code);
                    console.log(`根据角色${profile.role}获取到权限列表:`, permissionCodes);
                } else {
                    console.warn(`角色${profile.role}没有配置权限`);
                    // 使用默认的权限配置
            permissionCodes = ROLE_PERMISSIONS[profile.role as import('../types').Role] || [];
                }
            }
        } catch (error) {
            console.error('根据role code获取权限错误:', error);
            // 使用默认的权限配置
            permissionCodes = ROLE_PERMISSIONS[profile.role as import('../types').Role] || [];
        }
    }
    // 如果既没有role_id也没有role，使用默认的VIEWER权限
    else {
        console.warn('用户没有分配角色，使用默认的VIEWER权限');
        permissionCodes = ROLE_PERMISSIONS['VIEWER'] || [];
    }

    return {
        code: 200,
        message: '获取成功',
        data: {
            ...profile,
            role: profile.role as any,
            status: profile.status as any,
            permissions: permissionCodes
        } as AdminUser
    };
};
