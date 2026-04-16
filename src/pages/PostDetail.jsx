import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// ✅ 正确的名字（和 posts.js 里导出的一致）
import { getPostById } from '../api/posts';

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      const res = await getPostById(id);
      setPost(res);
    };
    fetchDetail();
  }, [id]);

  if (!post) return <div>加载中...</div>;

  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </div>
  );
}