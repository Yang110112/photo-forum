import { useState, useEffect } from 'react';
import { createPost } from '../api/posts';
import { getCategories } from '../api/categories';
import { useNavigate } from 'react-router-dom';
import '../css/CreatePost.css';

export default function CreatePost() {
  const [form, setForm] = useState({ title: '', content: '', category: '', tags: '' });
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getCategories().then(res => setCategories(res.data.data.categories || []));
  }, []);

  const submit = async () => {
    if (!form.category) {
      alert('请选择分类');
      return;
    }
    try {
      const payload = {
        title: form.title,
        content: form.content,
        category: form.category,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };
      await createPost(payload);
      navigate('/forum');
    } catch (err) {
      alert(err.response?.data?.errors?.[0]?.message || err.response?.data?.message || '发布失败，请重试');
    }
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
        <select
            className="create-post-input"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          <option value="">请选择分类</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
        <input
            className="create-post-input"
            placeholder="标签（逗号分隔，如：风光,日出）"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
        />
        <textarea
            className="create-post-textarea"
            placeholder="内容介绍（至少10个字符）"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
        />
        <button onClick={submit} className="create-post-button">
          发布帖子
        </button>
      </div>
  );
}
