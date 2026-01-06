import React, { useEffect, useState } from 'react';
import {
    Table,
    Tag,
    Card,
    Typography,
    message,
    Tooltip
} from 'antd';
import {
    SafetyCertificateOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import { getPermissions } from '../../api/settings';
import type { Permission } from '../../types';

const { Title, Text } = Typography;

const PermissionManagementPage: React.FC = () => {
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getPermissions();
            setPermissions(res.data);
        } catch (error) {
            message.error('加载权限列表失败');
        } finally {
            setLoading(false);
        }
    };

    const formatTreeData = (data: Permission[], parentId?: string): (Permission & { children?: any[] })[] => {
        return data
            .filter(item => item.parentId === parentId)
            .map(item => ({
                ...item,
                children: formatTreeData(data, item.id).length > 0 ? formatTreeData(data, item.id) : undefined
            }));
    };

    const treeData = formatTreeData(permissions);

    const columns = [
        {
            title: '权限名称',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <Text strong>{text}</Text>
        },
        {
            title: '权限编码',
            dataIndex: 'code',
            key: 'code',
            render: (text: string) => <code style={{ color: '#eb2f96' }}>{text}</code>
        },
        {
            title: '类型',
            dataIndex: 'type',
            key: 'type',
            render: (type: string) => (
                <Tag color={type === 'MENU' ? 'green' : 'orange'}>
                    {type === 'MENU' ? '页面/菜单' : '功能/按钮'}
                </Tag>
            )
        },
        {
            title: '说明',
            dataIndex: 'description',
            key: 'description',
            render: (text: string) => text || <Text type="secondary">-</Text>
        },
        {
            title: '状态',
            key: 'status',
            render: () => <Tag color="success">系统内置</Tag>
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Title level={2}>
                <SafetyCertificateOutlined /> 权限管理
                <Tooltip title="系统内置权限点，用于控制角色访问。如需新增自定义功能，请联系技术团队进行点位注册。">
                    <InfoCircleOutlined style={{ fontSize: 16, marginLeft: 8, color: '#999', cursor: 'pointer' }} />
                </Tooltip>
            </Title>
            <Card bordered={false}>
                <Table
                    columns={columns}
                    dataSource={treeData}
                    rowKey="id"
                    loading={loading}
                    pagination={false}
                    expandable={{ defaultExpandAllRows: true }}
                />
            </Card>
        </div>
    );
};

export default PermissionManagementPage;
