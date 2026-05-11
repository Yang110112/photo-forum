import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import MediaUploader from '../components/MediaUploader';
import '../css/CreatePost.css';

// 分类数据
const categories = [
  { _id: 'landscape', name: '风光摄影', emoji: '🏔️' },
  { _id: 'portrait', name: '人像摄影', emoji: '👤' },
  { _id: 'street', name: '街头摄影', emoji: '🏙️' },
  { _id: 'animal', name: '动物摄影', emoji: '🐾' },
  { _id: 'food', name: '美食摄影', emoji: '🍽️' },
  { _id: 'astrophotography', name: '星空摄影', emoji: '🌌' },
];

export default function CreatePost() {
  const [form, setForm] = useState({
    title: '',
    content: '',
    category: '',
    tags: ''
  });
  const [mediaFiles, setMediaFiles] = useState([]);
  const [openForBooking, setOpenForBooking] = useState(false);
  const [bookingInfo, setBookingInfo] = useState({
    location: '',
    duration: '',
    fee: ''
  });
  const [loading, setLoading] = useState(false);
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();

  // 检查用户是否是认证摄影师
  const isCertifiedPhotographer = () => {
    if (!user) return false;
    const savedCerts = JSON.parse(localStorage.getItem('photographerCerts') || '{}');
    const userCert = savedCerts[user.username];
    return userCert && userCert.status === 'approved';
  };

  // 如果未登录，跳转到登录页
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleFilesChange = (files) => {
    setMediaFiles(files);
  };

  const submit = async () => {
    if (!form.title.trim()) {
      alert('请输入标题');
      return;
    }
    if (!form.category) {
      alert('请选择分类');
      return;
    }
    if (!form.content.trim() || form.content.length < 10) {
      alert('内容介绍至少需要10个字符');
      return;
    }

    setLoading(true);

    try {
      // 创建帖子数据
      const postData = {
        title: form.title,
        content: form.content,
        category: form.category,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        media: mediaFiles.map(f => ({
          url: f.previewUrl || URL.createObjectURL(f.file),
          type: f.type,
          name: f.name
        })),
        author: {
          username: user?.username || '匿名用户',
          avatar: user?.avatar || ''
        },
        likeCount: 0,
        commentCount: 0,
        viewCount: 0,
        createdAt: new Date().toISOString(),
        // 约拍相关
        openForBooking: isCertifiedPhotographer() ? openForBooking : false,
        bookingInfo: isCertifiedPhotographer() && openForBooking ? bookingInfo : null,
        isCertified: isCertifiedPhotographer()
      };

      // 保存到 localStorage
      const savedPosts = localStorage.getItem('forumPosts');
      let posts = savedPosts ? JSON.parse(savedPosts) : [];
      posts.unshift(postData);
      localStorage.setItem('forumPosts', JSON.stringify(posts));

      alert('发布成功！');
      navigate('/forum');
    } catch (err) {
      alert('发布失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post-container">
      <h2 className="create-post-title">📷 发布摄影作品</h2>

      {/* 标题 */}
      <input
        className="create-post-input"
        placeholder="作品标题"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />

      {/* 分类选择 */}
      <div className="category-section">
        <label className="section-label">选择分类</label>
        <div className="category-grid">
          {categories.map(cat => (
            <div
              key={cat._id}
              className={`category-option ${form.category === cat._id ? 'selected' : ''}`}
              onClick={() => setForm({ ...form, category: cat._id })}
            >
              <span className="category-emoji">{cat.emoji}</span>
              <span className="category-name">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 标签 */}
      <input
        className="create-post-input"
        placeholder="标签（逗号分隔，如：风光,日出,云海）"
        value={form.tags}
        onChange={(e) => setForm({ ...form, tags: e.target.value })}
      />

      {/* 媒体上传 */}
      <div className="media-upload-section">
        <label className="section-label">上传图片/视频</label>
        <MediaUploader files={mediaFiles} onFilesChange={handleFilesChange} />
      </div>

      {/* 内容介绍 */}
      <textarea
        className="create-post-textarea"
        placeholder="作品介绍（至少10个字符）"
        value={form.content}
        onChange={(e) => setForm({ ...form, content: e.target.value })}
      />

      {/* 约拍选项 - 仅认证摄影师可见 */}
      {isCertifiedPhotographer() && (
        <div className="booking-section">
          <div className="booking-toggle">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={openForBooking}
                onChange={(e) => setOpenForBooking(e.target.checked)}
              />
              <span className="toggle-switch"></span>
              <span className="toggle-text">📷 开启约拍</span>
            </label>
            <p className="booking-hint">开启后，普通用户可以向您发起约拍请求</p>
          </div>

          {openForBooking && (
            <div className="booking-info">
              <h4>约拍信息</h4>
              <input
                type="text"
                placeholder="拍摄地点（如：北京朝阳区）"
                value={bookingInfo.location}
                onChange={(e) => setBookingInfo({ ...bookingInfo, location: e.target.value })}
                className="booking-input"
              />
              <select
                value={bookingInfo.duration}
                onChange={(e) => setBookingInfo({ ...bookingInfo, duration: e.target.value })}
                className="booking-select"
              >
                <option value="">选择拍摄时长</option>
                <option value="0.5">0.5小时</option>
                <option value="1">1小时</option>
                <option value="2">2小时</option>
                <option value="4">半天（4小时）</option>
                <option value="8">全天（8小时）</option>
              </select>
              <input
                type="text"
                placeholder="收费标准（如：面议 / 500元/小时）"
                value={bookingInfo.fee}
                onChange={(e) => setBookingInfo({ ...bookingInfo, fee: e.target.value })}
                className="booking-input"
              />
            </div>
          )}
        </div>
      )}

      {/* 发布按钮 */}
      <button
        onClick={submit}
        className="create-post-button"
        disabled={loading}
      >
        {loading ? '发布中...' : '🚀 发布作品'}
      </button>

      {/* 提示信息 */}
      <div className="upload-tips">
        <h4>💡 上传提示</h4>
        <ul>
          <li>支持上传多张图片或视频</li>
          <li>图片格式：JPG, PNG, GIF, WebP</li>
          <li>视频格式：MP4, WebM, MOV</li>
          <li>建议图片大小不超过10MB</li>
          <li>视频建议时长控制在3分钟以内</li>
          {isCertifiedPhotographer() && (
            <>
              <li>开启"约拍"功能后，用户可以向您发起约拍请求</li>
              <li>请填写准确的拍摄地点和收费标准</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}
