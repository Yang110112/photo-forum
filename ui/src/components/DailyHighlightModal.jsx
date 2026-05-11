import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/DailyHighlightModal.css';

export default function DailyHighlightModal({ isOpen, onClose, highlightPost }) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (isOpen && highlightPost) {
      setVisible(true);
      setImgLoaded(false);
    }
  }, [isOpen, highlightPost]);

  const handleClose = () => {
    setVisible(false);
    onClose();
  };

  const handleViewPost = () => {
    handleClose();
    navigate(`/post/${highlightPost._id}`);
  };

  if (!isOpen || !highlightPost) return null;

  const firstImage = highlightPost.images?.[0];
  const isVideo = firstImage?.startsWith('data:video');

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={handleClose}>×</button>

        <div className="modal-badge">🏆 今日热门作品</div>

        <div className="modal-media-container">
          {firstImage ? (
            isVideo ? (
              <video
                className="modal-media"
                src={firstImage}
                controls
                preload="none"
              />
            ) : (
              <>
                {!imgLoaded && <div className="modal-no-media">加载中...</div>}
                <img
                  ref={imgRef}
                  className="modal-media"
                  src={firstImage}
                  alt={highlightPost.title}
                  loading="lazy"
                  onLoad={() => setImgLoaded(true)}
                  style={{ display: imgLoaded ? 'block' : 'none' }}
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
                src={highlightPost.author?.avatar || `https://ui-avatars.com/api/?name=${highlightPost.author?.username}&background=f97316&color=fff`}
                alt={highlightPost.author?.username}
                className="modal-avatar"
                onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${highlightPost.author?.username}&background=f97316&color=fff`;
                }}
            />
            <div>
              <span className="modal-username">{highlightPost.author?.username}</span>
              <span className="modal-date">{new Date(highlightPost.createdAt).toLocaleDateString('zh-CN')}</span>
            </div>
          </div>

          <div className="modal-stats">
            <span className="modal-stat">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              {highlightPost.likeCount || 0} 点赞
            </span>
            <span className="modal-stat">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              {highlightPost.commentCount || 0} 评论
            </span>
            <span className="modal-stat">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              {highlightPost.viewCount || 0} 浏览
            </span>
          </div>

          {highlightPost.category && (
            <span className="modal-category">{highlightPost.category.name}</span>
          )}
        </div>

        <div className="modal-actions">
          <button className="modal-btn-primary" onClick={handleViewPost}>
            查看详情
          </button>
          <button className="modal-btn-secondary" onClick={handleClose}>
            稍后再说
          </button>
        </div>
      </div>
    </div>
  );
}