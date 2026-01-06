import axios from 'axios';
import { message } from 'antd';
import { useAuthStore } from '../stores/useAuthStore';

// 创建 axios 实例
const request = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: 10000,
});

// 请求拦截器
request.interceptors.request.use(
    (config) => {
        const { token } = useAuthStore.getState();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 响应拦截器
request.interceptors.response.use(
    (response) => {
        const { data } = response;

        // 如果返回的状态码不是 200，则抛出错误
        if (data.code !== undefined && data.code !== 200) {
            message.error(data.message || '请求失败');
            return Promise.reject(new Error(data.message || '请求失败'));
        }

        return data;
    },
    (error) => {
        if (error.response) {
            const { status } = error.response;

            switch (status) {
                case 401:
                    message.error('未授权,请重新登录');
                    useAuthStore.getState().logout();
                    window.location.href = '/login';
                    break;
                case 403:
                    message.error('没有权限访问');
                    break;
                case 404:
                    message.error('请求的资源不存在');
                    break;
                case 500:
                    message.error('服务器错误');
                    break;
                default:
                    message.error(error.response.data?.message || '请求失败');
            }
        } else if (error.request) {
            message.error('网络错误,请检查网络连接');
        } else {
            message.error('请求配置错误');
        }

        return Promise.reject(error);
    }
);

export default request;
