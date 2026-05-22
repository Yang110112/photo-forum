import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { message as antMessage } from 'antd';
import {
  getFriends, getPendingRequests, sendFriendRequest,
  acceptFriendRequest, rejectFriendRequest, removeFriend,
  searchUsers
} from '../api/friends';
import {
  followUser, unfollowUser, getFollowStats
} from '../api/follows';
import {
  getConversations, getConversation, sendMessage as sendMsg
} from '../api/messages';
import '../css/Messages.css';

export default function Messages() {
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();

  // 状态管理
  const [activeTab, setActiveTab] = useState('chats');
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);

  const messagesEndRef = useRef(null);
  const searchTimerRef = useRef(null);

  // 加载好友列表
  const loadFriends = useCallback(async () => {
    try {
      const res = await getFriends();
      setFriends(res.data.data.friends || []);
    } catch (err) {
      console.error('加载好友列表失败', err);
    }
  }, []);

  // 加载好友请求
  const loadPendingRequests = useCallback(async () => {
    try {
      const res = await getPendingRequests();
      setPendingRequests(res.data.data.requests || []);
    } catch (err) {
      console.error('加载好友请求失败', err);
    }
  }, []);

  // 加载会话列表
  const loadConversations = useCallback(async () => {
    try {
      const res = await getConversations();
      setConversations(res.data.data.conversations || []);
    } catch (err) {
      console.error('加载会话列表失败', err);
    }
  }, []);

  // 加载会话消息
  const loadChatMessages = useCallback(async (friendId) => {
    try {
      const res = await getConversation(friendId);
      setChatMessages(res.data.data.messages || []);
    } catch (err) {
      console.error('加载消息失败', err);
    }
  }, []);

  // 初始化
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadFriends();
    loadPendingRequests();
    loadConversations();
  }, [user, navigate, loadFriends, loadPendingRequests, loadConversations]);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // 搜索用户
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(async () => {
      try {
        const res = await searchUsers(searchQuery);
        setSearchResults(res.data.data.users || []);
      } catch (err) {
        console.error('搜索失败', err);
      }
    }, 300);
    return () => clearTimeout(searchTimerRef.current);
  }, [searchQuery]);

  // 发送消息
  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedChat || sendingMsg) return;

    setSendingMsg(true);
    try {
      await sendMsg({
        receiverId: selectedChat.friend._id,
        content: messageText.trim()
      });

      // 乐观更新
      const newMsg = {
        _id: `temp-${Date.now()}`,
        sender: { _id: user._id, username: user.username, avatar: user.avatar },
        content: messageText.trim(),
        isRead: true,
        createdAt: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, newMsg]);
      setMessageText('');
      loadConversations();
    } catch (err) {
      antMessage.error(err.response?.data?.message || '发送失败');
    } finally {
      setSendingMsg(false);
    }
  };

  // 发送好友请求
  const handleSendFriendRequest = async (toUserId, msg = '') => {
    try {
      await sendFriendRequest({ toUserId, message: msg });
      antMessage.success('好友请求已发送');
      if (searchQuery) {
        const res = await searchUsers(searchQuery);
        setSearchResults(res.data.data.users || []);
      }
    } catch (err) {
      antMessage.error(err.response?.data?.message || '发送失败');
    }
  };

  // 接受好友请求
  const handleAcceptRequest = async (requestId) => {
    try {
      await acceptFriendRequest(requestId);
      antMessage.success('已接受好友请求');
      loadPendingRequests();
      loadFriends();
    } catch (err) {
      antMessage.error(err.response?.data?.message || '操作失败');
    }
  };

  // 拒绝好友请求
  const handleRejectRequest = async (requestId) => {
    try {
      await rejectFriendRequest(requestId);
      antMessage.success('已拒绝好友请求');
      loadPendingRequests();
    } catch (err) {
      antMessage.error(err.response?.data?.message || '操作失败');
    }
  };

  // 删除好友
  const handleRemoveFriend = async (friendId) => {
    if (!window.confirm('确定要删除该好友吗？')) return;
    try {
      await removeFriend(friendId);
      antMessage.success('已删除好友');
      loadFriends();
      loadConversations();
      if (selectedChat?.friend?._id === friendId) {
        setSelectedChat(null);
        setChatMessages([]);
      }
    } catch (err) {
      antMessage.error(err.response?.data?.message || '操作失败');
    }
  };

  // 开始聊天
  const handleStartChat = (friend) => {
    setSelectedChat({
      conversationId: null,
      friend,
      lastMessage: '',
      lastTime: null,
      unreadCount: 0
    });
    loadChatMessages(friend._id);
    setActiveTab('chats');
  };

  // 选中会话
  const handleSelectConversation = async (conv) => {
    setSelectedChat(conv);
    setActiveTab('chats');
    await loadChatMessages(conv.friend._id);
    // 刷新会话列表清除未读
    loadConversations();
  };

  // 关注/取消关注
  const handleToggleFollow = async (targetUserId, isFollowing) => {
    try {
      if (isFollowing) {
        await unfollowUser(targetUserId);
        antMessage.success('已取消关注');
      } else {
        await followUser(targetUserId);
        antMessage.success('关注成功');
      }
      // 刷新搜索结果
      if (searchQuery) {
        const res = await searchUsers(searchQuery);
        setSearchResults(res.data.data.users || []);
      }
    } catch (err) {
      antMessage.error(err.response?.data?.message || '操作失败');
    }
  };

  // 格式化时间
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

  // 获取头像
  const getAvatar = (avatarUrl, username) => {
    if (avatarUrl && !avatarUrl.startsWith('/uploads')) return avatarUrl;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(username || 'U')}&background=random&color=fff`;
  };

  // 获取好友状态文本
  const getFriendStatusText = (status) => {
    const map = {
      'none': '添加好友',
      'pending_sent': '已申请',
      'pending_received': '待确认',
      'accepted': '已是好友'
    };
    return map[status] || status;
  };

  // 好友请求徽章数
  const pendingCount = pendingRequests.length;

  return (
    <div className="messages-container">
      {/* 侧边栏 */}
      <div className="messages-sidebar">
        <div className="sidebar-header">
          <h2>消息</h2>
          <button className="add-friend-btn" onClick={() => setShowAddFriend(true)}>
            + 添加好友
          </button>
        </div>

        {/* 标签切换 */}
        <div className="tab-switch">
          <button
            className={`tab-btn ${activeTab === 'chats' ? 'active' : ''}`}
            onClick={() => setActiveTab('chats')}
          >
            聊天
          </button>
          <button
            className={`tab-btn ${activeTab === 'friends' ? 'active' : ''}`}
            onClick={() => setActiveTab('friends')}
          >
            好友
            {pendingCount > 0 && <span className="pending-badge">{pendingCount}</span>}
          </button>
          <button
            className={`tab-btn ${activeTab === 'discover' ? 'active' : ''}`}
            onClick={() => setActiveTab('discover')}
          >
            发现
          </button>
        </div>

        {/* 聊天列表 */}
        {activeTab === 'chats' && (
          <div className="chat-list">
            {conversations.length === 0 ? (
              <div className="empty-state">
                <p>暂无聊天记录</p>
                <small>添加好友开始聊天吧</small>
              </div>
            ) : (
              conversations.map(conv => (
                <div
                  key={conv.conversationId || conv.friend._id}
                  className={`chat-item ${selectedChat?.friend?._id === conv.friend._id ? 'active' : ''}`}
                  onClick={() => handleSelectConversation(conv)}
                >
                  <img
                    src={getAvatar(conv.friend.avatar, conv.friend.username)}
                    alt={conv.friend.username}
                    className="chat-avatar"
                    onError={(e) => { e.target.src = getAvatar('', conv.friend.username); }}
                  />
                  <div className="chat-info">
                    <div className="chat-header-row">
                      <span className="chat-name">{conv.friend.username}</span>
                      <span className="chat-time">{formatTime(conv.lastTime)}</span>
                    </div>
                    <p className="chat-preview">{conv.lastMessage || '开始聊天吧...'}</p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="unread-badge">{conv.unreadCount}</span>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* 好友列表 */}
        {activeTab === 'friends' && (
          <div className="friends-list">
            {/* 待处理请求 */}
            {pendingRequests.length > 0 && (
              <div className="friend-requests-section">
                <div className="requests-header">好友请求 ({pendingCount})</div>
                {pendingRequests.map(req => (
                  <div key={req._id} className="friend-request-item">
                    <img
                      src={getAvatar(req.fromUser?.avatar, req.fromUser?.username)}
                      alt={req.fromUser?.username}
                      className="friend-avatar"
                    />
                    <div className="friend-info">
                      <span className="friend-name">{req.fromUser?.username}</span>
                      {req.message && <span className="friend-bio">{req.message}</span>}
                    </div>
                    <div className="friend-actions">
                      <button className="accept-btn" onClick={() => handleAcceptRequest(req._id)}>接受</button>
                      <button className="reject-btn" onClick={() => handleRejectRequest(req._id)}>拒绝</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 已有好友 */}
            {friends.length === 0 && pendingRequests.length === 0 ? (
              <div className="empty-state">
                <p>暂无好友</p>
                <small>去发现页添加好友吧</small>
              </div>
            ) : friends.length > 0 && (
              <>
                {pendingRequests.length > 0 && <div className="requests-header">我的好友</div>}
                {friends.map(friend => (
                  <div key={friend._id} className="friend-item">
                    <img
                      src={getAvatar(friend.avatar, friend.username)}
                      alt={friend.username}
                      className="friend-avatar"
                      onError={(e) => { e.target.src = getAvatar('', friend.username); }}
                    />
                    <div className="friend-info">
                      <span className="friend-name">
                        {friend.username}
                        {friend.isSystem && <span className="system-tag">官方</span>}
                      </span>
                      <span className="friend-bio">{friend.bio || ''}</span>
                    </div>
                    <div className="friend-actions">
                      <button className="chat-btn" onClick={() => handleStartChat(friend)} title="发消息">
                        💬
                      </button>
                      {!friend.isSystem && (
                        <button className="remove-btn" onClick={() => handleRemoveFriend(friend._id)} title="删除好友">
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* 发现用户 */}
        {activeTab === 'discover' && (
          <div className="discover-list">
            <div className="search-box">
              <input
                type="text"
                placeholder="搜索用户名或邮箱..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {searchQuery && searchResults.length === 0 && (
              <div className="empty-state">
                <p>未找到用户</p>
                <small>试试其他关键词</small>
              </div>
            )}
            {searchResults.map(u => (
              <div key={u._id} className="user-item">
                <img
                  src={getAvatar(u.avatar, u.username)}
                  alt={u.username}
                  className="user-avatar"
                />
                <div className="user-info">
                  <span className="user-name">{u.username}</span>
                  <span className="user-bio">{u.bio || ''}</span>
                </div>
                <div className="discover-actions">
                  {/* 关注按钮 */}
                  <button
                    className={`follow-btn ${u.isFollowing ? 'following' : ''}`}
                    onClick={() => handleToggleFollow(u._id, u.isFollowing)}
                  >
                    {u.isFollowing ? '已关注' : '关注'}
                  </button>
                  {/* 好友按钮 */}
                  {u.friendStatus === 'accepted' ? (
                    <span className="already-friend">好友</span>
                  ) : u.friendStatus === 'pending_sent' ? (
                    <span className="already-friend">已申请</span>
                  ) : u.friendStatus === 'pending_received' ? (
                    <button className="accept-btn-small" onClick={() => {
                      const req = pendingRequests.find(r => r.fromUser?._id === u._id);
                      if (req) handleAcceptRequest(req._id);
                    }}>接受</button>
                  ) : (
                    <button className="add-btn-small" onClick={() => handleSendFriendRequest(u._id)}>+好友</button>
                  )}
                </div>
              </div>
            ))}
            {!searchQuery && (
              <div className="empty-state">
                <p>搜索用户</p>
                <small>输入用户名或邮箱搜索</small>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 聊天区域 */}
      <div className="chat-area">
        {selectedChat ? (
          <>
            <div className="chat-header">
              <img
                src={getAvatar(selectedChat.friend?.avatar, selectedChat.friend?.username)}
                alt={selectedChat.friend?.username}
                className="chat-header-avatar"
              />
              <div>
                <h3>
                  {selectedChat.friend?.username}
                  {selectedChat.friend?.isSystem && <span className="system-tag">官方</span>}
                </h3>
                <span className="online-status">在线</span>
              </div>
            </div>

            <div className="messages-list">
              {chatMessages.length === 0 ? (
                <div className="no-messages">
                  <p>还没有消息，开始聊天吧！</p>
                </div>
              ) : (
                chatMessages.map(msg => {
                  const isOwn = msg.sender?._id === user?._id || msg.sender === user?._id;
                  return (
                    <div key={msg._id} className={`message ${isOwn ? 'own' : ''}`}>
                      <div className="message-bubble">
                        <p style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                        <span className="message-time">{formatTime(msg.createdAt)}</span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="message-input-area">
              <input
                type="text"
                placeholder="输入消息..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                disabled={sendingMsg}
              />
              <button onClick={handleSendMessage} disabled={!messageText.trim() || sendingMsg}>
                {sendingMsg ? '发送中...' : '发送'}
              </button>
            </div>
          </>
        ) : (
          <div className="no-chat-selected">
            <div className="no-chat-icon">💬</div>
            <h3>选择一个好友开始聊天</h3>
            <p>在左侧选择会话或添加新好友</p>
          </div>
        )}
      </div>

      {/* 添加好友弹窗 */}
      {showAddFriend && (
        <div className="modal-overlay" onClick={() => { setShowAddFriend(false); setSearchQuery(''); setSearchResults([]); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>添加好友</h3>
            <input
              type="text"
              placeholder="搜索用户名或邮箱..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <div className="modal-user-list">
              {searchQuery && searchResults.length === 0 && (
                <div className="empty-state"><p>未找到用户</p></div>
              )}
              {searchResults.map(u => (
                <div key={u._id} className="modal-user-item">
                  <img
                    src={getAvatar(u.avatar, u.username)}
                    alt={u.username}
                    className="modal-user-avatar"
                  />
                  <div className="modal-user-info">
                    <span>{u.username}</span>
                    <small>{u.bio || ''}</small>
                  </div>
                  {u.friendStatus === 'accepted' ? (
                    <span className="already-added">已是好友</span>
                  ) : u.friendStatus === 'pending_sent' ? (
                    <span className="already-added">已申请</span>
                  ) : (
                    <button onClick={() => handleSendFriendRequest(u._id)}>添加</button>
                  )}
                </div>
              ))}
              {!searchQuery && (
                <div className="empty-state"><p>输入关键词搜索用户</p></div>
              )}
            </div>
            <button className="modal-close-btn" onClick={() => { setShowAddFriend(false); setSearchQuery(''); setSearchResults([]); }}>
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
