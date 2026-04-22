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
                    <Link to="/forum" className="nav-link">论坛</Link>
                    {!user && (
                        <>
                            <Link to="/login" className="nav-link">登录</Link>
                        </>
                    )}
                    <Link to="/register" className="nav-link">注册</Link>
                    {user && (
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
                    )}
                </nav>
            </div>
        </header>
    );
}
