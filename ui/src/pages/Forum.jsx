import { useState, useEffect } from 'react';
import { Link, useNavigate,useSearchParams } from 'react-router-dom';
import '../css/Forum.css';
import { getPosts } from '../api/posts';
import api from '../api/axios';

// 分类数据
const categoryList = [
  { slug: 'landscape', name: '风光摄影', emoji: '🏔️' },
  { slug: 'portrait', name: '人像摄影', emoji: '👤' },
  { slug: 'street', name: '街头摄影', emoji: '🏙️' },
  { slug: 'animal', name: '动物摄影', emoji: '🐾' },
  { slug: 'food', name: '美食摄影', emoji: '🍽️' },
  { slug: 'astrophotography', name: '星空摄影', emoji: '🌌' },
];

export default function Forum() {
    const [posts, setPosts] = useState([]);
    const [hotPosts, setHotPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const currentCategory = searchParams.get('category');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [postsRes, hotRes] = await Promise.all([
                    getPosts(),
                    getPosts({ sortBy: 'likeCount', order: 'desc', limit: 5 }),
                ]);
                setPosts(postsRes.data.posts || []);
                setHotPosts(hotRes.data.posts || []);
            } catch (err) {
                console.error('加载数据失败', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // 根据分类筛选帖子
    const filteredPosts = currentCategory
        ? posts.filter(post => post.category === currentCategory || post.category?.slug === currentCategory)
        : posts;

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

                {filteredPosts.length === 0 ? (
                    <div className="forum-empty">
                        <div className="empty-icon">📷</div>
                        <h3>暂无作品</h3>
                        <p>还没有人发布作品，成为第一个分享者吧！</p>
                        <Link to="/create" className="btn-primary">发布作品</Link>
                    </div>
                ) : (
                    <div className="posts-grid">
                        {filteredPosts.map((post) => (
                            <div
                                key={post._id}
                                className="post-card"
                                onClick={() => navigate(`/post/${post._id}`)}
                                style={{ cursor: 'pointer' }}
                            >
                                {/* 媒体预览 */}
                                {post.media && post.media.length > 0 ? (
                                    <Link to={`/post/${post._id}`}>
                                        <div className="post-media-preview">
                                            {post.media[0].type?.startsWith('video/') || /\.(mp4|webm|ogg|mov)$/i.test(post.media[0].url) ? (
                                                <video src={post.media[0].url} />
                                            ) : (
                                                <img src={post.media[0].url} alt={post.title} />
                                            )}
                                            {post.media.length > 1 && (
                                                <span className="media-count">+{post.media.length - 1}</span>
                                            )}
                                        </div>
                                    </Link>
                                ) : post.images && post.images.length > 0 ? (
                                <Link to={`/post/${post._id}`}>
                                    {post.images[0].startsWith('data:video') ? (
                                        <video
                                            src={post.images[0]}
                                            className="post-cover"
                                            muted
                                            style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                                            onMouseEnter={(e) => e.target.play()}
                                            onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; }}
                                        />
                                    ) : (
                                        <img src={post.images[0]} alt={post.title} className="post-cover" />
                                    )}
                                </Link>
                            ) : null}
                                <div className="post-card-body">
                                    <Link to={`/post/${post._id}`}>
                                        <h3 className="post-title">{post.title}</h3>
                                    </Link>
                                    <p className="post-content">{post.content}</p>
                                    <div className="post-meta">
                                        <div className="post-author">
                                            <img
                                                src={`https://ui-avatars.com/api/?name=${post.author?.username || 'U'}&background=random&color=fff`}
                                                alt={post.author?.username}
                                                className="author-avatar"
                                            />
                                            <span>{post.author?.username || '匿名用户'}</span>
                                        </div>
                                        <div className="post-stats">
                                            <span>{post.viewCount || 0} 浏览</span>
                                            <span>{post.likeCount || 0} 点赞</span>
                                            <span>{post.commentCount || 0} 评论</span>
                                        </div>
                                    </div>
                                    <div className="post-tags">
                                        {post.category && (
                                            <span className="post-category">
                                                {typeof post.category === 'string'
                                                    ? (categoryList.find(c => c.slug === post.category)?.name || post.category)
                                                    : post.category?.name}
                                            </span>
                                        )}
                                        {post.tags?.map((tag) => (
                                            <span key={tag} className="post-tag">#{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 右侧边栏 */}
            <aside className="forum-sidebar">

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
                                post.images[0].startsWith('data:video') ? (
                                    <video src={post.images[0]} className="sidebar-thumb" muted />
                                ) : (
                                    <img src={post.images[0]} alt={post.title} className="sidebar-thumb" />
                                )
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
