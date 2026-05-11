import { useState } from 'react';
import { register } from '../api/auth';
import { useNavigate, Link } from 'react-router-dom';
import { message } from 'antd';
import '../css/Register.css';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      message.success('注册成功，请登录');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.errors?.[0]?.message || err.response?.data?.message || '注册失败';
      message.error(msg);
    }
  };

  return (
    <div className="register-container">
      <h1 className="register-title">注册</h1>
      <form onSubmit={handleSubmit} className="register-form">
        <input
          type="text"
          placeholder="用户名"
          value={form.username}
          className="register-input"
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <input
          type="email"
          placeholder="邮箱"
          value={form.email}
          className="register-input"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="密码"
          value={form.password}
          className="register-input"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button type="submit" className="register-button">注册</button>
      </form>
      <p className="register-footer">
        已有账号？<Link to="/login" className="register-link">返回登录</Link>
      </p>
    </div>
  );
}
