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
    Select,
    message,
    Avatar,
    Typography,
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    EditOutlined,
    UserOutlined,
    TeamOutlined
} from '@ant-design/icons';
import type { AdminUser, Role } from '../../types';
import {
    getStaffs,
    createStaff,
    updateStaff,
    deleteStaff
} from '../../api/settings';
import { getDepartments } from '../../api/department';

const { Title, Text } = Typography;

const StaffManagementPage: React.FC = () => {
    const [staffs, setStaffs] = useState<AdminUser[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);  // 部门列表
    const [loading, setLoading] = useState(false);
    const [staffModalVisible, setStaffModalVisible] = useState(false);
    const [editingStaff, setEditingStaff] = useState<AdminUser | null>(null);
    const [staffForm] = Form.useForm();

    useEffect(() => {
        fetchData();
        fetchDepartments();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getStaffs();
            console.log('员工数据:', res);
            setStaffs(res.data);
        } catch (error) {
            console.error('加载员工数据失败:', error);
            message.error('加载员工数据失败');
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const res = await getDepartments();
            setDepartments(res.data);
        } catch (error) {
            console.error('加载部门数据失败', error);
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
            title: '所属部门',
            dataIndex: 'department',
            key: 'department',
            render: (dept: any) => dept ? <Tag color="cyan">{dept.name}</Tag> : <Tag>未分配</Tag>
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

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}><TeamOutlined /> 员工管理</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddStaff}>
                    新增员工
                </Button>
            </div>
            <Card bordered={false}>
                <Table
                    columns={staffColumns}
                    dataSource={staffs}
                    rowKey="id"
                    loading={loading}
                />
            </Card>

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
                    <Form.Item name="department_id" label="所属部门">
                        <Select placeholder="请选择部门" allowClear>
                            {departments.map(d => (
                                <Select.Option key={d.id} value={d.id}>{d.name}</Select.Option>
                            ))}
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

export default StaffManagementPage;
