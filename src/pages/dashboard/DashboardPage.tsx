import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Skeleton, Space } from 'antd';
import {
    ArrowUpOutlined,
    ArrowDownOutlined,
    ShoppingCartOutlined,
    UserOutlined,
    RiseOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getOverviewStats, getProductRanking } from '../../api/analytics';

const columns: ColumnsType<any> = [
    {
        title: '商品名称',
        dataIndex: 'name',
        key: 'name',
        render: (text, record) => (
            <Space>
                <span>{record.icon}</span>
                <span>{text}</span>
            </Space>
        )
    },
    {
        title: '销量',
        dataIndex: 'sales',
        key: 'sales',
        sorter: (a, b) => a.sales - b.sales,
    },
    {
        title: '营业额',
        dataIndex: 'revenue',
        key: 'revenue',
        render: (value) => `¥${value.toLocaleString()}`,
        sorter: (a, b) => a.revenue - b.revenue,
    },
];

export const DashboardPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [overview, setOverview] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [statsRes, rankingRes] = await Promise.all([
                    getOverviewStats(),
                    getProductRanking()
                ]);
                setOverview(statsRes.data);
                setProducts(rankingRes.data);
            } catch (error) {
                console.error('Load dashboard data failed:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    return (
        <div style={{ padding: '4px 0' }}>
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} hoverable>
                        {loading ? <Skeleton active paragraph={{ rows: 1 }} /> : (
                            <Statistic
                                title="今日营业额"
                                value={overview?.todayRevenue}
                                precision={2}
                                prefix="¥"
                                valueStyle={{ color: '#3f8600' }}
                                suffix={
                                    <span style={{ fontSize: 14 }}>
                                        {overview?.revenueChange >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                                        {Math.abs(overview?.revenueChange)}%
                                    </span>
                                }
                            />
                        )}
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} hoverable>
                        {loading ? <Skeleton active paragraph={{ rows: 1 }} /> : (
                            <Statistic
                                title="今日订单"
                                value={overview?.todayOrders}
                                prefix={<ShoppingCartOutlined />}
                                valueStyle={{ color: '#1890ff' }}
                                suffix={
                                    <span style={{ fontSize: 14 }}>
                                        {overview?.orderChange >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                                        {Math.abs(overview?.orderChange)}%
                                    </span>
                                }
                            />
                        )}
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} hoverable>
                        {loading ? <Skeleton active paragraph={{ rows: 1 }} /> : (
                            <Statistic
                                title="新增用户"
                                value={overview?.newUsers}
                                prefix={<UserOutlined />}
                                valueStyle={{ color: '#722ed1' }}
                                suffix={
                                    <span style={{ fontSize: 14 }}>
                                        {overview?.userChange >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                                        {Math.abs(overview?.userChange)}%
                                    </span>
                                }
                            />
                        )}
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} hoverable>
                        {loading ? <Skeleton active paragraph={{ rows: 1 }} /> : (
                            <Statistic
                                title="客单价"
                                value={overview?.avgOrderValue}
                                precision={2}
                                prefix={<RiseOutlined />}
                                valueStyle={{ color: '#fa8c16' }}
                                suffix={
                                    <span style={{ fontSize: 14 }}>
                                        {overview?.avgChange >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                                        {Math.abs(overview?.avgChange)}%
                                    </span>
                                }
                            />
                        )}
                    </Card>
                </Col>
            </Row>

            <Card
                title="热销商品 TOP 5"
                bordered={false}
                style={{ marginTop: 16 }}
                extra={<a href="/analytics">查看详细分析</a>}
            >
                <Table
                    columns={columns}
                    dataSource={products}
                    rowKey="name"
                    pagination={false}
                    loading={loading}
                />
            </Card>
        </div>
    );
};
