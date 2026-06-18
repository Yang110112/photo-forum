import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import { getMe, updateMe, updatePassword, uploadAvatar } from '../api/users';
import { getFollowStats } from '../api/follows';
import { getFriends } from '../api/friends';
import { useNavigate, Link } from 'react-router-dom';
import '../css/Profile.css';

export default function Profile() {
  const { user: authUser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [editForm, setEditForm] = useState({ username: '', bio: '' });
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '' });
  const [editing, setEditing] = useState(false);
  const [msg, setMsg] = useState('');
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [followStats, setFollowStats] = useState({ followingCount: 0, followersCount: 0 });
  const [friendCount, setFriendCount] = useState(0);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await getMe();
        const u = res.data.data.user;
        setUser(u);
        setEditForm({ username: u.username, bio: u.bio || '' });

        // 加载关注统计
        const statsRes = await getFollowStats(u._id);
        setFollowStats(statsRes.data.data);

        // 加载好友数量
        const friendsRes = await getFriends();
        setFriendCount(friendsRes.data.data.friends?.length || 0);
      } catch (err) {
        console.error('加载资料失败', err);
      }
    };
    loadProfile();
  }, []);

  const handleSaveProfile = async () => {
    try {
      await updateMe(editForm);
      const res = await getMe();
      setUser(res.data.data.user);
      setEditing(false);
      setMsg('资料已更新');
    } catch (err) {
      setMsg(err.response?.data?.errors?.[0]?.message || err.response?.data?.message || '更新失败');
    }
  };

  const handleChangePwd = async () => {
    try {
      await updatePassword(pwdForm);
      setPwdForm({ currentPassword: '', newPassword: '' });
      setMsg('密码修改成功，请重新登录');
      setTimeout(() => { dispatch(logout()); navigate('/login'); }, 1500);
    } catch (err) {
      setMsg(err.response?.data?.errors?.[0]?.message || err.response?.data?.message || '密码修改失败');
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewAvatar(e.target.result);
    };
    reader.readAsDataURL(file);

    try {
      const res = await uploadAvatar(file);
      setUser(res.data.data.user);
      setMsg('头像上传成功');
    } catch (err) {
      setMsg(err.response?.data?.message || '头像上传失败');
      setPreviewAvatar(null);
    }
  };

  if (!authUser) return <div className="profile-tip">请先登录</div>;
  if (!user) return <div className="profile-tip">加载中...</div>;

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  const avatarSrc = previewAvatar || 
      (user.avatar && user.avatar.startsWith('/uploads')
          ? `${BASE_URL}${user.avatar}`
          : user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=f97316&color=fff`);

  return (
    <div className="profile-container">

      <div className="profile-card">
        <div className="profile-card-header">
          <div className="avatar-container">
            <img
              className="profile-avatar"
              src={avatarSrc}
              alt={user.username}
              onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${user.username}&background=f97316&color=fff`;
          }}
            />
            <label className="avatar-upload-btn">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif"
                onChange={handleAvatarChange}
                className="avatar-input"
              />
              <span className="upload-icon">📷</span>
            </label>
          </div>
          <div className="profile-info">
            <h2 className="profile-username">
                {user.username}
                {user.certStatus === 'approved' && (
                    <span className="cert-badge-profile">📸 认证摄影师</span>
                )}
            </h2>
            <p className="profile-email">{user.email}</p>
            <p className="profile-bio">{user.bio || '这个人很懒，还没有填写简介'}</p>
            <div className="profile-stats">
              <div className="stat-item-profile">
                <strong>{user.postCount ?? 0}</strong>
                <span>帖子</span>
              </div>
              <div className="stat-item-profile">
                <strong>{followStats.followingCount}</strong>
                <span>关注</span>
              </div>
              <div className="stat-item-profile">
                <strong>{followStats.followersCount}</strong>
                <span>粉丝</span>
              </div>
              <div className="stat-item-profile">
                <Link to="/messages" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <strong>{friendCount}</strong>
                  <span>好友</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="profile-card-actions">
          <button className="btn-edit" onClick={() => { setEditing(!editing); setMsg(''); }}>
            {editing ? '取消' : '编辑资料'}
          </button>
          <button className="btn-logout-profile" onClick={() => { dispatch(logout()); navigate('/login'); }}>
            退出登录
          </button>
        </div>
      </div>

      {msg && <p className="profile-msg">{msg}</p>}

      {/* 编辑资料 */}
      {editing && (
        <div className="profile-section">
          <h3>编辑资料</h3>
          <label>用户名</label>
          <input
            className="profile-input"
            value={editForm.username}
            onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
          />
          <label>个人简介</label>
          <textarea
            className="profile-textarea"
            value={editForm.bio}
            onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
            placeholder="介绍一下自己..."
          />
          <button className="btn-save" onClick={handleSaveProfile}>保存</button>
        </div>
      )}

      {/* 修改密码 */}
      <div className="profile-section">
        <h3>修改密码</h3>
        <label>当前密码</label>
        <input
          className="profile-input"
          type="password"
          value={pwdForm.currentPassword}
          onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
        />
        <label>新密码（至少6位）</label>
        <input
          className="profile-input"
          type="password"
          value={pwdForm.newPassword}
          onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
        />
        <button className="btn-save" onClick={handleChangePwd}>确认修改</button>
      </div>

    </div>
  );
}
