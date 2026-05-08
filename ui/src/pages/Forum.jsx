import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css/Forum.css';
import { getPosts } from '../api/posts';
import api from '../api/axios';

export default function Forum() {
    const [posts, setPosts] = useState([]);
    const [hotPosts, setHotPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [postsRes, hotRes, catRes] = await Promise.all([
                    getPosts(),
                    getPosts({ sortBy: 'likeCount', order: 'desc', limit: 5 }),
                    api.get('/categories'),
                ]);
                setPosts(postsRes.data.posts || []);
                setHotPosts(hotRes.data.posts || []);
                setCategories(catRes.data.data?.categories || catRes.data.categories || []);
            } catch (err) {
                console.error('加载数据失败', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

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
        <div className="forum-layout">
            {/* 左侧主内容 */}
            <div className="forum-main">
                <div className="home-header">
                    <Link to="/create" className="btn-primary">发布作品</Link>
                </div>

                <div className="posts-grid">
                    {posts.map((post) => (
                        <div key={post._id} className="post-card">
                            {post.images && post.images.length > 0 && (
                                <Link to={`/post/${post._id}`}>
                                    <img
                                        src={post.images[0]}
                                        alt={post.title}
                                        className="post-cover"
                                    />
                                </Link>
                            )}
                            <div className="post-card-body">
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
                        </div>
                    ))}
                </div>
            </div>

            {/* 右侧边栏 */}
            <aside className="forum-sidebar">
                {/* 分类导航 */}
                <div className="sidebar-card">
                    <h3 className="sidebar-title">摄影分类</h3>
                    <div className="sidebar-categories">
                        {categories.map((cat) => (
                            <span key={cat._id} className="sidebar-cat-item">
                                {cat.name}
                            </span>
                        ))}
                    </div>
                </div>

                {/* 热门排行 */}
                <div className="sidebar-card">
                    <h3 className="sidebar-title">热门排行</h3>
                    <div className="sidebar-hot-list">
                        {hotPosts.map((post, index) => (
                            <Link to={`/post/${post._id}`} key={post._id} className="sidebar-hot-item">
                                <span className={`hot-rank ${index < 3 ? 'hot-top' : ''}`}>{index + 1}</span>
                                <div className="hot-info">
                                    <span className="hot-title">{post.title}</span>
                                    <span className="hot-stats">{post.likeCount} 赞 / {post.viewCount} 浏览</span>
                                </div>
                            </Link>
                        ))}
                        {hotPosts.length === 0 && <p className="sidebar-empty">暂无数据</p>}
                    </div>
                </div>

                {/* 最新发布 */}
                <div className="sidebar-card">
                    <h3 className="sidebar-title">最新发布</h3>
                    <div className="sidebar-hot-list">
                        {posts.slice(0, 5).map((post) => (
                            <Link to={`/post/${post._id}`} key={post._id} className="sidebar-hot-item">
                                {post.images && post.images.length > 0 && (
                                    <img src={post.images[0]} alt={post.title} className="sidebar-thumb" />
                                )}
                                <div className="hot-info">
                                    <span className="hot-title">{post.title}</span>
                                    <span className="hot-stats">{post.author?.username}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </aside>
        </div>
    );
}
