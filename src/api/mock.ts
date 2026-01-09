import type { AdminUser, Role, Product, Order, DeliveryMethod, User, Canteen, OrderStatusType } from '../types/index';
import { Category, OrderStatus } from '../types/index';

// Mock 管理员用户数据
const mockAdminUser: AdminUser = {
    id: '1',
    username: 'admin',
    name: '系统管理员',
    role: 'SUPER_ADMIN' as Role,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    email: 'admin@canteen.com',
    phone: '13800138000',
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
};

// Mock 商品数据
// Mock 商品数据
let mockProducts: Product[] = [
    {
        id: 1,
        name: '川味宫保鸡丁',
        description: '精选嫩滑鸡粒，搭配酥脆花生与正宗川味干辣椒，酱香浓郁，回味微甜。',
        price: 12.50,
        category: Category.MAINS,
        image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?q=80&w=800',
        stock: 50,
        sales: 1205,
        tags: ['香辣', '招牌'],
        status: 'ACTIVE',
        is_recommended: true,
        is_featured: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
    },
    {
        id: 2,
        name: '台式秘制卤肉饭',
        description: '慢火细熬手切五花肉，油亮肥美不松散，浸润每一粒精选香米。',
        price: 15.00,
        category: Category.MAINS,
        image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=800',
        stock: 30,
        sales: 890,
        tags: ['销量王'],
        status: 'ACTIVE',
        is_recommended: true,
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
    },
    {
        id: 3,
        name: '田园清炒时蔬',
        description: '每日清晨直采时令鲜蔬，极致火候快炒，保留食材原本的清脆与鲜甜。',
        price: 9.00,
        category: Category.MAINS,
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800',
        stock: 100,
        sales: 450,
        tags: ['素食', '健康'],
        status: 'ACTIVE',
        created_at: '2024-01-03T00:00:00Z',
        updated_at: '2024-01-03T00:00:00Z',
    },
    {
        id: 4,
        name: '私房红烧牛肉面',
        description: '12小时大骨高汤熬制，大块牛腩入口即化，手工宽面劲道十足。',
        price: 14.00,
        category: Category.MAINS,
        image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=800',
        stock: 25,
        sales: 2100,
        tags: ['能量餐'],
        status: 'ACTIVE',
        is_featured: true,
        created_at: '2024-01-04T00:00:00Z',
        updated_at: '2024-01-04T00:00:00Z',
    },
    {
        id: 5,
        name: '金黄脆皮春卷',
        description: '外皮金黄酥脆，咬下一口咔嚓作响，内馅包含木耳、香菇等多种鲜美菌菇。',
        price: 5.00,
        category: Category.SNACKS,
        image: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?q=80&w=800',
        stock: 80,
        sales: 600,
        tags: ['酥脆'],
        status: 'ACTIVE',
        created_at: '2024-01-05T00:00:00Z',
        updated_at: '2024-01-05T00:00:00Z',
    },
    {
        id: 6,
        name: '新奥尔良炸鸡翅',
        description: '独家秘制腌料入味，外皮焦亮，肉质鲜美多汁，撕开即见诱人肉汁。',
        price: 8.00,
        category: Category.SNACKS,
        image: 'https://images.unsplash.com/photo-1567622445821-ff9680edaee7?q=80&w=800',
        stock: 40,
        sales: 320,
        tags: ['人气'],
        status: 'ACTIVE',
        created_at: '2024-01-06T00:00:00Z',
        updated_at: '2024-01-06T00:00:00Z',
    },
    {
        id: 7,
        name: '爆汁手打柠檬茶',
        description: '精选广东香水柠檬，暴力手打出汁，茶底醇厚，清爽解腻的最佳拍档。',
        price: 4.00,
        category: Category.DRINKS,
        image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800',
        stock: 200,
        sales: 1500,
        tags: ['冰镇'],
        status: 'ACTIVE',
        created_at: '2024-01-07T00:00:00Z',
        updated_at: '2024-01-07T00:00:00Z',
    },
    {
        id: 8,
        name: '经典醇香珍珠奶茶',
        description: '进口锡兰红茶底，混合新西兰牧场牛乳，珍珠Q弹软糯，甜而不腻。',
        price: 6.00,
        category: Category.DRINKS,
        image: 'https://images.unsplash.com/photo-1594911772125-07fc7a2d8d9f?q=80&w=800',
        stock: 150,
        sales: 980,
        tags: ['甜蜜'],
        status: 'ACTIVE',
        created_at: '2024-01-08T00:00:00Z',
        updated_at: '2024-01-08T00:00:00Z',
    },
    {
        id: 9,
        name: '元气职人午餐套餐',
        description: '包含私房牛肉面+脆皮春卷+手打柠檬茶。今日份的加油站！',
        price: 22.00,
        category: Category.COMBOS,
        image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?q=80&w=800',
        stock: 50,
        sales: 1800,
        tags: ['热销', '推荐'],
        status: 'ACTIVE',
        is_combo: true,
        is_recommended: true,
        is_featured: true,
        created_at: '2024-01-09T00:00:00Z',
        updated_at: '2024-01-09T00:00:00Z',
    },
    {
        id: 10,
        name: '测试下架商品',
        description: '这是一个已下架的测试商品',
        price: 10.00,
        category: Category.SNACKS,
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800',
        stock: 0,
        sales: 0,
        tags: [],
        status: 'INACTIVE',
        created_at: '2024-01-10T00:00:00Z',
        updated_at: '2024-01-10T00:00:00Z',
    },
];

