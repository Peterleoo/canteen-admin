import React, { useState, useEffect } from 'react';
import {
    Table,
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
    Select,
    Row,
    Col,
    App,
    Tabs,
    Card,
} from 'antd';
// 1. 显式引入 Divider 属性类型
import type { DividerProps } from 'antd';
import {
    EditOutlined,
    RocketOutlined,
    PlusOutlined,
    DeleteOutlined,
    EnvironmentOutlined,
    PhoneOutlined,
    UserOutlined,
    SettingOutlined,
} from '@ant-design/icons';
import { getCanteens, updateCanteen, updateCanteenStatus, createCanteen, deleteCanteen } from '../../api/canteen';
import { useAuthStore } from '../../stores/useAuthStore';
import { hasPermission } from '../../utils/rbac';
import type { Canteen } from '../../types/index';

const { Title, Text } = Typography;

export const CanteenListPage: React.FC = () => {
    const [canteens, setCanteens] = useState<Canteen[]>([]);
    const [loading, setLoading] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isConfigModalVisible, setIsConfigModalVisible] = useState(false);
    const [editingCanteen, setEditingCanteen] = useState<Canteen | null>(null);
    const [configuringCanteen, setConfiguringCanteen] = useState<Canteen | null>(null);
    const [form] = Form.useForm();
    const [configForm] = Form.useForm();

    const { user } = useAuthStore();

    const loadCanteens = async () => {
        setLoading(true);
        try {
            const response = await getCanteens();
            setCanteens(Array.isArray(response.data) ? response.data : []);
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
        // 编辑前先重置表单，避免上次编辑内容的影响
        form.resetFields();
        setEditingCanteen(canteen);
        // 使用setTimeout确保表单重置完成后再设置新值
        setTimeout(() => {
            form.setFieldsValue(canteen);
            setIsEditModalVisible(true);
        }, 0);
    };

    const handleAdd = () => {
        setEditingCanteen(null);
        // 显式设置新增表单的默认值，确保不读取上次编辑的内容
        form.setFieldsValue({
            // 基础信息默认值
            name: '',
            address: '',
            is_delivery_active: true, 
            status: 'OPEN',
            // 位置坐标相关默认值
            latitude: undefined,
            longitude: undefined,
            // 其他字段默认值
            contact_phone: '',
            manager: '',
            capacity: 0,
            delivery_radius: 0,
            delivery_fee: 0,
            min_delivery_amount: 0,
            default_packaging_fee: 0
        });
        setIsEditModalVisible(true);
    };

    const handleDelete = (id: string) => {
        Modal.confirm({
            title: '确认删除',
            content: '确定要删除该食堂吗？删除后关联数据将无法恢复。',
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
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

    const handleConfig = (canteen: Canteen) => {
        setConfiguringCanteen(canteen);
        configForm.setFieldsValue(canteen);
        setIsConfigModalVisible(true);
    };

    const handleConfigUpdate = async () => {
        try {
            const values = await configForm.validateFields();
            if (configuringCanteen) {
                await updateCanteen(configuringCanteen.id, values);
                message.success('配置更新成功');
            }
            setIsConfigModalVisible(false);
            loadCanteens();
        } catch (error) {
            console.error('配置更新失败:', error);
        }
    };

    const columns = [
        {
            title: '食堂信息',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: Canteen) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{text}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        <EnvironmentOutlined style={{ marginRight: 4 }} />
                        {record.address || (record as any).location || '暂无地址'}
                    </Text>
                </Space>
            ),
        },
        {
            title: '运营状态',
            dataIndex: 'status',
            key: 'status',
            width: 140,
            render: (status: 'OPEN' | 'CLOSED' | 'BUSY', record: Canteen) => (
                <Select
                    size="small"
                    bordered={false}
                    value={status}
                    onChange={(value: 'OPEN' | 'CLOSED' | 'BUSY') => {
                        if (hasPermission(user, 'canteen:edit')) {
                            handleStatusChange(record.id, value);
                        } else {
                            message.warning('您没有权限修改食堂状态');
                        }
                    }}
                    dropdownMatchSelectWidth={false}
                    style={{ padding: 0 }}
                    disabled={!hasPermission(user, 'canteen:edit')}
                >
                    <Select.Option value="OPEN"><Badge status="success" /> 营业中</Select.Option>
                    <Select.Option value="BUSY"><Badge status="warning" /> 繁忙</Select.Option>
                    <Select.Option value="CLOSED"><Badge status="error" /> 已关停</Select.Option>
                </Select>
            ),
        },
        {
            title: '配送/管理',
            key: 'details',
            render: (_: any, record: Canteen) => (
                <Row gutter={16} style={{ width: '300px' }}>
                    <Col span={12}>
                        <Space direction="vertical" size={0}>
                            <Tag color={record.is_delivery_active ? 'blue' : 'default'} icon={<RocketOutlined />}>
                                {record.is_delivery_active ? '支持配送' : '仅自提'}
                            </Tag>
                            <Text type="secondary" style={{ fontSize: '11px' }}>
                                费: ¥{record.delivery_fee} | 起: ¥{record.min_delivery_amount}
                            </Text>
                        </Space>
                    </Col>
                    <Col span={12}>
                        <div style={{ fontSize: '12px', color: 'rgba(0,0,0,0.45)' }}>
                            <div><UserOutlined /> {record.manager || '未指派'}</div>
                            <div><PhoneOutlined /> {record.contact_phone || '无'}</div>
                        </div>
                    </Col>
                </Row>
            ),
        },
        {
            title: '操作',
            key: 'action',
            width: 200,
            render: (_: any, record: Canteen) => (
                <Space split={<Divider type="vertical" />}>
                    {hasPermission(user, 'canteen:edit') && (
                        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
                    )}
                    {hasPermission(user, 'canteen:config') && (
                        <Button type="link" size="small" icon={<SettingOutlined />} onClick={() => handleConfig(record)}>配置</Button>
                    )}
                    {hasPermission(user, 'canteen:delete') && (
                        <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>删除</Button>
                    )}
                </Space>
            ),
        },
    ];

    // 定义对齐类型的快捷常量，彻底解决 TS2322
    const dividerOrientation = "left" as DividerProps['orientation'];

    return (
        <App>
            <div style={{ padding: '24px', background: '#fff', borderRadius: '8px' }}>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Title level={4} style={{ margin: 0 }}>食堂管理</Title>
                    {hasPermission(user, 'canteen:create') && (
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                            新增食堂
                        </Button>
                    )}
                </div>

                <Table
                    dataSource={canteens}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `共 ${total} 条数据`,
                    }}
                />

                <Modal
                    title={editingCanteen ? `编辑 - ${editingCanteen.name}` : '新增食堂'}
                    open={isEditModalVisible}
                    onOk={handleUpdate}
                    onCancel={() => {
                        // 关闭时重置表单，确保下次打开时是干净的
                        setIsEditModalVisible(false);
                        form.resetFields();
                    }}
                    afterClose={() => {
                        // 完全关闭后重置editingCanteen状态
                        setEditingCanteen(null);
                    }}
                    width={650}
                    destroyOnClose
                >
                    <Form
                        form={form}
                        layout="vertical"
                        initialValues={editingCanteen || {}}
                    >
                        {/* 强制断言解决类型报错 */}
                        <Divider orientation={dividerOrientation}>基础信息</Divider>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item name="name" label="食堂名称" rules={[{ required: true, message: '请输入名称' }]}>
                                    <Input placeholder="输入食堂全称" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="manager" label="管理员">
                                    <Input placeholder="负责人姓名" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item name="address" label="详细地址">
                            <Input placeholder="详细地理位置" />
                        </Form.Item>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item name="contact_phone" label="联系电话">
                                    <Input placeholder="联系方式" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="capacity" label="容纳上限">
                                    <InputNumber style={{ width: '100%' }} min={0} />
                                </Form.Item>
                            </Col>
                        </Row>
                        
                        <Divider orientation={dividerOrientation}>位置坐标</Divider>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item name="latitude" label="纬度" rules={[{ type: 'number', min: -90, max: 90, message: '纬度范围为-90到90' }]}>
                                    <InputNumber 
                                        style={{ width: '100%' }} 
                                        placeholder="例如：39.9042" 
                                        min={-90} 
                                        max={90} 
                                        step={0.0001} 
                                        precision={6}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="longitude" label="经度" rules={[{ type: 'number', min: -180, max: 180, message: '经度范围为-180到180' }]}>
                                    <InputNumber 
                                        style={{ width: '100%' }} 
                                        placeholder="例如：116.4074" 
                                        min={-180} 
                                        max={180} 
                                        step={0.0001} 
                                        precision={6}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Divider orientation={dividerOrientation}>配送与费用</Divider>
                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item name="is_delivery_active" label="开启配送" valuePropName="checked">
                                    <Switch />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item name="delivery_radius" label="服务半径 (km)">
                                    <InputNumber style={{ width: '100%' }} min={0} step={0.1} />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item name="delivery_fee" label="配送费 (¥)">
                                    <InputNumber style={{ width: '100%' }} min={0} step={0.5} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item name="min_delivery_amount" label="起送金额 (¥)">
                                    <InputNumber style={{ width: '100%' }} min={0} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="default_packaging_fee" label="默认打包费 (¥)">
                                    <InputNumber style={{ width: '100%' }} min={0} />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Modal>

                {/* 食堂配置弹窗 */}
                <Modal
                    title={configuringCanteen ? `${configuringCanteen.name} - 配置` : '食堂配置'}
                    open={isConfigModalVisible}
                    onOk={handleConfigUpdate}
                    onCancel={() => setIsConfigModalVisible(false)}
                    width={800}
                    destroyOnClose
                >
                    <Form
                        form={configForm}
                        layout="vertical"
                        initialValues={configuringCanteen || {}}
                    >
                        <Tabs defaultActiveKey="automation" size="middle">
                            {/* 自动化配置 */}
                            <Tabs.TabPane tab="自动化配置" key="automation">
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item name="is_auto_accept_orders" label="自动接单" valuePropName="checked">
                                            <Switch />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item name="auto_accept_delay" label="自动接单延迟（秒）">
                                            <InputNumber style={{ width: '100%' }} min={0} max={300} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Tabs.TabPane>

                            {/* 营业时间 */}
                            <Tabs.TabPane tab="营业时间" key="hours">
                                <Card title="工作日营业时间" size="small" style={{ marginBottom: 16 }}>
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item name="weekday_open_time" label="开始时间">
                                                <Input placeholder="08:00" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item name="weekday_close_time" label="结束时间">
                                                <Input placeholder="20:00" />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Card>
                                <Card title="周末营业时间" size="small">
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item name="weekend_open_time" label="开始时间">
                                                <Input placeholder="09:00" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item name="weekend_close_time" label="结束时间">
                                                <Input placeholder="18:00" />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Card>
                            </Tabs.TabPane>

                            {/* 库存与通知 */}
                            <Tabs.TabPane tab="库存与通知" key="inventory">
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item name="stock_alert_threshold" label="库存预警阈值">
                                            <InputNumber style={{ width: '100%' }} min={0} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item name="is_low_stock_notification" label="低库存通知" valuePropName="checked">
                                            <Switch />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Form.Item
                                    name="notification_phones"
                                    label="通知手机列表"
                                    getValueFromEvent={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                                        return e.target.value.split(',').map((phone: string) => phone.trim()).filter((phone: string) => phone);
                                    }}
                                    getValueProps={(value: string[]) => {
                                        return { value: Array.isArray(value) ? value.join(',') : value };
                                    }}
                                >
                                    <Input.TextArea
                                        placeholder="请输入手机号码，多个号码用逗号分隔"
                                        rows={4}
                                    />
                                </Form.Item>
                            </Tabs.TabPane>
                        </Tabs>
                    </Form>
                </Modal>
            </div>
        </App>
    );
};