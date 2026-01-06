import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Space,
    Tag,
    Image,
    Input,
    Select,
    Modal,
    Form,
    InputNumber,
    Switch,
    Upload,
    message,
    Popconfirm,
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    UploadOutlined,
} from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { Product, Category } from '../../types/index';
import { getProducts, createProduct, updateProduct, deleteProduct, batchUpdateProductStatus } from '../../api/product';
import { Category as CategoryEnum } from '../../types/index';

const { Search } = Input;
const { Option } = Select;

export const ProductListPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [keyword, setKeyword] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<Category | undefined>();
    const [statusFilter, setStatusFilter] = useState<'ACTIVE' | 'INACTIVE' | undefined>();
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [form] = Form.useForm();

    // 加载商品列表
    const loadProducts = async () => {
        setLoading(true);
        try {
            const response = await getProducts({
                page,
                pageSize,
                keyword,
                category: categoryFilter,
                status: statusFilter,
            });
            setProducts(response.data.data);
            setTotal(response.data.total);
        } catch (error) {
            message.error('加载商品列表失败');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, [page, pageSize, keyword, categoryFilter, statusFilter]);

    // 表格列定义
    const columns: ColumnsType<Product> = [
        {
            title: '商品图片',
            dataIndex: 'image',
            width: 100,
            render: (url: string) => <Image src={url} width={60} height={60} style={{ objectFit: 'cover', borderRadius: 8 }} />,
        },
        {
            title: '商品名称',
            dataIndex: 'name',
            width: 200,
            ellipsis: true,
        },
        {
            title: '分类',
            dataIndex: 'category',
            width: 100,
            render: (category: Category) => <Tag color="blue">{category}</Tag>,
        },
        {
            title: '价格',
            dataIndex: 'price',
            width: 100,
            render: (price: number) => <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>¥{price.toFixed(2)}</span>,
            sorter: (a, b) => a.price - b.price,
        },
        {
            title: '库存',
            dataIndex: 'stock',
            width: 100,
            render: (stock: number) => (
                <Tag color={stock < 30 ? 'red' : stock < 50 ? 'orange' : 'green'}>
                    {stock}
                </Tag>
            ),
            sorter: (a, b) => a.stock - b.stock,
        },
        {
            title: '销量',
            dataIndex: 'sales',
            width: 100,
            sorter: (a, b) => a.sales - b.sales,
        },
        {
            title: '状态',
            dataIndex: 'status',
            width: 100,
            render: (status: string) => (
                <Tag color={status === 'ACTIVE' ? 'success' : 'default'}>
                    {status === 'ACTIVE' ? '上架' : '下架'}
                </Tag>
            ),
        },
        {
            title: '标签',
            dataIndex: 'tags',
            width: 150,
            render: (tags: string[]) => (
                <>
                    {tags?.map(tag => (
                        <Tag key={tag} color="purple" style={{ marginBottom: 4 }}>
                            {tag}
                        </Tag>
                    ))}
                </>
            ),
        },
        {
            title: '操作',
            key: 'action',
            width: 200,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="link"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        编辑
                    </Button>
                    <Popconfirm
                        title="确定要删除这个商品吗?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Button
                            type="link"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                        >
                            删除
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // 处理分页变化
    const handleTableChange = (pagination: TablePaginationConfig) => {
        setPage(pagination.current || 1);
        setPageSize(pagination.pageSize || 10);
    };

    // 处理搜索
    const handleSearch = (value: string) => {
        setKeyword(value);
        setPage(1);
    };

    // 处理新增
    const handleAdd = () => {
        setEditingProduct(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    // 处理编辑
    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        form.setFieldsValue(product);
        setIsModalVisible(true);
    };

    // 处理删除
    const handleDelete = async (id: string) => {
        try {
            await deleteProduct(id);
            message.success('删除成功');
            loadProducts();
        } catch (error) {
            message.error('删除失败');
        }
    };

    // 处理表单提交
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            if (editingProduct) {
                await updateProduct(editingProduct.id, values);
                message.success('更新成功');
            } else {
                await createProduct(values);
                message.success('创建成功');
            }

            setIsModalVisible(false);
            form.resetFields();
            loadProducts();
        } catch (error) {
            message.error('操作失败');
        }
    };

    // 批量上架
    const handleBatchActive = async () => {
        if (selectedRowKeys.length === 0) {
            message.warning('请先选择商品');
            return;
        }

        try {
            await batchUpdateProductStatus(selectedRowKeys as string[], 'ACTIVE');
            message.success('批量上架成功');
            setSelectedRowKeys([]);
            loadProducts();
        } catch (error) {
            message.error('批量上架失败');
        }
    };

    // 批量下架
    const handleBatchInactive = async () => {
        if (selectedRowKeys.length === 0) {
            message.warning('请先选择商品');
            return;
        }

        try {
            await batchUpdateProductStatus(selectedRowKeys as string[], 'INACTIVE');
            message.success('批量下架成功');
            setSelectedRowKeys([]);
            loadProducts();
        } catch (error) {
            message.error('批量下架失败');
        }
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
    };

    return (
        <div>
            {/* 筛选栏 */}
            <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <Search
                    placeholder="搜索商品名称或描述"
                    allowClear
                    enterButton={<SearchOutlined />}
                    style={{ width: 300 }}
                    onSearch={handleSearch}
                />

                <Select
                    placeholder="选择分类"
                    allowClear
                    style={{ width: 150 }}
                    onChange={(value) => {
                        setCategoryFilter(value);
                        setPage(1);
                    }}
                >
                    {Object.values(CategoryEnum).map(cat => (
                        <Option key={cat} value={cat}>{cat}</Option>
                    ))}
                </Select>

                <Select
                    placeholder="选择状态"
                    allowClear
                    style={{ width: 150 }}
                    onChange={(value) => {
                        setStatusFilter(value);
                        setPage(1);
                    }}
                >
                    <Option value="ACTIVE">上架</Option>
                    <Option value="INACTIVE">下架</Option>
                </Select>
            </div>

            {/* 操作按钮栏 */}
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Space>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        新增商品
                    </Button>
                    <Button onClick={handleBatchActive} disabled={selectedRowKeys.length === 0}>
                        批量上架
                    </Button>
                    <Button onClick={handleBatchInactive} disabled={selectedRowKeys.length === 0}>
                        批量下架
                    </Button>
                </Space>

                <span style={{ color: '#8c8c8c' }}>
                    已选择 {selectedRowKeys.length} 项
                </span>
            </div>

            {/* 表格 */}
            <Table
                rowSelection={rowSelection}
                columns={columns}
                dataSource={products}
                rowKey="id"
                loading={loading}
                pagination={{
                    current: page,
                    pageSize: pageSize,
                    total: total,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total) => `共 ${total} 条`,
                }}
                onChange={handleTableChange}
                scroll={{ x: 1200 }}
            />

            {/* 新增/编辑弹窗 */}
            <Modal
                title={editingProduct ? '编辑商品' : '新增商品'}
                open={isModalVisible}
                onOk={handleSubmit}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                }}
                width={600}
                okText="确定"
                cancelText="取消"
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        status: 'ACTIVE',
                        stock: 0,
                        isRecommended: false,
                        isFeatured: false,
                    }}
                >
                    <Form.Item
                        label="商品名称"
                        name="name"
                        rules={[{ required: true, message: '请输入商品名称' }]}
                    >
                        <Input placeholder="请输入商品名称" />
                    </Form.Item>

                    <Form.Item
                        label="商品描述"
                        name="description"
                        rules={[{ required: true, message: '请输入商品描述' }]}
                    >
                        <Input.TextArea rows={3} placeholder="请输入商品描述" />
                    </Form.Item>

                    <Form.Item
                        label="商品分类"
                        name="category"
                        rules={[{ required: true, message: '请选择商品分类' }]}
                    >
                        <Select placeholder="请选择商品分类">
                            {Object.values(CategoryEnum).map(cat => (
                                <Option key={cat} value={cat}>{cat}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Space style={{ width: '100%' }} size="large">
                        <Form.Item
                            label="商品价格"
                            name="price"
                            rules={[{ required: true, message: '请输入商品价格' }]}
                        >
                            <InputNumber
                                min={0}
                                precision={2}
                                style={{ width: 200 }}
                                placeholder="请输入价格"
                                prefix="¥"
                            />
                        </Form.Item>

                        <Form.Item label="原价" name="originalPrice">
                            <InputNumber
                                min={0}
                                precision={2}
                                style={{ width: 200 }}
                                placeholder="选填"
                                prefix="¥"
                            />
                        </Form.Item>
                    </Space>

                    <Space style={{ width: '100%' }} size="large">
                        <Form.Item
                            label="库存数量"
                            name="stock"
                            rules={[{ required: true, message: '请输入库存数量' }]}
                        >
                            <InputNumber min={0} style={{ width: 200 }} placeholder="请输入库存" />
                        </Form.Item>

                        <Form.Item label="库存预警" name="stockAlert">
                            <InputNumber min={0} style={{ width: 200 }} placeholder="选填" />
                        </Form.Item>
                    </Space>

                    <Form.Item
                        label="商品图片"
                        name="image"
                        rules={[{ required: true, message: '请输入图片URL' }]}
                    >
                        <Input placeholder="请输入图片URL (暂不支持上传)" />
                    </Form.Item>

                    <Form.Item label="商品标签" name="tags">
                        <Select mode="tags" placeholder="输入后按回车添加标签">
                            <Option value="热销">热销</Option>
                            <Option value="推荐">推荐</Option>
                            <Option value="新品">新品</Option>
                        </Select>
                    </Form.Item>

                    <Space size="large">
                        <Form.Item label="是否推荐" name="isRecommended" valuePropName="checked">
                            <Switch />
                        </Form.Item>

                        <Form.Item label="今日疯抢" name="isFeatured" valuePropName="checked">
                            <Switch />
                        </Form.Item>

                        <Form.Item label="上架状态" name="status" valuePropName="checked">
                            <Switch checkedChildren="上架" unCheckedChildren="下架" />
                        </Form.Item>
                    </Space>
                </Form>
            </Modal>
        </div>
    );
};
