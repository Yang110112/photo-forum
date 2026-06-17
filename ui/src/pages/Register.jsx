import { useState } from 'react';
import { register } from '../api/auth';
import { useNavigate, Link } from 'react-router-dom';
import { message } from 'antd';
import '../css/Register.css';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      message.success('注册成功，请登录');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.errors?.[0]?.message || err.response?.data?.message || '注册失败';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
      <div className="register-logo">
        <span>🍊</span>
      </div>
      <h1 className="register-title">创建账号</h1>
      <p className="register-subtitle">加入我们，开始您的旅程</p>

      <form onSubmit={handleSubmit} className="register-form">
        <div className="register-field">
          <span className="register-field-icon">👤</span>
          <input
            type="text"
            placeholder="用户名"
            value={form.username}
            className="register-input"
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
        </div>
        <div className="register-field">
          <span className="register-field-icon">✉️</span>
          <input
            type="email"
            placeholder="邮箱地址"
            value={form.email}
            className="register-input"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="register-field">
          <span className="register-field-icon">🔒</span>
          <input
            type="password"
            placeholder="设置密码"
            value={form.password}
            className="register-input"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <button type="submit" className={`register-button${loading ? ' loading' : ''}`} disabled={loading}>
          {loading ? '注册中...' : '立即注册'}
        </button>
      </form>

      <p className="register-footer">
        已有账号？<Link to="/login" className="register-footer-link">返回登录</Link>
      </p>
      </div>
    </div>
  );
}
