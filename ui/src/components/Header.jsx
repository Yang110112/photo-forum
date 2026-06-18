import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import { getUnreadCount } from '../api/messages';
import { getPendingRequests } from '../api/friends';
import { io } from 'socket.io-client';
import '../css/Header.css';

// 分类数据
const activities = [
  { slug: 'weekly-challenge', name: '每周挑战', emoji: '🏆', status: '进行中' },
  { slug: 'theme-contest', name: '主题摄影赛', emoji: '📸', status: '进行中' },
  { slug: 'beginner-event', name: '新手专场', emoji: '🌱', status: '即将开始' },
  { slug: 'season-contest', name: '季度大赛', emoji: '🎖️', status: '即将开始' },
  { slug: 'past-events', name: '往期活动', emoji: '📅', status: '已结束' },
];

export default function Header() {
    const { user } = useSelector(state => state.auth);
    const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [showCategories, setShowCategories] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [unreadMsgCount, setUnreadMsgCount] = useState(0);
    const [pendingFriendCount, setPendingFriendCount] = useState(0);
    const socketRef = useRef(null);
    const hideTimer = useRef(null);
    // 初始加载未读数 + WebSocket 实时更新
    useEffect(() => {
        if (!user) return;

        const fetchCounts = async () => {
            try {
                const [msgRes, friendRes] = await Promise.all([
                    getUnreadCount().catch(() => ({ data: { data: { totalUnread: 0 } } })),
                    getPendingRequests().catch(() => ({ data: { data: { requests: [] } } }))
                ]);
                setUnreadMsgCount(msgRes.data.data.totalUnread || 0);
                setPendingFriendCount(friendRes.data.data.requests?.length || 0);
            } catch (err) {
                // 静默处理
            }
        };
        fetchCounts();

        // ★ 通过 WebSocket 实时监听新消息更新未读数（替代30秒轮询）★
        const token = localStorage.getItem('token');
        if (token) {
            const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000', {
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000
            });
            socketRef.current = socket;

            socket.on('connect', () => {
                socket.emit('auth', { token });
            });

            // ★ 收到新消息时实时更新未读数 ★
            socket.on('new-message', () => {
                setUnreadMsgCount(prev => prev + 1);
                fetchCounts(); // 同步最新数据
            });

            // ★ 收到已读回执时刷新未读数 ★
            socket.on('message-read', () => {
                fetchCounts();
            });

            // ★ 收到会话更新时刷新未读数 ★
            socket.on('conversation-update', () => {
                fetchCounts();
            });

            return () => {
                socket.disconnect();
            };
        }
    }, [user]);

    const totalNotifications = unreadMsgCount + pendingFriendCount;

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

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
                <Link to="/" className="logo">摄影论坛</Link>

                <nav className="nav">
                    <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>首页</Link>
                    <Link to="/forum" className={`nav-link ${location.pathname === '/forum' && !currentCategory ? 'active' : ''}`}>论坛</Link>

                    {/* 活动下拉菜单 */}
                    <div
                        className="nav-dropdown"
                        onMouseEnter={() => {
                            clearTimeout(hideTimer.current);
                            setShowCategories(true);
                        }}
                        onMouseLeave={() => {
                            hideTimer.current = setTimeout(() => setShowCategories(false), 100);
                        }}
                    >
                        <button className={`nav-link nav-dropdown-btn ${location.pathname.startsWith('/activity') ? 'active' : ''}`}>
                        
                            活动 {showCategories ? '▲' : '▼'}
                        </button>

                        {showCategories && (
                            <div className="dropdown-menu"
                                onMouseEnter={() => clearTimeout(hideTimer.current)}
                                onMouseLeave={() => {
                                    hideTimer.current = setTimeout(() => setShowCategories(false), 100);
                                }}
                            >
                                <div className="dropdown-header">摄影活动</div>
                                {activities.map(act => (
                                    <div
                                        key={act.slug}
                                        className="dropdown-item"
                                        onClick={() => {
                                            setShowCategories(false);
                                            navigate(`/activity/${act.slug}`);
                                        }}
                                    >
                                        <span className="dropdown-emoji">{act.emoji}</span>
                                        <span className="dropdown-name">{act.name}</span>
                                        <span className={`activity-status ${act.status === '进行中' ? 'status-active' : act.status === '即将开始' ? 'status-soon' : 'status-ended'}`}>
                                            {act.status}
                                        </span>
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
                    {user && (
                        <>
                            <Link to="/messages" className={`nav-link msg-link ${location.pathname === '/messages' ? 'active' : ''}`}>
                                消息
                                {totalNotifications > 0 && <span className="header-notif-badge">{totalNotifications}</span>}
                            </Link>
                            <Link to="/create" className="nav-link create-btn">发布作品</Link>
                            <div className="nav-avatar-wrap"
                                onMouseEnter={() => setShowUserMenu(true)}
                                onMouseLeave={() => setShowUserMenu(false)}
                            >
                                <img
                                    src={user.avatar 
                                    ? `${BASE_URL}${user.avatar}` 
                                    : `https://ui-avatars.com/api/?name=${user.username}&background=f97316&color=fff&size=36`
                                }
                                    alt={user.username}
                                    className="nav-avatar"
                                    onError={(e) => {
                                        e.target.src = `https://ui-avatars.com/api/?name=${user.username}&background=f97316&color=fff&size=36`;
                                    }}
                                />
                                {showUserMenu && (
                                    <div className="user-dropdown">
                                        <Link to="/profile" className="user-dropdown-item">个人中心</Link>
                                        <Link to="/my-posts" className="user-dropdown-item">我的作品</Link>
                                        <Link to="/certification" className="user-dropdown-item">摄影师认证</Link>
                                        <Link to="/bookings" className="user-dropdown-item">我的约拍</Link>
                                        <div className="user-dropdown-divider" />
                                        <button className="user-dropdown-item user-dropdown-logout" onClick={handleLogout}>退出登录</button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* 移动端菜单内容 */}
            {showMobileMenu && (
                <div className="mobile-menu">
                    <Link to="/" className="mobile-menu-item" onClick={() => setShowMobileMenu(false)}>首页</Link>
                    <Link to="/forum" className="mobile-menu-item" onClick={() => setShowMobileMenu(false)}>论坛</Link>

                    <div className="mobile-menu-section">活动</div>
                    {activities.map(act => (
                        <Link
                            key={act.slug}
                            to={`/activity/${act.slug}`}
                            className="mobile-menu-item"
                            onClick={() => setShowMobileMenu(false)}
                        >
                            <span className="mobile-menu-emoji">{act.emoji}</span>
                            {act.name}
                            <span className={`activity-status ${act.status === '进行中' ? 'status-active' : act.status === '即将开始' ? 'status-soon' : 'status-ended'}`}>
                                {act.status}
                            </span>
                        </Link>
                    ))}

                    {user && (
                        <>
                            <div className="mobile-menu-divider"></div>
                            <Link to="/create" className="mobile-menu-item" onClick={() => setShowMobileMenu(false)}>发布作品</Link>
                            <Link to="/messages" className="mobile-menu-item" onClick={() => setShowMobileMenu(false)}>
                                消息 {totalNotifications > 0 && `(${totalNotifications})`}
                            </Link>
                            <Link to="/profile" className="mobile-menu-item" onClick={() => setShowMobileMenu(false)}>个人中心</Link>
                        </>
                    )}
                </div>
            )}
        </header>
    );
}