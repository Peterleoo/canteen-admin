import React, { useState, useEffect } from 'react';
import {
    Table,
    Tag,
    Space,
    Button,
    Card,
    Tabs,
    Input,
    message,
    Modal,
    Descriptions,
    Divider,
} from 'antd';
import {
    EyeOutlined,
    CheckCircleOutlined,
    PlayCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getOrders, updateOrderStatus } from '../../api/order';
import { OrderStatus, type Order, type OrderStatus as OrderStatusType } from '../../types/index';
import dayjs from 'dayjs';

const { Search } = Input;

export const OrderListPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [statusFilter, setStatusFilter] = useState<OrderStatusType | undefined>();
    const [keyword, setKeyword] = useState('');

    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const response = await getOrders({
                page,
                pageSize,
                status: statusFilter,
                keyword,
            });
            setOrders(response.data.data);
            setTotal(response.data.total);
        } catch (error) {
            message.error('加载订单失败');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, [page, pageSize, statusFilter, keyword]);

    const handleStatusChange = async (id: string, status: OrderStatusType) => {
        try {
            await updateOrderStatus(id, status);
            message.success(`订单状态已更新为 ${status}`);
            loadOrders();
            if (currentOrder && currentOrder.id === id) {
                setCurrentOrder({ ...currentOrder, status });
            }
        } catch (error) {
            message.error('状态更新失败');
        }
    };

    const showDetail = (order: Order) => {
        setCurrentOrder(order);
        setIsDetailVisible(true);
    };

    const statusTags: Record<string, string> = {
        [OrderStatus.PENDING]: 'orange',
        [OrderStatus.PREPARING]: 'blue',
        [OrderStatus.DELIVERING]: 'cyan',
        [OrderStatus.READY_FOR_PICKUP]: 'purple',
        [OrderStatus.COMPLETED]: 'green',
        [OrderStatus.CANCELLED]: 'default',
    };

    const columns: ColumnsType<Order> = [
        {
            title: '订单编号',
            dataIndex: 'id',
            key: 'id',
            width: 120,
        },
        {
            title: '用户信息',
            key: 'user',
            width: 180,
            render: (_, record) => (
                <div>
                    <div style={{ fontWeight: 'bold' }}>{record.user?.name}</div>
                    <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.user?.phone}</div>
                </div>
            ),
        },
        {
            title: '订单金额',
            dataIndex: 'total',
            key: 'total',
            width: 100,
            render: (total) => `¥${total.toFixed(2)}`,
        },
        {
            title: '配送方式',
            dataIndex: 'deliveryMethod',
            key: 'deliveryMethod',
            width: 100,
            render: (method) => (
                <Tag color={method === 'DELIVERY' ? 'geekblue' : 'gold'}>
                    {method === 'DELIVERY' ? '外送' : '自提'}
                </Tag>
            ),
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => <Tag color={statusTags[status]}>{status}</Tag>,
        },
        {
            title: '下单时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 180,
            render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
        },
        {
            title: '操作',
            key: 'action',
            width: 250,
            render: (_, record) => (
                <Space size="middle">
                    <Button icon={<EyeOutlined />} onClick={() => showDetail(record)}>详情</Button>

                    {record.status === OrderStatus.PENDING && (
                        <Button
                            type="primary"
                            icon={<PlayCircleOutlined />}
                            onClick={() => handleStatusChange(record.id, OrderStatus.PREPARING)}
                        >
                            接单
                        </Button>
                    )}

                    {record.status === OrderStatus.PREPARING && (
                        <Button
                            type="primary"
                            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                            icon={<CheckCircleOutlined />}
                            onClick={() => handleStatusChange(record.id, record.deliveryMethod === 'DELIVERY' ? OrderStatus.DELIVERING : OrderStatus.READY_FOR_PICKUP)}
                        >
                            备餐完成
                        </Button>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <Card>
            <Tabs
                defaultActiveKey="ALL"
                onChange={(key) => {
                    setStatusFilter(key === 'ALL' ? undefined : (key as OrderStatusType));
                    setPage(1);
                }}
                items={[
                    { label: '全部订单', key: 'ALL' },
                    { label: '待处理', key: OrderStatus.PENDING },
                    { label: '进行中', key: OrderStatus.PREPARING },
                    { label: '已完成', key: OrderStatus.COMPLETED },
                    { label: '已取消', key: OrderStatus.CANCELLED },
                ]}
            />

            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Space>
                    <Search
                        placeholder="搜索订单号/姓名/手机号"
                        onSearch={(value) => {
                            setKeyword(value);
                            setPage(1);
                        }}
                        style={{ width: 300 }}
                        allowClear
                    />
                </Space>

                <Button onClick={loadOrders}>刷新列表</Button>
            </div>

            <Table
                columns={columns}
                dataSource={orders}
                rowKey="id"
                loading={loading}
                pagination={{
                    current: page,
                    pageSize: pageSize,
                    total: total,
                    onChange: (p, ps) => {
                        setPage(p);
                        setPageSize(ps);
                    },
                    showTotal: (t) => `共 ${t} 条订单`,
                }}
            />

            <Modal
                title="订单详情"
                open={isDetailVisible}
                onCancel={() => setIsDetailVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsDetailVisible(false)}>关闭</Button>,
                    currentOrder?.status === OrderStatus.PENDING && (
                        <Button key="cancel" danger onClick={() => handleStatusChange(currentOrder.id, OrderStatus.CANCELLED)}>
                            驳回订单
                        </Button>
                    ),
                ]}
                width={700}
            >
                {currentOrder && (
                    <div>
                        <Descriptions title="基本信息" bordered column={2}>
                            <Descriptions.Item label="订单编号">{currentOrder.id}</Descriptions.Item>
                            <Descriptions.Item label="下单时间">{dayjs(currentOrder.createdAt).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
                            <Descriptions.Item label="当前状态"><Tag color={statusTags[currentOrder.status]}>{currentOrder.status}</Tag></Descriptions.Item>
                            <Descriptions.Item label="配送方式">{currentOrder.deliveryMethod === 'DELIVERY' ? '外送' : '自提'}</Descriptions.Item>
                        </Descriptions>

                        <Divider />

                        <Descriptions title="用户信息" bordered column={2}>
                            <Descriptions.Item label="姓名">{currentOrder.user?.name}</Descriptions.Item>
                            <Descriptions.Item label="电话">{currentOrder.user?.phone}</Descriptions.Item>
                            {currentOrder.deliveryMethod === 'DELIVERY' && (
                                <Descriptions.Item label="配送地址" span={2}>
                                    {currentOrder.address?.area} {currentOrder.address?.detail}
                                </Descriptions.Item>
                            )}
                        </Descriptions>

                        <Divider />

                        <Table
                            title={() => <span style={{ fontWeight: 'bold' }}>商品清单</span>}
                            dataSource={currentOrder.items}
                            pagination={false}
                            rowKey="id"
                            columns={[
                                { title: '商品', dataIndex: 'name', key: 'name' },
                                { title: '单价', dataIndex: 'price', key: 'price', render: (p) => `¥${p.toFixed(2)}` },
                                { title: '数量', dataIndex: 'quantity', key: 'quantity' },
                                { title: '小计', key: 'subtotal', render: (_, r) => `¥${(r.price * r.quantity).toFixed(2)}` },
                            ]}
                        />

                        <div style={{ marginTop: 16, textAlign: 'right', fontSize: '16px' }}>
                            <div>商品小计: ¥{currentOrder.subtotal.toFixed(2)}</div>
                            <div>配送费: ¥{currentOrder.deliveryFee.toFixed(2)}</div>
                            <div style={{ fontSize: '20px', fontWeight: 'bold', marginTop: 8 }}>
                                实付款: <span style={{ color: '#ff4d4f' }}>¥{currentOrder.total.toFixed(2)}</span>
                            </div>
                        </div>

                        {currentOrder.remark && (
                            <div style={{ marginTop: 16 }}>
                                <span style={{ fontWeight: 'bold' }}>备注：</span>
                                <span style={{ color: '#8c8c8c' }}>{currentOrder.remark}</span>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </Card>
    );
};
