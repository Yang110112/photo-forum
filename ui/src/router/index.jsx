// 路由配置
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from '../components/Layout';
import AuthLayout from '../components/AuthLayout';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Home from '../pages/Home';
import Forum from '../pages/Forum';
import PostDetail from '../pages/PostDetail';
import CreatePost from '../pages/CreatePost';
import Profile from '../pages/Profile';
import Messages from '../pages/Messages';
import MyPosts from '../pages/MyPosts';
import PhotographerCert from '../pages/PhotographerCert';
import BookingRequests from '../pages/BookingRequests';
import ComingSoon from '../pages/ComingSoon';

const ProtectedRoute = ({ children }) => {
    const { token } = useSelector(state => state.auth);
    return token ? children : <Navigate to="/login" replace />;
};

const routes = [
    {
        element: <ProtectedRoute><Layout /></ProtectedRoute>,
        children: [
            { path: '/', element: <Home /> },
            { path: '/forum', element: <Forum /> },
            { path: '/activity/:slug', element: <ComingSoon /> },
            { path: '/post/:id', element: <PostDetail /> },
            { path: '/create', element: <CreatePost /> },
            { path: '/profile', element: <Profile /> },
            { path: '/messages', element: <Messages /> },
            { path: '/my-posts', element: <MyPosts /> },
            // 摄影师认证页面
            { path: '/certification', element: <PhotographerCert /> },
            // 约拍管理页面
            { path: '/bookings', element: <BookingRequests /> },
            { path: '*', element: <Navigate to="/" replace /> },
        ]
    },
    {
        element: <AuthLayout />,
        children: [
            { path: '/login', element: <Login /> },
            { path: '/register', element: <Register /> },
        ]
    }
];

export default routes;
