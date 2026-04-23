import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css/Forum.css';
import { getPosts } from '../api/posts'; // API 函数

export default function Forum() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    // 组件挂载时请求一次帖子列表
    useEffect(() => {
        const fetchPosts = async () => {
            const res = await getPosts();
            setPosts(res.data.posts || []);
            setLoading(false);
        };
        fetchPosts();
    }, []);

    //加载动画
    if (loading) return (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '60vh',
        gap: '16px'
    }}>
        <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #fde8d8',
            borderTop: '4px solid #f97316',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{ color: '#f97316', fontWeight: '600', fontSize: '0.95rem' }}>加载中...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
);

    return (
        <div className="home-container">
            <div className="home-header">
                <h1 className="home-title">摄影论坛</h1>
                <Link to="/create" className="btn-primary">发布作品</Link>
            </div>

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
                                    src={`https://ui-avatars.com/api/?name=${post.author?.username}&background=random&color=fff`}
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