import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, DatePicker, Segmented, Space, Table, Typography, Skeleton } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, AccountBookOutlined, ShoppingCartOutlined, UserAddOutlined, BarChartOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import {
    getOverviewStats,
    getRevenueTrend,
    getOrderDistribution,
    getProductRanking
} from '../../api/analytics';

const { Title, Text } = Typography;

const AnalyticsPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [overviewData, setOverviewData] = useState<any>(null);
    const [revenueTrend, setRevenueTrend] = useState<any[]>([]);
    const [distributionData, setDistributionData] = useState<any[]>([]);
    const [rankingData, setRankingData] = useState<any[]>([]);
    const [period, setPeriod] = useState<string | number>(7);

    useEffect(() => {
        fetchData();
    }, [period]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [overview, trend, dist, ranking] = await Promise.all([
                getOverviewStats(),
                getRevenueTrend(Number(period)),
                getOrderDistribution(),
                getProductRanking()
            ]);

            setOverviewData(overview.data);
            setRevenueTrend(trend.data);
            setDistributionData(dist.data);
            setRankingData(ranking.data);
        } catch (error) {
            console.error('Fetch analytics data failed:', error);
        } finally {
            setLoading(false);
        }
    };

    // 营收趋势配置
    const getRevenueOption = () => ({
        tooltip: {
            trigger: 'axis',
        },
        legend: {
            data: ['营收', '订单数'],
            bottom: 0
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '10%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: revenueTrend.map(item => item.date)
        },
        yAxis: [
            {
                type: 'value',
                name: '营收 (元)',
            },
            {
                type: 'value',
                name: '订单数',
                position: 'right'
            }
        ],
        series: [
            {
                name: '营收',
                type: 'line',
                smooth: true,
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [{ offset: 0, color: '#1890ff' }, { offset: 1, color: '#ffffff' }]
                    }
                },
                data: revenueTrend.map(item => item.revenue)
            },
            {
                name: '订单数',
                type: 'line',
                smooth: true,
                yAxisIndex: 1,
                lineStyle: { color: '#52c41a' },
                data: revenueTrend.map(item => item.orders)
            }
        ]
    });

    // 时段分布配置
    const getDistributionOption = () => ({
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: distributionData.map(item => item.hour)
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                name: '订单量',
                type: 'bar',
                data: distributionData.map(item => item.orders),
                itemStyle: {
                    color: '#faad14'
                }
            }
        ]
    });

    const columns = [
        {
            title: '排名',
            dataIndex: 'index',
            key: 'index',
            width: 80,
            render: (_: any, __: any, index: number) => (
                <span style={{
                    display: 'inline-block',
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: index < 3 ? '#ff4d4f' : '#f0f2f5',
                    color: index < 3 ? '#fff' : '#000',
                    textAlign: 'center',
                    lineHeight: '24px'
                }}>
                    {index + 1}
                </span>
            )
        },
        {
            title: '商品名称',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: any) => (
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
            sorter: (a: any, b: any) => a.sales - b.sales,
        },
        {
            title: '销售额',
            dataIndex: 'revenue',
            key: 'revenue',
            render: (val: number) => `¥${val.toLocaleString()}`,
            sorter: (a: any, b: any) => a.revenue - b.revenue,
        }
    ];

    return (
        <div className="analytics-container" style={{ padding: '24px' }}>
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={2} style={{ margin: 0 }}>经营分析</Title>
                <Space size="large">
                    <Segmented
                        options={[
                            { label: '近7天', value: 7 },
                            { label: '近30天', value: 30 }
                        ]}
                        value={period}
                        onChange={(val) => setPeriod(val)}
                    />
                    <DatePicker.RangePicker />
                </Space>
            </div>

            {/* 统计概览 */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} hoverable>
                        <Statistic
                            title="今日营收"
                            value={overviewData?.todayRevenue}
                            precision={2}
                            prefix={<AccountBookOutlined />}
                            suffix="元"
                        />
                        <div style={{ marginTop: '8px' }}>
                            <Text type="secondary">环比昨日 </Text>
                            <Text type={overviewData?.revenueChange >= 0 ? 'danger' : 'success'}>
                                {overviewData?.revenueChange >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                                {Math.abs(overviewData?.revenueChange)}%
                            </Text>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} hoverable>
                        <Statistic
                            title="今日订单"
                            value={overviewData?.todayOrders}
                            prefix={<ShoppingCartOutlined />}
                        />
                        <div style={{ marginTop: '8px' }}>
                            <Text type="secondary">环比昨日 </Text>
                            <Text type={overviewData?.orderChange >= 0 ? 'danger' : 'success'}>
                                {overviewData?.orderChange >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                                {Math.abs(overviewData?.orderChange)}%
                            </Text>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} hoverable>
                        <Statistic
                            title="新增用户"
                            value={overviewData?.newUsers}
                            prefix={<UserAddOutlined />}
                        />
                        <div style={{ marginTop: '8px' }}>
                            <Text type="secondary">环比昨日 </Text>
                            <Text type={overviewData?.userChange >= 0 ? 'danger' : 'success'}>
                                {overviewData?.userChange >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                                {Math.abs(overviewData?.userChange)}%
                            </Text>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} hoverable>
                        <Statistic
                            title="客单价"
                            value={overviewData?.avgOrderValue}
                            precision={2}
                            prefix={<BarChartOutlined />}
                            suffix="元"
                        />
                        <div style={{ marginTop: '8px' }}>
                            <Text type="secondary">环比昨日 </Text>
                            <Text type={overviewData?.avgChange >= 0 ? 'danger' : 'success'}>
                                {overviewData?.avgChange >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                                {Math.abs(overviewData?.avgChange)}%
                            </Text>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* 营收趋势与分布 */}
            <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
                <Col xs={24} lg={16}>
                    <Card title="营收趋势" bordered={false}>
                        {loading ? <Skeleton active paragraph={{ rows: 8 }} /> : (
                            <ReactECharts option={getRevenueOption()} style={{ height: '400px' }} />
                        )}
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card title="订单时段分布" bordered={false}>
                        {loading ? <Skeleton active paragraph={{ rows: 8 }} /> : (
                            <ReactECharts option={getDistributionOption()} style={{ height: '400px' }} />
                        )}
                    </Card>
                </Col>
            </Row>

            {/* 商品排行 */}
            <Card title="热销商品排行" bordered={false} style={{ marginTop: '24px' }}>
                <Table
                    columns={columns}
                    dataSource={rankingData}
                    rowKey="name"
                    pagination={false}
                    loading={loading}
                />
            </Card>
        </div>
    );
};

export default AnalyticsPage;
