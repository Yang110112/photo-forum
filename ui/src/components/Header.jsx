import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import '../css/Header.css';

export default function Header() {
    const { user } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <header className="header">
            <div className="header-container">
                <Link to="/" className="logo">摄影论坛</Link>
                <nav className="nav">
                    <Link to="/" className="nav-link">首页</Link>
                    {user ? (
                        <>
                            <Link to="/create" className="nav-link">发布作品</Link>
                            <Link to="/profile" className="nav-link">个人中心</Link>
                            <button onClick={handleLogout} className="btn-logout">
                                退出登录
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/forum" className="nav-link">论坛</Link>
                            <Link to="/login" className="nav-link">登录</Link>
                            <Link to="/register" className="nav-link">注册</Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}