import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { message, Modal } from 'antd';
import { getPosts, deletePost } from '../api/posts';
import '../css/MyPosts.css';

const emojiMap = {
    landscape: '🏔️',
    portrait: '👤',
    street: '🏙️',
    wildlife: '🐾',
    food: '🍽️',
    astrophoto: '🌌',
    gear: '⚙️',
    editing: '🖥️',
};

export default function MyPosts() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(null);
    const { user } = useSelector(state => state.auth);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchMyPosts();
    }, [user]);

    const fetchMyPosts = async () => {
        try {
            const res = await getPosts({ author: user.id || user._id, limit: 50 });
            setPosts(res.data.posts || []);
        } catch (err) {
            message.error('加载失败');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setDeleting(id);
        try {
            await deletePost(id);
            setPosts(posts.filter(p => p._id !== id));
            message.success('删除成功');
        } catch (err) {
            message.error('删除失败');
        } finally {
            setDeleting(null);
        }
    };

    const confirmDelete = (e, id) => {
        e.stopPropagation();
        Modal.confirm({
            title: '确认删除',
            content: '删除后无法恢复，确定要删除这篇作品吗？',
            okText: '确认删除',
            cancelText: '取消',
            okButtonProps: { danger: true },
            onOk: () => handleDelete(id),
        });
    };

    if (loading) return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '60vh', flexDirection: 'column', gap: '16px'
        }}>
            <div style={{
                width: '48px', height: '48px',
                border: '4px solid #fde8d8', borderTop: '4px solid #f97316',
                borderRadius: '50%', animation: 'spin 0.8s linear infinite'
            }} />
            <p style={{ color: '#f97316', fontWeight: 600 }}>加载中...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <div className="myposts-container">
            <div className="myposts-header">
                <h2 className="myposts-title">我的作品</h2>
            </div>

            {posts.length === 0 ? (
                <div className="myposts-empty">
                    <div className="empty-icon">📷</div>
                    <h3>还没有发布作品</h3>
                    <p>快去发布你的第一个摄影作品吧！</p>
                    <Link to="/create" className="myposts-create-btn">发布作品</Link>
                </div>
            ) : (
                <div className="myposts-grid">
                    {posts.map(post => (
                        <div
                            key={post._id}
                            className="mypost-card"
                            onClick={() => navigate(`/post/${post._id}`)}
                            style={{ cursor: 'pointer' }}
                        >
                            {/* 封面图 */}
                            {post.images && post.images.length > 0 && (
                                <div onClick={(e) => e.stopPropagation()}>
                                    <Link to={`/post/${post._id}`}>
                                        {post.images[0].startsWith('data:video') ? (
                                            <video
                                                src={post.images[0]}
                                                className="mypost-cover"
                                                muted
                                                onMouseEnter={(e) => e.target.play()}
                                                onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; }}
                                            />
                                        ) : (
                                            <img src={post.images[0]} alt={post.title} className="mypost-cover" />
                                        )}
                                    </Link>
                                </div>
                            )}

                            <div className="mypost-body">
                                <h3 className="mypost-title">{post.title}</h3>
                                <p className="mypost-content">{post.content}</p>

                                <div className="mypost-meta">
                                    <div className="mypost-stats">
                                        <span>👁 {post.viewCount || 0}</span>
                                        <span>❤️ {post.likeCount || 0}</span>
                                        <span>💬 {post.commentCount || 0}</span>
                                    </div>
                                    <span className="mypost-category">
                                        {emojiMap[post.category?.slug] || '📷'} {post.category?.name || ''}
                                    </span>
                                </div>

                                <div className="mypost-actions">
                                    <button
                                        className="btn-delete"
                                        onClick={(e) => confirmDelete(e, post._id)}
                                        disabled={deleting === post._id}
                                    >
                                        {deleting === post._id ? '删除中...' : '删除'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}