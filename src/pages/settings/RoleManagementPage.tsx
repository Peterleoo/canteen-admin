import React, { useEffect, useState } from 'react';
import {
    Table,
    Button,
    Tag,
    Space,
    Card,
    Typography,
    Drawer,
    Tree,
    message,
    Divider,
    Modal,
    Form,
    Input,
    Select
} from 'antd';
import {
    SafetyCertificateOutlined,
    EditOutlined,
    PlusOutlined,
    DeleteOutlined,
    KeyOutlined
} from '@ant-design/icons';
import {
    getRoles,
    getPermissions,
    updateRolePermissions,
    createRole,
    updateRole,
    deleteRole
} from '../../api/settings';
import type { RoleConfig, Permission } from '../../types';

const { Title, Text } = Typography;

const RoleManagementPage: React.FC = () => {
    const [roles, setRoles] = useState<RoleConfig[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [currentRole, setCurrentRole] = useState<RoleConfig | null>(null);
    const [editingRole, setEditingRole] = useState<RoleConfig | null>(null);
    const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [rolesRes, permsRes] = await Promise.all([
                getRoles(),
                getPermissions()
            ]);
            setRoles(rolesRes.data);
            setPermissions(permsRes.data);
        } catch (error) {
            message.error('加载权限数据失败');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingRole(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEditRole = (role: RoleConfig) => {
        setEditingRole(role);
        form.setFieldsValue(role);
        setModalVisible(true);
    };

    const handleDeleteRole = (role: RoleConfig) => {
        if (role.code === 'SUPER_ADMIN') {
            message.warning('超级管理员角色不可删除');
            return;
        }
        Modal.confirm({
            title: '确认删除',
            content: `确定要删除角色 "${role.name}" 吗？此操作不可撤销。`,
            onOk: async () => {
                await deleteRole(role.id);
                message.success('删除成功');
                fetchData();
            }
        });
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            if (editingRole) {
                await updateRole(editingRole.id, values);
                message.success('更新成功');
            } else {
                await createRole(values);
                message.success('创建成功');
            }
            setModalVisible(false);
            fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    const handleEditPermissions = (role: RoleConfig) => {
        setCurrentRole(role);
        // 关键点：确保 role.permissions 是一个纯字符串数组
        // 如果 role.permissions 是 null 或 undefined，初始化为空数组
        const initialKeys = Array.isArray(role.permissions) ? role.permissions : [];

        console.log('当前角色拥有的权限ID:', initialKeys); // 调试用

        setCheckedKeys(initialKeys);
        setDrawerVisible(true);
    };

    const handleSavePermissions = async () => {
        if (!currentRole) return;
        setLoading(true);
        try {
            await updateRolePermissions(currentRole.id, checkedKeys);
            message.success('权限分配成功');
            setDrawerVisible(false);
            fetchData();
        } catch (error) {
            message.error('保存失败');
        } finally {
            setLoading(false);
        }
    };

    const formatTreeData = (data: Permission[], parentId?: string | null): any[] => {
        return data
            .filter(item => {
                const itemParent = item.parentId || null;
                const targetParent = parentId || null;
                return itemParent === targetParent;
            })
            .map(item => ({
                title: item.name,
                key: item.id,
                children: formatTreeData(data, item.id).length > 0 ? formatTreeData(data, item.id) : undefined
            }));
    };

    const treeData = formatTreeData(permissions);

    const columns = [
        {
            title: '角色名称',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <Text strong>{text}</Text>
        },
        {
            title: '角色标识',
            dataIndex: 'code',
            key: 'code',
            render: (text: string) => <Tag color="blue">{text}</Tag>
        },
        {
            title: '描述',
            dataIndex: 'description',
            key: 'description',
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
            render: (_: any, record: RoleConfig) => (
                <Space>
                    <Button
                        type="link"
                        icon={<SafetyCertificateOutlined />}
                        onClick={() => handleEditPermissions(record)}
                    >
                        权限
                    </Button>
                    <Button type="link" icon={<EditOutlined />} onClick={() => handleEditRole(record)}>编辑</Button>
                    <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteRole(record)}
                        disabled={record.code === 'SUPER_ADMIN'}
                    >
                        删除
                    </Button>
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}><KeyOutlined /> 角色管理</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    新增角色
                </Button>
            </div>
            <Card bordered={false}>
                <Table
                    columns={columns}
                    dataSource={roles}
                    rowKey="id"
                    loading={loading}
                    pagination={false}
                />
            </Card>

            <Drawer
                title={`分配权限 - ${currentRole?.name}`}
                width={400}
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
                extra={
                    <Space>
                        <Button onClick={() => setDrawerVisible(false)}>取消</Button>
                        <Button type="primary" onClick={handleSavePermissions} loading={loading}>
                            确定保存
                        </Button>
                    </Space>
                }
            >
                <div style={{ marginBottom: 16 }}>
                    <Text type="secondary">勾选下方权限点，为该角色分配功能。按钮类操作权限建议谨慎分配。</Text>
                </div>
                <Divider />
                <Tree
                    checkable
                    defaultExpandAll
                    // 确保处理 keys 对象
                    onCheck={(keys: any) => {
                        // 兼容处理：如果是对象则取其 checked 属性，如果是数组则直接使用
                        const newKeys = Array.isArray(keys) ? keys : keys.checked;
                        setCheckedKeys(newKeys);
                    }}
                    checkedKeys={checkedKeys}
                    treeData={treeData}
                />
            </Drawer>

            <Modal
                title={editingRole ? '编辑角色' : '新增角色'}
                open={modalVisible}
                onOk={handleModalOk}
                onCancel={() => setModalVisible(false)}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="角色名称" rules={[{ required: true, message: '请输入角色名称' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="code" label="角色标识" rules={[{ required: true, message: '请输入角色标识' }]}>
                        <Input disabled={editingRole?.code === 'SUPER_ADMIN'} />
                    </Form.Item>
                    <Form.Item name="description" label="角色描述">
                        <Input.TextArea rows={3} />
                    </Form.Item>
                    <Form.Item name="status" label="状态" initialValue="ACTIVE">
                        <Select>
                            <Select.Option value="ACTIVE">启用</Select.Option>
                            <Select.Option value="INACTIVE">禁用</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default RoleManagementPage;
