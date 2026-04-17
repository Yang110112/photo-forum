import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../css/Forum.css';

const mockPosts = [
    {
        _id: 'mock1',
        title: '风光摄影：雪山日出',
        content: '这是一组在雪山拍摄的日出作品，记录了壮丽的自然景观，光线变化令人叹为观止。',
        author: { username: '摄影师小明', avatar: 'https://via.placeholder.com/30' },
        viewCount: 1234,
        likeCount: 89,
        category: { name: '风光摄影' },
        tags: ['风光', '日出', '雪山'],
    },
    {
        _id: 'mock2',
        title: '人像摄影：光影与情绪',
        content: '一组人像作品，探讨光影对人物情绪的表达，用光线诠释内心世界的细腻变化。',
        author: { username: '人像摄影师', avatar: 'https://via.placeholder.com/30' },
        viewCount: 892,
        likeCount: 67,
        category: { name: '人像摄影' },
        tags: ['人像', '光影'],
    },
    {
        _id: 'mock3',
        title: '街头摄影：城市的角落',
        content: '漫步城市街头，用镜头捕捉那些被忽略的角落，记录普通人的生活瞬间与城市温度。',
        author: { username: '街头猎人', avatar: 'https://via.placeholder.com/30' },
        viewCount: 567,
        likeCount: 43,
        category: { name: '街头摄影' },
        tags: ['街头', '城市', '纪实'],
    },
];

export default function Forum() {
    const [posts] = useState(mockPosts);

    return (
        <div className="home-container">
            <div className="home-header">
                <h1 className="home-title">摄影论坛</h1>
                <Link to="/create" className="btn-primary">发布作品</Link>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '16px' }}>
                🔧 接口未接入，当前显示模拟数据
            </p>

            <div className="posts-grid">
                {posts.map((post) => (
                    <div key={post._id} className="post-card">
                        <Link to={`/post/${post._id}`}>
                            <h3 className="post-title">{post.title}</h3>
                        </Link>
                        <p className="post-content">{post.content}</p>
                        <div className="post-meta">
                            <div className="post-author">
                                <img
                                    src={post.author?.avatar || 'https://via.placeholder.com/30'}
                                    alt={post.author?.username}
                                    className="author-avatar"
                                />
                                <span>{post.author?.username}</span>
                            </div>
                            <div className="post-stats">
                                <span>{post.viewCount} 浏览</span>
                                <span>{post.likeCount} 点赞</span>
                            </div>
                        </div>
                        <div className="post-tags">
                            <span className="post-category">{post.category?.name}</span>
                            {post.tags?.map((tag) => (
                                <span key={tag} className="post-tag">#{tag}</span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}