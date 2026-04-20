import { Link } from 'react-router-dom';
import '../css/Home.css';

export default function HomePage() {
    return (
        <div className="homepage-container">
            <header className="homepage-header">
                <h1 className="homepage-title">摄影论坛</h1>
                <p className="homepage-subtitle">
                    分享你的摄影作品，结识更多摄影爱好者，发现世界的美好瞬间。
                </p>
                <div className="homepage-buttons">
                    <Link to="/forum" className="btn-primary">进入论坛</Link>
                    <Link to="/create" className="btn-secondary">发布作品</Link>
                </div>
            </header>

            <section className="homepage-features">
                <div className="feature-card">
                    <h3>发现</h3>
                    <p>浏览社区中的精彩摄影作品，获取灵感与创意。</p>
                </div>
                <div className="feature-card">
                    <h3>分享</h3>
                    <p>上传你的摄影作品，与大家交流你的拍摄技巧和故事。</p>
                </div>
                <div className="feature-card">
                    <h3>交流</h3>
                    <p>参与话题讨论，关注摄影爱好者，结识更多朋友。</p>
                </div>
            </section>
        </div>
    );
}