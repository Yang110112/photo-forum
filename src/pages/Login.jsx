import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginUser } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async () => {
    await dispatch(loginUser(form));
    navigate('/');
  };

  return (
      <div className="max-w-md mx-auto mt-20 p-6 shadow rounded">
        <h2 className="text-xl font-bold mb-4">登录</h2>
        <input
            className="w-full border p-2 mb-2 rounded"
            placeholder="邮箱"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
            className="w-full border p-2 mb-4 rounded"
            type="password"
            placeholder="密码"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button
            onClick={handleLogin}
            className="bg-blue-600 text-white w-full p-2 rounded"
        >
          登录
        </button>
      </div>
  );
}