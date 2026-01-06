import React, { useEffect, useState } from 'react';
import {
    Tabs,
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
    TimePicker,
    message,
    Avatar,
    Typography,
    Switch,
    Row,
    Col,
    Divider
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    EditOutlined,
    UserOutlined,
    SettingOutlined,
    SafetyCertificateOutlined,
    ClockCircleOutlined,
    WalletOutlined,
    NotificationOutlined
} from '@ant-design/icons';
import type { AdminUser, Role } from '../../types';
import {
    getStaffs,
    createStaff,
    updateStaff,
    deleteStaff,
    getSystemConfig,
    updateSystemConfig
} from '../../api/settings';
import dayjs from 'dayjs';

const { TabPane } = Tabs;
const { Title, Text } = Typography;

const SettingsPage: React.FC = () => {
    const [staffs, setStaffs] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [staffModalVisible, setStaffModalVisible] = useState(false);
    const [editingStaff, setEditingStaff] = useState<AdminUser | null>(null);
    const [staffForm] = Form.useForm();
    const [configForm] = Form.useForm();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [staffsRes, configRes] = await Promise.all([
                getStaffs(),
                getSystemConfig()
            ]);
            setStaffs(staffsRes.data);
            configForm.setFieldsValue({
                ...configRes.data,
                businessHours: [
                    dayjs(configRes.data.businessHours[0], 'HH:mm'),
                    dayjs(configRes.data.businessHours[1], 'HH:mm')
                ]
            });
        } catch (error) {
            message.error('加载数据失败');
        } finally {
            setLoading(false);
        }
    };

    const roleMap: Record<Role, { text: string, color: string }> = {
        SUPER_ADMIN: { text: '超级管理员', color: 'volcano' },
        ADMIN: { text: '管理员', color: 'blue' },
        CANTEEN_MANAGER: { text: '食堂经理', color: 'green' },
        OPERATOR: { text: '运营人员', color: 'cyan' },
        VIEWER: { text: '查看者', color: 'default' }
    };

    const staffColumns = [
        {
            title: '员工信息',
            key: 'info',
            render: (_: any, record: AdminUser) => (
                <Space>
                    <Avatar src={record.avatar} icon={<UserOutlined />} />
                    <div>
                        <div><Text strong>{record.name}</Text> <Text type="secondary">@{record.username}</Text></div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>{record.email}</Text>
                    </div>
                </Space>
            )
        },
        {
            title: '角色',
            dataIndex: 'role',
            key: 'role',
            render: (role: Role) => (
                <Tag color={roleMap[role]?.color}>{roleMap[role]?.text}</Tag>
            )
        },
        {
            title: '联系方式',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'ACTIVE' ? 'success' : 'default'}>
                    {status === 'ACTIVE' ? '启用中' : '已禁用'}
                </Tag>
            )
        },
        {
            title: '加入日期',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => <Text type="secondary" style={{ fontSize: '12px' }}>{date}</Text>
        },
        {
            title: '操作',
            key: 'action',
            render: (_: any, record: AdminUser) => (
                <Space>
                    <Button type="link" icon={<EditOutlined />} onClick={() => handleEditStaff(record)}>编辑</Button>
                    <Button
                        type="link"
                        danger={record.status === 'ACTIVE'}
                        onClick={() => handleToggleStaffStatus(record)}
                    >
                        {record.status === 'ACTIVE' ? '禁用' : '启用'}
                    </Button>
                    {record.role !== 'SUPER_ADMIN' && (
                        <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDeleteStaff(record.id)}>删除</Button>
                    )}
                </Space>
            )
        }
    ];

    const handleEditStaff = (record: AdminUser) => {
        setEditingStaff(record);
        staffForm.setFieldsValue(record);
        setStaffModalVisible(true);
    };

    const handleAddStaff = () => {
        setEditingStaff(null);
        staffForm.resetFields();
        setStaffModalVisible(true);
    };

    const handleToggleStaffStatus = async (record: AdminUser) => {
        const newStatus = record.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        await updateStaff(record.id, { status: newStatus as any });
        message.success('状态更新成功');
        fetchData();
    };

    const handleDeleteStaff = (id: string) => {
        Modal.confirm({
            title: '确认删除',
            content: '确定要删除该员工吗？此操作不可撤销。',
            onOk: async () => {
                await deleteStaff(id);
                message.success('删除成功');
                fetchData();
            }
        });
    };

    const handleStaffModalOk = async () => {
        try {
            const values = await staffForm.validateFields();
            if (editingStaff) {
                await updateStaff(editingStaff.id, values);
                message.success('更新成功');
            } else {
                await createStaff(values);
                message.success('创建成功');
            }
            setStaffModalVisible(false);
            fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    const onConfigFinish = async (values: any) => {
        setLoading(true);
        try {
            const payload = {
                ...values,
                businessHours: [
                    values.businessHours[0].format('HH:mm'),
                    values.businessHours[1].format('HH:mm')
                ]
            };
            await updateSystemConfig(payload);
            message.success('系统配置已更新');
            fetchData();
        } catch (error) {
            message.error('更新失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '24px' }}>
            <Title level={2}>系统设置</Title>
            <Card bordered={false}>
                <Tabs defaultActiveKey="staff">
                    <TabPane
                        tab={<span><UserOutlined />员工管理</span>}
                        key="staff"
                    >
                        <div style={{ marginBottom: 16 }}>
                            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddStaff}>
                                新增员工
                            </Button>
                        </div>
                        <Table
                            columns={staffColumns}
                            dataSource={staffs}
                            rowKey="id"
                            loading={loading}
                        />
                    </TabPane>

                    <TabPane
                        tab={<span><SettingOutlined />系统配置</span>}
                        key="config"
                    >
                        <Form
                            form={configForm}
                            layout="vertical"
                            onFinish={onConfigFinish}
                            style={{ maxWidth: 800, marginTop: 16 }}
                        >
                            <Divider orientation={"left" as any}><ClockCircleOutlined /> 营业时间</Divider>
                            <Form.Item
                                name="businessHours"
                                label="食堂营业时段"
                                rules={[{ required: true, message: '请选择营业时间' }]}
                            >
                                <TimePicker.RangePicker format="HH:mm" style={{ width: 300 }} />
                            </Form.Item>

                            <Divider orientation={"left" as any}><WalletOutlined /> 配送规则</Divider>
                            <Row gutter={24}>
                                <Col span={12}>
                                    <Form.Item name="deliveryFee" label="基础配送费 (¥)" rules={[{ required: true }]}>
                                        <InputNumber style={{ width: '100%' }} min={0} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="freeDeliveryThreshold" label="免配送费门槛 (¥)" rules={[{ required: true }]}>
                                        <InputNumber style={{ width: '100%' }} min={0} />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Divider orientation={"left" as any}><NotificationOutlined /> 库存与通知</Divider>
                            <Row gutter={24}>
                                <Col span={12}>
                                    <Form.Item name="stockAlertThreshold" label="全局库存预警阈值" rules={[{ required: true }]}>
                                        <InputNumber style={{ width: '100%' }} min={1} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="autoAcceptOrder" label="自动接单模式" valuePropName="checked">
                                        <Switch />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Divider orientation={"left" as any}><SafetyCertificateOutlined /> 系统维护</Divider>
                            <Form.Item name="maintenanceMode" label="维护模式 (仅管理员可访问)" valuePropName="checked">
                                <Switch />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" loading={loading} size="large">
                                    保存所有配置
                                </Button>
                            </Form.Item>
                        </Form>
                    </TabPane>
                </Tabs>
            </Card>

            {/* 员工弹窗 */}
            <Modal
                title={editingStaff ? '编辑员工' : '新增员工'}
                open={staffModalVisible}
                onOk={handleStaffModalOk}
                onCancel={() => setStaffModalVisible(false)}
            >
                <Form form={staffForm} layout="vertical">
                    <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
                        <Input disabled={!!editingStaff} />
                    </Form.Item>
                    <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="role" label="角色" rules={[{ required: true }]}>
                        <Select>
                            <Select.Option value="SUPER_ADMIN">超级管理员</Select.Option>
                            <Select.Option value="ADMIN">管理员</Select.Option>
                            <Select.Option value="CANTEEN_MANAGER">食堂经理</Select.Option>
                            <Select.Option value="OPERATOR">运营人员</Select.Option>
                            <Select.Option value="VIEWER">查看者</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="phone" label="手机号" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="email" label="邮箱" rules={[{ type: 'email' }]}>
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default SettingsPage;
