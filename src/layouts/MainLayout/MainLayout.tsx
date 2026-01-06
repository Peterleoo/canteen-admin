import React, { useState } from 'react';
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
    ControlOutlined,
    PictureOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import type { MenuProps } from 'antd';
import './MainLayout.css';

const { Header, Sider, Content } = Layout;

const menuItems: MenuProps['items'] = [
    {
        key: '/',
        icon: <DashboardOutlined />,
        label: '数据看板',
    },
    {
        key: '/products',
        icon: <ShoppingOutlined />,
        label: '商品管理',
    },
    {
        key: '/orders',
        icon: <ShoppingCartOutlined />,
        label: '订单管理',
    },
    {
        key: '/users',
        icon: <UserOutlined />,
        label: '用户管理',
    },
    {
        key: '/canteens',
        icon: <ShopOutlined />,
        label: '食堂管理',
    },
    {
        key: 'marketing_group',
        icon: <GiftOutlined />,
        label: '营销管理',
        children: [
            {
                key: '/marketing/coupons',
                icon: <GiftOutlined />,
                label: '优惠券管理',
            },
            {
                key: '/marketing/promotions',
                icon: <PictureOutlined />,
                label: '活动海报',
            },
        ],
    },
    {
        key: '/analytics',
        icon: <BarChartOutlined />,
        label: '数据分析',
    },
    {
        key: 'settings_group',
        icon: <SettingOutlined />,
        label: '系统设置',
        children: [
            {
                key: '/settings/staff',
                icon: <TeamOutlined />,
                label: '员工管理',
            },
            {
                key: '/settings/roles',
                icon: <KeyOutlined />,
                label: '角色管理',
            },
            {
                key: '/settings/permissions',
                icon: <SafetyCertificateOutlined />,
                label: '权限管理',
            },
            {
                key: '/settings/config',
                icon: <ControlOutlined />,
                label: '系统配置',
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
                    items={menuItems}
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
