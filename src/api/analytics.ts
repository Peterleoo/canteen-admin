import { supabase } from '../utils/supabase';
import type { ApiResponse } from '../types/index';
import {
    mockGetOverviewStats,
    mockGetRevenueTrend,
    mockGetOrderDistribution,
    mockGetProductRanking
} from './mock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// 经营概览
export const getOverviewStats = async (): Promise<ApiResponse<any>> => {
    if (USE_MOCK) {
        return mockGetOverviewStats();
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();

    const { data: todayOrders, error: orderError } = await supabase
        .from('orders')
        .select('total')
        .gte('created_at', todayStr);

    if (orderError) return { code: 500, message: orderError.message, data: null };

    const todayRevenue = todayOrders.reduce((acc, curr) => acc + Number(curr.total), 0);
    const totalTodayOrders = todayOrders.length;

    const { count: todayUsers, error: userError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayStr);

    if (userError) return { code: 500, message: userError.message, data: null };

    const avgOrderValue = totalTodayOrders > 0 ? todayRevenue / totalTodayOrders : 0;

    return {
        code: 200,
        message: '获取成功',
        data: {
            todayRevenue,
            todayOrders: totalTodayOrders,
            todayUsers: todayUsers || 0,
            avgOrderValue,
            revenueChange: 12.5,
            ordersChange: 8.2,
            usersChange: -2.4
        }
    };
};

// 营收趋势
export const getRevenueTrend = async (days: number = 7): Promise<ApiResponse<any[]>> => {
    if (USE_MOCK) {
        return mockGetRevenueTrend(days);
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
        .from('orders')
        .select('total, created_at')
        .gte('created_at', startDate.toISOString());

    if (error) return { code: 500, message: error.message, data: [] };

    const groups = data.reduce((acc: any, curr: any) => {
        const date = curr.created_at.split('T')[0];
        acc[date] = (acc[date] || 0) + Number(curr.total);
        return acc;
    }, {});

    const trend = Object.entries(groups).map(([date, value]) => ({
        date,
        value
    })).sort((a, b) => a.date.localeCompare(b.date));

    return { code: 200, message: '获取成功', data: trend };
};

// 订单时段分布
export const getOrderDistribution = async (): Promise<ApiResponse<any[]>> => {
    if (USE_MOCK) {
        return mockGetOrderDistribution();
    }

    const { data, error } = await supabase
        .from('orders')
        .select('created_at');

    if (error) return { code: 500, message: error.message, data: [] };

    const hours = new Array(24).fill(0);
    data.forEach((order: any) => {
        const hour = new Date(order.created_at).getHours();
        hours[hour]++;
    });

    const distribution = hours.map((count, index) => ({
        time: `${index}:00`,
        value: count
    }));

    return { code: 200, message: '获取成功', data: distribution };
};

// 商品销售排行
export const getProductRanking = async (): Promise<ApiResponse<any[]>> => {
    if (USE_MOCK) {
        return mockGetProductRanking();
    }

    const { data, error } = await supabase
        .from('products')
        .select('name, sales')
        .order('sales', { ascending: false })
        .limit(5);

    if (error) return { code: 500, message: error.message, data: [] };

    const ranking = data.map(p => ({
        name: p.name,
        value: p.sales
    }));

    return { code: 200, message: '获取成功', data: ranking };
};
