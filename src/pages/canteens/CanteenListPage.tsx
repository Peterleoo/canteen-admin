import React, { useState, useEffect } from 'react';
import {
    Card,
    Row,
    Col,
    Tag,
    Button,
    Space,
    Typography,
    Switch,
    message,
    Modal,
    Form,
    Input,
    InputNumber,
    Badge,
    Divider,
    Descriptions,
} from 'antd';
import {
    EnvironmentOutlined,
    PhoneOutlined,
    UserOutlined,
    EditOutlined,
    RocketOutlined,
    PlusOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import { getCanteens, updateCanteen, updateCanteenStatus, createCanteen, deleteCanteen } from '../../api/canteen';
import type { Canteen } from '../../types/index';

const { Title, Text } = Typography;

export const CanteenListPage: React.FC = () => {
    const [canteens, setCanteens] = useState<Canteen[]>([]);
    const [loading, setLoading] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingCanteen, setEditingCanteen] = useState<Canteen | null>(null);
    const [form] = Form.useForm();

    const loadCanteens = async () => {
        setLoading(true);
        try {
            const response = await getCanteens();
            setCanteens(response.data);
        } catch (error) {
            message.error('加载食堂数据失败');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCanteens();
    }, []);

    const handleStatusChange = async (id: string, status: 'OPEN' | 'CLOSED' | 'BUSY') => {
        try {
            await updateCanteenStatus(id, status);
            message.success('状态更新成功');
            loadCanteens();
        } catch (error) {
            message.error('状态更新失败');
        }
    };

    const handleEdit = (canteen: Canteen) => {
        setEditingCanteen(canteen);
        form.setFieldsValue(canteen);
        setIsEditModalVisible(true);
    };

    const handleAdd = () => {
        setEditingCanteen(null);
        form.resetFields();
        setIsEditModalVisible(true);
    };

    const handleDelete = (id: string) => {
        Modal.confirm({
            title: '确认删除',
            content: '确定要删除该食堂吗？删除后关联数据将无法恢复。',
            onOk: async () => {
                try {
                    await deleteCanteen(id);
                    message.success('删除成功');
                    loadCanteens();
                } catch (error) {
                    message.error('删除失败');
                }
            }
        });
    };

    const handleUpdate = async () => {
        try {
            const values = await form.validateFields();
            if (editingCanteen) {
                await updateCanteen(editingCanteen.id, values);
                message.success('更新成功');
            } else {
                await createCanteen(values);
                message.success('创建成功');
            }
            setIsEditModalVisible(false);
            loadCanteens();
        } catch (error) {
            console.error('Validate failed:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'success';
            case 'BUSY': return 'warning';
            case 'CLOSED': return 'error';
            default: return 'default';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'OPEN': return '正在营业';
            case 'BUSY': return '繁忙中';
            case 'CLOSED': return '已关停';
            default: return status;
        }
    };

    return (
        <div style={{ padding: '0 8px' }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    新增食堂
                </Button>
            </div>
            {loading && canteens.length === 0 ? (
                <Card loading={true} />
            ) : (
                <Row gutter={[16, 16]}>
                    {canteens.map(canteen => (
                        <Col xs={24} lg={12} key={canteen.id}>
                            <Card
                                hoverable
                                actions={[
                                    <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(canteen)}>编辑</Button>,
                                    <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(canteen.id)}>删除</Button>,
                                    <Space direction="vertical" size={0}>
                                        <Badge status={getStatusColor(canteen.status) as any} text={getStatusText(canteen.status)} />
                                        <Button type="link" size="small" onClick={() => handleStatusChange(canteen.id, canteen.status === 'OPEN' ? 'CLOSED' : 'OPEN')}>切换状态</Button>
                                    </Space>
                                ]}
                            >
                                <Card.Meta
                                    title={
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Title level={4} style={{ margin: 0 }}>{canteen.name}</Title>
                                            <Tag color={canteen.deliveryEnabled ? 'blue' : 'default'} icon={<RocketOutlined />}>
                                                {canteen.deliveryEnabled ? '支持配送' : '暂无配送'}
                                            </Tag>
                                        </div>
                                    }
                                    description={
                                        <Space direction="vertical" style={{ width: '100%', marginTop: 12 }}>
                                            <Text type="secondary"><EnvironmentOutlined /> {canteen.address} ({canteen.distance})</Text>
                                            <Text type="secondary"><PhoneOutlined /> {canteen.contactPhone || '未设置'}</Text>
                                            <Text type="secondary"><UserOutlined /> 管理员: {canteen.manager || '未指派'}</Text>

                                            <Divider style={{ margin: '12px 0' }} />

                                            <Descriptions column={2} size="small">
                                                <Descriptions.Item label="当前订单">{canteen.currentOrders || 0}</Descriptions.Item>
                                                <Descriptions.Item label="容纳上限">{canteen.capacity || '-'}</Descriptions.Item>
                                                <Descriptions.Item label="配送费">¥{canteen.deliveryFee?.toFixed(2) || '0.00'}</Descriptions.Item>
                                                <Descriptions.Item label="起送额">¥{canteen.freeDeliveryThreshold?.toFixed(2) || '0.00'}</Descriptions.Item>
                                            </Descriptions>
                                        </Space>
                                    }
                                />
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            <Modal
                title={editingCanteen ? `编辑 - ${editingCanteen.name}` : '新增食堂'}
                open={isEditModalVisible}
                onOk={handleUpdate}
                onCancel={() => setIsEditModalVisible(false)}
                width={600}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={editingCanteen || {}}
                >
                    <Divider orientation={"left" as any}>基础信息</Divider>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="name" label="食堂名称" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="manager" label="管理员">
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="address" label="详细地址">
                        <Input />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="contactPhone" label="联系电话">
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="capacity" label="容纳上限">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider orientation={"left" as any}>配送配置</Divider>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="deliveryEnabled" label="开启配送" valuePropName="checked">
                                <Switch />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="deliveryRadius" label="服务半径 (km)">
                                <InputNumber style={{ width: '100%' }} min={0.1} step={0.1} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="deliveryFee" label="配送费 (¥)">
                                <InputNumber style={{ width: '100%' }} min={0} step={0.5} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="freeDeliveryThreshold" label="满额免配送费 (¥)">
                        <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};