// ============ 认证相关 Mock ============

export const mockLogin = (username: string, password: string) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (username === 'admin' && password === 'admin123') {
                resolve({
                    code: 200,
                    message: '登录成功',
                    data: {
                        token: 'mock-jwt-token-' + Date.now(),
                        user: mockAdminUser,
                    },
                });
            } else {
                reject({
                    code: 401,
                    message: '用户名或密码错误',
                });
            }
        }, 500);
    });
};

export const mockGetCurrentUser = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                code: 200,
                message: '成功',
                data: mockAdminUser,
            });
        }, 300);
    });
};

export const mockLogout = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                code: 200,
                message: '登出成功',
                data: null,
            });
        }, 300);
    });
};

// ============ 商品相关 Mock ============

export interface ProductQueryParams {
    page?: number;
    pageSize?: number;
    category?: Category;
    status?: 'ACTIVE' | 'INACTIVE';
    keyword?: string;
}

// 获取商品列表
export const mockGetProducts = (params: ProductQueryParams) => {
    return new Promise<any>((resolve) => {
        setTimeout(() => {
            const { page = 1, pageSize = 10, category, status, keyword } = params;

            // 筛选
            let filtered = [...mockProducts];

            if (category) {
                filtered = filtered.filter(p => p.category === category);
            }

            if (status) {
                filtered = filtered.filter(p => p.status === status);
            }

            if (keyword) {
                filtered = filtered.filter(p =>
                    p.name.toLowerCase().includes(keyword.toLowerCase()) ||
                    p.description.toLowerCase().includes(keyword.toLowerCase())
                );
            }

            // 分页
            const total = filtered.length;
            const start = (page - 1) * pageSize;
            const end = start + pageSize;
            const data = filtered.slice(start, end);

            resolve({
                code: 200,
                message: '成功',
                data: {
                    data,
                    total,
                    page,
                    pageSize,
                },
            });
        }, 500);
    });
};

// 获取商品详情
export const mockGetProductDetail = (id: string) => {
    return new Promise<any>((resolve, reject) => {
        setTimeout(() => {
            const product = mockProducts.find(p => p.id === Number(id));
            if (product) {
                resolve({
                    code: 200,
                    message: '成功',
                    data: product,
                });
            } else {
                reject({
                    code: 404,
                    message: '商品不存在',
                });
            }
        }, 300);
    });
};

