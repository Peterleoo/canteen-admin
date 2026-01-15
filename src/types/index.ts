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
// types/index.ts

// 1. 值必须对应数据库里的枚举字符串
export const OrderStatus = {
    PENDING: 'PENDING',
    PREPARING: 'PREPARING',
    DELIVERING: 'DELIVERING',
    READY_FOR_PICKUP: 'READY_FOR_PICKUP',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED'
} as const;

export type OrderStatusType = typeof OrderStatus[keyof typeof OrderStatus];

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
    // 食堂关联
    canteen_id?: string;      // 所属食堂 ID
    canteen?: Canteen;        // 关联查询时的食堂对象
    // combo_items 这种复杂的关联建议根据实际建表情况调整
}

// 购物车商品
export interface CartItem extends Product {
    quantity: number;
}

// 用户
export interface User {
    id: string;
    username: string;    // 修复：从 name 改为 username
    email: string;       // 修复：确保有 email 字段
    password?: string;    // 新增：用于前端app登录验证的密码字段（可选，返回时不包含）
    avatar?: string;
    phone?: string;
    status: 'ACTIVE' | 'BANNED' | 'INACTIVE' | 'active' | 'banned'; // 兼容大小写
    created_at: string;  // 修复：从 createdAt 改为 created_at
    // 统计字段（可选，根据你的业务逻辑）
    total_orders?: number;
    total_spent?: number;
    // 部门关联
    department_id?: string | null;
    department?: Department | null; // 关联查询时的部门对象
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

// src/types/index.ts

export interface Order {
    id: number;              // 数据库中是 integer，所以这里用 number
    user_id: string;         // 对应数据库 user_id (UUID)
    users?: User;            // 对应 Supabase 关联查询 users(*) 返回的对象
    canteen_id: number;      // 对应数据库 canteen_id
    canteens?: Canteen;      // 对应 Supabase 关联查询 canteens(*) 返回的对象

    // 订单商品清单
    order_items?: OrderItem[]; // 对应关联表 order_items(*)

    // 金额相关（确保与数据库字段名一致）
    // 如果数据库只有 total 字段，则其他字段设为可选或补齐数据库字段
    subtotal?: number;
    packaging_fee?: number;  // 打包费（与数据库字段名一致）
    delivery_fee?: number;   // 配送费
    discount_amount?: number;// 优惠金额
    total: number;           // 对应数据库 total

    status: OrderStatusType;
    delivery_method: 'DELIVERY' | 'PICKUP'; // 对应数据库下划线风格

    address_id?: string;
    address_detail?: string; // 建议直接存储地址快照，防止关联表数据被删

    remark?: string;
    cancel_reason?: string;

    created_at: string;      // 对应数据库 created_at
    updated_at: string;      // 对应数据库 updated_at
}

// 补充：订单项接口
export interface OrderItem {
    id: number;
    order_id: number;
    product_name: string;
    price: number;
    quantity: number;
    created_at: string;
}

// 食堂 (Canteen) 接口修改建议
export interface Canteen {
    id: string;
    name: string;
    address: string;
    distance?: string; // 距离通常是计算出来的，建议设为可选
    latitude?: number; // 新增：纬度
    longitude?: number; // 新增：经度
    status: 'OPEN' | 'CLOSED' | 'BUSY';

    // 基础管理信息
    contact_phone?: string;  // 对应数据库 contact_phone
    manager?: string;
    capacity?: number;
    current_orders?: number; // 对应数据库 current_orders

    // --- 自动化配置 ---
    is_auto_accept_orders: boolean;   // 自动接单开关
    auto_accept_delay?: number;       // 自动接单延迟（秒）

    // --- 营业时间 ---
    // 工作日营业时间
    weekday_open_time: string;        // 工作日开始时间 (HH:MM)
    weekday_close_time: string;       // 工作日结束时间 (HH:MM)
    // 周末营业时间
    weekend_open_time: string;        // 周末开始时间 (HH:MM)
    weekend_close_time: string;       // 周末结束时间 (HH:MM)

    // --- 库存与通知 ---
    stock_alert_threshold: number;    // 库存预警阈值
    is_low_stock_notification: boolean; // 低库存通知开关
    notification_phones?: string[];   // 通知手机列表

    // --- 配送核心配置 ---
    is_delivery_active: boolean;      // 配送服务总开关 (开启/关闭)
    delivery_radius: number;          // 配送半径 (公里)
    min_delivery_amount: number;      // 起送金额 (满多少才送)
    delivery_fee: number;             // 基础配送费
    free_delivery_threshold: number;  // 免配送费阈值 (满多少免运费)

    // --- 费用相关补充 ---
    default_packaging_fee: number;    // 默认打包费 (新增字段)

    updated_at?: string;
    created_at?: string;
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
    created_at: string;  // 改为 snake_case
    // 部门关联
    department_id?: string | null;
    department?: Department | null; // 关联查询时的部门对象
    // 权限列表
    permissions: string[];
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
    created_at: string;  // 改为 snake_case
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
    type: 'MENU' | 'BUTTON';  // 修正：数据库中使用 BUTTON 而非 ACTION
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
    created_at: string;  // 改为 snake_case
}

// 部门
export interface Department {
    id: string;
    name: string;
    description?: string;
    status: 'ACTIVE' | 'INACTIVE';
    created_at: string;
    updated_at?: string;
    canteen_ids?: string[]; // 关联的食堂 ID 列表（前端使用）
    canteens?: Canteen[]; // 关联的食堂对象列表（关联查询）
}

// 部门与食堂关联
export interface DepartmentCanteen {
    id: string;
    department_id: string;
    canteen_id: string;
    created_at: string;
}
