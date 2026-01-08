-- 1. 管理员用户扩展信息表 (需配合 Auth.users 触发器)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    name TEXT,
    role TEXT DEFAULT 'OPERATOR',
    avatar TEXT,
    phone TEXT,
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. 食堂表
CREATE TABLE canteens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    distance TEXT,
    status TEXT DEFAULT 'OPEN',
    contact_phone TEXT,
    manager TEXT,
    capacity INTEGER DEFAULT 0,
    current_orders INTEGER DEFAULT 0,
    delivery_enabled BOOLEAN DEFAULT TRUE,
    delivery_radius DECIMAL,
    delivery_fee DECIMAL,
    free_delivery_threshold DECIMAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. 商品表
CREATE TABLE products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL NOT NULL,
    original_price DECIMAL,
    category TEXT,
    image TEXT,
    images TEXT[], -- 数组
    stock INTEGER DEFAULT 0,
    stock_alert INTEGER,
    sales INTEGER DEFAULT 0,
    tags TEXT[],
    status TEXT DEFAULT 'ACTIVE',
    is_recommended BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    is_combo BOOLEAN DEFAULT FALSE,
    combo_items JSONB, -- 存储套餐子项
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. 订单表
CREATE TABLE orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID, -- 对应前台用户ID
    canteen_id UUID REFERENCES canteens(id),
    items JSONB NOT NULL,
    subtotal DECIMAL NOT NULL,
    delivery_fee DECIMAL DEFAULT 0,
    total DECIMAL NOT NULL,
    status TEXT DEFAULT 'PENDING',
    delivery_method TEXT,
    address_id UUID,
    remark TEXT,
    estimated_time TEXT,
    actual_time TEXT,
    cancel_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. 权限管理
CREATE TABLE permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL, -- MENU, ACTION
    parent_id UUID REFERENCES permissions(id),
    description TEXT
);

CREATE TABLE roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE role_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE
);

-- 6. 营销管理
CREATE TABLE coupons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- CASH, DISCOUNT, FREE_DELIVERY
    value DECIMAL NOT NULL,
    min_amount DECIMAL DEFAULT 0,
    valid_from TIMESTAMP WITH TIME ZONE,
    valid_to TIMESTAMP WITH TIME ZONE,
    total_count INTEGER DEFAULT 0,
    used_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'ACTIVE',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE promotions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    image TEXT,
    type TEXT NOT NULL, -- BANNER, ACTIVITY
    link TEXT,
    status TEXT DEFAULT 'ACTIVE',
    sort_order INTEGER DEFAULT 0,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. 系统配置
CREATE TABLE system_configs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    config_key TEXT UNIQUE NOT NULL,
    config_value JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
