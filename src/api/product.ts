import { supabase } from '../utils/supabase';
import type { Product, Category, ApiResponse, ProductStatus } from '../types/index';
import {
    mockGetProducts,
    mockGetProductDetail,
    mockCreateProduct,
    mockUpdateProduct,
    mockDeleteProduct,
    mockBatchUpdateProductStatus
} from './mock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// 获取商品列表 (支持分页和筛选)
export const getProducts = async (params: {
    page: number;
    pageSize: number;
    keyword?: string;
    category?: Category;
    status?: ProductStatus;
}) => {
    if (USE_MOCK) {
        return mockGetProducts(params);
    }

    let query = supabase
        .from('products')
        .select('*', { count: 'exact' });

    if (params.keyword) {
        query = query.ilike('name', `%${params.keyword}%`);
    }
    if (params.category) {
        query = query.eq('category', params.category);
    }
    if (params.status) {
        query = query.eq('status', params.status);
    }

    const from = (params.page - 1) * params.pageSize;
    const to = from + params.pageSize - 1;

    const { data, error, count } = await query
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) {
        return { code: 500, message: error.message, data: { data: [], total: 0 } };
    }

    return {
        code: 200,
        message: '获取成功',
        data: {
            data: data as Product[],
            total: count || 0
        }
    };
};

// 获取商品详情
export const getProductDetail = async (id: string | number): Promise<ApiResponse<Product>> => {
    if (USE_MOCK) {
        return mockGetProductDetail(String(id));
    }

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        return { code: 500, message: error.message, data: null as any };
    }

    return { code: 200, message: '获取成功', data: data as Product };
};

// 创建商品
export const createProduct = async (data: Partial<Product>): Promise<ApiResponse<Product>> => {
    if (USE_MOCK) {
        return mockCreateProduct(data);
    }

    const { data: newData, error } = await supabase
        .from('products')
        .insert([data])
        .select()
        .single();

    if (error) {
        if (error.code === '23505') {
            return { code: 500, message: '数据库主键冲突。请联系管理员运行: select setval(\'products_id_seq\', (select max(id) from products));', data: null as any };
        }
        return { code: 500, message: error.message, data: null as any };
    }

    return { code: 200, message: '创建成功', data: newData as Product };
};

// 更新商品
export const updateProduct = async (id: string | number, data: Partial<Product>): Promise<ApiResponse<Product>> => {
    if (USE_MOCK) {
        return mockUpdateProduct(String(id), data);
    }

    const { data: updatedData, error } = await supabase
        .from('products')
        .update(data)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return { code: 500, message: error.message, data: null as any };
    }

    return { code: 200, message: '更新成功', data: updatedData as Product };
};

// 删除商品
export const deleteProduct = async (id: string | number): Promise<ApiResponse> => {
    if (USE_MOCK) {
        return mockDeleteProduct(String(id));
    }

    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

    if (error) {
        return { code: 500, message: error.message, data: null };
    }

    return { code: 200, message: '删除成功', data: null };
};

// 批量更新商品状态
export const batchUpdateProductStatus = async (ids: (string | number)[], status: ProductStatus): Promise<ApiResponse> => {
    if (USE_MOCK) {
        return mockBatchUpdateProductStatus(ids.map(String), status);
    }

    const { error } = await supabase
        .from('products')
        .update({ status })
        .in('id', ids);

    if (error) {
        return { code: 500, message: error.message, data: null };
    }

    return { code: 200, message: '操作成功', data: null };
};
