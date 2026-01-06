import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { login } from '../../api/auth';
import type { LoginParams } from '../../api/auth';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login: setAuth } = useAuthStore();

    const onFinish = async (values: LoginParams) => {
        setLoading(true);
        try {
            const response = await login(values);
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
                        name="username"
                        rules={[{ required: true, message: '请输入用户名' }]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="用户名"
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
                    <p>默认账号: admin / admin123</p>
                </div>
            </Card>
        </div>
    );
};
