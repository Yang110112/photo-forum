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
      setPost(res.data.data);
    };
    fetchDetail();
  }, [id]);

  if (!post) return <div>加载中...</div>;

  return (
  <div>
    <h1>{post.title}</h1>

    <div>
      <img src={post.author?.avatar} alt={post.author?.username} />
      <span>{post.author?.username}</span>
    </div>

    <div>
      <span>{post.viewCount} 浏览</span>
      <span>{post.likeCount} 点赞</span>
      <span>{post.commentCount} 评论</span>
    </div>

    <p>{post.content}</p>

    <div>
      <span>{post.category?.name}</span>
      {post.tags?.map(tag => (
        <span key={tag}>#{tag}</span>
      ))}
    </div>
  </div>
);
}