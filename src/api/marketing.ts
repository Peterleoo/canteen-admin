import request from '../utils/request';
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
export const getCoupons = () => {
    if (USE_MOCK) {
        return mockGetCoupons() as Promise<ApiResponse<Coupon[]>>;
    }
    return request.get<any, ApiResponse<Coupon[]>>('/marketing/coupons');
};

// 创建优惠券
export const createCoupon = (data: Partial<Coupon>) => {
    if (USE_MOCK) {
        return mockCreateCoupon(data) as Promise<ApiResponse<Coupon>>;
    }
    return request.post<any, ApiResponse<Coupon>>('/marketing/coupons', data);
};

// 更新优惠券
export const updateCoupon = (id: string, data: Partial<Coupon>) => {
    if (USE_MOCK) {
        return mockUpdateCoupon(id, data) as Promise<ApiResponse<Coupon>>;
    }
    return request.put<any, ApiResponse<Coupon>>(`/marketing/coupons/${id}`, data);
};

// 删除优惠券
export const deleteCoupon = (id: string) => {
    if (USE_MOCK) {
        return mockDeleteCoupon(id) as Promise<ApiResponse<any>>;
    }
    return request.delete<any, ApiResponse<any>>(`/marketing/coupons/${id}`);
};

// 获取促销活动/横幅
export const getPromotions = () => {
    if (USE_MOCK) {
        return mockGetPromotions() as Promise<ApiResponse<Promotion[]>>;
    }
    return request.get<any, ApiResponse<Promotion[]>>('/marketing/promotions');
};

// 更新促销活动内容
export const updatePromotion = (id: string, data: Partial<Promotion>) => {
    if (USE_MOCK) {
        return mockUpdatePromotion(id, data) as Promise<ApiResponse<Promotion>>;
    }
    return request.put<any, ApiResponse<Promotion>>(`/marketing/promotions/${id}`, data);
};
