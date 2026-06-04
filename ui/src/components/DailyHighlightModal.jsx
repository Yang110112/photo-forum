import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/DailyHighlightModal.css';

export default function DailyHighlightModal({ isOpen, onClose, highlightPost }) {
  const navigate = useNavigate();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  // 每次打开都重置图片状态，避免上次加载状态残留
  useEffect(() => {
    if (isOpen) {
      setImgLoaded(false);
      setImgError(false);
    }
  }, [isOpen, highlightPost?._id]);

  if (!isOpen) return null;

  const handleClose = () => onClose();

  const handleViewPost = () => {
    onClose();
    navigate(`/post/${highlightPost._id}`);
  };

  const handleGoCreate = () => {
    onClose();
    navigate('/create');
  };

  const firstImage = highlightPost?.images?.[0];
  const isVideo = firstImage?.startsWith('data:video');

  // ✅ 昨日无作品：兜底显示
  if (!highlightPost) {
    return (
      <div className="modal-overlay" onClick={handleClose}>
        <div className="modal-content modal-empty" onClick={e => e.stopPropagation()}>
          <button className="modal-close" onClick={handleClose}>×</button>
          <div className="modal-badge modal-badge--gray">📅 昨日热门作品</div>
          <div className="modal-empty-body">
            <span className="modal-empty-icon">🌙</span>
            <p className="modal-empty-title">昨日暂无热门作品</p>
            <p className="modal-empty-desc">快来发布你的作品，<br />说不定明天就是热门！</p>
          </div>
          <div className="modal-actions">
            <button className="modal-btn-primary" onClick={handleGoCreate}>
              去发布作品
            </button>
            <button className="modal-btn-secondary" onClick={handleClose}>
              关闭
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={handleClose}>×</button>
        <div className="modal-badge">🏆 昨日热门作品</div>

        {/* ✅ 图片区域：加骨架屏，减少卡顿感知 */}
        <div className="modal-media-container">
          {firstImage ? (
            isVideo ? (
              <video
                className="modal-media"
                src={firstImage}
                controls
                preload="metadata" // ✅ 改为 metadata，只加载首帧，不全量加载
              />
            ) : (
              <>
                {/* 骨架屏：图片未加载完时显示 */}
                {!imgLoaded && !imgError && (
                  <div className="modal-skeleton" />
                )}
                {imgError && (
                  <div className="modal-no-media">图片加载失败</div>
                )}
                <img
                  className="modal-media"
                  src={firstImage}
                  alt={highlightPost.title}
                  onLoad={() => setImgLoaded(true)}
                  onError={() => setImgError(true)}
                  style={{ display: imgLoaded ? 'block' : 'none' }}
                  // ✅ 去掉 loading="lazy"，弹窗内图片应立即加载
                />
              </>
            )
          ) : (
            <div className="modal-no-media">暂无预览图</div>
          )}
        </div>

        <div className="modal-info">
          <h2 className="modal-title">{highlightPost.title}</h2>

          <div className="modal-author">
            <img
              src={
                highlightPost.author?.avatar ||
                `https://ui-avatars.com/api/?name=${highlightPost.author?.username}&background=f97316&color=fff`
              }
              alt={highlightPost.author?.username}
              className="modal-avatar"
              onError={e => {
                e.target.src = `https://ui-avatars.com/api/?name=${highlightPost.author?.username}&background=f97316&color=fff`;
              }}
            />
            <div>
              <span className="modal-username">{highlightPost.author?.username}</span>
              <span className="modal-date">
                {new Date(highlightPost.createdAt).toLocaleDateString('zh-CN')}
              </span>
            </div>
          </div>

          <div className="modal-stats">
            <span className="modal-stat">❤️ {highlightPost.likeCount || 0} 点赞</span>
            <span className="modal-stat">💬 {highlightPost.commentCount || 0} 评论</span>
            <span className="modal-stat">👁️ {highlightPost.viewCount || 0} 浏览</span>
          </div>

          {highlightPost.category && (
            <span className="modal-category">{highlightPost.category.name}</span>
          )}
        </div>

        <div className="modal-actions">
          <button className="modal-btn-primary" onClick={handleViewPost}>查看详情</button>
          <button className="modal-btn-secondary" onClick={handleClose}>稍后再说</button>
        </div>
      </div>
    </div>
  );
}