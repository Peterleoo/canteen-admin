import React, { useEffect, useState } from 'react';
import {
    Button,
    Card,
    Form,
    InputNumber,
    TimePicker,
    message,
    Typography,
    Switch,
    Row,
    Col,
    Divider
} from 'antd';
import {
    SettingOutlined,
    SafetyCertificateOutlined,
    ClockCircleOutlined,
    WalletOutlined,
    NotificationOutlined
} from '@ant-design/icons';
import {
    getSystemConfig,
    updateSystemConfig
} from '../../api/settings';
import dayjs from 'dayjs';

const { Title } = Typography;

const SystemConfigPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        setLoading(true);
        try {
            const res = await getSystemConfig();
            form.setFieldsValue({
                ...res.data,
                businessHours: [
                    dayjs(res.data.businessHours[0], 'HH:mm'),
                    dayjs(res.data.businessHours[1], 'HH:mm')
                ]
            });
        } catch (error) {
            message.error('加载配置失败');
        } finally {
            setLoading(false);
        }
    };

    const onFinish = async (values: any) => {
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
        } catch (error) {
            message.error('更新失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '24px' }}>
            <Title level={2}><SettingOutlined /> 系统配置</Title>
            <Card bordered={false}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    style={{ maxWidth: 800 }}
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
            </Card>
        </div>
    );
};

export default SystemConfigPage;
