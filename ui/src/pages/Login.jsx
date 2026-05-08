import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginUser } from '../store/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import '../css/Login.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const result = await dispatch(loginUser(form)).unwrap();
      if (result.token) {
        navigate('/');
      }
    } catch (err) {
      alert(err.message || '登录失败，请检查邮箱和密码');
    }
  };

  return (
      <div className="login-container">
        <h2 className="login-title">登录</h2>
        <input
            className="login-input"
            placeholder="邮箱"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
            className="login-input"
            type="password"
            placeholder="密码"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button
            onClick={handleLogin}
            className="login-button"
        >
          登录
        </button>
        <p className="login-footer">
          没有账号？<Link to="/register" className="login-link">前往注册</Link>
        </p>
      </div>
  );
}
