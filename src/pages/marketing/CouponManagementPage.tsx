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
    Col
} from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, GiftOutlined } from '@ant-design/icons';
import type { Coupon } from '../../types';
import {
    getCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon
} from '../../api/marketing';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const CouponManagementPage: React.FC = () => {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState<Coupon | null>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchData();
    }, []);

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
            render: (text: string) => <Text strong>{text}</Text>
        },
        {
            title: '类型',
            dataIndex: 'type',
            key: 'type',
            render: (type: string) => {
                const map: any = {
                    CASH: { text: '满减券', color: 'blue' },
                    DISCOUNT: { text: '打折券', color: 'green' },
                    FREE_DELIVERY: { text: '免邮券', color: 'orange' }
                };
                return <Tag color={map[type]?.color}>{map[type]?.text}</Tag>;
            }
        },
        {
            title: '面值/折扣',
            dataIndex: 'value',
            key: 'value',
            render: (val: number, record: Coupon) => (
                <span>{record.type === 'DISCOUNT' ? `${val * 10}折` : `¥${val}`}</span>
            )
        },
        {
            title: '使用门槛',
            dataIndex: 'minAmount',
            key: 'minAmount',
            render: (val: number) => `满¥${val}可用`
        },
        {
            title: '有效期',
            key: 'validity',
            render: (_: any, record: Coupon) => (
                <Text type="secondary" style={{ fontSize: '12px' }}>
                    {record.validFrom} 至 {record.validTo}
                </Text>
            )
        },
        {
            title: '发放情况',
            key: 'usage',
            render: (_: any, record: Coupon) => (
                <Space direction="vertical" size={0}>
                    <Text style={{ fontSize: '12px' }}>总量: {record.totalCount}</Text>
                    <Text style={{ fontSize: '12px' }} type="secondary">已用: {record.usedCount}</Text>
                </Space>
            )
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const map: any = {
                    ACTIVE: { text: '进行中', color: 'success' },
                    INACTIVE: { text: '已停止', color: 'default' },
                    EXPIRED: { text: '已过期', color: 'error' }
                };
                return <Tag color={map[status]?.color}>{map[status]?.text}</Tag>;
            }
        },
        {
            title: '操作',
            key: 'action',
            render: (_: any, record: Coupon) => (
                <Space>
                    <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
                    <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>删除</Button>
                </Space>
            )
        }
    ];

    const handleDelete = (id: string) => {
        Modal.confirm({
            title: '确认删除',
            content: '确定要删除这张优惠券吗？删除后将无法发放。',
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
            validity: [dayjs(record.validFrom), dayjs(record.validTo)]
        });
        setModalVisible(true);
    };

    const handleCreate = () => {
        setEditingItem(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                ...values,
                validFrom: values.validity[0].format('YYYY-MM-DD'),
                validTo: values.validity[1].format('YYYY-MM-DD'),
            };
            delete payload.validity;

            if (editingItem) {
                await updateCoupon(editingItem.id, payload);
                message.success('更新成功');
            } else {
                await createCoupon(payload);
                message.success('创建成功');
            }
            setModalVisible(false);
            fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}><GiftOutlined /> 优惠券管理</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                    新增优惠券
                </Button>
            </div>
            <Card bordered={false}>
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
                width={600}
            >
                <Form form={form} layout="vertical" initialValues={{ type: 'CASH', totalCount: 100 }}>
                    <Form.Item name="name" label="优惠券名称" rules={[{ required: true, message: '请输入名称' }]}>
                        <Input placeholder="如：满20减5元券" />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="type" label="类型" rules={[{ required: true }]}>
                                <Select>
                                    <Select.Option value="CASH">满减券</Select.Option>
                                    <Select.Option value="DISCOUNT">打折券</Select.Option>
                                    <Select.Option value="FREE_DELIVERY">免邮券</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="value" label="面值/折扣率" rules={[{ required: true, message: '请输入数值' }]}>
                                <InputNumber style={{ width: '100%' }} placeholder="满减填金额，打折填0.x" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="minAmount" label="使用门槛 (¥)" rules={[{ required: true }]}>
                                <InputNumber style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="totalCount" label="发行总量" rules={[{ required: true }]}>
                                <InputNumber style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="validity" label="有效期" rules={[{ required: true, message: '请选择有效期' }]}>
                        <RangePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="description" label="使用说明">
                        <Input.TextArea rows={2} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default CouponManagementPage;
