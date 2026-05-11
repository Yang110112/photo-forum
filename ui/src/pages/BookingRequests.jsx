import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import '../css/BookingRequests.css';

export default function BookingRequests() {
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('received');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // 加载约拍请求数据
    const savedRequests = JSON.parse(localStorage.getItem('bookingRequests') || '{}');

    // 我发出的请求
    setSentRequests(savedRequests.sent || []);

    // 我收到的请求
    setReceivedRequests(savedRequests.received || []);
  }, [user, navigate]);

  const handleAccept = (requestId) => {
    const savedRequests = JSON.parse(localStorage.getItem('bookingRequests') || '{}');

    // 更新收到请求的状态
    const updatedReceived = savedRequests.received.map(r => {
      if (r.id === requestId) {
        return { ...r, status: 'accepted' };
      }
      return r;
    });

    // 更新发出请求的状态（发送者那边）
    const updatedSent = savedRequests.sent.map(r => {
      if (r.id === requestId) {
        return { ...r, status: 'accepted' };
      }
      return r;
    });

    localStorage.setItem('bookingRequests', JSON.stringify({
      sent: updatedSent,
      received: updatedReceived
    }));

    setReceivedRequests(updatedReceived);
    alert('已接受约拍请求！');
  };

  const handleReject = (requestId) => {
    const savedRequests = JSON.parse(localStorage.getItem('bookingRequests') || '{}');

    const updatedReceived = savedRequests.received.map(r => {
      if (r.id === requestId) {
        return { ...r, status: 'rejected' };
      }
      return r;
    });

    const updatedSent = savedRequests.sent.map(r => {
      if (r.id === requestId) {
        return { ...r, status: 'rejected' };
      }
      return r;
    });

    localStorage.setItem('bookingRequests', JSON.stringify({
      sent: updatedSent,
      received: updatedSent
    }));

    setReceivedRequests(updatedReceived);
    alert('已拒绝约拍请求');
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

  return (
    <div className="booking-container">
      <h2 className="booking-title">📅 我的约拍</h2>

      {/* 切换标签 */}
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
              <div key={request.id} className="booking-card">
                <div className="booking-card-header">
                  <div className="booking-user">
                    <img
                      src={request.requesterAvatar || `https://ui-avatars.com/api/?name=${request.requesterName}&background=random`}
                      alt={request.requesterName}
                      className="booking-avatar"
                    />
                    <div className="booking-user-info">
                      <span className="booking-user-name">{request.requesterName}</span>
                      <span className="booking-date">{formatDate(request.createdAt)}</span>
                    </div>
                  </div>
                  <span className={`booking-status ${getStatusClass(request.status)}`}>
                    {getStatusText(request.status)}
                  </span>
                </div>

                <div className="booking-card-body">
                  <div className="booking-info-row">
                    <span className="booking-label">📍 拍摄地点：</span>
                    <span className="booking-value">{request.proposedLocation}</span>
                  </div>
                  <div className="booking-info-row">
                    <span className="booking-label">📅 期望时间：</span>
                    <span className="booking-value">{request.proposedDate}</span>
                  </div>
                  <div className="booking-info-row">
                    <span className="booking-label">📝 留言：</span>
                    <span className="booking-value">{request.message}</span>
                  </div>
                </div>

                {request.status === 'pending' && (
                  <div className="booking-card-actions">
                    <button
                      className="booking-btn accept"
                      onClick={() => handleAccept(request.id)}
                    >
                      ✅ 接受
                    </button>
                    <button
                      className="booking-btn reject"
                      onClick={() => handleReject(request.id)}
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
              <div key={request.id} className="booking-card">
                <div className="booking-card-header">
                  <div className="booking-photographer">
                    <img
                      src={request.photographerAvatar || `https://ui-avatars.com/api/?name=${request.photographerName}&background=random`}
                      alt={request.photographerName}
                      className="booking-avatar"
                    />
                    <div className="booking-user-info">
                      <span className="booking-user-name">{request.photographerName}</span>
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
                    <span className="booking-value">{request.postTitle}</span>
                  </div>
                  <div className="booking-info-row">
                    <span className="booking-label">📍 期望地点：</span>
                    <span className="booking-value">{request.proposedLocation}</span>
                  </div>
                  <div className="booking-info-row">
                    <span className="booking-label">📅 期望时间：</span>
                    <span className="booking-value">{request.proposedDate}</span>
                  </div>
                  <div className="booking-info-row">
                    <span className="booking-label">📝 留言：</span>
                    <span className="booking-value">{request.message}</span>
                  </div>
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