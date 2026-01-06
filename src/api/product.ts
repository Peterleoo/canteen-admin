import request from '../utils/request';
import type { Product, ApiResponse, PaginationResponse } from '../types/index';
import {
    mockGetProducts,
    mockGetProduct,
    mockCreateProduct,
    mockUpdateProduct,
    mockDeleteProduct,
    mockBatchUpdateProductStatus,
    type ProductQueryParams,
} from './mock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// 获取商品列表
export const getProducts = (params: ProductQueryParams) => {
    if (USE_MOCK) {
        return mockGetProducts(params) as Promise<ApiResponse<PaginationResponse<Product>>>;
    }
    return request.get<any, ApiResponse<PaginationResponse<Product>>>('/products', { params });
};

// 获取商品详情
export const getProduct = (id: string) => {
    if (USE_MOCK) {
        return mockGetProduct(id) as Promise<ApiResponse<Product>>;
    }
    return request.get<any, ApiResponse<Product>>(`/products/${id}`);
};

// 创建商品
export const createProduct = (data: Partial<Product>) => {
    if (USE_MOCK) {
        return mockCreateProduct(data) as Promise<ApiResponse<Product>>;
    }
    return request.post<any, ApiResponse<Product>>('/products', data);
};

// 更新商品
export const updateProduct = (id: string, data: Partial<Product>) => {
    if (USE_MOCK) {
        return mockUpdateProduct(id, data) as Promise<ApiResponse<Product>>;
    }
    return request.put<any, ApiResponse<Product>>(`/products/${id}`, data);
};

// 删除商品
export const deleteProduct = (id: string) => {
    if (USE_MOCK) {
        return mockDeleteProduct(id) as Promise<ApiResponse>;
    }
    return request.delete<any, ApiResponse>(`/products/${id}`);
};

// 批量更新商品状态
export const batchUpdateProductStatus = (ids: string[], status: 'ACTIVE' | 'INACTIVE') => {
    if (USE_MOCK) {
        return mockBatchUpdateProductStatus(ids, status) as Promise<ApiResponse>;
    }
    return request.put<any, ApiResponse>('/products/batch-status', { ids, status });
};
