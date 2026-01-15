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
    Typography,
    Transfer,
    Divider,
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    EditOutlined,
    ApartmentOutlined,
    ShopOutlined,
} from '@ant-design/icons';
import type { Department, Canteen } from '../../types';
import {
    getDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    updateDepartmentCanteens
} from '../../api/department';
import { getCanteens } from '../../api/canteen';

const { Title, Text } = Typography;
const { TextArea } = Input;

const DepartmentManagementPage: React.FC = () => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [canteens, setCanteens] = useState<Canteen[]>([]);
    const [loading, setLoading] = useState(false);
    const [deptModalVisible, setDeptModalVisible] = useState(false);
    const [canteenModalVisible, setCanteenModalVisible] = useState(false);
    const [editingDept, setEditingDept] = useState<Department | null>(null);
    const [currentDeptId, setCurrentDeptId] = useState<string>('');
    const [selectedCanteenIds, setSelectedCanteenIds] = useState<string[]>([]);
    const [deptForm] = Form.useForm();

    useEffect(() => {
        fetchData();
        fetchCanteens();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getDepartments();
            setDepartments(res.data);
        } catch (error) {
            message.error('加载部门数据失败');
        } finally {
            setLoading(false);
        }
    };

    const fetchCanteens = async () => {
        try {
            const res = await getCanteens();
            setCanteens(res.data);
        } catch (error) {
            console.error('加载食堂数据失败', error);
        }
    };

    const columns = [
        {
            title: '部门名称',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <Text strong>{text}</Text>
        },
        {
            title: '描述',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: '关联食堂数',
            key: 'canteen_count',
            render: (_: any, record: Department) => (
                <Tag color="blue">{record.canteen_ids?.length || 0} 个</Tag>
            )
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
            title: '创建时间',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (time: string) => new Date(time).toLocaleDateString()
        },
        {
            title: '操作',
            key: 'action',
            fixed: 'right' as const,
            width: 260,
            render: (_: any, record: Department) => (
                <Space>
                    <Button
                        type="link"
                        icon={<ShopOutlined />}
                        onClick={() => handleManageCanteens(record)}
                    >
                        管理食堂
                    </Button>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEditDept(record)}
                    >
                        编辑
                    </Button>
                    <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteDept(record.id)}
                    >
                        删除
                    </Button>
                </Space>
            )
        }
    ];

    const handleAddDept = () => {
        setEditingDept(null);
        deptForm.resetFields();
        setDeptModalVisible(true);
    };

    const handleEditDept = (record: Department) => {
        setEditingDept(record);
        deptForm.setFieldsValue({
            name: record.name,
            description: record.description,
            status: record.status
        });
        setDeptModalVisible(true);
    };

    const handleManageCanteens = async (record: Department) => {
        setCurrentDeptId(record.id);
        setSelectedCanteenIds(record.canteen_ids || []);
        setCanteenModalVisible(true);
    };

    const handleDeptModalOk = async () => {
        try {
            const values = await deptForm.validateFields();
            if (editingDept) {
                await updateDepartment(editingDept.id, values);
                message.success('更新成功');
            } else {
                await createDepartment(values);
                message.success('创建成功');
            }
            setDeptModalVisible(false);
            fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteDept = (id: string) => {
        Modal.confirm({
            title: '确认删除',
            content: '确定要删除该部门吗？如果部门下有员工，将无法删除。',
            onOk: async () => {
                try {
                    const res = await deleteDepartment(id);
                    if (res.code === 200) {
                        message.success('删除成功');
                        fetchData();
                    } else {
                        message.error(res.message);
                    }
                } catch (error: any) {
                    message.error(error?.message || '删除失败');
                }
            }
        });
    };

    const handleCanteenModalOk = async () => {
        try {
            await updateDepartmentCanteens(currentDeptId, selectedCanteenIds);
            message.success('食堂关联更新成功');
            setCanteenModalVisible(false);
            fetchData();
        } catch (error) {
            message.error('更新失败');
        }
    };

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>
                    <ApartmentOutlined /> 部门管理
                </Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddDept}>
                    新增部门
                </Button>
            </div>
            <Card bordered={false}>
                <Table
                    columns={columns}
                    dataSource={departments}
                    rowKey="id"
                    loading={loading}
                    scroll={{ x: 1000 }}
                />
            </Card>

            {/* 新增/编辑部门弹窗 */}
            <Modal
                title={editingDept ? '编辑部门' : '新增部门'}
                open={deptModalVisible}
                onOk={handleDeptModalOk}
                onCancel={() => setDeptModalVisible(false)}
                width={600}
            >
                <Form form={deptForm} layout="vertical">
                    <Form.Item
                        name="name"
                        label="部门名称"
                        rules={[{ required: true, message: '请输入部门名称' }]}
                    >
                        <Input placeholder="例如：运营部、销售部" />
                    </Form.Item>
                    <Form.Item name="description" label="部门描述">
                        <TextArea rows={3} placeholder="请输入部门职责描述" />
                    </Form.Item>
                    <Form.Item name="status" label="状态" initialValue="ACTIVE">
                        <Select>
                            <Select.Option value="ACTIVE">启用</Select.Option>
                            <Select.Option value="INACTIVE">禁用</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

            {/* 管理食堂关联弹窗 */}
            <Modal
                title="管理部门关联的食堂"
                open={canteenModalVisible}
                onOk={handleCanteenModalOk}
                onCancel={() => setCanteenModalVisible(false)}
                width={700}
            >
                <div style={{ marginBottom: 16 }}>
                    <Text type="secondary">
                        选择该部门可管理的食堂，部门成员将只能查看和管理这些食堂的数据
                    </Text>
                </div>
                <Divider />
                <Transfer
                    dataSource={canteens.map(c => ({
                        key: c.id,
                        title: c.name,
                        description: c.address
                    }))}
                    targetKeys={selectedCanteenIds}
                    onChange={(keys) => setSelectedCanteenIds(keys as string[])}
                    render={item => `${item.title}`}
                    listStyle={{
                        width: 300,
                        height: 400,
                    }}
                    titles={['可选食堂', '已关联食堂']}
                    showSearch
                    filterOption={(inputValue, item) =>
                        item.title!.indexOf(inputValue) !== -1
                    }
                />
            </Modal>
        </div>
    );
};

export default DepartmentManagementPage;
