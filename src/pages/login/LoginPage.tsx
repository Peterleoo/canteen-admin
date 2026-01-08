import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { login } from '../../api/auth';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login: setAuth } = useAuthStore();
    const isMock = import.meta.env.VITE_USE_MOCK !== 'false';

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            // 在 mock 模式下，将 email 字段映射为 username 传给 login
            const loginData = isMock ? { ...values, username: values.email } : values;
            const response = await login(loginData);
            const { token, user } = response.data;

            setAuth(token, user);
            message.success('登录成功');
            navigate('/');
        } catch (error) {
            // 错误已在 request 拦截器中处理
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-background" />
            <Card className="login-card" bordered={false}>
                <div className="login-header">
                    <h1>食堂运营管理后台</h1>
                    <p>Canteen Management System</p>
                </div>

                <Form
                    name="login"
                    onFinish={onFinish}
                    autoComplete="off"
                    size="large"
                >
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: `请输入${isMock ? '用户名' : '邮箱'}` },
                            ...(isMock ? [] : [{ type: 'email' as const, message: '请输入有效的邮箱地址' }])
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder={isMock ? '用户名' : '邮箱'}
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: '请输入密码' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="密码"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                        >
                            登录
                        </Button>
                    </Form.Item>
                </Form>

                <div className="login-footer">
                    {isMock ? (
                        <p>本地开发模式 (Mock 数据)</p>
                    ) : (
                        <p>通过 Supabase Auth 进行身份验证</p>
                    )}
                </div>
            </Card>
        </div>
    );
};
