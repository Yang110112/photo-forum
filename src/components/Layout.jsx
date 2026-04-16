import { Link, useNavigate, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';

export default function Layout() {
    const { user } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 头部导航栏 */}
            <header className="bg-white shadow-md sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <Link to="/" className="text-2xl font-bold text-blue-600">摄影论坛</Link>
                    <nav className="flex items-center gap-6">
                        <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors">首页</Link>
                        {user ? (
                            <>
                                <Link to="/create" className="text-gray-700 hover:text-blue-600 transition-colors">发布作品</Link>
                                <Link to="/profile" className="text-gray-700 hover:text-blue-600 transition-colors">个人中心</Link>
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                >
                                    退出登录
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-700 hover:text-blue-600 transition-colors">登录</Link>
                                <Link to="/register" className="text-gray-700 hover:text-blue-600 transition-colors">注册</Link>
                            </>
                        )}
                    </nav>
                </div>
            </header>

            {/* 页面内容区 */}
            <main className="container mx-auto px-4 py-8">
                <Outlet />
            </main>

            {/* 页脚 */}
            <footer className="bg-gray-800 text-white py-6 mt-12">
                <div className="container mx-auto px-4 text-center">
                    <p>© 2025 摄影论坛 版权所有</p>
                </div>
            </footer>
        </div>
    );
}