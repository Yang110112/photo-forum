import { useState } from 'react';
import { register } from '../api/auth';
import { useNavigate } from 'react-router-dom';

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
    <div>
      <h1>注册</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="用户名"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <input
          type="password"
          placeholder="密码"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button type="submit">注册</button>
      </form>
    </div>
  );
}