import { useState } from 'react';
import { register } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import '../css/Register.css';

export default function Register() {
  const [form, setForm] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      alert('注册成功，去登录');
      navigate('/login');
    } catch (err) {
      alert('注册失败');
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
        {/* 密码 */}  
        <input
          type="password"
          placeholder="密码"
          value={form.password}
          className="register-input"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button type="submit" className="register-button">注册</button>
      </form>
    </div>
  );
}