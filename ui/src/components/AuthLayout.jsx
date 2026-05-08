import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function AuthLayout() {
    const { token } = useSelector(state => state.auth);

    // 已登录用户访问登录/注册页时，直接跳转首页
    if (token) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="auth-page">
            <Outlet />
        </div>
    );
}
