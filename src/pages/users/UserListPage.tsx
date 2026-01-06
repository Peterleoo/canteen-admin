import React, { useState, useEffect } from 'react';
import {
    Table,
    Tag,
    Space,
    Button,
    Card,
    Input,
    message,
    Modal,
    Descriptions,
    Divider,
    Avatar,
    Tooltip,
} from 'antd';
import {
    SearchOutlined,
    EyeOutlined,
    StopOutlined,
    CheckCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getUsers, getUserDetail, updateUserStatus } from '../../api/user';
import type { User } from '../../types/index';
import dayjs from 'dayjs';

const { Search } = Input;

export const UserListPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [keyword, setKeyword] = useState('');

    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [currentUser, setCurrentUser] = useState<(User & { addresses: any[] }) | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const response = await getUsers({
                page,
                pageSize,
                keyword,
            });
            setUsers(response.data.data);
            setTotal(response.data.total);
        } catch (error) {
            message.error('加载用户列表失败');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, [page, pageSize, keyword]);

    const handleStatusChange = async (user: User) => {
        const newStatus = user.status === 'BANNED' ? 'ACTIVE' : 'BANNED';
        const actionText = newStatus === 'BANNED' ? '拉黑' : '解除拉黑';

        Modal.confirm({
            title: `确定要${actionText}该用户吗？`,
            content: `用户：${user.name} (${user.phone})`,
            okText: '确定',
            cancelText: '取消',
            onOk: async () => {
                try {
                    await updateUserStatus(user.id, newStatus);
                    message.success(`${actionText}成功`);
                    loadUsers();
                } catch (error) {
                    message.error(`${actionText}失败`);
                }
            }
        });
    };

    const showDetail = async (id: string) => {
        setDetailLoading(true);
        setIsDetailVisible(true);
        try {
            const response = await getUserDetail(id);
            setCurrentUser(response.data);
        } catch (error) {
            message.error('获取用户详情失败');
            setIsDetailVisible(false);
        } finally {
            setDetailLoading(false);
        }
    };

    const columns: ColumnsType<User> = [
        {
            title: '用户信息',
            key: 'user',
            width: 200,
            render: (_, record) => (
                <Space>
                    <Avatar src={record.avatar} />
                    <div>
                        <div style={{ fontWeight: 'bold' }}>{record.name}</div>
                        <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.phone}</div>
                    </div>
                </Space>
            ),
        },
        {
            title: '总订单数',
            dataIndex: 'totalOrders',
            key: 'totalOrders',
            width: 100,
            sorter: (a, b) => a.totalOrders - b.totalOrders,
        },
        {
            title: '总消费',
            dataIndex: 'totalSpent',
            key: 'totalSpent',
            width: 120,
            render: (val) => `¥${val.toFixed(2)}`,
            sorter: (a, b) => a.totalSpent - b.totalSpent,
        },
        {
            title: '最近下单',
            dataIndex: 'lastOrderAt',
            key: 'lastOrderAt',
            width: 180,
            render: (time) => time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '无',
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (status) => (
                <Tag color={status === 'ACTIVE' ? 'success' : 'error'}>
                    {status === 'ACTIVE' ? '活跃' : '已拉黑'}
                </Tag>
            ),
        },
        {
            title: '注册时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 150,
            render: (time) => dayjs(time).format('YYYY-MM-DD'),
        },
        {
            title: '操作',
            key: 'action',
            width: 180,
            fixed: 'right',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="详情">
                        <Button shape="circle" icon={<EyeOutlined />} onClick={() => showDetail(record.id)} />
                    </Tooltip>
                    <Tooltip title={record.status === 'BANNED' ? '解除拉黑' : '拉黑'}>
                        <Button
                            danger={record.status === 'ACTIVE'}
                            shape="circle"
                            icon={record.status === 'BANNED' ? <CheckCircleOutlined /> : <StopOutlined />}
                            onClick={() => handleStatusChange(record)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <Card bordered={false}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Search
                    placeholder="搜索姓名/手机号"
                    onSearch={(value) => {
                        setKeyword(value);
                        setPage(1);
                    }}
                    style={{ width: 300 }}
                    allowClear
                    enterButton={<SearchOutlined />}
                />
                <Button onClick={loadUsers}>刷新</Button>
            </div>

            <Table
                columns={columns}
                dataSource={users}
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
                    showTotal: (t) => `共 ${t} 名用户`,
                    showSizeChanger: true,
                }}
                scroll={{ x: 1000 }}
            />

            <Modal
                title="用户详画像"
                open={isDetailVisible}
                onCancel={() => setIsDetailVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsDetailVisible(false)}>关闭</Button>
                ]}
                width={700}
                loading={detailLoading}
            >
                {currentUser && (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
                            <Avatar size={64} src={currentUser.avatar} style={{ marginRight: 16 }} />
                            <div>
                                <h3 style={{ margin: 0 }}>{currentUser.name}</h3>
                                <div style={{ color: '#8c8c8c' }}>ID: {currentUser.id} | 注册于 {dayjs(currentUser.createdAt).format('YYYY-MM-DD')}</div>
                                <Tag color={currentUser.status === 'ACTIVE' ? 'success' : 'error'} style={{ marginTop: 8 }}>
                                    {currentUser.status === 'ACTIVE' ? '活跃' : '已拉黑'}
                                </Tag>
                            </div>
                        </div>

                        <Descriptions title="消费统计" bordered column={3}>
                            <Descriptions.Item label="累计订单">{currentUser.totalOrders}</Descriptions.Item>
                            <Descriptions.Item label="累计消费">¥{currentUser.totalSpent.toFixed(2)}</Descriptions.Item>
                            <Descriptions.Item label="客单价">¥{(currentUser.totalSpent / (currentUser.totalOrders || 1)).toFixed(2)}</Descriptions.Item>
                        </Descriptions>

                        <Divider />

                        <Descriptions title="基本信息" bordered column={2}>
                            <Descriptions.Item label="手机号">{currentUser.phone}</Descriptions.Item>
                            <Descriptions.Item label="最近下单时间">{currentUser.lastOrderAt ? dayjs(currentUser.lastOrderAt).format('YYYY-MM-DD HH:mm') : '无'}</Descriptions.Item>
                        </Descriptions>

                        <Divider />

                        <h4 style={{ marginBottom: 16 }}>收货地址</h4>
                        <Table
                            dataSource={currentUser.addresses}
                            pagination={false}
                            rowKey="id"
                            size="small"
                            columns={[
                                { title: '联系人', dataIndex: 'contactName', key: 'contactName' },
                                { title: '电话', dataIndex: 'phone', key: 'phone' },
                                { title: '标签', dataIndex: 'tag', key: 'tag', render: (t) => t ? <Tag>{t}</Tag> : '-' },
                                { title: '地址', key: 'address', render: (_, r) => `${r.area}${r.detail}` },
                                { title: '默认', dataIndex: 'isDefault', key: 'isDefault', render: (d) => d ? <Tag color="blue">默认</Tag> : null },
                            ]}
                        />
                    </div>
                )}
            </Modal>
        </Card>
    );
};
