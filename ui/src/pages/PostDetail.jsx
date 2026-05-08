import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getPostById } from '../api/posts';
import { getCommentsByPost, createComment } from '../api/comments';
import '../css/PostDetail.css';

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useSelector(state => state.auth);

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [postRes, commentRes] = await Promise.all([
          getPostById(id),
          getCommentsByPost(id),
        ]);
        setPost(postRes.data.data.post);
        setComments(commentRes.data.comments || []);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  const handleComment = async () => {
    if (!commentText.trim()) return;
    try {
      const res = await createComment({ content: commentText, post: id });
      setComments(prev => [res.data.data.comment, ...prev]);
      setCommentText('');
    } catch {
      alert('评论失败，请重试');
    }
  };

  const avatarUrl = (username, avatar) => {
    if (avatar && !avatar.startsWith('/uploads')) return avatar;
    return `https://ui-avatars.com/api/?name=${username}&background=random&color=fff`;
  };

  if (loading) return <div className="pd-loading">加载中...</div>;
  if (!post) return <div className="pd-loading">帖子不存在</div>;

  return (
    <div className="pd-container">

      {/* 帖子主体 */}
      <div className="pd-card">
        <div className="pd-header">
          <button className="pd-back" onClick={() => navigate(-1)}>← 返回</button>
          <div className="pd-tags">
            <span className="pd-category">{post.category?.name}</span>
            {post.tags?.map(tag => <span key={tag} className="pd-tag">#{tag}</span>)}
          </div>
        </div>

        <h1 className="pd-title">{post.title}</h1>

        {/* 图片展示 */}
        {post.images && post.images.length > 0 && (
            <div className="pd-images">
                {post.images.map((img, index) => (
                    <img key={index} src={img} alt={`${post.title} - ${index + 1}`} className="pd-image" />
                ))}
            </div>
        )}

        <div className="pd-meta">
          <img
            className="pd-avatar"
            src={avatarUrl(post.author?.username, post.author?.avatar)}
            alt={post.author?.username}
          />
          <div>
            <span className="pd-author">{post.author?.username}</span>
            <span className="pd-date">{new Date(post.createdAt).toLocaleDateString('zh-CN')}</span>
          </div>
          <div className="pd-stats">
            <span>👁 {post.viewCount}</span>
            <span>❤️ {post.likeCount}</span>
            <span>💬 {post.commentCount}</span>
          </div>
        </div>

        <div
          className="pd-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>

      {/* 评论区 */}
      <div className="pd-comment-section">
        <h3 className="pd-comment-title">评论 ({comments.length})</h3>

        {token ? (
          <div className="pd-comment-input">
            <img
              className="pd-avatar"
              src={avatarUrl(user?.username, user?.avatar)}
              alt={user?.username}
            />
            <div className="pd-input-wrap">
              <textarea
                className="pd-textarea"
                placeholder="写下你的评论..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
              />
              <button className="pd-submit" onClick={handleComment}>发布评论</button>
            </div>
          </div>
        ) : (
          <p className="pd-login-tip">
            <span onClick={() => navigate('/login')} className="pd-login-link">登录</span> 后参与评论
          </p>
        )}

        <div className="pd-comments">
          {comments.length === 0 && <p className="pd-no-comment">暂无评论，来发表第一条吧</p>}
          {comments.map(c => (
            <div key={c._id} className="pd-comment-item">
              <img
                className="pd-avatar"
                src={avatarUrl(c.author?.username, c.author?.avatar)}
                alt={c.author?.username}
              />
              <div className="pd-comment-body">
                <div className="pd-comment-top">
                  <span className="pd-comment-author">{c.author?.username}</span>
                  <span className="pd-comment-date">{new Date(c.createdAt).toLocaleDateString('zh-CN')}</span>
                </div>
                <p className="pd-comment-content">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
