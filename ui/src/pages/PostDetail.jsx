import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getPostById } from '../api/posts';
import { getCommentsByPost, createComment } from '../api/comments';
import { message } from 'antd';
import '../css/PostDetail.css';

// 分类数据
const categories = [
  { slug: 'landscape', name: '风光摄影', emoji: '🏔️' },
  { slug: 'portrait', name: '人像摄影', emoji: '👤' },
  { slug: 'street', name: '街头摄影', emoji: '🏙️' },
  { slug: 'animal', name: '动物摄影', emoji: '🐾' },
  { slug: 'food', name: '美食摄影', emoji: '🍽️' },
  { slug: 'astrophotography', name: '星空摄影', emoji: '🌌' },
];

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useSelector(state => state.auth);

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [postRes, commentRes] = await Promise.all([
          getPostById(id),
          getCommentsByPost(id),
        ]);
        setPost(postRes.data.data.post);
        setComments(commentRes.data.comments || []);
        setLikeCount(postRes.data.data.post?.likeCount || 0);
      } catch (error) {
        console.log('API failed, loading from localStorage');

        // 从localStorage加载帖子
        const savedPosts = localStorage.getItem('forumPosts');
        if (savedPosts) {
          try {
            const posts = JSON.parse(savedPosts);
            const localPost = posts.find(p => p._id === id);
            if (localPost) {
              setPost(localPost);
              setLikeCount(localPost.likeCount || 0);
            }
          } catch (e) {
            console.error('Failed to parse saved posts');
          }
        }

        // 从localStorage加载评论
        const savedComments = localStorage.getItem(`comments_${id}`);
        if (savedComments) {
          try {
            setComments(JSON.parse(savedComments));
          } catch (e) {
            console.error('Failed to parse saved comments');
          }
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  // 保存评论到localStorage
  const saveComments = (newComments) => {
    localStorage.setItem(`comments_${id}`, JSON.stringify(newComments));
    setComments(newComments);

    // 更新帖子的评论数
    const savedPosts = localStorage.getItem('forumPosts');
    if (savedPosts) {
      try {
        const posts = JSON.parse(savedPosts);
        const updatedPosts = posts.map(p => {
          if (p._id === id) {
            return { ...p, commentCount: newComments.length };
          }
          return p;
        });
        localStorage.setItem('forumPosts', JSON.stringify(updatedPosts));
      } catch (e) {
        console.error('Failed to update post comment count');
      }
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    if (!user) {
      message.warning('请先登录后再评论');
      navigate('/login');
      return;
    }

    setSubmitting(true);

    try {
      const newComment = {
        _id: `comment-${Date.now()}`,
        content: commentText.trim(),
        author: {
          username: user.username,
          avatar: user.avatar || ''
        },
        createdAt: new Date().toISOString(),
        likeCount: 0
      };

      // 保存到API
      try {
        const res = await createComment({ content: commentText, post: id });
        saveComments([newComment, ...comments]);
      } catch (apiError) {
        // API失败，保存到localStorage
        console.log('Saving comment to localStorage');
        saveComments([newComment, ...comments]);
      }

      setCommentText('');
    } catch (error) {
      message.error('评论失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = () => {
    if (!user) {
      message.warning('请先登录后再点赞');
      navigate('/login');
      return;
    }

    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);

    // 保存点赞状态到localStorage
    const likes = JSON.parse(localStorage.getItem('userLikes') || '[]');
    if (liked) {
      const updatedLikes = likes.filter(l => l !== id);
      localStorage.setItem('userLikes', JSON.stringify(updatedLikes));
    } else {
      likes.push(id);
      localStorage.setItem('userLikes', JSON.stringify(likes));
    }
  };

  const handleCommentLike = (commentId) => {
    const updatedComments = comments.map(c => {
      if (c._id === commentId) {
        return { ...c, likeCount: (c.likeCount || 0) + 1 };
      }
      return c;
    });
    saveComments(updatedComments);
  };

  const avatarUrl = (username, avatar) => {
    if (avatar && !avatar.startsWith('/uploads')) return avatar;
    return `https://ui-avatars.com/api/?name=${username || 'U'}&background=random&color=fff`;
  };

  // 格式化时间
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    return date.toLocaleDateString('zh-CN');
  };

  // 获取分类信息
  const getCategoryInfo = (categorySlug) => {
    return categories.find(c => c.slug === categorySlug) || { name: categorySlug, emoji: '📷' };
  };

  if (loading) return (
    <div className="pd-loading">
      <div className="loading-spinner"></div>
      <p>加载中...</p>
    </div>
  );

  if (!post) return (
    <div className="pd-not-found">
      <h2>😢 作品不存在</h2>
      <p>该作品可能已被删除或不存在</p>
      <button onClick={() => navigate('/forum')}>返回论坛</button>
    </div>
  );

  const categoryInfo = getCategoryInfo(post.category);

  return (
    <div className="pd-container">
      {/* 帖子主体 */}
      <div className="pd-card">
        <div className="pd-header">
          <button className="pd-back" onClick={() => navigate(-1)}>
            ← 返回
          </button>
          <div className="pd-tags">
            <span className="pd-category">
              {categoryInfo.emoji} {categoryInfo.name}
            </span>
            {post.tags?.map(tag => (
              <span key={tag} className="pd-tag">#{tag}</span>
            ))}
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
          <div className="pd-author-info">
            <span className="pd-author">{post.author?.username || '匿名用户'}</span>
            <span className="pd-date">{formatTime(post.createdAt)}</span>
          </div>
        </div>

        {/* 媒体展示 */}
        {post.media && post.media.length > 0 && (
          <div className="pd-media-gallery">
            {post.media.map((media, index) => (
              media.type?.startsWith('video/') || /\.(mp4|webm|ogg|mov)$/i.test(media.url) ? (
                <video key={index} src={media.url} controls className="pd-media-item" />
              ) : (
                <img key={index} src={media.url} alt={`Media ${index + 1}`} className="pd-media-item" />
              )
            ))}
          </div>
        )}

        <div
          className="pd-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* 互动栏 */}
        <div className="pd-actions">
          <button
            className={`pd-action-btn ${liked ? 'liked' : ''}`}
            onClick={handleLike}
          >
            {liked ? '❤️' : '🤍'} {likeCount} 点赞
          </button>
          <button className="pd-action-btn">
            💬 {comments.length} 评论
          </button>
          <button className="pd-action-btn">
            👁 {post.viewCount || 0} 浏览
          </button>
        </div>
      </div>

      {/* 评论区 */}
      <div className="pd-comment-section">
        <h3 className="pd-comment-title">
          💬 评论 ({comments.length})
        </h3>

        {/* 评论输入框 */}
        <div className="pd-comment-input">
          {user ? (
            <>
              <img
                className="pd-avatar"
                src={avatarUrl(user.username, user.avatar)}
                alt={user.username}
              />
              <div className="pd-input-wrap">
                <textarea
                  className="pd-textarea"
                  placeholder="写下你的评论... (所有用户都可以评论)"
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  rows="3"
                />
                <div className="pd-input-actions">
                  <span className="pd-hint">评论是一种分享，让更多人看到你的想法</span>
                  <button
                    className="pd-submit"
                    onClick={handleComment}
                    disabled={!commentText.trim() || submitting}
                  >
                    {submitting ? '发布中...' : '发布评论'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="pd-login-prompt">
              <p>
                <span onClick={() => navigate('/login')} className="pd-login-link">登录</span>
                后参与评论，所有登录用户都可以发表评论！
              </p>
              <div className="pd-anonymous-comment">
                <textarea
                  className="pd-textarea"
                  placeholder="未登录状态下也可以写下评论（登录后发布）"
                  disabled
                  rows="2"
                />
                <button disabled>请先登录</button>
              </div>
            </div>
          )}
        </div>

        {/* 评论列表 */}
        <div className="pd-comments">
          {comments.length === 0 ? (
            <div className="pd-no-comment">
              <span className="no-comment-icon">💬</span>
              <p>暂无评论</p>
              <small>成为第一个评论的人吧！</small>
            </div>
          ) : (
            comments.map(c => (
              <div key={c._id} className="pd-comment-item">
                <img
                  className="pd-comment-avatar"
                  src={avatarUrl(c.author?.username, c.author?.avatar)}
                  alt={c.author?.username}
                />
                <div className="pd-comment-body">
                  <div className="pd-comment-top">
                    <div>
                      <span className="pd-comment-author">{c.author?.username || '匿名用户'}</span>
                      <span className="pd-comment-date">{formatTime(c.createdAt)}</span>
                    </div>
                    <button
                      className="pd-comment-like"
                      onClick={() => handleCommentLike(c._id)}
                      title="点赞评论"
                    >
                      👍 {c.likeCount || 0}
                    </button>
                  </div>
                  <p className="pd-comment-content">{c.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 评论提示 */}
        <div className="pd-comment-tip">
          <h4>💡 评论规范</h4>
          <ul>
            <li>尊重他人，友善交流</li>
            <li>分享你对作品的真实感受</li>
            <li>禁止发布广告、垃圾信息</li>
            <li>所有注册用户都可以发表评论</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
