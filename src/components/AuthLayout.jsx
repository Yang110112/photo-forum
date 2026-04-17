import { Outlet } from 'react-router-dom';
import Header from './Header';

export default function AuthLayout() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <Outlet />
        </div>
    );
}