// 用户角色
export const Role = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    ADMIN: 'ADMIN',
    CANTEEN_MANAGER: 'CANTEEN_MANAGER',
    OPERATOR: 'OPERATOR',
    VIEWER: 'VIEWER'
} as const;
export type Role = typeof Role[keyof typeof Role];

// 商品分类
export const Category = {
    POPULAR: '人气热销',
    MAINS: '主食',
    SNACKS: '小吃',
    DRINKS: '饮品',
    COMBOS: '套餐',
} as const;
export type Category = typeof Category[keyof typeof Category];



// 订单状态
export const OrderStatus = {
    PENDING: '待接单',
    PREPARING: '准备中',
    DELIVERING: '配送中',
    READY_FOR_PICKUP: '待自提',
    COMPLETED: '已完成',
    CANCELLED: '已取消'
} as const;
export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

// 配送方式
export type DeliveryMethod = 'PICKUP' | 'DELIVERY';

// 商品状态
export type ProductStatus = 'ACTIVE' | 'INACTIVE';

// 套餐子项
export interface ComboItem {
    id: string;
    name: string;
    quantity: string;
    price: number;
}

// 商品
export interface Product {
    id: number;              // 数据库 int4 对应 number
    name: string;
    description: string;
    price: number;
    original_price?: number; // 改为下划线
    category: string;        // 存储分类名称
    image: string;
    images?: string[];
    stock: number;
    stock_alert?: number;    // 改为下划线
    sales: number;
    tags?: string[];
    status: ProductStatus;
    is_recommended?: boolean; // 改为下划线
    is_featured?: boolean;    // 改为下划线
    is_combo?: boolean;       // 改为下划线
    sort_order?: number;      // 改为下划线
    created_at?: string;      // 改为下划线
    updated_at?: string;      // 改为下划线
    // combo_items 这种复杂的关联建议根据实际建表情况调整
}

// 购物车商品
export interface CartItem extends Product {
    quantity: number;
}

// 用户
export interface User {
    id: string;
    name: string;
    phone: string;
    avatar?: string;
    status: 'ACTIVE' | 'INACTIVE' | 'BANNED';
    totalOrders: number;
    totalSpent: number;
    lastOrderAt?: string;
    createdAt: string;
}

// 地址
export interface Address {
    id: string;
    contactName: string;
    phone: string;
    area: string;
    detail: string;
    tag: string;
    isDefault: boolean;
}

// 订单
export interface Order {
    id: string;
    userId: string;
    user?: User;
    canteenId: string;
    canteen?: Canteen;
    items: CartItem[];
    subtotal: number;
    deliveryFee: number;
    total: number;
    status: OrderStatus;
    deliveryMethod: DeliveryMethod;
    addressId?: string;
    address?: Address;
    remark?: string;
    estimatedTime?: string;
    actualTime?: string;
    cancelReason?: string;
    createdAt: string;
    updatedAt: string;
}

// 食堂
export interface Canteen {
    id: string;
    name: string;
    address: string;
    distance: string;
    status: 'OPEN' | 'CLOSED' | 'BUSY';
    contactPhone?: string;
    manager?: string;
    capacity?: number;
    currentOrders?: number;
    deliveryEnabled?: boolean;
    deliveryRadius?: number;
    deliveryFee?: number;
    freeDeliveryThreshold?: number;
}

// 管理员用户
export interface AdminUser {
    id: string;
    username: string;
    name: string;
    role: Role;
    avatar?: string;
    email?: string;
    phone?: string;
    status: 'ACTIVE' | 'INACTIVE';
    createdAt: string;
}

// 登录响应
export interface LoginResponse {
    token: string;
    user: AdminUser;
}

// 分页参数
export interface PaginationParams {
    page: number;
    pageSize: number;
}

// 分页响应
export interface PaginationResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
}

// API 响应
export interface ApiResponse<T = any> {
    code: number;
    message: string;
    data: T;
}

// 统计数据
export interface DashboardStats {
    todayRevenue: number;
    todayOrders: number;
    todayUsers: number;
    avgOrderValue: number;
    revenueChange: number;
    ordersChange: number;
    usersChange: number;
}

// 图表数据
export interface ChartData {
    date: string;
    value: number;
    type?: string;
}

// 优惠券类型
export type CouponType = 'CASH' | 'DISCOUNT' | 'FREE_DELIVERY';

// 优惠券
export interface Coupon {
    id: string;
    name: string;
    type: CouponType;
    value: number;
    minAmount: number;
    validFrom: string;
    validTo: string;
    totalCount: number;
    usedCount: number;
    status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
    description?: string;
    createdAt: string;
}

// 促销活动
export interface Promotion {
    id: string;
    title: string;
    subtitle?: string;
    image: string;
    type: 'BANNER' | 'ACTIVITY';
    link?: string;
    status: 'ACTIVE' | 'INACTIVE';
    sort_order: number;
    start_time?: string;
    end_time?: string;
    created_at: string;
}

// 权限点
export interface Permission {
    id: string;
    name: string;
    code: string;
    type: 'MENU' | 'ACTION';
    parentId?: string;
    description?: string;
}

// 角色配置
export interface RoleConfig {
    id: string;
    name: string;
    code: string;
    description?: string;
    permissions: string[]; // 权限 ID 列表
    status: 'ACTIVE' | 'INACTIVE';
    createdAt: string;
}
