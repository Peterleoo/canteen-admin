const STATUS_TEXT: Record<string, string> = {
    'PENDING': '待处理',
    'PREPARING': '准备中',
    'DELIVERING': '配送中',
    'READY_FOR_PICKUP': '待自提',
    'COMPLETED': '已完成',
    'CANCELLED': '已取消',
};

// 手机号码隐藏中间4位的辅助函数
const formatPhoneNumber = (phone?: string) => {
    if (!phone) return '';
    if (phone.length !== 11) return phone;
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};

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
import { getOrders, updateOrderStatus, getOrderDetail } from '../../api/order';
import { OrderStatus, type Order, type OrderStatusType } from '../../types/index';
import dayjs from 'dayjs';
import { useAuthStore } from '../../stores/useAuthStore';

const { Search } = Input;

export const OrderListPage: React.FC = () => {
    const { user } = useAuthStore();
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
                userId: user?.id,  // 传递userId用于权限过滤
            });
            // 修正：Supabase API 返回的是 list 和 total
            console.log('DEBUG: Fetched orders:', response.data.list); // 添加调试日志
            setOrders(response.data.list || []);
            setTotal(response.data.total || 0);
        } catch (error) {
            message.error('加载订单失败');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, [page, pageSize, statusFilter, keyword]);

    const handleStatusChange = async (id: any, status: OrderStatusType) => {
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

    const showDetail = async (order: Order) => {
        setLoading(true);
        try {
            // 关键修复：将 order.id 转为字符串以匹配 API 定义
            const response = await getOrderDetail(String(order.id));

            if (response.code === 200 && response.data) {
                setCurrentOrder(response.data);
                setIsDetailVisible(true);
            } else {
                message.error('获取订单详情失败: ' + response.message);
            }
        } catch (error) {
            message.error('请求详情出错');
        } finally {
            setLoading(false);
        }
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
            width: 80,
        },
        {
            title: '所属食堂',
            dataIndex: 'canteens',
            key: 'canteen',
            width: 150,
            render: (canteens: any) => (
                <Tag color="green">
                    {canteens?.name || '未知食堂'}
                </Tag>
            ),
        },
        {
            title: '用户信息',
            key: 'user',
            width: 180,
            render: (_, record: any) => (
                <div>
                    <div style={{ fontWeight: 'bold' }}>{record.users?.username || '匿名用户'}</div>
                    <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                        {record.users?.phone ? formatPhoneNumber(record.users.phone) : '无手机号码'}
                    </div>
                </div>
            ),
        },
        {
            title: '订单金额',
            dataIndex: 'total',
            key: 'total',
            width: 100,
            render: (total) => (
                <span style={{ fontWeight: 'bold', color: '#ff4d4f' }}>
                    ¥{Number(total || 0).toFixed(2)}
                </span>
            ),
        },
        {
            title: '配送方式',
            dataIndex: 'delivery_method',
            key: 'delivery_method',
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
            render: (status: string) => {
                const s = (status || '').toUpperCase(); // 强制转大写匹配映射表
                return <Tag color={statusTags[s] || 'default'}>{STATUS_TEXT[s] || s}</Tag>;
            },
        },
        {
            title: '下单时间',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 180,
            render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
        },
        {
            title: '操作',
            key: 'action',
            width: 200,
            render: (_, record) => {
                const s = (record.status || '').toUpperCase();
                return (
                    <Space size="middle">
                        <Button size="small" icon={<EyeOutlined />} onClick={() => showDetail(record)}>详情</Button>

                        {s === 'PENDING' && (
                            <Button
                                size="small"
                                type="primary"
                                icon={<PlayCircleOutlined />}
                                onClick={() => handleStatusChange(record.id, OrderStatus.PREPARING)}
                            >
                                接单
                            </Button>
                        )}

                        {s === 'PREPARING' && (
                            <Button
                                size="small"
                                type="primary"
                                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                                icon={<CheckCircleOutlined />}
                                onClick={() => handleStatusChange(
                                    record.id,
                                    record.delivery_method === 'DELIVERY' ? OrderStatus.DELIVERING : OrderStatus.READY_FOR_PICKUP
                                )}
                            >
                                备餐完成
                            </Button>
                        )}
                        {/* 3. 配送中 或 待自提 -> 完成订单 (新增逻辑) */}
                        {(s === 'DELIVERING' || s === 'READY_FOR_PICKUP') && (
                            <Button
                                size="small"
                                type="primary"
                                style={{ backgroundColor: '#1890ff' }}
                                icon={<CheckCircleOutlined />}
                                onClick={() => handleStatusChange(record.id, OrderStatus.COMPLETED)}
                            >
                                完成订单
                            </Button>
                        )}
                    </Space>
                );
            },
        },
    ]; // 注意：这里是唯一的 columns 结束点

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
                    { label: '准备中', key: OrderStatus.PREPARING },
                    { label: '配送中', key: OrderStatus.DELIVERING },
                    { label: '自提中', key: OrderStatus.READY_FOR_PICKUP },
                    { label: '已完成', key: OrderStatus.COMPLETED },
                    { label: '已取消', key: OrderStatus.CANCELLED },
                ]}
            />

            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Space>
                    <Search
                        placeholder="搜索订单号"
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
                {currentOrder && (() => {
                    // 直接使用数据库中已计算好的金额字段
                    const itemsSubtotal = Number(currentOrder.subtotal || 0);
                    const packingFee = Number(currentOrder.packaging_fee || 0);
                    const deliveryFee = Number(currentOrder.delivery_fee || 0);
                    const discountAmount = Number(currentOrder.discount_amount || 0);
                    const finalTotal = Number(currentOrder.total || 0);

                    return (
                        <div>
                            <Descriptions title="基本信息" bordered column={2}>
                                <Descriptions.Item label="订单编号">{currentOrder.id}</Descriptions.Item>
                                <Descriptions.Item label="下单时间">{dayjs(currentOrder.created_at).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
                                <Descriptions.Item label="所属食堂">
                                    <Tag color="green">{(currentOrder as any).canteens?.name || '未知食堂'}</Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="当前状态">
                                    <Tag color={statusTags[currentOrder.status]}>{STATUS_TEXT[currentOrder.status] || currentOrder.status}</Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="配送方式">{currentOrder.delivery_method === 'DELIVERY' ? '外送' : '自提'}</Descriptions.Item>
                            </Descriptions>

                            <Divider />

                            <Descriptions title="用户信息" bordered column={2}>
                                <Descriptions.Item label="昵称">{(currentOrder as any).users?.username || '未知'}</Descriptions.Item>
                                <Descriptions.Item label="手机号码">
                                    {(currentOrder as any).users?.phone ? formatPhoneNumber((currentOrder as any).users.phone) : '无'}
                                </Descriptions.Item>
                                {currentOrder.delivery_method === 'DELIVERY' && (
                                    <Descriptions.Item label="配送地址" span={2}>
                                        {(currentOrder as any).address_detail || '暂无详细地址'}
                                    </Descriptions.Item>
                                )}
                            </Descriptions>

                            <Divider />

                            <Table
                                title={() => <span style={{ fontWeight: 'bold' }}>商品清单</span>}
                                dataSource={(currentOrder as any).order_items || []}
                                pagination={false}
                                rowKey="id"
                                size="small"
                                columns={[
                                    { title: '商品', dataIndex: 'product_name', key: 'product_name' },
                                    { title: '单价', dataIndex: 'price', render: (p) => `¥${Number(p || 0).toFixed(2)}` },
                                    { title: '数量', dataIndex: 'quantity', key: 'quantity' },
                                    { title: '小计', render: (_, r: any) => `¥${(Number(r.price || 0) * (r.quantity || 0)).toFixed(2)}` },
                                ]}
                            />

                            {/* --- 2. 汇总金额显示区域 --- */}
                            <div style={{ marginTop: 16, textAlign: 'right', fontSize: '14px', borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
                                <div style={{ marginBottom: 4 }}>
                                    商品小计: <span style={{ width: 100, display: 'inline-block' }}>¥{itemsSubtotal.toFixed(2)}</span>
                                </div>

                                <div style={{ marginBottom: 4 }}>
                                    打包费: <span style={{ width: 100, display: 'inline-block' }}>¥{packingFee.toFixed(2)}</span>
                                </div>

                                <div style={{ marginBottom: 4 }}>
                                    配送费: <span style={{ width: 100, display: 'inline-block' }}>
                                        {currentOrder.delivery_method === 'PICKUP' ? '¥0.00 (自提)' : `¥${deliveryFee.toFixed(2)}`}
                                    </span>
                                </div>

                                {discountAmount > 0 && (
                                    <div style={{ marginBottom: 4, color: '#ff4d4f' }}>
                                        优惠减免: <span style={{ width: 100, display: 'inline-block' }}>-¥{discountAmount.toFixed(2)}</span>
                                    </div>
                                )}

                                <div style={{ fontSize: '18px', fontWeight: 'bold', marginTop: 12 }}>
                                    实付款: <span style={{ color: '#ff4d4f', width: 100, display: 'inline-block' }}>
                                        ¥{finalTotal.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {currentOrder.remark && (
                                <div style={{ marginTop: 16 }}>
                                    <span style={{ fontWeight: 'bold' }}>备注：</span>
                                    <span style={{ color: '#8c8c8c' }}>{currentOrder.remark}</span>
                                </div>
                            )}
                        </div>
                    );
                })()}
            </Modal>
        </Card>
    );
};