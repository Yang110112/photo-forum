import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getCommentsByPost, createComment } from '../api/comments';
import { message } from 'antd';
import { getPostById, likePost, unlikePost } from '../api/posts';
import { createBooking } from '../api/bookings';
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
  const { user } = useSelector(state => state.auth);

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // 约拍弹窗状态
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    proposedLocation: '',
    proposedDate: '',
    message: '',
  });
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

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
        setLiked(postRes.data.data.post?.isLiked || false);
      } catch (error) {
        message.error('加载失败');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  const handleComment = async () => {
    if (!commentText.trim()) return;
    if (!user) {
      message.warning('请先登录后再评论');
      navigate('/login');
      return;
    }
    setSubmitting(true);
    try {
      await createComment({ content: commentText, post: id });
      const res = await getCommentsByPost(id);
      setComments(res.data.comments || []);
      setCommentText('');
      message.success('评论成功');
    } catch (err) {
      message.error('评论失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
        message.warning('请先登录后再点赞');
        navigate('/login');
        return;
    }
    try {
        if (liked) {
            await unlikePost(id);
            setLiked(false);
            setLikeCount(prev => prev - 1);
        } else {
            await likePost(id);
            setLiked(true);
            setLikeCount(prev => prev + 1);
        }
    } catch (err) {
        message.error(err.response?.data?.message || '操作失败');
    }
  };

  // 提交约拍请求
  const handleBookingSubmit = async () => {
    if (!bookingForm.proposedLocation.trim()) {
      message.warning('请填写期望拍摄地点');
      return;
    }
    if (!bookingForm.proposedDate) {
      message.warning('请选择期望拍摄日期');
      return;
    }

    setBookingSubmitting(true);
    try {
      await createBooking({
        post: id,
        photographer: post.author?._id || post.author,
        proposedLocation: bookingForm.proposedLocation,
        proposedDate: bookingForm.proposedDate,
        message: bookingForm.message,
      });
      message.success('约拍请求已发送，请等待摄影师确认！');
      setShowBookingModal(false);
      setBookingForm({ proposedLocation: '', proposedDate: '', message: '' });
    } catch (err) {
      message.error(err.response?.data?.message || '约拍请求发送失败，请重试');
    } finally {
      setBookingSubmitting(false);
    }
  };

  const avatarUrl = (username, avatar) => {
    if (avatar && !avatar.startsWith('/uploads')) return avatar;
    return `https://ui-avatars.com/api/?name=${username || 'U'}&background=f97316&color=fff`;
  };

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

  const getCategoryInfo = (category) => {
    if (!category) return { name: '未分类', emoji: '📷' };
    const slug = typeof category === 'string' ? category : category.slug || category.name;
    const found = categories.find(c => c.slug === slug);
    if (found) return found;
    if (typeof category === 'object' && category.name) {
      return { name: category.name, emoji: '📷' };
    }
    return { name: slug, emoji: '📷' };
  };

  // 判断是否可以约拍（不是自己的帖子 + 帖子开启了约拍）
  const canBook = user && post?.openForBooking && post?.author?._id !== user?._id && post?.author !== user?._id;

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
      <div className="pd-card">
        <div className="pd-header">
          <button className="pd-back" onClick={() => navigate('/forum')}>
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

        {/* 图片/视频展示 */}
        {post.images && post.images.length > 0 && (
          <div className="pd-images">
            {post.images.map((item, index) => (
              item.startsWith('data:video') ? (
                <video
                  key={index}
                  src={item}
                  controls
                  className="pd-image"
                />
              ) : (
                <img
                  key={index}
                  src={item}
                  alt={`${post.title} - ${index + 1}`}
                  className="pd-image"
                />
              )
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
            <span className="pd-author">
              {post.author?.username || '匿名用户'}
              {/* 认证摄影师标识 */}
              {post.author?.certStatus === 'approved' && (
                <span style={{ marginLeft: 6, fontSize: '0.8rem', color: '#0ea5e9' }} title="认证摄影师">✅</span>
              )}
            </span>
            <span className="pd-date">{formatTime(post.createdAt)}</span>
          </div>
        </div>

        <div
          className="pd-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* 约拍信息展示区 */}
        {post.openForBooking && (
          <div className="pd-booking-info">
            <h4>📷 可约拍</h4>
            {post.bookingLocation && (
              <p>📍 拍摄地点：{post.bookingLocation}</p>
            )}
            {post.bookingDuration && (
              <p>⏱ 拍摄时长：{post.bookingDuration}小时</p>
            )}
            {post.bookingFee && (
              <p>💰 收费标准：{post.bookingFee}</p>
            )}
          </div>
        )}

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
          {/* 约拍按钮 - 仅当帖子开启约拍且不是自己的帖子时显示 */}
          {canBook && (
            <button
              className="pd-action-btn booking-btn"
              onClick={() => setShowBookingModal(true)}
            >
              📷 约拍
            </button>
          )}
        </div>
      </div>

      {/* 评论区 */}
      <div className="pd-comment-section">
        <h3 className="pd-comment-title">
          💬 评论 ({comments.length})
        </h3>

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
                  placeholder="写下你的评论..."
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  rows="3"
                />
                <div className="pd-input-actions">
                  <span className="pd-hint">友善交流，分享你的真实感受</span>
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
                后参与评论
              </p>
            </div>
          )}
        </div>

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
                  </div>
                  <p className="pd-comment-content">{c.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 约拍弹窗 */}
      {showBookingModal && (
        <div className="booking-modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
            <div className="booking-modal-header">
              <h3>📷 发起约拍</h3>
              <button className="booking-modal-close" onClick={() => setShowBookingModal(false)}>✕</button>
            </div>
            <div className="booking-modal-body">
              <div className="booking-photographer-info">
                向摄影师 <strong>{post.author?.username}</strong> 发起约拍请求
              </div>

              <div className="booking-form-group">
                <label>📍 期望拍摄地点 *</label>
                <input
                  type="text"
                  placeholder="如：北京朝阳区奥林匹克公园"
                  value={bookingForm.proposedLocation}
                  onChange={(e) => setBookingForm({ ...bookingForm, proposedLocation: e.target.value })}
                />
              </div>

              <div className="booking-form-group">
                <label>📅 期望拍摄日期 *</label>
                <input
                  type="date"
                  value={bookingForm.proposedDate}
                  onChange={(e) => setBookingForm({ ...bookingForm, proposedDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="booking-form-group">
                <label>📝 留言（可选）</label>
                <textarea
                  placeholder="介绍一下你的拍摄需求、想要的风格等..."
                  value={bookingForm.message}
                  onChange={(e) => setBookingForm({ ...bookingForm, message: e.target.value })}
                  rows="4"
                />
              </div>

              <div className="booking-modal-footer">
                <button className="booking-cancel" onClick={() => setShowBookingModal(false)}>
                  取消
                </button>
                <button
                  className="booking-submit"
                  onClick={handleBookingSubmit}
                  disabled={bookingSubmitting}
                >
                  {bookingSubmitting ? '发送中...' : '发送约拍请求'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
