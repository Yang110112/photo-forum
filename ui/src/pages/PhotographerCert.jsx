import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import '../css/PhotographerCert.css';

// 认证类型
const certTypes = [
  { id: 'id_card', name: '身份证', icon: '🪪' },
  { id: 'photographer_license', name: '摄影师资格证', icon: '🎓' },
  { id: 'business_license', name: '营业执照', icon: '📋' },
  { id: 'award_cert', name: '获奖证书', icon: '🏆' },
  { id: 'media_cert', name: '媒体认证', icon: '📰' },
];

export default function PhotographerCert() {
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const [certStatus, setCertStatus] = useState('none');
  const [form, setForm] = useState({
    realName: '',
    phone: '',
    certType: '',
    description: '',
  });
  const [certFiles, setCertFiles] = useState([]);
  const [portfolioFiles, setPortfolioFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // 检查用户的认证状态
    const savedCerts = JSON.parse(localStorage.getItem('photographerCerts') || '{}');
    const userCert = savedCerts[user.username];
    if (userCert) {
      setCertStatus(userCert.status);
      setForm({
        realName: userCert.realName || '',
        phone: userCert.phone || '',
        certType: userCert.certType || '',
        description: userCert.description || '',
      });
    }
  }, [user, navigate]);

  const handleCertFilesChange = (files) => {
    setCertFiles(files);
  };

  const handlePortfolioChange = (files) => {
    setPortfolioFiles(files);
  };

  const handleSubmit = async () => {
    if (!form.realName.trim()) {
      alert('请输入真实姓名');
      return;
    }
    if (!form.phone.trim()) {
      alert('请输入联系电话');
      return;
    }
    if (!form.certType) {
      alert('请选择认证类型');
      return;
    }
    if (certFiles.length === 0) {
      alert('请上传至少一张证书照片');
      return;
    }
    if (portfolioFiles.length === 0) {
      alert('请上传至少3张代表作品');
      return;
    }

    setSubmitting(true);

    try {
      // 保存认证申请
      const savedCerts = JSON.parse(localStorage.getItem('photographerCerts') || '{}');
      savedCerts[user.username] = {
        status: 'pending',
        realName: form.realName,
        phone: form.phone,
        certType: form.certType,
        description: form.description,
        certFiles: certFiles.map(f => f.previewUrl || URL.createObjectURL(f.file)),
        portfolioFiles: portfolioFiles.map(f => f.previewUrl || URL.createObjectURL(f.file)),
        submittedAt: new Date().toISOString(),
      };
      localStorage.setItem('photographerCerts', JSON.stringify(savedCerts));

      // 更新用户认证状态
      const savedUsers = JSON.parse(localStorage.getItem('forumUsers') || '{}');
      if (savedUsers[user.username]) {
        savedUsers[user.username].certStatus = 'pending';
        localStorage.setItem('forumUsers', JSON.stringify(savedUsers));
      }

      alert('认证申请已提交，请等待审核！');
      setCertStatus('pending');
    } catch (err) {
      alert('提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  // 已认证状态
  if (certStatus === 'approved') {
    return (
      <div className="cert-container">
        <div className="cert-approved">
          <div className="cert-badge">✅ 已认证摄影师</div>
          <h2>恭喜您通过摄影师认证！</h2>
          <p>您现在可以：</p>
          <ul>
            <li>在发布作品时勾选"可约拍"选项</li>
            <li>接收普通用户的约拍请求</li>
            <li>展示官方认证标识</li>
          </ul>
          <button onClick={() => navigate('/profile')} className="cert-btn">
            查看我的主页
          </button>
        </div>
      </div>
    );
  }

  // 待审核状态
  if (certStatus === 'pending') {
    return (
      <div className="cert-container">
        <div className="cert-pending">
          <div className="pending-icon">⏳</div>
          <h2>认证申请已提交</h2>
          <p>我们将在1-3个工作日内完成审核</p>
          <div className="pending-info">
            <p>提交时间：{new Date().toLocaleDateString('zh-CN')}</p>
            <p>审核状态：<span className="status-pending">审核中...</span></p>
          </div>
          <button onClick={() => navigate('/')} className="cert-btn secondary">
            返回首页
          </button>
        </div>
      </div>
    );
  }

  // 未通过状态
  if (certStatus === 'rejected') {
    return (
      <div className="cert-container">
        <div className="cert-rejected">
          <div className="rejected-icon">❌</div>
          <h2>认证申请未通过</h2>
          <p>请重新提交认证申请，确保上传的资料清晰完整</p>
          <button onClick={() => setCertStatus('none')} className="cert-btn">
            重新申请
          </button>
        </div>
      </div>
    );
  }

  // 申请表单
  return (
    <div className="cert-container">
      <h2 className="cert-title">📸 摄影师认证申请</h2>
      <p className="cert-subtitle">通过认证后，您可以在作品中添加"可约拍"选项，让更多人与您合作</p>

      {/* 基本信息 */}
      <div className="cert-section">
        <h3 className="section-title">基本信息</h3>
        <div className="form-group">
          <label>真实姓名 *</label>
          <input
            type="text"
            placeholder="请输入您的真实姓名"
            value={form.realName}
            onChange={(e) => setForm({ ...form, realName: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>联系电话 *</label>
          <input
            type="tel"
            placeholder="请输入手机号码"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
      </div>

      {/* 认证类型 */}
      <div className="cert-section">
        <h3 className="section-title">认证类型 *</h3>
        <div className="cert-types">
          {certTypes.map(type => (
            <div
              key={type.id}
              className={`cert-type-option ${form.certType === type.id ? 'selected' : ''}`}
              onClick={() => setForm({ ...form, certType: type.id })}
            >
              <span className="cert-type-icon">{type.icon}</span>
              <span className="cert-type-name">{type.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 认证证书上传 */}
      <div className="cert-section">
        <h3 className="section-title">上传证书 *</h3>
        <p className="section-hint">请上传相关证书照片，确保图片清晰可读</p>
        <div className="upload-area" onClick={() => document.getElementById('cert-input').click()}>
          <input
            id="cert-input"
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => {
              const files = Array.from(e.target.files).map(file => ({
                file,
                previewUrl: URL.createObjectURL(file)
              }));
              setCertFiles([...certFiles, ...files]);
            }}
          />
          <div className="upload-icon">📁</div>
          <p>点击上传证书照片</p>
          <span>支持 JPG、PNG 格式</span>
        </div>
        {certFiles.length > 0 && (
          <div className="file-preview">
            {certFiles.map((f, i) => (
              <div key={i} className="preview-item">
                <img src={f.previewUrl} alt={`证书${i + 1}`} />
                <button onClick={() => setCertFiles(certFiles.filter((_, idx) => idx !== i))}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 代表作品上传 */}
      <div className="cert-section">
        <h3 className="section-title">代表作品 *</h3>
        <p className="section-hint">请上传3-10张您的代表作品，展示您的摄影水平</p>
        <div className="upload-area" onClick={() => document.getElementById('portfolio-input').click()}>
          <input
            id="portfolio-input"
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => {
              const files = Array.from(e.target.files).map(file => ({
                file,
                previewUrl: URL.createObjectURL(file)
              }));
              setPortfolioFiles([...portfolioFiles, ...files]);
            }}
          />
          <div className="upload-icon">🖼️</div>
          <p>点击上传代表作品</p>
          <span>支持 JPG、PNG 格式，建议至少3张</span>
        </div>
        {portfolioFiles.length > 0 && (
          <div className="file-preview portfolio">
            {portfolioFiles.map((f, i) => (
              <div key={i} className="preview-item">
                <img src={f.previewUrl} alt={`作品${i + 1}`} />
                <button onClick={() => setPortfolioFiles(portfolioFiles.filter((_, idx) => idx !== i))}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 自我介绍 */}
      <div className="cert-section">
        <h3 className="section-title">自我介绍（可选）</h3>
        <textarea
          placeholder="介绍一下您的摄影经历、擅长领域等..."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows="4"
        />
      </div>

      {/* 提交按钮 */}
      <button
        className="cert-submit"
        onClick={handleSubmit}
        disabled={submitting}
      >
        {submitting ? '提交中...' : '📮 提交认证申请'}
      </button>

      <div className="cert-tips">
        <h4>💡 认证说明</h4>
        <ul>
          <li>认证审核通常需要1-3个工作日</li>
          <li>请确保上传的资料真实有效</li>
          <li>认证通过后，您可以在作品中添加约拍功能</li>
          <li>如有疑问，请联系客服</li>
        </ul>
      </div>
    </div>
  );
}