// 创建商品
export const mockCreateProduct = (data: Partial<Product>) => {
    return new Promise<any>((resolve) => {
        setTimeout(() => {
            const newProduct: Product = {
                id: Date.now(),
                name: data.name!,
                description: data.description!,
                price: data.price!,
                original_price: data.original_price,
                category: data.category!,
                image: data.image!,
                images: data.images,
                stock: data.stock!,
                stock_alert: data.stock_alert,
                sales: 0,
                tags: data.tags || [],
                status: data.status || 'ACTIVE',
                is_recommended: data.is_recommended || false,
                is_featured: data.is_featured || false,
                sort_order: data.sort_order || 0,
                is_combo: data.is_combo || false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            mockProducts.unshift(newProduct);

            resolve({
                code: 200,
                message: '创建成功',
                data: newProduct,
            });
        }, 500);
    });
};

// 更新商品
export const mockUpdateProduct = (id: string, data: Partial<Product>) => {
    return new Promise<any>((resolve, reject) => {
        setTimeout(() => {
            const index = mockProducts.findIndex(p => p.id === Number(id));
            if (index !== -1) {
                mockProducts[index] = {
                    ...mockProducts[index],
                    ...data,
                    updated_at: new Date().toISOString(),
                };
                resolve({
                    code: 200,
                    message: '更新成功',
                    data: mockProducts[index],
                });
            } else {
                reject({
                    code: 404,
                    message: '商品不存在',
                });
            }
        }, 500);
    });
};

// 删除商品
export const mockDeleteProduct = (id: string) => {
    return new Promise<any>((resolve, reject) => {
        setTimeout(() => {
            const index = mockProducts.findIndex(p => p.id === Number(id));
            if (index !== -1) {
                mockProducts.splice(index, 1);
                resolve({
                    code: 200,
                    message: '删除成功',
                    data: null,
                });
            } else {
                reject({
                    code: 404,
                    message: '商品不存在',
                });
            }
        }, 500);
    });
};

// 批量更新商品状态
export const mockBatchUpdateProductStatus = (ids: string[], status: 'ACTIVE' | 'INACTIVE') => {
    return new Promise<any>((resolve) => {
        setTimeout(() => {
            ids.forEach(id => {
                const index = mockProducts.findIndex(p => p.id === Number(id));
                if (index !== -1) {
                    mockProducts[index].status = status;
                    mockProducts[index].updated_at = new Date().toISOString();
                }
            });

            resolve({
                code: 200,
                message: '批量更新成功',
                data: null,
            });
        }, 500);
    });
};

// ============ 订单相关 Mock ============

export interface OrderQueryParams {
    page?: number;
    pageSize?: number;
    status?: OrderStatusType;
    deliveryMethod?: DeliveryMethod;
    keyword?: string;
    startDate?: string;
    endDate?: string;
}

let mockOrders: Order[] = [
    {
        id: 1001,
        user_id: 'U001',
        profiles: {
            id: 'U001', username: '张三', phone: '13812345678', email: 'zhangsan@example.com', status: 'ACTIVE', total_orders: 5, total_spent: 260, created_at: '2024-01-01'
        },
        canteen_id: 1,
        order_items: [
            { id: 1, product_name: '川味宫保鸡丁', quantity: 1, price: 12.5, category: Category.MAINS, image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?q=80&w=800', stock: 50, sales: 1205, status: 'ACTIVE' } as any
        ],
        subtotal: 12.5,
        delivery_fee: 0,
        total: 14.0, // 12.5 + 1.5(打包)
        status: OrderStatus.PENDING,
        delivery_method: 'PICKUP',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: 1002,
        user_id: 'U002',
        profiles: {
            id: 'U002', username: '李四', phone: '13987654321', email: 'lisi@example.com', status: 'ACTIVE', total_orders: 2, total_spent: 80, created_at: '2024-01-02'
        },
        canteen_id: 1,
        order_items: [
            { id: 4, product_name: '私房红烧牛肉面', quantity: 2, price: 14.0, category: Category.MAINS, image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=800', stock: 25, sales: 2100, status: 'ACTIVE' } as any
        ],
        subtotal: 28.0,
        delivery_fee: 5,
        total: 33.0,
        status: OrderStatus.PREPARING,
        delivery_method: 'DELIVERY',
        address_detail: '万科滨河道 3号楼201',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        updated_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
        id: 1003,
        user_id: 'U003',
        profiles: {
            id: 'U003', username: '王五', phone: '13700001111', email: 'wangwu@example.com', status: 'ACTIVE', total_orders: 10, total_spent: 1200, created_at: '2023-12-15'
        },
        canteen_id: 1,
        order_items: [
            { id: 9, product_name: '元气职人午餐套餐', quantity: 1, price: 22.0, category: Category.COMBOS, image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?q=80&w=800', stock: 50, sales: 1800, status: 'ACTIVE' } as any,
            { id: 7, product_name: '爆汁手打柠檬茶', quantity: 1, price: 4.0, category: Category.DRINKS, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800', stock: 200, sales: 1500, status: 'ACTIVE' } as any
        ],
        subtotal: 26.0,
        delivery_fee: 0,
        total: 26.0,
        status: OrderStatus.COMPLETED,
        delivery_method: 'PICKUP',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString(),
    }
];

// 获取订单列表
export const mockGetOrders = (params: OrderQueryParams) => {
    return new Promise<any>((resolve) => {
        setTimeout(() => {
            const { page = 1, pageSize = 10, status, deliveryMethod, keyword } = params;

            let filtered = [...mockOrders];

            if (status) {
                filtered = filtered.filter(o => o.status === status);
            }

            if (deliveryMethod) {
                filtered = filtered.filter(o => o.delivery_method === deliveryMethod);
            }

            if (keyword) {
                filtered = filtered.filter(o =>
                    String(o.id).includes(keyword) ||
                    o.profiles?.phone?.includes(keyword) ||
                    o.profiles?.username?.includes(keyword)
                );
            }

            const total = filtered.length;
            const start = (page - 1) * pageSize;
            const end = start + pageSize;
            const data = filtered.slice(start, end);

            resolve({
                code: 200,
                message: '成功',
                data: {
                    data, // Use data instead of list to match PaginationResponse
                    total,
                    page,
                    pageSize,
                },
            });
        }, 500);
    });
};

// 更新订单状态
export const mockUpdateOrderStatus = (id: string, status: OrderStatusType) => {
    return new Promise<any>((resolve, reject) => {
        setTimeout(() => {
            const index = mockOrders.findIndex(o => o.id === Number(id));
            if (index !== -1) {
                mockOrders[index].status = status;
                mockOrders[index].updated_at = new Date().toISOString();
                resolve({
                    code: 200,
                    message: '更新成功',
                    data: mockOrders[index],
                });
            } else {
                reject({
                    code: 404,
                    message: '订单不存在',
                });
            }
        }, 300);
    });
};

// 获取详细订单
export const mockGetOrderDetail = (id: string) => {
    return new Promise<any>((resolve, reject) => {
        setTimeout(() => {
            const order = mockOrders.find(o => o.id === Number(id));
            if (order) {
                resolve({
                    code: 200,
                    message: '成功',
                    data: order,
                });
            } else {
                reject({
                    code: 404,
                    message: '订单不存在',
                });
            }
        }, 300);
    });
};

// 批量取消订单
export const mockBatchCancelOrders = (ids: string[], reason: string) => {
    return new Promise<any>((resolve) => {
        setTimeout(() => {
            mockOrders.forEach(o => {
                if (ids.includes(String(o.id))) {
                    o.status = OrderStatus.CANCELLED;
                    (o as any).cancel_reason = reason;
                    o.updated_at = new Date().toISOString();
                }
            });
            resolve({
                code: 200,
                message: '批量取消成功',
                data: null,
            });
        }, 300);
    });
};

// ============ 用户管理相关 Mock ============

export interface UserQueryParams {
    page?: number;
    pageSize?: number;
    status?: 'ACTIVE' | 'INACTIVE' | 'BANNED';
    keyword?: string;
}

let mockUsers: User[] = [
    {
        id: 'U001',
        username: '张三',
        email: 'zhangsan@example.com',
        phone: '13812345678',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZhangSan',
        status: 'ACTIVE',
        total_orders: 5,
        total_spent: 260.5,
        created_at: '2023-10-01T08:00:00Z',
    },
    {
        id: 'U002',
        username: '李四',
        email: 'lisi@example.com',
        phone: '13987654321',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LiSi',
        status: 'ACTIVE',
        total_orders: 12,
        total_spent: 1250,
        created_at: '2023-09-15T10:00:00Z',
    },
    {
        id: 'U003',
        username: '王五',
        email: 'wangwu@example.com',
        phone: '13700001111',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=WangWu',
        status: 'BANNED',
        total_orders: 2,
        total_spent: 45,
        created_at: '2023-11-20T09:00:00Z',
    },
    {
        id: 'U004',
        username: '赵六',
        email: 'zhaoliu@example.com',
        phone: '13566667777',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZhaoLiu',
        status: 'ACTIVE',
        total_orders: 25,
        total_spent: 3200,
        created_at: '2023-08-01T14:00:00Z',
    },
    {
        id: 'U005',
        username: '钱七',
        email: 'qianqi@example.com',
        phone: '18899990000',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=QianQi',
        status: 'ACTIVE',
        total_orders: 8,
        total_spent: 680,
        created_at: '2023-12-05T11:00:00Z',
    }
];

// 获取用户列表
export const mockGetUsers = (params: UserQueryParams) => {
    return new Promise<any>((resolve) => {
        setTimeout(() => {
            const { page = 1, pageSize = 10, status, keyword } = params;

            let filtered = [...mockUsers];

            if (status) {
                filtered = filtered.filter(u => u.status === status);
            }

            if (keyword) {
                filtered = filtered.filter(u =>
                    u.username.toLowerCase().includes(keyword.toLowerCase()) ||
                    (u.phone && u.phone.includes(keyword)) ||
                    u.email.toLowerCase().includes(keyword.toLowerCase())
                );
            }

            const total = filtered.length;
            const start = (page - 1) * pageSize;
            const end = start + pageSize;
            const data = filtered.slice(start, end);

            resolve({
                code: 200,
                message: '成功',
                data: {
                    data, // Match interface property 'data'
                    total,
                    page,
                    pageSize,
                },
            });
        }, 500);
    });
};

// 获取用户详情
export const mockGetUserDetail = (id: string) => {
    return new Promise<any>((resolve, reject) => {
        setTimeout(() => {
            const user = mockUsers.find(u => u.id === id);
            if (user) {
                resolve({
                    code: 200,
                    message: '成功',
                    data: {
                        ...user,
                        addresses: [
                            { id: 'A001', contactName: user.username, phone: user.phone, area: '万科滨河道', detail: '3号楼201', tag: '家', isDefault: true },
                            { id: 'A002', contactName: user.username, phone: user.phone, area: '财富中心', detail: 'A座3002', tag: '公司', isDefault: false },
                        ],
                    },
                });
            } else {
                reject({
                    code: 404,
                    message: '用户不存在',
                });
            }
        }, 300);
    });
};

// 更新用户状态
export const mockUpdateUserStatus = (id: string, status: 'ACTIVE' | 'INACTIVE' | 'BANNED') => {
    return new Promise<any>((resolve, reject) => {
        setTimeout(() => {
            const index = mockUsers.findIndex(u => u.id === id);
            if (index !== -1) {
                mockUsers[index].status = status;
                resolve({
                    code: 200,
                    message: '更新成功',
                    data: mockUsers[index],
                });
            } else {
                reject({
                    code: 404,
                    message: '用户不存在',
                });
            }
        }, 300);
    });
};

// ============ 食堂管理相关 Mock ============

let mockCanteens: Canteen[] = [
    {
        id: '1',
        name: '第一学生食堂',
        address: '校园北区学子路 12 号',
        distance: '200m',
        status: 'OPEN',
        contact_phone: '010-62771234', // 已修改
        manager: '陈主管',
        capacity: 500,
        current_orders: 42,           // 已修改
        is_delivery_active: true,     // 已修改 (原 deliveryEnabled)
        delivery_radius: 3,           // 已修改
        delivery_fee: 2.5,            // 已修改
        free_delivery_threshold: 30,  // 已修改
        min_delivery_amount: 15,      // 新增：起送价
        default_packaging_fee: 1.5,   // 新增：打包费
    },
    {
        id: '2',
        name: '第二学生食堂 (清真)',
        address: '校园南区友谊路 5 号',
        distance: '800m',
        status: 'BUSY',
        contact_phone: '010-62775678', // 已修改
        manager: '穆经理',
        capacity: 300,
        current_orders: 85,           // 已修改
        is_delivery_active: true,     // 已修改
        delivery_radius: 2,           // 已修改
        delivery_fee: 3.0,            // 已修改
        free_delivery_threshold: 50,  // 已修改
        min_delivery_amount: 20,      // 新增
        default_packaging_fee: 2.0,   // 新增
    }
];

// 获取食堂列表
export const mockGetCanteens = () => {
    return new Promise<any>((resolve) => {
        setTimeout(() => {
            resolve({
                code: 200,
                message: '成功',
                data: mockCanteens,
            });
        }, 500);
    });
};

// 获取食堂详情
export const mockGetCanteenDetail = (id: string) => {
    return new Promise<any>((resolve, reject) => {
        setTimeout(() => {
            const canteen = mockCanteens.find(c => c.id === id);
            if (canteen) {
                resolve({
                    code: 200,
                    message: '成功',
                    data: canteen,
                });
            } else {
                reject({
                    code: 404,
                    message: '食堂不存在',
                });
            }
        }, 300);
    });
};

// 更新食堂信息
export const mockUpdateCanteen = (id: string, data: Partial<Canteen>) => {
    return new Promise<any>((resolve, reject) => {
        setTimeout(() => {
            const index = mockCanteens.findIndex(c => c.id === id);
            if (index !== -1) {
                mockCanteens[index] = { ...mockCanteens[index], ...data };
                resolve({
                    code: 200,
                    message: '更新成功',
                    data: mockCanteens[index],
                });
            } else {
                reject({
                    code: 404,
                    message: '食堂不存在',
                });
            }
        }, 300);
    });
};

// 更新食堂状态
export const mockUpdateCanteenStatus = (id: string, status: 'OPEN' | 'CLOSED' | 'BUSY') => {
    return new Promise<any>((resolve, reject) => {
        setTimeout(() => {
            const index = mockCanteens.findIndex(c => c.id === id);
            if (index !== -1) {
                mockCanteens[index].status = status;
                resolve({
                    code: 200,
                    message: '状态切换成功',
                    data: mockCanteens[index],
                });
            } else {
                reject({
                    code: 404,
                    message: '食堂不存在',
                });
            }
        }, 300);
    });
};

// 新增食堂
export const mockCreateCanteen = (data: Partial<Canteen>) => {
    return new Promise<any>((resolve) => {
        setTimeout(() => {
            const newCanteen: Canteen = {
                id: String(Date.now()),
                name: data.name || '新食堂',
                address: data.address || '',
                distance: '100m',
                status: 'OPEN',

                // --- 风格转换后的字段 ---
                contact_phone: data.contact_phone || '', // contactPhone -> contact_phone
                manager: data.manager || '',
                capacity: data.capacity || 0,
                current_orders: 0,                       // currentOrders -> current_orders

                // --- 配送服务配置 ---
                is_delivery_active: data.is_delivery_active ?? false, // deliveryEnabled -> is_delivery_active
                delivery_radius: data.delivery_radius || 1,           // deliveryRadius -> delivery_radius
                delivery_fee: data.delivery_fee || 0,                 // deliveryFee -> delivery_fee
                free_delivery_threshold: data.free_delivery_threshold || 0, // 修正拼写

                // --- 新增业务字段 ---
                min_delivery_amount: data.min_delivery_amount || 0,      // 新发起送价
                default_packaging_fee: data.default_packaging_fee || 0,  // 新增打包费
            };

            mockCanteens.push(newCanteen);

            resolve({
                code: 200,
                message: '创建成功',
                data: newCanteen,
            });
        }, 300);
    });
};

// 删除食堂
export const mockDeleteCanteen = (id: string) => {
    return new Promise<any>((resolve, reject) => {
        setTimeout(() => {
            const index = mockCanteens.findIndex(c => c.id === id);
            if (index !== -1) {
                mockCanteens.splice(index, 1);
                resolve({
                    code: 200,
                    message: '删除成功',
                    data: null,
                });
            } else {
                reject({
                    code: 404,
                    message: '食堂不存在',
                });
            }
        }, 300);
    });
};

// ============ 数据分析相关 Mock ============

// 累计统计
export const mockGetOverviewStats = () => {
    return new Promise<any>((resolve) => {
        setTimeout(() => {
            resolve({
                code: 200,
                message: '成功',
                data: {
                    todayRevenue: 12580.50,
                    revenueChange: 12.5, // 环比增长
                    todayOrders: 458,
                    orderChange: 8.2,
                    newUsers: 45,
                    userChange: -2.3,
                    avgOrderValue: 27.5,
                    avgChange: 4.1
                }
            });
        }, 500);
    });
};

// 营收趋势
export const mockGetRevenueTrend = (days: number) => {
    return new Promise<any>((resolve) => {
        const data = Array.from({ length: days }).map((_, i) => ({
            date: new Date(Date.now() - (days - 1 - i) * 24 * 3600 * 1000).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
            revenue: Math.floor(Math.random() * 5000) + 8000,
            orders: Math.floor(Math.random() * 200) + 300
        }));
        setTimeout(() => {
            resolve({
                code: 200,
                message: '成功',
                data
            });
        }, 500);
    });
};

// 时段分布
export const mockGetOrderDistribution = () => {
    return new Promise<any>((resolve) => {
        const data = Array.from({ length: 24 }).map((_, i) => ({
            hour: `${i}:00`,
            orders: i >= 11 && i <= 13 ? Math.floor(Math.random() * 100) + 150 :
                i >= 17 && i <= 19 ? Math.floor(Math.random() * 80) + 100 :
                    Math.floor(Math.random() * 20)
        }));
        setTimeout(() => {
            resolve({
                code: 200,
                message: '成功',
                data
            });
        }, 500);
    });
};

// 商品排行
export const mockGetProductRanking = () => {
    return new Promise<any>((resolve) => {
        const data = [
            { name: '招牌红烧肉套餐', sales: 1250, revenue: 31250, icon: '🍱' },
            { name: '清蒸鲈鱼', sales: 980, revenue: 47040, icon: '🐟' },
            { name: '酸辣土豆丝', sales: 850, revenue: 10200, icon: '🥔' },
            { name: '老北京炸酱面', sales: 720, revenue: 12960, icon: '🍜' },
            { name: '皮蛋瘦肉粥', sales: 600, revenue: 4800, icon: '🥣' }
        ];
        setTimeout(() => {
            resolve({
                code: 200,
                message: '成功',
                data
            });
        }, 500);
    });
};

// ============ 营销管理相关 Mock ============

let mockCoupons: any[] = [
    {
        id: 'cp1',
        name: '新人立减券',
        type: 'CASH',
        value: 5,
        minAmount: 20,
        validFrom: '2026-01-01',
        validTo: '2026-12-31',
        totalCount: 1000,
        usedCount: 156,
        status: 'ACTIVE',
        description: '全场通用，限新用户首次下单使用',
        createdAt: '2026-01-01 10:00:00'
    },
    {
        id: 'cp2',
        name: '下午茶8折优惠',
        type: 'DISCOUNT',
        value: 0.8,
        minAmount: 15,
        validFrom: '2026-01-01',
        validTo: '2026-03-31',
        totalCount: 500,
        usedCount: 89,
        status: 'ACTIVE',
        description: '限14:00-17:00使用，饮品类可用',
        createdAt: '2026-01-05 14:30:00'
    },
    {
        id: 'cp3',
        name: '免配送费券',
        type: 'FREE_DELIVERY',
        value: 5,
        minAmount: 30,
        validFrom: '2026-01-01',
        validTo: '2026-06-30',
        totalCount: 2000,
        usedCount: 450,
        status: 'ACTIVE',
        description: '限外卖订单使用',
        createdAt: '2026-01-02 09:15:00'
    }
];

let mockPromotions: any[] = [
    {
        id: 'pm1',
        title: '冬季暖心系列',
        subtitle: '多款热饮买一送一',
        image: 'https://images.unsplash.com/photo-1544787210-282bb050519c?w=800',
        type: 'BANNER',
        link: '/products?category=饮品',
        status: 'ACTIVE',
        sort_order: 1,
        createdAt: '2026-01-01 08:00:00'
    },
    {
        id: 'pm2',
        title: '周三会员日',
        subtitle: '全场菜品双倍积分',
        image: 'https://images.unsplash.com/photo-155524362d-1621351c96da?w=800',
        type: 'ACTIVITY',
        status: 'ACTIVE',
        sort_order: 2,
        startTime: '2026-01-01 00:00:00',
        endTime: '2026-12-31 23:59:59',
        createdAt: '2026-01-01 00:00:00'
    }
];

// 获取优惠券列表
export const mockGetCoupons = () => {
    return new Promise<any>((resolve) => {
        setTimeout(() => {
            resolve({
                code: 200,
                message: '成功',
                data: [...mockCoupons]
            });
        }, 500);
    });
};

// 创建优惠券
export const mockCreateCoupon = (data: any) => {
    return new Promise<any>((resolve) => {
        const newCoupon = {
            ...data,
            id: 'cp' + (mockCoupons.length + 1),
            usedCount: 0,
            status: 'ACTIVE',
            createdAt: new Date().toLocaleString()
        };
        mockCoupons.unshift(newCoupon);
        setTimeout(() => {
            resolve({
                code: 200,
                message: '创建成功',
                data: newCoupon
            });
        }, 500);
    });
};

// 更新优惠券
export const mockUpdateCoupon = (id: string, data: any) => {
    return new Promise<any>((resolve) => {
        const index = mockCoupons.findIndex(c => c.id === id);
        if (index !== -1) {
            mockCoupons[index] = { ...mockCoupons[index], ...data };
        }
        setTimeout(() => {
            resolve({
                code: 200,
                message: '更新成功',
                data: mockCoupons[index]
            });
        }, 500);
    });
};

// 删除优惠券
export const mockDeleteCoupon = (id: string) => {
    return new Promise<any>((resolve) => {
        mockCoupons = mockCoupons.filter(c => c.id !== id);
        setTimeout(() => {
            resolve({
                code: 200,
                message: '删除成功',
                data: null
            });
        }, 500);
    });
};

// 获取促销列表
export const mockGetPromotions = () => {
    return new Promise<any>((resolve) => {
        setTimeout(() => {
            resolve({
                code: 200,
                message: '成功',
                data: [...mockPromotions]
            });
        }, 500);
    });
};

// 更新促销项
export const mockUpdatePromotion = (id: string, data: any) => {
    return new Promise<any>((resolve) => {
        const index = mockPromotions.findIndex(p => p.id === id);
        if (index !== -1) {
            mockPromotions[index] = { ...mockPromotions[index], ...data };
        }
        setTimeout(() => {
            resolve({
                code: 200,
                message: '更新成功',
                data: mockPromotions[index]
            });
        }, 500);
    });
};

// ============ 系统设置相关 Mock ============

let mockStaffs: any[] = [
    {
        id: 'st1',
        username: 'admin',
        name: '超级管理员',
        role: 'SUPER_ADMIN',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
        email: 'admin@canteen.com',
        phone: '13800138000',
        status: 'ACTIVE',
        createdAt: '2025-01-01 00:00:00'
    },
    {
        id: 'st2',
        username: 'zhangsan',
        name: '张三',
        role: 'CANTEEN_MANAGER',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zhang',
        email: 'zhangsan@canteen.com',
        phone: '13912345678',
        status: 'ACTIVE',
        createdAt: '2025-06-15 10:30:00'
    },
    {
        id: 'st3',
        username: 'lisi',
        name: '李四',
        role: 'OPERATOR',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Li',
        email: 'lisi@canteen.com',
        phone: '13788889999',
        status: 'INACTIVE',
        createdAt: '2025-10-20 14:20:00'
    }
];

let mockSystemConfig = {
    business_hours: ['08:00', '20:00'],
    delivery_fee: 5,
    free_delivery_threshold: 30,
    stock_alert_threshold: 20,
    auto_accept_order: true,
    maintenance_mode: false
};

// 获取员工列表
export const mockGetStaffs = () => {
    return new Promise<any>((resolve) => {
        setTimeout(() => {
            resolve({
                code: 200,
                message: '成功',
                data: [...mockStaffs]
            });
        }, 500);
    });
};

// 新增员工
export const mockCreateStaff = (data: any) => {
    return new Promise<any>((resolve) => {
        const newStaff = {
            ...data,
            id: 'st' + (mockStaffs.length + 1),
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`,
            status: 'ACTIVE',
            createdAt: new Date().toLocaleString()
        };
        mockStaffs.unshift(newStaff);
        setTimeout(() => {
            resolve({
                code: 200,
                message: '新增成功',
                data: newStaff
            });
        }, 500);
    });
};

// 更新员工
export const mockUpdateStaff = (id: string, data: any) => {
    return new Promise<any>((resolve) => {
        const index = mockStaffs.findIndex(s => s.id === id);
        if (index !== -1) {
            mockStaffs[index] = { ...mockStaffs[index], ...data };
        }
        setTimeout(() => {
            resolve({
                code: 200,
                message: '更新成功',
                data: mockStaffs[index]
            });
        }, 500);
    });
};

// 删除员工
export const mockDeleteStaff = (id: string) => {
    return new Promise<any>((resolve) => {
        mockStaffs = mockStaffs.filter(s => s.id !== id);
        setTimeout(() => {
            resolve({
                code: 200,
                message: '删除成功',
                data: null
            });
        }, 500);
    });
};

// 获取系统配置
export const mockGetSystemConfig = () => {
    return new Promise<any>((resolve) => {
        setTimeout(() => {
            resolve({
                code: 200,
                message: '成功',
                data: mockSystemConfig
            });
        }, 500);
    });
};

// 更新系统配置
export const mockUpdateSystemConfig = (data: any) => {
    return new Promise<any>((resolve) => {
        mockSystemConfig = { ...mockSystemConfig, ...data };
        setTimeout(() => {
            resolve({
                code: 200,
                message: '配置更新成功',
                data: mockSystemConfig
            });
        }, 500);
    });
};

// ============ 权限管理相关 Mock ============

let mockPermissions: any[] = [
    { id: 'p1', name: '数据看板', code: 'dashboard:view', type: 'MENU' },
    { id: 'p2', name: '商品管理', code: 'product:manage', type: 'MENU' },
    { id: 'p3', name: '订单管理', code: 'order:manage', type: 'MENU' },
    { id: 'p4', name: '用户管理', code: 'user:manage', type: 'MENU' },
    { id: 'p5', name: '食堂管理', code: 'canteen:manage', type: 'MENU' },

    { id: 'p6', name: '营销管理', code: 'marketing:group', type: 'MENU' },
    { id: 'p6_1', name: '优惠券管理', code: 'marketing:coupons', type: 'MENU', parentId: 'p6' },
    { id: 'p6_2', name: '活动管理', code: 'marketing:promotions', type: 'MENU', parentId: 'p6' },

    { id: 'p7', name: '数据分析', code: 'analytics:view', type: 'MENU' },

    { id: 'p8', name: '系统设置', code: 'settings:group', type: 'MENU' },
    { id: 'p8_1', name: '员工管理', code: 'settings:staff', type: 'MENU', parentId: 'p8' },
    { id: 'p8_2', name: '角色管理', code: 'settings:roles', type: 'MENU', parentId: 'p8' },
    { id: 'p8_3', name: '权限管理', code: 'settings:permissions', type: 'MENU', parentId: 'p8' },
    { id: 'p8_4', name: '系统配置', code: 'settings:config', type: 'MENU', parentId: 'p8' },

    { id: 'p9', name: '功能操作', code: 'actions:group', type: 'MENU' },
    { id: 'p9_1', name: '食堂增删', code: 'canteen:edit', type: 'ACTION', parentId: 'p9' },
    { id: 'p9_2', name: '订单接单', code: 'order:accept', type: 'ACTION', parentId: 'p9' },
    { id: 'p9_3', name: '员工维护', code: 'staff:edit', type: 'ACTION', parentId: 'p9' },
];

let mockRoles: any[] = [
    {
        id: 'r1',
        name: '超级管理员',
        code: 'SUPER_ADMIN',
        description: '系统最高权限，可管理所有模块',
        permissions: mockPermissions.map(p => p.id),
        status: 'ACTIVE',
        createdAt: '2025-01-01 00:00:00'
    },
    {
        id: 'r2',
        name: '食堂经理',
        code: 'CANTEEN_MANAGER',
        description: '负责食堂日常运营与订单管理',
        permissions: ['p1', 'p2', 'p3', 'p5', 'p9_2'],
        status: 'ACTIVE',
        createdAt: '2025-06-15 10:30:00'
    },
    {
        id: 'r3',
        name: '运营专员',
        code: 'OPERATOR',
        description: '负责营销活动与商品维护',
        permissions: ['p1', 'p2', 'p6', 'p6_1', 'p6_2', 'p7'],
        status: 'ACTIVE',
        createdAt: '2025-10-20 14:20:00'
    }
];

// 获取角色列表
export const mockGetRoles = () => {
    return new Promise<any>((resolve) => {
        setTimeout(() => {
            resolve({
                code: 200,
                message: '成功',
                data: [...mockRoles]
            });
        }, 300);
    });
};

// 创建角色
export const mockCreateRole = (data: any) => {
    return new Promise<any>((resolve) => {
        const newRole = {
            ...data,
            id: 'r' + (mockRoles.length + 1),
            permissions: [],
            status: 'ACTIVE',
            createdAt: new Date().toLocaleString()
        };
        mockRoles.push(newRole);
        setTimeout(() => {
            resolve({
                code: 200,
                message: '创建成功',
                data: newRole
            });
        }, 500);
    });
};

// 更新角色
export const mockUpdateRole = (id: string, data: any) => {
    return new Promise<any>((resolve) => {
        const index = mockRoles.findIndex(r => r.id === id);
        if (index !== -1) {
            mockRoles[index] = { ...mockRoles[index], ...data };
        }
        setTimeout(() => {
            resolve({
                code: 200,
                message: '更新成功',
                data: mockRoles[index]
            });
        }, 500);
    });
};

// 删除角色
export const mockDeleteRole = (id: string) => {
    return new Promise<any>((resolve) => {
        mockRoles = mockRoles.filter(r => r.id !== id);
        setTimeout(() => {
            resolve({
                code: 200,
                message: '删除成功',
                data: null
            });
        }, 500);
    });
};

// 更新角色权限
export const mockUpdateRolePermissions = (roleId: string, permissions: string[]) => {
    return new Promise<any>((resolve, reject) => {
        setTimeout(() => {
            const index = mockRoles.findIndex(r => r.id === roleId);
            if (index !== -1) {
                mockRoles[index].permissions = permissions;
                resolve({
                    code: 200,
                    message: '权限更新成功',
                    data: mockRoles[index]
                });
            } else {
                reject({
                    code: 404,
                    message: '角色不存在'
                });
            }
        }, 500);
    });
};

// 获取权限列表
export const mockGetPermissions = () => {
    return new Promise<any>((resolve) => {
        setTimeout(() => {
            resolve({
                code: 200,
                message: '成功',
                data: [...mockPermissions]
            });
        }, 300);
    });
};
