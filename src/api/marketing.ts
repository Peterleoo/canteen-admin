import { supabase } from '../utils/supabase';
import type { ApiResponse, Coupon, MarketingBanner, UserCoupon } from '../types/index';
import {
    mockGetCoupons,
    mockCreateCoupon,
    mockUpdateCoupon,
    mockDeleteCoupon,
    mockGetBanners,
    mockUpdateBanner,
    mockCreateBanner,
    mockDeleteBanner,
    mockGetUserCouponsForAdmin
} from './mock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// 获取优惠券列表
export const getCoupons = async (): Promise<ApiResponse<Coupon[]>> => {
    if (USE_MOCK) {
        return mockGetCoupons();
    }

    const { data, error } = await supabase
        .from('marketing_coupons')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        return { code: 500, message: error.message, data: [] };
    }

    return { code: 200, message: '获取成功', data: data as Coupon[] };
};

// 创建优惠券
export const createCoupon = async (data: Partial<Coupon>): Promise<ApiResponse<Coupon>> => {
    if (USE_MOCK) {
        return mockCreateCoupon(data);
    }

    const { data: newData, error } = await supabase
        .from('marketing_coupons')
        .insert([data])
        .select()
        .single();

    if (error) {
        return { code: 500, message: error.message, data: null as any };
    }

    return { code: 200, message: '创建成功', data: newData as Coupon };
};

// 更新优惠券
export const updateCoupon = async (id: string, data: Partial<Coupon>): Promise<ApiResponse<Coupon>> => {
    if (USE_MOCK) {
        return mockUpdateCoupon(id, data);
    }

    const { data: updatedData, error } = await supabase
        .from('marketing_coupons')
        .update(data)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return { code: 500, message: error.message, data: null as any };
    }

    return { code: 200, message: '更新成功', data: updatedData as Coupon };
};

// 删除优惠券
export const deleteCoupon = async (id: string): Promise<ApiResponse> => {
    if (USE_MOCK) {
        return mockDeleteCoupon(id);
    }

    const { error } = await supabase
        .from('marketing_coupons')
        .delete()
        .eq('id', id);

    if (error) {
        return { code: 500, message: error.message, data: null };
    }

    return { code: 200, message: '删除成功', data: null };
};

// 获取海报列表
export const getMarketingBanners = async (): Promise<ApiResponse<MarketingBanner[]>> => {
    if (USE_MOCK) {
        return mockGetBanners();
    }

    const { data, error } = await supabase
        .from('marketing_banners')
        .select('*')
        .order('sort_order', { ascending: true });

    if (error) {
        return { code: 500, message: error.message, data: [] };
    }

    return { code: 200, message: '获取成功', data: data as MarketingBanner[] };
};

// 兼容旧版 Promotions 命名
export const getPromotions = getMarketingBanners;

// 更新海报内容
export const updateMarketingBanner = async (id: string, data: Partial<MarketingBanner>): Promise<ApiResponse<MarketingBanner>> => {
    if (USE_MOCK) {
        return mockUpdateBanner(id, data);
    }

    const { data: updatedData, error } = await supabase
        .from('marketing_banners')
        .update(data)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return { code: 500, message: error.message, data: null as any };
    }

    return { code: 200, message: '更新成功', data: updatedData as MarketingBanner };
};

export const updatePromotion = updateMarketingBanner;

// 创建海报
export const createMarketingBanner = async (data: Partial<MarketingBanner>): Promise<ApiResponse<MarketingBanner>> => {
    if (USE_MOCK) {
        return mockCreateBanner(data);
    }

    const { data: newData, error } = await supabase
        .from('marketing_banners')
        .insert([data])
        .select()
        .single();

    if (error) {
        return { code: 500, message: error.message, data: null as any };
    }

    return { code: 200, message: '创建成功', data: newData as MarketingBanner };
};

export const createPromotion = createMarketingBanner;

// 删除海报
export const deleteMarketingBanner = async (id: string): Promise<ApiResponse> => {
    if (USE_MOCK) {
        return mockDeleteBanner(id);
    }

    const { error } = await supabase
        .from('marketing_banners')
        .delete()
        .eq('id', id);

    if (error) {
        return { code: 500, message: error.message, data: null };
    }

    return { code: 200, message: '删除成功', data: null };
};

export const deletePromotion = deleteMarketingBanner;

// 获取优惠券领用记录 (管理员)
export const getUserCouponsForAdmin = async (couponId?: string, userId?: string): Promise<ApiResponse<UserCoupon[]>> => {
    if (USE_MOCK) {
        return mockGetUserCouponsForAdmin(couponId, userId);
    }

    let query = supabase
        .from('user_coupons')
        .select(`
            *,
            user:users!user_id(*),
            coupon:marketing_coupons!coupon_id(*)
        `)
        .order('received_at', { ascending: false });

    if (couponId) query = query.eq('coupon_id', couponId);
    if (userId) query = query.eq('user_id', userId);

    const { data, error } = await query;

    if (error) {
        return { code: 500, message: error.message, data: [] };
    }

    return { code: 200, message: '获取成功', data: data as any[] };
};
