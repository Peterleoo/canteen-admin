import { supabase } from '../utils/supabase';
import type { ApiResponse } from '../types/index';
import { getUserAccessibleCanteenIds } from '../utils/permissionFilter';
import {
    mockGetOverviewStats,
    mockGetRevenueTrend,
    mockGetOrderDistribution,
    mockGetProductRanking
} from './mock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// 经营概览（支持权限过滤）
export const getOverviewStats = async (userId?: string): Promise<ApiResponse<any>> => {
    if (USE_MOCK) {
        return mockGetOverviewStats();
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();
    
    // 计算昨日日期
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString();

    // 构建订单查询函数
    const buildOrderQuery = (dateStr: string) => {
        let query = supabase
            .from('orders')
            .select('total')
            .gte('created_at', dateStr)
            .lt('created_at', dateStr === todayStr ? new Date().toISOString() : todayStr);
        
        // 权限过滤
        if (userId) {
            // 权限过滤逻辑会在实际实现时添加
        }
        
        return query;
    };

    // 构建用户查询函数
    const buildUserQuery = (dateStr: string) => {
        return supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', dateStr)
            .lt('created_at', dateStr === todayStr ? new Date().toISOString() : todayStr);
    };

    try {
        // 并行获取今日和昨日的订单数据
        const [todayOrdersRes, yesterdayOrdersRes, todayUsersRes, yesterdayUsersRes] = await Promise.all([
            buildOrderQuery(todayStr),
            buildOrderQuery(yesterdayStr),
            buildUserQuery(todayStr),
            buildUserQuery(yesterdayStr)
        ]);

        // 检查错误
        if (todayOrdersRes.error) throw todayOrdersRes.error;
        if (yesterdayOrdersRes.error) throw yesterdayOrdersRes.error;
        if (todayUsersRes.error) throw todayUsersRes.error;
        if (yesterdayUsersRes.error) throw yesterdayUsersRes.error;

        // 计算今日数据
        const todayRevenue = todayOrdersRes.data.reduce((acc, curr) => acc + Number(curr.total), 0);
        const todayOrderCount = todayOrdersRes.data.length;
        const todayUsers = todayUsersRes.count || 0;
        const todayAvgOrderValue = todayOrderCount > 0 ? todayRevenue / todayOrderCount : 0;

        // 计算昨日数据
        const yesterdayRevenue = yesterdayOrdersRes.data.reduce((acc, curr) => acc + Number(curr.total), 0);
        const yesterdayOrderCount = yesterdayOrdersRes.data.length;
        const yesterdayUsers = yesterdayUsersRes.count || 0;
        const yesterdayAvgOrderValue = yesterdayOrderCount > 0 ? yesterdayRevenue / yesterdayOrderCount : 0;

        // 计算环比值（保留一位小数）
        const calculateChange = (current: number, previous: number): number => {
            if (previous === 0) return 0;
            return Math.round(((current - previous) / previous) * 1000) / 10;
        };

        const revenueChange = calculateChange(todayRevenue, yesterdayRevenue);
        const orderChange = calculateChange(todayOrderCount, yesterdayOrderCount);
        const userChange = calculateChange(todayUsers, yesterdayUsers);
        const avgChange = calculateChange(todayAvgOrderValue, yesterdayAvgOrderValue);

        return {
            code: 200,
            message: '获取成功',
            data: {
                todayRevenue,
                todayOrders: todayOrderCount,
                todayUsers,
                avgOrderValue: todayAvgOrderValue,
                revenueChange,
                orderChange,
                userChange,
                avgChange
            }
        };
    } catch (error) {
        console.error('获取经营概览失败:', error);
        return { code: 500, message: '获取经营概览失败', data: null };
    }
};

// 营收趋势（支持权限过滤）
export const getRevenueTrend = async (days: number = 7, userId?: string): Promise<ApiResponse<any[]>> => {
    if (USE_MOCK) {
        return mockGetRevenueTrend(days);
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let query = supabase
        .from('orders')
        .select('total, created_at')
        .gte('created_at', startDate.toISOString());

    // 权限过滤
    if (userId) {
        const accessibleCanteenIds = await getUserAccessibleCanteenIds(userId);
        if (accessibleCanteenIds !== null && accessibleCanteenIds.length > 0) {
            query = query.in('canteen_id', accessibleCanteenIds);
        } else if (accessibleCanteenIds && accessibleCanteenIds.length === 0) {
            return { code: 200, message: '获取成功', data: [] };
        }
    }

    const { data, error } = await query;

    if (error) return { code: 500, message: error.message, data: [] };

    // 按日期分组，计算每天的营收和订单数
    const groups: { [key: string]: { revenue: number; orders: number } } = {};
    data.forEach((order: any) => {
        const date = order.created_at.split('T')[0];
        if (!groups[date]) {
            groups[date] = { revenue: 0, orders: 0 };
        }
        groups[date].revenue += Number(order.total);
        groups[date].orders++;
    });

    const trend = Object.entries(groups).map(([date, value]) => ({
        date,
        revenue: value.revenue,
        orders: value.orders
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
        hour: `${index}:00`,
        orders: count
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
        .select('name, sales, price')
        .order('sales', { ascending: false })
        .limit(5);

    if (error) return { code: 500, message: error.message, data: [] };

    const ranking = data.map(p => ({
        name: p.name,
        sales: p.sales,
        revenue: p.sales * p.price,
        icon: '🍱' // 默认图标，可以根据商品类型动态设置
    }));

    return { code: 200, message: '获取成功', data: ranking };
};
