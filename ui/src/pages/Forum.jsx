import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import '../css/Forum.css';
import { getPosts } from '../api/posts';

// 分类数据
const categories = [
  { slug: 'landscape', name: '风光摄影', emoji: '🏔️' },
  { slug: 'portrait', name: '人像摄影', emoji: '👤' },
  { slug: 'street', name: '街头摄影', emoji: '🏙️' },
  { slug: 'animal', name: '动物摄影', emoji: '🐾' },
  { slug: 'food', name: '美食摄影', emoji: '🍽️' },
  { slug: 'astrophotography', name: '星空摄影', emoji: '🌌' },
];

export default function Forum() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const currentCategory = searchParams.get('category');

    // 获取所有帖子（包括本地存储的）
    const fetchAllPosts = () => {
        // 从API获取
        const apiPosts = posts.filter(p => !p._id?.startsWith('local-'));

        // 从localStorage获取
        const savedPosts = localStorage.getItem('forumPosts');
        let localPosts = [];
        if (savedPosts) {
            try {
                localPosts = JSON.parse(savedPosts);
            } catch (e) {
                console.error('Failed to parse saved posts');
            }
        }

        // 合并并去重
        const allPosts = [...localPosts];
        posts.forEach(p => {
            if (!allPosts.find(ap => ap._id === p._id)) {
                allPosts.push(p);
            }
        });

        return allPosts;
    };

    // 组件挂载时请求一次帖子列表
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await getPosts();
                setPosts(res.data.posts || []);
            } catch (error) {
                console.error('Failed to fetch posts from API');
            }

            // 同时加载本地存储的帖子
            const savedPosts = localStorage.getItem('forumPosts');
            if (savedPosts) {
                try {
                    const localPosts = JSON.parse(savedPosts);
                    setPosts(prev => {
                        const apiPosts = prev;
                        const allPosts = [...localPosts];
                        apiPosts.forEach(p => {
                            if (!allPosts.find(ap => ap._id === p._id)) {
                                allPosts.push(p);
                            }
                        });
                        return allPosts;
                    });
                } catch (e) {
                    console.error('Failed to parse saved posts');
                }
            }

            setLoading(false);
        };
        fetchPosts();
    }, []);

    // 根据分类筛选帖子
    const filteredPosts = currentCategory
        ? posts.filter(post => post.category === currentCategory)
        : posts;

    // 加载动画
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

    // 获取当前分类名称
    const getCategoryName = () => {
        if (!currentCategory) return '全部作品';
        const cat = categories.find(c => c.slug === currentCategory);
        return cat ? `${cat.emoji} ${cat.name}` : '全部作品';
    };

    return (
        <div className="forum-container">
            <div className="forum-header">
                <h1 className="forum-title">📷 {getCategoryName()}</h1>
                <Link to="/create" className="btn-primary">发布作品</Link>
            </div>

            {/* 分类筛选标签 */}
            <div className="forum-category-bar">
                <Link
                    to="/forum"
                    className={`forum-category-tab ${!currentCategory ? 'active' : ''}`}
                >
                    全部
                </Link>
                {categories.map(cat => (
                    <Link
                        key={cat.slug}
                        to={`/forum?category=${cat.slug}`}
                        className={`forum-category-tab ${currentCategory === cat.slug ? 'active' : ''}`}
                    >
                        {cat.emoji} {cat.name}
                    </Link>
                ))}
            </div>

            {/* 作品网格 */}
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
                        <div key={post._id} className="post-card">
                            <Link to={`/post/${post._id}`}>
                                {/* 显示媒体预览 */}
                                {post.media && post.media.length > 0 && (
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
                                )}
                                <h3 className="post-title">{post.title}</h3>
                            </Link>
                            <p className="post-content">{post.content}</p>
                            <div className="post-meta">
                                <div className="post-author">
                                    <img
                                        src={post.author?.avatar || `https://ui-avatars.com/api/?name=${post.author?.username || 'U'}&background=random&color=fff`}
                                        alt={post.author?.username}
                                        className="author-avatar"
                                    />
                                    <span>{post.author?.username || '匿名用户'}</span>
                                </div>
                                <div className="post-stats">
                                    <span>👁 {post.viewCount || 0}</span>
                                    <span>❤️ {post.likeCount || 0}</span>
                                    <span>💬 {post.commentCount || 0}</span>
                                </div>
                            </div>
                            <div className="post-tags">
                                {post.category && (
                                    <span className="post-category">
                                        {categories.find(c => c.slug === post.category)?.emoji} {categories.find(c => c.slug === post.category)?.name}
                                    </span>
                                )}
                                {post.tags?.map((tag) => (
                                    <span key={tag} className="post-tag">#{tag}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
