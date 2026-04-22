import { Link } from 'react-router-dom';
import '../css/Home.css';

export default function HomePage() {
    return (
        <div className="homepage-container">

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
                        { emoji: '🏔️', name: '风光摄影', desc: '山川大地，自然之美' },
                        { emoji: '👤', name: '人像摄影', desc: '捕捉人物神韵与情感' },
                        { emoji: '🏙️', name: '街头摄影', desc: '城市脉搏，生活瞬间' },
                        { emoji: '🐾', name: '动物摄影', desc: '自然界的生灵之美' },
                        { emoji: '🍽️', name: '美食摄影', desc: '色香味的视觉盛宴' },
                        { emoji: '🌌', name: '星空摄影', desc: '仰望宇宙，无限深邃' },
                    ].map((cat) => (
                        <Link to="/forum" className="category-card" key={cat.name}>
                            <span className="category-emoji">{cat.emoji}</span>
                            <h4>{cat.name}</h4>
                            <p>{cat.desc}</p>
                        </Link>
                    ))}
                </div>
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
