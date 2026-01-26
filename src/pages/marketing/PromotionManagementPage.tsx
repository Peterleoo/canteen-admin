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
    Tag,
    Select,
    Space,
    Popconfirm
} from 'antd';
import {
    EditOutlined,
    PictureOutlined,
    PlusOutlined,
    DeleteOutlined,
    LinkOutlined
} from '@ant-design/icons';
import type { MarketingBanner } from '../../types';
import {
    getMarketingBanners,
    updateMarketingBanner,
    createMarketingBanner,
    deleteMarketingBanner
} from '../../api/marketing';
import { getCanteens } from '../../api/canteen';
import type { Canteen } from '../../types';

const { Title, Text } = Typography;
const { Option } = Select;

const PromotionManagementPage: React.FC = () => {
    const [banners, setBanners] = useState<MarketingBanner[]>([]);
    const [canteens, setCanteens] = useState<Canteen[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState<MarketingBanner | null>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchData();
        fetchCanteens();
    }, []);

    const fetchCanteens = async () => {
        try {
            const res = await getCanteens();
            setCanteens(res.data);
        } catch (error) {
            console.error('加载食堂列表失败', error);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getMarketingBanners();
            setBanners(res.data);
        } catch (error) {
            message.error('加载海报失败');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingItem(null);
        form.resetFields();
        form.setFieldsValue({ status: 'ACTIVE', sort_order: 0, action_type: 'NONE' });
        setModalVisible(true);
    };

    const handleEdit = (record: MarketingBanner) => {
        setEditingItem(record);
        form.setFieldsValue(record);
        setModalVisible(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteMarketingBanner(id);
            message.success('删除成功');
            fetchData();
        } catch (error: any) {
            message.error('删除失败: ' + error.message);
        }
    };

    const handleToggleStatus = async (id: string, checked: boolean) => {
        await updateMarketingBanner(id, { status: checked ? 'ACTIVE' : 'INACTIVE' });
        message.success('状态更新成功');
        fetchData();
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            if (editingItem) {
                await updateMarketingBanner(editingItem.id, values);
                message.success('更新成功');
            } else {
                await createMarketingBanner(values);
                message.success('创建成功');
            }
            setModalVisible(false);
            fetchData();
        } catch (error: any) {
            message.error('保存失败: ' + error.message);
        }
    };

    const columns = [
        {
            title: '海报图片',
            dataIndex: 'image_url',
            key: 'image_url',
            width: 150,
            render: (url: string) => <Image src={url} width={120} height={60} style={{ objectFit: 'cover', borderRadius: '4px' }} />
        },
        {
            title: '标题',
            dataIndex: 'title',
            key: 'title',
            render: (text: string, record: MarketingBanner) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{text || '未命名海报'}</Text>
                    {record.subtitle && <Text type="secondary" style={{ fontSize: '12px' }}>{record.subtitle}</Text>}
                    <Tag>
                        {record.canteen_id
                            ? (canteens.find(c => String(c.id) === String(record.canteen_id))?.name || '未知食堂')
                            : '全站通用'}
                    </Tag>
                </Space>
            )
        },
        {
            title: '跳转动作',
            dataIndex: 'action_type',
            key: 'action_type',
            render: (type: string, record: MarketingBanner) => (
                <Space direction="vertical" size={0}>
                    <Tag color="blue">{type}</Tag>
                    {record.action_value && <Text type="secondary" style={{ fontSize: '12px' }}><LinkOutlined /> {record.action_value}</Text>}
                </Space>
            )
        },
        {
            title: '排序',
            dataIndex: 'sort_order',
            key: 'sort_order',
            sorter: (a: any, b: any) => a.sort_order - b.sort_order,
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status: string, record: MarketingBanner) => (
                <Switch
                    checked={status === 'ACTIVE'}
                    onChange={(checked) => handleToggleStatus(record.id, checked)}
                />
            )
        },
        {
            title: '操作',
            key: 'action',
            render: (_: any, record: MarketingBanner) => (
                <Space>
                    <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
                    <Popconfirm title="确定删除吗？" onConfirm={() => handleDelete(record.id)}>
                        <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={4} style={{ margin: 0 }}><PictureOutlined /> 首页海报管理</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增海报</Button>
            </div>

            <Card bordered={false} bodyStyle={{ padding: 0 }}>
                <Table
                    columns={columns}
                    dataSource={banners}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title={editingItem ? "编辑海报" : "新增海报"}
                open={modalVisible}
                onOk={handleModalOk}
                onCancel={() => setModalVisible(false)}
                width={600}
                destroyOnClose
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="canteen_id" label="展现食堂">
                        <Select placeholder="请选择该海报展示的食堂">
                            <Option value={null}>全站通用 (所有食堂均展示)</Option>
                            {canteens.map(c => (
                                <Option key={c.id} value={c.id}>{c.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="title" label="海报主标题">
                        <Input placeholder="活动内部名称或主标题，如：匠心好味道" />
                    </Form.Item>
                    <Form.Item name="subtitle" label="海报副标题/说明">
                        <Input placeholder="辅助说明文字，如：严选食材，新鲜每一天" />
                    </Form.Item>
                    <Form.Item name="image_url" label="海报图片地址 (URL)" rules={[{ required: true, message: '请输入图片地址' }]}>
                        <Input placeholder="建议尺寸 750x300 或相同比例" />
                    </Form.Item>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <Form.Item name="action_type" label="跳转类型" style={{ flex: 1 }} rules={[{ required: true }]}>
                            <Select placeholder="选择点击动作">
                                <Option value="NONE">无动作</Option>
                                <Option value="PRODUCT">跳转商品</Option>
                                <Option value="CATEGORY">跳转分类</Option>
                                <Option value="URL">外部链接</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item name="action_value" label="跳转值" style={{ flex: 2 }}>
                            <Input placeholder="商品ID / 分类名 / H5链接" />
                        </Form.Item>
                    </div>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <Form.Item name="sort_order" label="排序权重" style={{ flex: 1 }}>
                            <InputNumber style={{ width: '100%' }} placeholder="数字越大越靠前" />
                        </Form.Item>
                        <Form.Item name="status" label="是否立即发布" style={{ flex: 1 }} valuePropName="checked">
                            <Switch checkedChildren="公开" unCheckedChildren="隐藏" />
                        </Form.Item>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default PromotionManagementPage;
