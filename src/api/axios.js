import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
});

// 请求拦截器自动带 token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 响应拦截器：如果后端没启动，返回 mock 数据
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // 网络错误（后端没启动），返回 mock 数据
        if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
            console.warn('后端服务未启动，使用 Mock 数据');

            // 帖子列表 mock 数据
            if (error.config.url === '/posts' && error.config.method === 'get') {
                return Promise.resolve({
                    data: {
                        data: [
                            {
                                _id: '1',
                                title: '风光摄影：雪山日出',
                                content: '这是一组在雪山拍摄的日出作品，记录了壮丽的自然景观...',
                                author: { username: '摄影师小明', avatar: 'https://via.placeholder.com/30' },
                                viewCount: 1234,
                                likeCount: 89,
                                commentCount: 12,
                                category: { name: '风光摄影' },
                                tags: ['风光', '日出', '雪山']
                            },
                            {
                                _id: '2',
                                title: '人像摄影：光影与情绪',
                                content: '一组人像作品，探讨光影对人物情绪的表达...',
                                author: { username: '人像摄影师', avatar: 'https://via.placeholder.com/30' },
                                viewCount: 892,
                                likeCount: 67,
                                commentCount: 8,
                                category: { name: '人像摄影' },
                                tags: ['人像', '光影']
                            }
                        ],
                        total: 2,
                        totalPages: 1,
                        currentPage: 1
                    }
                });
            }

            // 其他接口 mock 数据
            return Promise.resolve({ data: { success: true, data: [] } });
        }
        return Promise.reject(error);
    }
);

export default api;