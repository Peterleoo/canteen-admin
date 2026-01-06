import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { LoginPage } from './pages/login/LoginPage';
import { MainLayout } from './layouts/MainLayout';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { ProductListPage } from './pages/products/ProductListPage';
import { OrderListPage } from './pages/orders/OrderListPage';
import { UserListPage } from './pages/users/UserListPage';
import { CanteenListPage } from './pages/canteens/CanteenListPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import CouponManagementPage from './pages/marketing/CouponManagementPage';
import PromotionManagementPage from './pages/marketing/PromotionManagementPage';
import StaffManagementPage from './pages/settings/StaffManagementPage';
import SystemConfigPage from './pages/settings/SystemConfigPage';
import RoleManagementPage from './pages/settings/RoleManagementPage';
import PermissionManagementPage from './pages/settings/PermissionManagementPage';
import { useAuthStore } from './stores/useAuthStore';

// 路由守卫组件
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 8,
        },
      }}
    >
      <AntApp>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <MainLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="products" element={<ProductListPage />} />
              <Route path="orders" element={<OrderListPage />} />
              <Route path="users" element={<UserListPage />} />
              <Route path="canteens" element={<CanteenListPage />} />
              <Route path="marketing">
                <Route path="coupons" element={<CouponManagementPage />} />
                <Route path="promotions" element={<PromotionManagementPage />} />
              </Route>
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="settings">
                <Route path="staff" element={<StaffManagementPage />} />
                <Route path="roles" element={<RoleManagementPage />} />
                <Route path="permissions" element={<PermissionManagementPage />} />
                <Route path="config" element={<SystemConfigPage />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
