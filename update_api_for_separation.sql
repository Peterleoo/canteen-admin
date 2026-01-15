-- 分离后API更新建议
-- 以下是前端API需要更新的部分，用于适配新的数据库结构

-- 1. 更新src/api/settings.ts中的员工管理API
/*
// 将getStaffs函数更新为指向staffs表
export const getStaffs = async (): Promise<ApiResponse<AdminUser[]>> => {
    if (USE_MOCK) {
        // mock数据保持不变
        return mockGetStaffs();
    }

    const { data, error } = await supabase
        .from('staffs') // 从profiles改为staffs
        .select(`
            id,
            username,
            name,
            role,
            avatar,
            email,
            phone,
            status,
            created_at,
            department_id,
            department:departments (id, name)
        `)
        .order('created_at', { ascending: false });

    if (error) return { code: 500, message: error.message, data: [] };

    return { code: 200, message: '获取成功', data: data as unknown as AdminUser[] };
};

// 将createStaff函数更新为指向staffs表
export const createStaff = async (data: any): Promise<ApiResponse<any>> => {
    if (USE_MOCK) return mockCreateStaff(data);

    // 适配数据库字段映射
    const payload = {
        ...data,
        id: crypto.randomUUID() // 测试环境手动分配 ID
    };

    const { data: newData, error } = await supabase
        .from('staffs') // 从profiles改为staffs
        .insert([payload])
        .select()
        .single();

    if (error) return { code: 500, message: error.message, data: null };
    return { code: 200, message: '创建成功', data: newData };
};

// 同样更新updateStaff和deleteStaff函数，将from('profiles')改为from('staffs')
*/

-- 2. 更新src/api/user.ts中的用户管理API
/*
// 将getUsers函数更新为指向users表
export const getUsers = async (params: UserQueryParams): Promise<ApiResponse<PaginationResponse<User>>> => {
    if (USE_MOCK) {
        return mockGetUsers(params) as Promise<ApiResponse<PaginationResponse<User>>>;
    }

    const { page = 1, pageSize = 10, keyword = '' } = params;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase.from('users').select('*', { count: 'exact' }); // 从profiles改为users

    // 如果有关键词，搜索用户名或邮箱
    if (keyword) {
        query = query.or(`username.ilike.%${keyword}%,email.ilike.%${keyword}%`);
    }

    const { data, error, count } = await query
        .range(from, to)
        .order('created_at', { ascending: false });

    return wrapResponse({
        data: (data || []) as User[],
        total: count || 0,
        page,
        pageSize
    }, error);
};

// 同样更新getUserDetail和updateUserStatus函数，将from('profiles')改为from('users')
*/

-- 3. 更新src/api/order.ts中的订单关联
/*
// 将订单查询中的profiles关联改为users关联
export const getOrders = async (params: {
    page: number;
    pageSize: number;
    status?: OrderStatusType;
    keyword?: string;
    userId?: string;
}) => {
    // ... 其他代码保持不变

    let query = supabase
        .from('orders')
        // 将profiles(*)改为users(*)
        .select('*, users(*), canteens(*), order_items(*)', { count: 'exact' });

    // ... 其他代码保持不变
};

// 将订单详情查询中的profiles关联改为users关联
export const getOrderDetail = async (id: string, userId?: string): Promise<ApiResponse<Order>> => {
    // ... 其他代码保持不变

    let query = supabase
        .from('orders')
        // 将profiles(*)改为users(*)
        .select('*, users(*), canteens(*), order_items(*)')
        .eq('id', id);

    // ... 其他代码保持不变
};
*/

-- 4. 更新src/types/index.ts中的类型定义
/*
// 确保Order接口中的profiles关联改为users关联
export interface Order {
    id: number;
    user_id: string;
    users?: User; // 从profiles改为users
    canteen_id: number;
    canteens?: Canteen;
    order_items?: OrderItem[];
    // ... 其他字段保持不变
}
*/

-- 5. 更新src/pages/orders/OrderListPage.tsx中的关联字段
/*
// 将渲染用户信息的代码从profiles改为users
const columns: ColumnsType<Order> = [
    // ... 其他列保持不变
    {
        title: '用户信息',
        key: 'user',
        width: 180,
        render: (_, record: any) => (
            <div>
                <div style={{ fontWeight: 'bold' }}>{record.users?.username || '匿名用户'}</div> {/* 从profiles改为users */}
                <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.users?.email || '无邮箱'}</div> {/* 从profiles改为users */}
            </div>
        ),
    },
    // ... 其他列保持不变
];
*/

-- 6. 更新src/pages/orders/OrderListPage.tsx中的订单详情用户信息
/*
// 将订单详情中的profiles改为users
<Descriptions title="用户信息" bordered column={2}>
    <Descriptions.Item label="姓名">{(currentOrder as any).users?.username || '未知'}</Descriptions.Item> {/* 从profiles改为users */}
    <Descriptions.Item label="邮箱">{(currentOrder as any).users?.email || '无'}</Descriptions.Item> {/* 从profiles改为users */}
    {/* ... 其他字段保持不变 */}
</Descriptions>
*/

-- 7. 清理不再需要的代码
-- 删除src/api/settings.ts中与用户管理相关的函数（如果有）
-- 删除src/api/user.ts中与员工管理相关的函数（如果有）
-- 更新所有组件中使用profiles关联的地方为users关联

-- 8. 测试建议
/*
1. 启动开发服务器：npm run dev
2. 访问后台员工管理页面，确认能正常查看、添加、编辑和删除员工
3. 访问前台用户管理页面，确认能正常查看、添加、编辑和删除用户
4. 访问订单管理页面，确认订单能正确关联到前台用户
5. 运行构建命令：npm run build，确认没有构建错误
6. 运行测试命令（如果有），确认所有测试通过
*/