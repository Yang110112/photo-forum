import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from '../components/Layout';
import AuthLayout from '../components/AuthLayout';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Home from '../pages/Home';
import Forum from '../pages/Forum';

const PostDetail = lazy(() => import('../pages/PostDetail'));
const CreatePost = lazy(() => import('../pages/CreatePost'));
const Profile = lazy(() => import('../pages/Profile'));

const ProtectedRoute = ({ children }) => {
    const { token } = useSelector(state => state.auth);
    return token ? children : <Navigate to="/login" replace />;
};

const routes = [
    {
        element: <Layout />,
        children: [
            { path: '/', element: <Home /> },
            { path: '/forum', element: <Forum /> },
            { path: '/post/:id', element: <PostDetail /> },
            { path: '/create', element: <ProtectedRoute><CreatePost /></ProtectedRoute> },
            { path: '/profile', element: <ProtectedRoute><Profile /></ProtectedRoute> },
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