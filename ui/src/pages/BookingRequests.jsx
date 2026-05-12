import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getReceivedBookings, getSentBookings, updateBookingStatus } from '../api/bookings';
import '../css/BookingRequests.css';

export default function BookingRequests() {
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('received');
  const [loading, setLoading] = useState(true);

  // ✅ 改动：从 API 加载数据
  const fetchBookings = async () => {
    try {
      const [receivedRes, sentRes] = await Promise.all([
        getReceivedBookings(),
        getSentBookings(),
      ]);
      setReceivedRequests(receivedRes.data.bookings || []);
      setSentRequests(sentRes.data.bookings || []);
    } catch (err) {
      // 降级到 localStorage
      if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED') {
        const savedRequests = JSON.parse(localStorage.getItem('bookingRequests') || '{}');
        setSentRequests(savedRequests.sent || []);
        setReceivedRequests(savedRequests.received || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchBookings();
  }, [user, navigate]);

  // ✅ 改动：通过 API 更新状态
  const handleAccept = async (requestId) => {
    try {
      await updateBookingStatus(requestId, { status: 'accepted' });
      setReceivedRequests(prev =>
        prev.map(r => r._id === requestId ? { ...r, status: 'accepted' } : r)
      );
      alert('已接受约拍请求！');
    } catch (err) {
      alert(err.response?.data?.message || '操作失败');
    }
  };

  const handleReject = async (requestId) => {
    try {
      await updateBookingStatus(requestId, { status: 'rejected' });
      setReceivedRequests(prev =>
        prev.map(r => r._id === requestId ? { ...r, status: 'rejected' } : r)
      );
      alert('已拒绝约拍请求');
    } catch (err) {
      alert(err.response?.data?.message || '操作失败');
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return '待处理';
      case 'accepted': return '已接受';
      case 'rejected': return '已拒绝';
      default: return status;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'accepted': return 'status-accepted';
      case 'rejected': return 'status-rejected';
      default: return '';
    }
  };

  // ✅ 改动：API 返回的数据字段名和 localStorage 不同，统一适配
  const getAvatar = (person) => {
    return person?.avatar || `https://ui-avatars.com/api/?name=${person?.username || 'U'}&background=random`;
  };

  if (loading) return <div className="booking-container"><p>加载中...</p></div>;

  return (
    <div className="booking-container">
      <h2 className="booking-title">📅 我的约拍</h2>

      <div className="booking-tabs">
        <button
          className={`booking-tab ${activeTab === 'received' ? 'active' : ''}`}
          onClick={() => setActiveTab('received')}
        >
          收到的请求 ({receivedRequests.length})
        </button>
        <button
          className={`booking-tab ${activeTab === 'sent' ? 'active' : ''}`}
          onClick={() => setActiveTab('sent')}
        >
          发出的请求 ({sentRequests.length})
        </button>
      </div>

      {/* 收到的请求 */}
      {activeTab === 'received' && (
        <div className="booking-list">
          {receivedRequests.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📭</span>
              <p>暂无收到的约拍请求</p>
              <small>当普通用户向您发起约拍时，会显示在这里</small>
            </div>
          ) : (
            receivedRequests.map(request => (
              <div key={request._id || request.id} className="booking-card">
                <div className="booking-card-header">
                  <div className="booking-user">
                    <img
                      src={getAvatar(request.requester)}
                      alt={request.requester?.username}
                      className="booking-avatar"
                    />
                    <div className="booking-user-info">
                      <span className="booking-user-name">{request.requester?.username}</span>
                      <span className="booking-date">{formatDate(request.createdAt)}</span>
                    </div>
                  </div>
                  <span className={`booking-status ${getStatusClass(request.status)}`}>
                    {getStatusText(request.status)}
                  </span>
                </div>

                <div className="booking-card-body">
                  <div className="booking-info-row">
                    <span className="booking-label">📷 作品：</span>
                    <span className="booking-value">{request.post?.title}</span>
                  </div>
                  <div className="booking-info-row">
                    <span className="booking-label">📍 拍摄地点：</span>
                    <span className="booking-value">{request.proposedLocation}</span>
                  </div>
                  <div className="booking-info-row">
                    <span className="booking-label">📅 期望时间：</span>
                    <span className="booking-value">{request.proposedDate}</span>
                  </div>
                  {request.message && (
                    <div className="booking-info-row">
                      <span className="booking-label">📝 留言：</span>
                      <span className="booking-value">{request.message}</span>
                    </div>
                  )}
                </div>

                {request.status === 'pending' && (
                  <div className="booking-card-actions">
                    <button
                      className="booking-btn accept"
                      onClick={() => handleAccept(request._id || request.id)}
                    >
                      ✅ 接受
                    </button>
                    <button
                      className="booking-btn reject"
                      onClick={() => handleReject(request._id || request.id)}
                    >
                      ❌ 拒绝
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* 发出的请求 */}
      {activeTab === 'sent' && (
        <div className="booking-list">
          {sentRequests.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📤</span>
              <p>暂无发出的约拍请求</p>
              <small>在开启约拍功能的认证摄影师作品中，可以发起约拍请求</small>
            </div>
          ) : (
            sentRequests.map(request => (
              <div key={request._id || request.id} className="booking-card">
                <div className="booking-card-header">
                  <div className="booking-photographer">
                    <img
                      src={getAvatar(request.photographer)}
                      alt={request.photographer?.username}
                      className="booking-avatar"
                    />
                    <div className="booking-user-info">
                      <span className="booking-user-name">{request.photographer?.username}</span>
                      <span className="booking-date">{formatDate(request.createdAt)}</span>
                    </div>
                  </div>
                  <span className={`booking-status ${getStatusClass(request.status)}`}>
                    {getStatusText(request.status)}
                  </span>
                </div>

                <div className="booking-card-body">
                  <div className="booking-info-row">
                    <span className="booking-label">📷 作品：</span>
                    <span className="booking-value">{request.post?.title}</span>
                  </div>
                  <div className="booking-info-row">
                    <span className="booking-label">📍 期望地点：</span>
                    <span className="booking-value">{request.proposedLocation}</span>
                  </div>
                  <div className="booking-info-row">
                    <span className="booking-label">📅 期望时间：</span>
                    <span className="booking-value">{request.proposedDate}</span>
                  </div>
                  {request.message && (
                    <div className="booking-info-row">
                      <span className="booking-label">📝 留言：</span>
                      <span className="booking-value">{request.message}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div className="booking-tips">
        <h4>💡 约拍说明</h4>
        <ul>
          <li>只有认证摄影师的作品可以发起约拍</li>
          <li>发出约拍请求后，等待摄影师审核</li>
          <li>摄影师接受后，你们可以通过私信沟通细节</li>
          <li>请注意人身和财产安全</li>
        </ul>
      </div>
    </div>
  );
}