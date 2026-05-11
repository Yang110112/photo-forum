import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import '../css/Header.css';

// 分类数据
const categories = [
  { slug: 'landscape', name: '风光摄影', emoji: '🏔️' },
  { slug: 'portrait', name: '人像摄影', emoji: '👤' },
  { slug: 'street', name: '街头摄影', emoji: '🏙️' },
  { slug: 'animal', name: '动物摄影', emoji: '🐾' },
  { slug: 'food', name: '美食摄影', emoji: '🍽️' },
  { slug: 'astrophotography', name: '星空摄影', emoji: '🌌' },
];

export default function Header() {
    const { user } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [showCategories, setShowCategories] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    // 获取当前选中的分类
    const getCurrentCategory = () => {
        const params = new URLSearchParams(location.search);
        return params.get('category');
    };

    const handleCategoryClick = (slug) => {
        setShowCategories(false);
        navigate(`/forum?category=${slug}`);
    };

    const currentCategory = getCurrentCategory();

    return (
        <header className="header">
            <div className="header-container">
                <Link to="/" className="logo">📷 摄影论坛</Link>

                <nav className="nav">
                    <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>首页</Link>
                    <Link to="/forum" className={`nav-link ${location.pathname === '/forum' && !currentCategory ? 'active' : ''}`}>论坛</Link>

                    {/* 分类下拉菜单 */}
                    <div
                        className="nav-dropdown"
                        onMouseEnter={() => setShowCategories(true)}
                        onMouseLeave={() => setShowCategories(false)}
                    >
                        <button className={`nav-link nav-dropdown-btn ${currentCategory ? 'active' : ''}`}>
                            📂 分类 {showCategories ? '▲' : '▼'}
                        </button>

                        {showCategories && (
                            <div className="dropdown-menu">
                                <div className="dropdown-header">摄影分类</div>
                                {categories.map(cat => (
                                    <div
                                        key={cat.slug}
                                        className={`dropdown-item ${currentCategory === cat.slug ? 'selected' : ''}`}
                                        onClick={() => handleCategoryClick(cat.slug)}
                                    >
                                        <span className="dropdown-emoji">{cat.emoji}</span>
                                        <span className="dropdown-name">{cat.name}</span>
                                        {currentCategory === cat.slug && <span className="check-mark">✓</span>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 移动端菜单按钮 */}
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                    >
                        {showMobileMenu ? '✕' : '☰'}
                    </button>
                </nav>

                <div className="nav-actions">
                    {!user ? (
                        <>
                            <Link to="/login" className="nav-link">登录</Link>
                            <Link to="/register" className="nav-link register-link">注册</Link>
                        </>
                    ) : (
                        <>
                            <Link to="/create" className="nav-link create-btn">📷 发布作品</Link>
                            <Link to="/messages" className="nav-link messages-btn">💬 私信</Link>
                            <img
                                src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
                                alt={user.username}
                                className="nav-avatar"
                                onClick={() => navigate('/profile')}
                                title={user.username}
                                onError={(e) => {
                                    e.target.src = `https://ui-avatars.com/api/?name=${user.username}&background=3b82f6&color=fff`;
                                }}
                            />
                            <button onClick={handleLogout} className="logout-btn">退出</button>
                        </>
                    )}
                </div>
            </div>

            {/* 移动端菜单内容 */}
            {showMobileMenu && (
                <div className="mobile-menu">
                    <Link to="/" className="mobile-menu-item" onClick={() => setShowMobileMenu(false)}>🏠 首页</Link>
                    <Link to="/forum" className="mobile-menu-item" onClick={() => setShowMobileMenu(false)}>📝 论坛</Link>

                    <div className="mobile-menu-section">📂 分类</div>
                    {categories.map(cat => (
                        <Link
                            key={cat.slug}
                            to={`/forum?category=${cat.slug}`}
                            className={`mobile-menu-item ${currentCategory === cat.slug ? 'active' : ''}`}
                            onClick={() => setShowMobileMenu(false)}
                        >
                            <span className="mobile-menu-emoji">{cat.emoji}</span>
                            {cat.name}
                        </Link>
                    ))}

                    {user && (
                        <>
                            <div className="mobile-menu-divider"></div>
                            <Link to="/create" className="mobile-menu-item" onClick={() => setShowMobileMenu(false)}>📷 发布作品</Link>
                            <Link to="/certification" className="mobile-menu-item" onClick={() => setShowMobileMenu(false)}>✅ 摄影师认证</Link>
                            <Link to="/bookings" className="mobile-menu-item" onClick={() => setShowMobileMenu(false)}>📅 约拍管理</Link>
                            <Link to="/messages" className="mobile-menu-item" onClick={() => setShowMobileMenu(false)}>💬 私信</Link>
                            <Link to="/profile" className="mobile-menu-item" onClick={() => setShowMobileMenu(false)}>👤 个人中心</Link>
                        </>
                    )}
                </div>
            )}

            {/* 分类标签栏 - 显示在论坛页面 */}
            {location.pathname === '/forum' && (
                <div className="category-tabs">
                    <Link
                        to="/forum"
                        className={`category-tab ${!currentCategory ? 'active' : ''}`}
                    >
                        全部作品
                    </Link>
                    {categories.map(cat => (
                        <Link
                            key={cat.slug}
                            to={`/forum?category=${cat.slug}`}
                            className={`category-tab ${currentCategory === cat.slug ? 'active' : ''}`}
                        >
                            {cat.emoji} {cat.name}
                        </Link>
                    ))}
                </div>
            )}
        </header>
    );
}
