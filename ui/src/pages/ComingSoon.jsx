import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../css/ComingSoon.css';

const activityMap = {
  'weekly-challenge': { name: '每周挑战', emoji: '🏆', desc: '每周一个主题，记录你眼中的世界', date: '2025-08-01' },
  'theme-contest':   { name: '主题摄影赛', emoji: '📸', desc: '与摄影师们同台竞技，展示你的视角', date: '2025-08-15' },
  'beginner-event':  { name: '新手专场', emoji: '🌱', desc: '专为摄影新手设计，轻松入门不迷路', date: '2025-09-01' },
  'season-contest':  { name: '季度大赛', emoji: '🎖️', desc: '年度最高规格赛事，顶尖作品同场角逐', date: '2025-10-01' },
  'past-events':     { name: '往期活动', emoji: '📅', desc: '回顾精彩瞬间，感受每一届的温度', date: null },
};

function useCountdown(targetDateStr) {
  const calc = () => {
    if (!targetDateStr) return null;
    const diff = new Date(targetDateStr) - new Date();
    if (diff <= 0) return { d: '00', h: '00', m: '00', s: '00' };
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const pad = n => String(n).padStart(2, '0');
    return { d: pad(d), h: pad(h), m: pad(m), s: pad(s) };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    if (!targetDateStr) return;
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [targetDateStr]);
  return time;
}

export default function ComingSoon() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const activity = activityMap[slug] || { name: '活动', emoji: '🎉', desc: '精彩活动即将上线', date: null };
  const time = useCountdown(activity.date);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = () => {
    if (!email || !email.includes('@')) return;
    setSubscribed(true);
    setEmail('');
  };

  return (
    <div className="cs-page">
      <div className="cs-container">

        {/* 返回按钮 */}
        <button className="cs-back-btn" onClick={() => navigate(-1)}>
          ← 返回
        </button>

        {/* 主图标 */}
        <div className="cs-icon-wrap">
          <span className="cs-icon-emoji">{activity.emoji}</span>
        </div>

        {/* 标题区 */}
        <h1 className="cs-title">{activity.name}</h1>
        <p className="cs-desc">{activity.desc}</p>
        <div className="cs-badge">敬请期待</div>

        {/* 倒计时 */}
        {time && (
          <div className="cs-countdown-wrap">
            {[{ label: '天', val: time.d }, { label: '时', val: time.h }, { label: '分', val: time.m }, { label: '秒', val: time.s }].map(({ label, val }, i) => (
              <div key={i} className="cs-count-card">
                <span className="cs-count-num">{val}</span>
                <span className="cs-count-label">{label}</span>
              </div>
            ))}
          </div>
        )}

        {/* 分隔线 */}
        <div className="cs-divider" />

        {/* 订阅区 */}
        <p className="cs-notify-text">活动开启时第一时间通知我</p>
        {subscribed ? (
          <div className="cs-success-msg">✓ 订阅成功，我们会在活动开始前通知你！</div>
        ) : (
          <div className="cs-notify-row">
            <input
              className="cs-input"
              type="email"
              placeholder="输入你的邮箱"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubscribe()}
            />
            <button className="cs-sub-btn" onClick={handleSubscribe}>订阅</button>
          </div>
        )}

        {/* 其他活动入口 */}
        <div className="cs-other-wrap">
          <p className="cs-other-title">同期活动</p>
          <div className="cs-other-grid">
            {Object.entries(activityMap)
              .filter(([s]) => s !== slug)
              .map(([s, a]) => (
                <button key={s} className="cs-other-card" onClick={() => navigate(`/activity/${s}`)}>
                  <span className="cs-other-emoji">{a.emoji}</span>
                  <span className="cs-other-name">{a.name}</span>
                </button>
              ))}
          </div>
        </div>

      </div>
    </div>
  );
}