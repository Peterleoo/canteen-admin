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
            // 调试神器：直接看结构
            console.log('完整的接口返回:', response);
            // 修正 1: 根据 api/user.ts 的返回结构，取 response.data.list
            setUsers(response.data.data || []);
            setTotal(response.data.total || 0);
        } catch (error) {
            console.error(error);
            message.error('加载用户列表失败');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, [page, pageSize, keyword]);

    const handleStatusChange = async (user: any) => {
        // 兼容处理：Supabase 存储的可能是小写，判断时统一转大写
        const currentStatus = (user.status || 'ACTIVE').toUpperCase();
        const newStatus = currentStatus === 'BANNED' ? 'ACTIVE' : 'BANNED';
        const actionText = newStatus === 'BANNED' ? '拉黑' : '解除拉黑';

        Modal.confirm({
            title: `确定要${actionText}该用户吗？`,
            content: `用户：${user.username || '未知'} (${user.email || '无邮箱'})`,
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
            render: (_, record: any) => (
                <Space>
                    <Avatar src={record.avatar}>{record.username?.[0]}</Avatar>
                    <div>
                        {/* 修正 2: 使用 username 而非 name */}
                        <div style={{ fontWeight: 'bold' }}>{record.username}</div>
                        <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.email}</div>
                    </div>
                </Space>
            ),
        },
        {
            title: '总订单数',
            dataIndex: 'total_orders', // 修正 3: 对应数据库下划线字段
            key: 'total_orders',
            width: 100,
            render: (val) => val || 0,
        },
        {
            title: '总消费',
            dataIndex: 'total_spent',
            key: 'total_spent',
            width: 120,
            render: (val) => val ? `¥${Number(val).toFixed(2)}` : '¥0.00',
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (status) => {
                const s = (status || 'ACTIVE').toUpperCase();
                return (
                    <Tag color={s === 'ACTIVE' ? 'success' : 'error'}>
                        {s === 'ACTIVE' ? '活跃' : '已拉黑'}
                    </Tag>
                );
            },
        },
        {
            title: '注册时间',
            dataIndex: 'created_at', // 修正 4: 对应数据库 created_at
            key: 'created_at',
            width: 150,
            render: (time) => time ? dayjs(time).format('YYYY-MM-DD') : '-',
        },
        {
            title: '操作',
            key: 'action',
            width: 120,
            fixed: 'right',
            render: (_, record: any) => {
                const s = (record.status || 'ACTIVE').toUpperCase();
                return (
                    <Space size="middle">
                        <Tooltip title="详情">
                            <Button shape="circle" icon={<EyeOutlined />} onClick={() => showDetail(record.id)} />
                        </Tooltip>
                        <Tooltip title={s === 'BANNED' ? '解除拉黑' : '拉黑'}>
                            <Button
                                danger={s === 'ACTIVE'}
                                shape="circle"
                                icon={s === 'BANNED' ? <CheckCircleOutlined /> : <StopOutlined />}
                                onClick={() => handleStatusChange(record)}
                            />
                        </Tooltip>
                    </Space>
                );
            },
        },
    ];

    return (
        <Card variant="outlined">
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Search
                    placeholder="搜索用户名/邮箱"
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
            >
                {detailLoading ? (
                    <div style={{ padding: '50px', textAlign: 'center' }}>加载中...</div>
                ) : currentUser && (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
                            <Avatar size={64} src={currentUser.avatar} style={{ marginRight: 16 }}>
                                {currentUser.username?.[0]}
                            </Avatar>
                            <div>
                                <h3 style={{ margin: 0 }}>{currentUser.username}</h3>
                                <div style={{ color: '#8c8c8c' }}>
                                    ID: {currentUser.id} | 注册于 {dayjs(currentUser.created_at).format('YYYY-MM-DD')}
                                </div>
                                <Tag color={(currentUser.status || 'ACTIVE').toUpperCase() === 'ACTIVE' ? 'success' : 'error'} style={{ marginTop: 8 }}>
                                    {(currentUser.status || 'ACTIVE').toUpperCase() === 'ACTIVE' ? '活跃' : '已拉黑'}
                                </Tag>
                            </div>
                        </div>

                        <Descriptions title="消费统计" bordered column={3}>
                            <Descriptions.Item label="累计订单">{(currentUser as any).total_orders || 0}</Descriptions.Item>
                            <Descriptions.Item label="累计消费">¥{Number((currentUser as any).total_spent || 0).toFixed(2)}</Descriptions.Item>
                            <Descriptions.Item label="客单价">
                                ¥{(Number((currentUser as any).total_spent || 0) / ((currentUser as any).total_orders || 1)).toFixed(2)}
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider />

                        <Descriptions title="基本信息" bordered column={1}>
                            <Descriptions.Item label="邮箱">{currentUser.email}</Descriptions.Item>
                            <Descriptions.Item label="角色">{(currentUser as any).role || '普通用户'}</Descriptions.Item>
                        </Descriptions>

                        {currentUser.addresses && currentUser.addresses.length > 0 && (
                            <>
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
                                        { title: '地址', key: 'address', render: (_, r: any) => `${r.area}${r.detail}` },
                                    ]}
                                />
                            </>
                        )}
                    </div>
                )}
            </Modal>
        </Card>
    );
};