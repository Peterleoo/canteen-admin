import { supabase } from '../utils/supabase';
import type { ApiResponse, Coupon, Promotion } from '../types/index';
import {
    mockGetCoupons,
    mockCreateCoupon,
    mockUpdateCoupon,
    mockDeleteCoupon,
    mockGetPromotions,
    mockUpdatePromotion
} from './mock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// 获取优惠券列表
export const getCoupons = async (): Promise<ApiResponse<Coupon[]>> => {
    if (USE_MOCK) {
        return mockGetCoupons();
    }

    const { data, error } = await supabase
        .from('coupons')
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
        .from('coupons')
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
        .from('coupons')
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
        .from('coupons')
        .delete()
        .eq('id', id);

    if (error) {
        return { code: 500, message: error.message, data: null };
    }

    return { code: 200, message: '删除成功', data: null };
};

// 获取促销活动/横幅
export const getPromotions = async (): Promise<ApiResponse<Promotion[]>> => {
    if (USE_MOCK) {
        return mockGetPromotions();
    }

    const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('sort_order', { ascending: true });

    if (error) {
        return { code: 500, message: error.message, data: [] };
    }

    return { code: 200, message: '获取成功', data: data as Promotion[] };
};

// 更新促销活动内容
export const updatePromotion = async (id: string, data: Partial<Promotion>): Promise<ApiResponse<Promotion>> => {
    if (USE_MOCK) {
        return mockUpdatePromotion(id, data);
    }

    const { data: updatedData, error } = await supabase
        .from('promotions')
        .update(data)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return { code: 500, message: error.message, data: null as any };
    }

    return { code: 200, message: '更新成功', data: updatedData as Promotion };
};
