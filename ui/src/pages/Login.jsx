import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginUser } from '../store/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { message } from 'antd';
import '../css/Login.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      message.warning('请填写邮箱和密码');
      return;
    }
    setLoading(true);
    try {
      const result = await dispatch(loginUser(form)).unwrap();
      if (result.token) {
        message.success('登录成功');
        navigate('/');
      }
    } catch (err) {
      const msg = err.response?.data?.message || '登录失败，邮箱或密码错误';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">🍊</div>
        </div>
        <h1 className="login-title">欢迎回来</h1>
        <p className="login-subtitle">请登录您的账号继续</p>

        <div className="login-field">
          <label className="login-label">邮箱地址</label>
          <div className="login-input-wrap">
            <span className="login-input-icon">✉️</span>
            <input
              className="login-input"
              placeholder="请输入邮箱"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        <div className="login-field">
          <label className="login-label">密码</label>
          <div className="login-input-wrap">
            <span className="login-input-icon">🔒</span>
            <input
              className="login-input"
              type="password"
              placeholder="请输入密码"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        <button
          onClick={handleLogin}
          className="login-button"
          disabled={loading}
        >
          {loading ? '登录中...' : '登 录'}
        </button>

        <p className="login-footer">
          还没有账号？<Link to="/register" className="login-link">立即注册</Link>
        </p>
      </div>
    </div>
  );
}
