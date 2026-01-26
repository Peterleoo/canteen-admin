import React, { useEffect, useState } from 'react';
import {
    Table,
    Button,
    Tag,
    Space,
    Card,
    Modal,
    Form,
    Input,
    InputNumber,
    Select,
    DatePicker,
    message,
    Typography,
    Row,
    Col,
    Statistic,
    Switch
} from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, GiftOutlined } from '@ant-design/icons';
import type { Coupon } from '../../types';
import {
    getCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon
} from '../../api/marketing';
import { getCanteens } from '../../api/canteen';
import type { Canteen } from '../../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const CouponManagementPage: React.FC = () => {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [canteens, setCanteens] = useState<Canteen[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState<Coupon | null>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchData();
        fetchCanteens();
    }, []);

    const fetchCanteens = async () => {
        try {
            const res = await getCanteens();
            setCanteens(res.data);
        } catch (error) {
            console.error('加载食堂列表失败', error);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getCoupons();
            setCoupons(res.data);
        } catch (error) {
            message.error('加载优惠券失败');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: '优惠券名称',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: Coupon) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{text}</Text>
                    <Text type="secondary" style={{ fontSize: '11px' }}>{record.description}</Text>
                    <Tag style={{ marginTop: '4px' }}>
                        {record.canteen_id
                            ? (canteens.find(c => String(c.id) === String(record.canteen_id))?.name || '未知食堂')
                            : '全站通用'}
                    </Tag>
                </Space>
            )
        },
        {
            title: '类型/面值',
            key: 'type_value',
            render: (_: any, record: Coupon) => (
                <Space>
                    <Tag color={record.type === 'PERCENT' ? 'orange' : 'blue'}>
                        {record.type === 'PERCENT' ? '折扣券' : '满减券'}
                    </Tag>
                    <Text strong>
                        {record.type === 'PERCENT' ? `${record.value * 10}折` : `¥${record.value}`}
                    </Text>
                </Space>
            )
        },
        {
            title: '使用门槛',
            dataIndex: 'min_spend',
            key: 'min_spend',
            render: (val: number) => `满¥${val}可用`
        },
        {
            title: '有效期',
            key: 'validity',
            render: (_: any, record: Coupon) => (
                <Space direction="vertical" size={0} style={{ fontSize: '11px' }}>
                    <Text type="secondary">起: {dayjs(record.start_at).format('YYYY-MM-DD')}</Text>
                    <Text type="secondary">止: {dayjs(record.end_at).format('YYYY-MM-DD')}</Text>
                </Space>
            )
        },
        {
            title: '发放/使用',
            key: 'usage',
            render: (_: any, record: Coupon) => (
                <Row gutter={16}>
                    <Col span={12}>
                        <Statistic title="已领" value={record.received_count} suffix={`/ ${record.total_stock === -1 ? '∞' : record.total_stock}`} valueStyle={{ fontSize: '14px' }} />
                    </Col>
                    <Col span={12}>
                        <Statistic title="已用" value={record.used_count} valueStyle={{ fontSize: '14px', color: '#3f8600' }} />
                    </Col>
                </Row>
            )
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status: string, record: Coupon) => {
                const isExpired = dayjs().isAfter(dayjs(record.end_at));
                if (isExpired) return <Tag color="error">已过期</Tag>;
                return status === 'ACTIVE' ? <Tag color="success">投放中</Tag> : <Tag>已暂停</Tag>;
            }
        },
        {
            title: '操作',
            key: 'action',
            width: 120,
            render: (_: any, record: Coupon) => (
                <Space>
                    <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
                    <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>删除</Button>
                </Space>
            )
        }
    ];

    const handleDelete = (id: string) => {
        Modal.confirm({
            title: '确认删除',
            content: '确定要删除这张优惠券吗？删除后将无法领用。',
            onOk: async () => {
                await deleteCoupon(id);
                message.success('删除成功');
                fetchData();
            }
        });
    };

    const handleEdit = (record: Coupon) => {
        setEditingItem(record);
        form.setFieldsValue({
            ...record,
            validity: [dayjs(record.start_at), dayjs(record.end_at)]
        });
        setModalVisible(true);
    };

    const handleCreate = () => {
        setEditingItem(null);
        form.resetFields();
        form.setFieldsValue({ type: 'FIXED', total_stock: 100, min_spend: 0, status: 'ACTIVE' });
        setModalVisible(true);
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                ...values,
                start_at: values.validity[0].toISOString(),
                end_at: values.validity[1].toISOString(),
            };
            delete payload.validity;

            if (editingItem) {
                await updateCoupon(editingItem.id, {
                    ...payload,
                    status: values.status ? 'ACTIVE' : 'INACTIVE'
                });
                message.success('更新成功');
            } else {
                await createCoupon({
                    ...payload,
                    status: values.status ? 'ACTIVE' : 'INACTIVE'
                });
                message.success('创建成功');
            }
            setModalVisible(false);
            fetchData();
        } catch (error: any) {
            message.error('保存失败: ' + error.message);
        }
    };

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={4} style={{ margin: 0 }}><GiftOutlined /> 优惠券与营销工具</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                    新增优惠券
                </Button>
            </div>
            <Card bordered={false} bodyStyle={{ padding: 0 }}>
                <Table
                    columns={columns}
                    dataSource={coupons}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title={editingItem ? '编辑优惠券' : '新增优惠券'}
                open={modalVisible}
                onOk={handleModalOk}
                onCancel={() => setModalVisible(false)}
                width={650}
                destroyOnClose
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="canteen_id" label="展现食堂">
                        <Select placeholder="请选择该优惠券所属的食堂">
                            <Option value={null}>全站通用 (所有食堂均可領用)</Option>
                            {canteens.map(c => (
                                <Option key={c.id} value={c.id}>{c.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="name" label="券名称" rules={[{ required: true, message: '请输入券名称' }]}>
                        <Input placeholder="如：午餐时段满20减5元券" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="type" label="优惠类型" rules={[{ required: true }]}>
                                <Select>
                                    <Select.Option value="FIXED">满减 (固定金额)</Select.Option>
                                    <Select.Option value="PERCENT">折扣 (打几折)</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="value" label="额度/比例" rules={[{ required: true }]}>
                                <InputNumber style={{ width: '100%' }} placeholder="金额或百分比(1-99)" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="min_spend" label="门槛金额 (¥)" rules={[{ required: true }]}>
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="total_stock" label="发行总量" rules={[{ required: true }]}>
                                <InputNumber style={{ width: '100%' }} min={-1} placeholder="-1 为不限量" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="validity" label="有效期" rules={[{ required: true }]}>
                                <RangePicker style={{ width: '100%' }} showTime />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="description" label="使用规则说明">
                        <Input.TextArea rows={2} placeholder="会展示在用户领券中心的券下方" />
                    </Form.Item>

                    <Form.Item name="status" label="是否上架投放" valuePropName="checked">
                        <Switch checkedChildren="上架中" unCheckedChildren="已下架" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default CouponManagementPage;
