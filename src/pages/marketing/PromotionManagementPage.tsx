import React, { useEffect, useState } from 'react';
import {
    Table,
    Button,
    Card,
    Modal,
    Form,
    Input,
    InputNumber,
    message,
    Image,
    Typography,
    Switch,
    Tag
} from 'antd';
import {
    EditOutlined,
    PictureOutlined,
    GiftOutlined
} from '@ant-design/icons';
import type { Promotion } from '../../types';
import {
    getPromotions,
    updatePromotion
} from '../../api/marketing';

const { Title, Text } = Typography;

const PromotionManagementPage: React.FC = () => {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState<Promotion | null>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getPromotions();
            setPromotions(res.data);
        } catch (error) {
            message.error('加载活动失败');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (record: Promotion) => {
        setEditingItem(record);
        form.setFieldsValue(record);
        setModalVisible(true);
    };

    const handleToggleStatus = async (id: string, checked: boolean) => {
        await updatePromotion(id, { status: checked ? 'ACTIVE' : 'INACTIVE' });
        message.success('状态更新成功');
        fetchData();
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            if (editingItem) {
                await updatePromotion(editingItem.id, values);
                message.success('更新成功');
            }
            setModalVisible(false);
            fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    const columns = [
        {
            title: '缩略图',
            dataIndex: 'image',
            key: 'image',
            render: (url: string) => <Image src={url} width={80} height={45} style={{ objectFit: 'cover', borderRadius: '4px' }} />
        },
        {
            title: '活动标题',
            dataIndex: 'title',
            key: 'title',
            render: (text: string, record: Promotion) => (
                <div>
                    <div><Text strong>{text}</Text></div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>{record.subtitle}</Text>
                </div>
            )
        },
        {
            title: '类型',
            dataIndex: 'type',
            key: 'type',
            render: (type: string) => (
                <Tag icon={type === 'BANNER' ? <PictureOutlined /> : <GiftOutlined />}>
                    {type === 'BANNER' ? '首页横幅' : '营销活动'}
                </Tag>
            )
        },
        {
            title: '排序',
            dataIndex: 'sortOrder',
            key: 'sortOrder',
        },
        {
            title: '显示状态',
            dataIndex: 'status',
            key: 'status',
            render: (status: string, record: Promotion) => (
                <Switch
                    checked={status === 'ACTIVE'}
                    onChange={(checked) => handleToggleStatus(record.id, checked)}
                />
            )
        },
        {
            title: '操作',
            key: 'action',
            render: (_: any, record: Promotion) => (
                <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
            )
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Title level={2}><PictureOutlined /> 活动与海报管理</Title>
            <Card bordered={false}>
                <Table
                    columns={columns}
                    dataSource={promotions}
                    rowKey="id"
                    loading={loading}
                    pagination={false}
                />
            </Card>

            <Modal
                title="编辑活动/海报"
                open={modalVisible}
                onOk={handleModalOk}
                onCancel={() => setModalVisible(false)}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="title" label="活动标题" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="subtitle" label="副标题">
                        <Input />
                    </Form.Item>
                    <Form.Item name="image" label="图片 URL" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="link" label="跳转链接">
                        <Input placeholder="如：/products?category=主食" />
                    </Form.Item>
                    <Form.Item name="sortOrder" label="排序权重">
                        <InputNumber style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default PromotionManagementPage;
