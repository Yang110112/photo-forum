import { useState } from 'react';
import { createPost } from '../api/posts';
import { useNavigate } from 'react-router-dom';
import '../css/CreatePost.css';

export default function CreatePost() {
  const [form, setForm] = useState({ title: '', content: '' });
  const navigate = useNavigate();

  const submit = async () => {
    await createPost(form);
    navigate('/');
  };

  return (
      <div className="create-post-container">
        <h2 className="create-post-title">发布摄影作品</h2>
        <input
            className="create-post-input"
            placeholder="标题"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <textarea
            className="create-post-textarea"
            placeholder="内容介绍"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
        />
        <button onClick={submit} className="create-post-button">
          发布帖子
        </button>
      </div>
  );
}