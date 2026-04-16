import { useState } from 'react';
import { createPost } from '../api/posts';
import { useNavigate } from 'react-router-dom';

export default function CreatePost() {
  const [form, setForm] = useState({ title: '', content: '' });
  const navigate = useNavigate();

  const submit = async () => {
    await createPost(form);
    navigate('/');
  };

  return (
      <div className="max-w-2xl mx-auto mt-10 p-6 shadow rounded">
        <h2 className="text-xl font-bold mb-4">发布摄影作品</h2>
        <input
            className="w-full border p-2 mb-2 rounded"
            placeholder="标题"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <textarea
            className="w-full border p-2 mb-4 rounded h-40"
            placeholder="内容介绍"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
        />
        <button onClick={submit} className="bg-blue-600 text-white px-4 py-2 rounded">
          发布帖子
        </button>
      </div>
  );
}