import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DailyHighlightModal from '../components/DailyHighlightModal';
import { getPosts } from '../api/posts';
import { useSelector } from 'react-redux';
import '../css/Home.css';

export default function HomePage() {
    const [showHighlight, setShowHighlight] = useState(false);
    const [highlightPost, setHighlightPost] = useState(null);
    const [hotPosts, setHotPosts] = useState([]);
    const navigate = useNavigate();
    const { user } = useSelector(state => state.auth);

    useEffect(() => {
        // 获取热门作品
        getPosts({ sortBy: 'likeCount', order: 'desc', limit: 3 })
            .then(res => {
                const posts = res.data.posts || [];
                setHotPosts(posts);

                // 每日热门弹窗
                const today = new Date().toDateString();
                const lastShown = localStorage.getItem(`highlightShownDate_${user?._id}`);
                if (lastShown !== today && posts.length > 0) {
                    setHighlightPost(posts[0]);
                    setTimeout(() => setShowHighlight(true), 500);
                }
            })
            .catch(() => {});
    }, []);

    const handleCloseHighlight = () => {
        setShowHighlight(false);
        localStorage.setItem(`highlightShownDate_${user?._id}`, new Date().toDateString());
    };

    return (
        <div className="homepage-container">
            {/* 每日热门弹窗 */}
            <DailyHighlightModal
                isOpen={showHighlight}
                onClose={handleCloseHighlight}
                highlightPost={highlightPost}
            />

            {/* Hero */}
            <header className="homepage-header">
                <div className="hero-bg">
                    <div className="hero-orb orb1" />
                    <div className="hero-orb orb2" />
                    <div className="hero-orb orb3" />
                </div>
                <div className="hero-content">
                    <span className="hero-badge">📷 摄影师社区</span>
                    <h1 className="homepage-title">用镜头<br />记录世界</h1>
                    <p className="homepage-subtitle">
                        分享你的摄影作品，结识更多摄影爱好者，<br />在这里发现世界每一个美好瞬间。
                    </p>
                    <div className="homepage-buttons">
                        <Link to="/forum" className="btn-primary">进入论坛</Link>
                        <Link to="/create" className="btn-secondary">发布作品</Link>
                    </div>
                </div>
            </header>

            {/* Features */}
            <section className="homepage-features">
                <div className="feature-card">
                    <div className="feature-icon">🔭</div>
                    <h3>发现</h3>
                    <p>浏览社区中的精彩摄影作品，获取灵感与创意，拓展你的视觉边界。</p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon">🖼️</div>
                    <h3>分享</h3>
                    <p>上传你的摄影作品，与大家交流你的拍摄技巧和背后的故事。</p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon">💬</div>
                    <h3>交流</h3>
                    <p>参与话题讨论，关注摄影爱好者，结识志同道合的朋友。</p>
                </div>
            </section>

            {/* 摄影分类 */}
            <section className="homepage-section">
                <div className="section-header">
                    <h2 className="section-title">探索摄影分类</h2>
                    <p className="section-sub">找到你最热爱的摄影风格</p>
                </div>
                <div className="category-grid">
                    {[
                        { emoji: '🏔️', name: '风光摄影', desc: '山川大地，自然之美', slug: 'landscape' },
                        { emoji: '👤', name: '人像摄影', desc: '捕捉人物神韵与情感', slug: 'portrait' },
                        { emoji: '🏙️', name: '街头摄影', desc: '城市脉搏，生活瞬间', slug: 'street' },
                        { emoji: '🐾', name: '动物摄影', desc: '自然界的生灵之美', slug: 'animal' },
                        { emoji: '🍽️', name: '美食摄影', desc: '色香味的视觉盛宴', slug: 'food' },
                        { emoji: '🌌', name: '星空摄影', desc: '仰望宇宙，无限深邃', slug: 'astrophotography' },
                    ].map((cat) => (
                        <Link to={`/forum?category=${cat.slug}`} className="category-card" key={cat.name}>
                            <span className="category-emoji">{cat.emoji}</span>
                            <h4>{cat.name}</h4>
                            <p>{cat.desc}</p>
                        </Link>
                    ))}
                </div>
            </section>

            {/* 热门作品展示 */}
            <section className="homepage-section">
                <div className="section-header">
                    <h2 className="section-title">🔥 热门作品</h2>
                    <p className="section-sub">今日最受关注的摄影作品</p>
                </div>
                {hotPosts.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#a8a29e' }}>暂无热门作品</p>
                ) : (
                    <div className="highlights-grid">
                        {hotPosts.map((post, index) => (
                            <div
                                key={post._id}
                                className="highlight-card"
                                onClick={() => navigate(`/post/${post._id}`)}
                                style={{ cursor: 'pointer' }}
                            >
                                {index === 0 && <span className="highlight-badge">🏆 第1名</span>}
                                {index === 1 && <span className="highlight-badge silver">🥈 第2名</span>}
                                {index === 2 && <span className="highlight-badge bronze">🥉 第3名</span>}
                                <div className="highlight-content">
                                    <h4>{post.title}</h4>
                                    <p>{post.content}</p>
                                    <div className="highlight-meta">
                                        <span>❤️ {post.likeCount || 0}</span>
                                        <span>💬 {post.commentCount || 0}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* 加入社区 CTA */}
            <section className="homepage-cta">
                <div className="cta-bg">
                    <div className="cta-orb" />
                </div>
                <div className="cta-content">
                    <h2>准备好了吗？</h2>
                    <p>加入我们，与数万名摄影爱好者一起，用镜头记录世界的美好。</p>
                    <div className="cta-buttons">
                        <Link to="/register" className="btn-primary">立即注册</Link>
                        <Link to="/forum" className="btn-outline">先逛逛</Link>
                    </div>
                </div>
            </section>

            {/* 使用步骤 */}
            <section className="homepage-section steps-section">
                <div className="section-header">
                    <h2 className="section-title">三步开始你的摄影之旅</h2>
                </div>
                <div className="steps-grid">
                    <div className="step-card">
                        <div className="step-num">01</div>
                        <h4>注册账号</h4>
                        <p>免费注册，快速完成，立刻融入摄影社区。</p>
                    </div>
                    <div className="step-arrow">→</div>
                    <div className="step-card">
                        <div className="step-num">02</div>
                        <h4>上传作品</h4>
                        <p>发布你的摄影作品，添加描述与标签，让更多人看见。</p>
                    </div>
                    <div className="step-arrow">→</div>
                    <div className="step-card">
                        <div className="step-num">03</div>
                        <h4>互动交流</h4>
                        <p>评论、点赞、收藏，与摄影爱好者共同成长。</p>
                    </div>
                </div>
            </section>

        </div>
    );
}