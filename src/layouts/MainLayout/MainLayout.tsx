import React, { useState, useMemo } from 'react';
import { Layout, Menu, Avatar, Dropdown, theme } from 'antd';
import {
    DashboardOutlined,
    ShoppingOutlined,
    ShoppingCartOutlined,
    UserOutlined,
    ShopOutlined,
    SettingOutlined,
    BarChartOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    LogoutOutlined,
    GiftOutlined,
    TeamOutlined,
    SafetyCertificateOutlined,
    KeyOutlined,
    PictureOutlined,
    ApartmentOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { filterMenuByPermission } from '../../utils/permissionFilter';
import type { MenuProps } from 'antd';
import './MainLayout.css';

const { Header, Sider, Content } = Layout;

// 菜单配置，包含权限信息
const menuConfig = [
    {
        key: '/',
        icon: <DashboardOutlined />,
        label: '数据看板',
        permission: 'view:dashboard',
    },
    {
        key: '/products',
        icon: <ShoppingOutlined />,
        label: '商品管理',
        permission: 'view:products',
    },
    {
        key: '/orders',
        icon: <ShoppingCartOutlined />,
        label: '订单管理',
        permission: 'view:orders',
    },
    {
        key: '/users',
        icon: <UserOutlined />,
        label: '用户管理',
        permission: 'view:users',
    },
    {
        key: '/canteens',
        icon: <ShopOutlined />,
        label: '食堂管理',
        permission: 'view:canteens',
    },
    {
        key: 'marketing_group',
        icon: <GiftOutlined />,
        label: '营销管理',
        permission: 'view:marketing',
        children: [
            {
                key: '/marketing/coupons',
                icon: <GiftOutlined />,
                label: '优惠券管理',
                permission: 'manage:coupons',
            },
            {
                key: '/marketing/promotions',
                icon: <PictureOutlined />,
                label: '活动海报',
                permission: 'manage:promotions',
            },
        ],
    },
    {
        key: '/analytics',
        icon: <BarChartOutlined />,
        label: '数据分析',
        permission: 'view:analytics',
    },
    {
        key: 'settings_group',
        icon: <SettingOutlined />,
        label: '系统设置',
        permission: 'view:settings',
        children: [
            {
                key: '/settings/staff',
                icon: <TeamOutlined />,
                label: '员工管理',
                permission: 'manage:staff',
            },
            {
                key: '/settings/departments',
                icon: <ApartmentOutlined />,
                label: '部门管理',
                permission: 'manage:departments',
            },
            {
                key: '/settings/roles',
                icon: <KeyOutlined />,
                label: '角色管理',
                permission: 'manage:roles',
            },
            {
                key: '/settings/permissions',
                icon: <SafetyCertificateOutlined />,
                label: '权限管理',
                permission: 'view:permissions',
            },
        ],
    },
];

export const MainLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuthStore();
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    // 根据用户权限过滤菜单
    const filteredMenuItems = useMemo(() => {
        // 如果没有用户或用户没有权限，返回空数组
        if (!user?.permissions) {
            return [];
        }
        
        // 使用统一的菜单过滤函数
        const filtered = filterMenuByPermission(menuConfig, user.permissions);
        
        // 移除菜单项中的permission属性，因为它不是Menu.Item的标准属性
        const removePermissionProps = (items: any[]): MenuProps['items'] => {
            return items.map(item => {
                const { permission, children, ...rest } = item;
                const menuItem: any = rest;
                
                if (children && children.length > 0) {
                    menuItem.children = removePermissionProps(children);
                }
                
                return menuItem;
            });
        };
        
        return removePermissionProps(filtered);
    }, [user]);

    const handleMenuClick = ({ key }: { key: string }) => {
        navigate(key);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const userMenuItems: MenuProps['items'] = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: '个人信息',
        },
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: '账号设置',
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: '退出登录',
            onClick: handleLogout,
        },
    ];

    return (
        <Layout className="main-layout">
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                className="main-sider"
            >
                <div className="logo">
                    {!collapsed ? '食堂管理后台' : '食堂'}
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={filteredMenuItems}
                    onClick={handleMenuClick}
                />
            </Sider>
            <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'margin-left 0.2s' }}>
                <Header
                    style={{
                        padding: 0,
                        background: colorBgContainer,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingRight: 24,
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                            className: 'trigger',
                            onClick: () => setCollapsed(!collapsed),
                        })}
                    </div>

                    <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                        <div className="user-info">
                            <Avatar src={user?.avatar} icon={<UserOutlined />} />
                            <span className="user-name">{user?.name}</span>
                        </div>
                    </Dropdown>
                </Header>
                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                        overflow: 'auto',
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};
