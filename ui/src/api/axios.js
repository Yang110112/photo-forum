import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
});

// 请求拦截器
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

//模拟数据
const allMockPosts = [
    {
        _id: '1',
        title: '风光摄影：雪山日出',
        content: '这是一组在雪山拍摄的日出作品，记录了壮丽的自然景观，光线变化令人叹为观止。',
        author: { username: '摄影师小明', avatar: 'https://ui-avatars.com/api/?name=摄影师小明&background=random' },
        viewCount: 1234,
        likeCount: 89,
        commentCount: 12,
        category: { name: '风光摄影' },
        tags: ['风光', '日出', '雪山']
    },
    {
        _id: '2',
        title: '人像摄影：光影与情绪',
        content: '一组人像作品，探讨光影对人物情绪的表达，用光线诠释内心世界的细腻变化。',
        author: { username: '人像摄影师', avatar: 'https://ui-avatars.com/api/?name=人像摄影师&background=random' },
        viewCount: 892,
        likeCount: 67,
        commentCount: 8,
        category: { name: '人像摄影' },
        tags: ['人像', '光影']
    },
    {
        _id: '3',
        title: '街头摄影：城市的角落',
        content: '漫步城市街头，用镜头捕捉那些被忽略的角落，记录普通人的生活瞬间与城市温度。',
        author: { username: '街头猎人', avatar: 'https://ui-avatars.com/api/?name=街头猎人&background=random' },
        viewCount: 567,
        likeCount: 43,
        commentCount: 5,
        category: { name: '街头摄影' },
        tags: ['街头', '城市', '纪实']
    },
];

// 响应拦截器：如果后端没启动，返回 mock 数据
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
            console.warn('后端服务未启动，使用 Mock 数据');

            // 帖子详情（放在列表之前）
            if (error.config.url.startsWith('/posts/') && error.config.method === 'get') {
                const id = error.config.url.split('/').pop();
                const post = allMockPosts.find(p => p._id === id);
                return Promise.resolve({ data: { data: post || null } });
            }

            // 帖子列表
            if (error.config.url === '/posts' && error.config.method === 'get') {
                return Promise.resolve({
                    data: {
                        data: allMockPosts,
                        total: allMockPosts.length,
                        totalPages: 1,
                        currentPage: 1
                    }
                });
            }

            // 其他接口
            return Promise.resolve({ data: { success: true, data: [] } });
        }
        return Promise.reject(error);
    }
);

export default api;