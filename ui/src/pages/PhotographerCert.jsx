import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { message } from 'antd';
import { fetchUserInfo } from '../store/authSlice';
import { submitCertification, getMyCertification } from '../api/certification';
import { uploadFile } from '../api/upload';
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
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [certStatus, setCertStatus] = useState('none');
  const [reviewNote, setReviewNote] = useState('');
  const [form, setForm] = useState({
    realName: '',
    phone: '',
    certType: '',
    description: '',
  });
  const [certFileUrls, setCertFileUrls] = useState([]);    // ✅ 改成存 URL 字符串
  const [portfolioUrls, setPortfolioUrls] = useState([]);   // ✅ 改成存 URL 字符串
  const [certPreviewUrls, setCertPreviewUrls] = useState([]);   // 预览用
  const [portfolioPreviewUrls, setPortfolioPreviewUrls] = useState([]); // 预览用
  const [submitting, setSubmitting] = useState(false);
  const [uploadingCert, setUploadingCert] = useState(false);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // ✅ 改动：从 API 获取认证状态
    getMyCertification()
      .then(res => {
        const cert = res.data.cert;
        if (cert) {
          setCertStatus(cert.status);
          setReviewNote(cert.reviewNote || '');
          setForm({
            realName: cert.realName || '',
            phone: cert.phone || '',
            certType: cert.certType || '',
            description: cert.description || '',
          });
          if (cert.certFiles) {
            setCertFileUrls(cert.certFiles);
            setCertPreviewUrls(cert.certFiles);
          }
          if (cert.portfolioFiles) {
            setPortfolioUrls(cert.portfolioFiles);
            setPortfolioPreviewUrls(cert.portfolioFiles);
          }
        } else {
          // 没有 cert 记录，看 user 的 certStatus
          if (user.certStatus === 'approved') setCertStatus('approved');
          else if (user.certStatus === 'pending') setCertStatus('pending');
          else if (user.certStatus === 'rejected') setCertStatus('rejected');
        }
      })
      .catch(err => {
        // 降级到 localStorage
        if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED') {
          const savedCerts = JSON.parse(localStorage.getItem('photographerCerts') || '{}');
          const userCert = savedCerts[user.username];
          if (userCert) setCertStatus(userCert.status);
        }
      });
  }, [user, navigate]);

  // ✅ 改动：上传证书文件到服务器
  const handleCertFilesChange = async (e) => {
    const files = Array.from(e.target.files);
    setUploadingCert(true);
    try {
      for (const file of files) {
        const res = await uploadFile(file);
        setCertFileUrls(prev => [...prev, res.data.url]);
        setCertPreviewUrls(prev => [...prev, URL.createObjectURL(file)]);
      }
    } catch (err) {
      message.error('证书上传失败，请重试');
    } finally {
      setUploadingCert(false);
    }
  };

  // ✅ 改动：上传作品文件到服务器
  const handlePortfolioChange = async (e) => {
    const files = Array.from(e.target.files);
    setUploadingPortfolio(true);
    try {
      for (const file of files) {
        const res = await uploadFile(file);
        setPortfolioUrls(prev => [...prev, res.data.url]);
        setPortfolioPreviewUrls(prev => [...prev, URL.createObjectURL(file)]);
      }
    } catch (err) {
      message.error('作品上传失败，请重试');
    } finally {
      setUploadingPortfolio(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.realName.trim()) { message.warning('请输入真实姓名'); return; }
    if (!form.phone.trim()) { message.warning('请输入联系电话'); return; }
    if (!form.certType) { message.warning('请选择认证类型'); return; }
    if (certFileUrls.length === 0) { message.warning('请上传至少一张证书照片'); return; }
    if (portfolioUrls.length === 0) { message.warning('请上传至少一张代表作品'); return; }

    setSubmitting(true);
    try {
      // ✅ 改动：调用 API 提交
      await submitCertification({
        realName: form.realName,
        phone: form.phone,
        certType: form.certType,
        description: form.description,
        certFiles: certFileUrls,
        portfolioFiles: portfolioUrls,
      });

      // 刷新用户信息（certStatus 会变成 pending）
      dispatch(fetchUserInfo());

      message.success('认证申请已提交，请等待审核！');
      setCertStatus('pending');
    } catch (err) {
      // 降级到 localStorage
      if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED') {
        const savedCerts = JSON.parse(localStorage.getItem('photographerCerts') || '{}');
        savedCerts[user.username] = {
          status: 'pending',
          realName: form.realName,
          phone: form.phone,
          certType: form.certType,
          description: form.description,
          certFiles: certPreviewUrls,
          portfolioFiles: portfolioPreviewUrls,
          submittedAt: new Date().toISOString(),
        };
        localStorage.setItem('photographerCerts', JSON.stringify(savedCerts));
        message.success('认证申请已提交（离线模式）！');
        setCertStatus('pending');
      } else {
        message.error(err.response?.data?.message || '提交失败，请重试');
      }
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
          {reviewNote && <p style={{ color: '#dc2626', marginTop: '8px' }}>审核备注：{reviewNote}</p>}
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

      {/* ✅ 改动：证书上传改为先上传到服务器 */}
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
            onChange={handleCertFilesChange}
          />
          <div className="upload-icon">📁</div>
          <p>{uploadingCert ? '上传中...' : '点击上传证书照片'}</p>
          <span>支持 JPG、PNG 格式</span>
        </div>
        {certPreviewUrls.length > 0 && (
          <div className="file-preview">
            {certPreviewUrls.map((url, i) => (
              <div key={i} className="preview-item">
                <img src={url} alt={`证书${i + 1}`} />
                <button onClick={() => {
                  setCertFileUrls(prev => prev.filter((_, idx) => idx !== i));
                  setCertPreviewUrls(prev => prev.filter((_, idx) => idx !== i));
                }}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ✅ 改动：作品上传改为先上传到服务器 */}
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
            onChange={handlePortfolioChange}
          />
          <div className="upload-icon">🖼️</div>
          <p>{uploadingPortfolio ? '上传中...' : '点击上传代表作品'}</p>
          <span>支持 JPG、PNG 格式，建议至少3张</span>
        </div>
        {portfolioPreviewUrls.length > 0 && (
          <div className="file-preview portfolio">
            {portfolioPreviewUrls.map((url, i) => (
              <div key={i} className="preview-item">
                <img src={url} alt={`作品${i + 1}`} />
                <button onClick={() => {
                  setPortfolioUrls(prev => prev.filter((_, idx) => idx !== i));
                  setPortfolioPreviewUrls(prev => prev.filter((_, idx) => idx !== i));
                }}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="cert-section">
        <h3 className="section-title">自我介绍（可选）</h3>
        <textarea
          placeholder="介绍一下您的摄影经历、擅长领域等..."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows="4"
        />
      </div>

      <button
        className="cert-submit"
        onClick={handleSubmit}
        disabled={submitting || uploadingCert || uploadingPortfolio}
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