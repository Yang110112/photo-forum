import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
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
  getConversations, getConversation,
  broadcastMessage, getBroadcastHistory
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

  // 广播通知状态（仅系统官方账号）
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastContent, setBroadcastContent] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastHistory, setBroadcastHistory] = useState([]);

  // ★ 在线状态 & typing 状态 ★
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUser, setTypingUser] = useState(null); // { senderId, username }

  const messagesEndRef = useRef(null);
  const searchTimerRef = useRef(null);
  const socketRef = useRef(null); // Socket.io 引用
  const typingTimerRef = useRef(null); // typing 超时定时器

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

  // ======== WebSocket 连接 (Socket.io) ========
  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    socketRef.current = socket;

    // 连接后用 JWT 认证
    socket.on('connect', () => {
      socket.emit('auth', { token });
    });

    socket.on('auth-success', () => {
      console.log('[WS] 认证成功');
      // 请求在线好友列表
      socket.emit('get-online-users');
    });

    socket.on('auth-error', (data) => {
      antMessage.error(data.message || 'WebSocket认证失败');
    });

    // ★ 实时接收新消息（WebSocket推送，替代轮询）★
    socket.on('new-message', (msg) => {
      // 如果消息属于当前打开的会话，追加到聊天列表
      if (selectedChat) {
        const convId = [user._id, msg.sender._id].sort().join('_');
        if (convId === selectedChat.conversationId) {
          setChatMessages(prev => [...prev, msg]);
        }
      }
      // 刷新会话列表
      loadConversations();
      antMessage.info(`新消息: ${msg.sender.username}`, {
        description: msg.content.length > 50 ? msg.content.slice(0, 50) + '...' : msg.content
      });
    });

    // ★ 消息发送确认（WebSocket 服务器回执）★
    socket.on('message-sent', (msg) => {
      setChatMessages(prev => [...prev, msg]);
      setMessageText('');
      setSendingMsg(false);
      loadConversations();
    });

    // ★ 已读回执（对方已读我的消息）★
    socket.on('message-read', (data) => {
      // 按会话批量标记已读
      if (data.conversationId && selectedChat?.conversationId === data.conversationId) {
        setChatMessages(prev =>
          prev.map(m => (!m.isOwn && !m.isRead ? { ...m, isRead: true } : m))
        );
      }
    });

    // ★ 在线用户列表（初始加载）★
    socket.on('online-users', (data) => {
      setOnlineUsers(new Set(data.userIds || []));
    });

    // ★ 好友上线通知 ★
    socket.on('user-online', (data) => {
      setOnlineUsers(prev => new Set([...prev, data.userId]));
    });

    // ★ 好友离线通知 ★
    socket.on('user-offline', (data) => {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        next.delete(data.userId);
        return next;
      });
    });

    // ★ 对方正在输入 ★
    socket.on('user-typing', (data) => {
      if (selectedChat && data.senderId === selectedChat.friend._id) {
        setTypingUser({ senderId: data.senderId });
      }
    });

    // ★ 对方停止输入 ★
    socket.on('user-stop-typing', (data) => {
      if (typingUser?.senderId === data.senderId) {
        setTypingUser(null);
      }
    });

    // ★ 会话列表实时更新 ★
    socket.on('conversation-update', (data) => {
      setConversations(prev => {
        const existing = prev.find(c => c.conversationId === data.conversationId);
        if (existing) {
          return [
            ...prev.filter(c => c.conversationId !== data.conversationId),
            {
              ...existing,
              lastMessage: data.lastMessage,
              lastTime: data.lastTime,
              unreadCount: data.unreadCount !== undefined
                ? existing.unreadCount + data.unreadCount
                : existing.unreadCount
            }
          ].sort((a, b) => new Date(b.lastTime) - new Date(a.lastTime));
        }
        return prev;
      });
    });

    // 错误处理
    socket.on('error', (data) => {
      antMessage.error(data.message || 'WebSocket通信失败');
      setSendingMsg(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [user, selectedChat, typingUser]);

  // ★ 通过 WebSocket 发送消息（替代原来的 HTTP POST）★
  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedChat || sendingMsg) return;
    if (!socketRef.current?.connected) {
      antMessage.error('WebSocket未连接，请稍后重试');
      return;
    }

    // 停止 typing 状态
    socketRef.current.emit('stop-typing', { receiverId: selectedChat.friend._id });
    setSendingMsg(true);
    socketRef.current.emit('send-message', {
      receiverId: selectedChat.friend._id,
      content: messageText.trim()
    });
  };

  // ★ 输入中事件 — 发送 typing 状态给对方 ★
  const handleInputChange = (e) => {
    const val = e.target.value;
    setMessageText(val);

    if (!socketRef.current?.connected || !selectedChat) return;
    if (!val.trim()) {
      socketRef.current.emit('stop-typing', { receiverId: selectedChat.friend._id });
      return;
    }
    socketRef.current.emit('typing', { receiverId: selectedChat.friend._id });
    // 3秒无输入自动停止
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socketRef.current?.emit('stop-typing', { receiverId: selectedChat.friend._id });
    }, 3000);
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
    const conversationId = [user._id, friend._id].sort().join('_');
    setSelectedChat({ conversationId, friend, lastMessage: '', lastTime: null, unreadCount: 0 });
    setTypingUser(null);

    // ★ 本地立即清零未读数 ★
    setConversations(prev =>
        prev.map(c => c.conversationId === conversationId ? { ...c, unreadCount: 0 } : c)
    );

    loadChatMessages(friend._id);
    setActiveTab('chats');
    if (socketRef.current?.connected) {
        socketRef.current.emit('message-read', { conversationId });
    }
};

  // 选中会话
const handleSelectConversation = async (conv) => {
    setSelectedChat(conv);
    setActiveTab('chats');
    setTypingUser(null);

    // ★ 本地立即清零未读数 ★
    setConversations(prev =>
        prev.map(c => c.conversationId === conv.conversationId ? { ...c, unreadCount: 0 } : c)
    );

    await loadChatMessages(conv.friend._id);
    if (conv.conversationId && socketRef.current?.connected) {
        socketRef.current.emit('message-read', { conversationId: conv.conversationId });
    }
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
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  const getAvatar = (avatarUrl, username) => {
  if (!avatarUrl) return `https://ui-avatars.com/api/?name=${encodeURIComponent(username || 'U')}&background=random&color=fff`;
  if (avatarUrl.startsWith('/uploads')) return `${BASE_URL}${avatarUrl}`;
  return avatarUrl;
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

  // 判断当前用户是否为系统官方
  const isSystemAccount = user?.isSystem || false;

  // 发送广播通知
  const handleBroadcast = async () => {
    if (!broadcastContent.trim()) {
      antMessage.warning('请输入通知内容');
      return;
    }
    if (!window.confirm(`确定要向所有用户发送广播通知吗？\n\n标题：${broadcastTitle || '系统通知'}\n内容：${broadcastContent.trim().slice(0, 50)}...`)) {
      return;
    }
    setBroadcasting(true);
    try {
      const res = await broadcastMessage({
        title: broadcastTitle.trim() || undefined,
        content: broadcastContent.trim()
      });
      antMessage.success(res.data.message || `通知已发送给 ${res.data.data.recipientCount} 位用户`);
      setBroadcastTitle('');
      setBroadcastContent('');
      setShowBroadcast(false);
      loadBroadcastHistory();
      loadConversations(); // 刷新会话列表
    } catch (err) {
      antMessage.error(err.response?.data?.message || '广播发送失败');
    } finally {
      setBroadcasting(false);
    }
  };

  // 加载广播历史
  const loadBroadcastHistory = useCallback(async () => {
    if (!isSystemAccount) return;
    try {
      const res = await getBroadcastHistory();
      setBroadcastHistory(res.data.data.broadcasts || []);
    } catch (err) {
      console.error('加载广播历史失败', err);
    }
  }, [isSystemAccount]);

  // 初始化加载广播历史
  useEffect(() => {
    if (isSystemAccount) {
      loadBroadcastHistory();
    }
  }, [isSystemAccount, loadBroadcastHistory]);

  // 好友请求徽章数
  const pendingCount = pendingRequests.length;

  return (
    <div className="messages-container">
      {/* 侧边栏 */}
      <div className="messages-sidebar">
        <div className="sidebar-header">
          <h2>消息</h2>
          <div className="sidebar-header-actions">
            {isSystemAccount && (
              <button className="broadcast-btn" onClick={() => setShowBroadcast(true)}>
                📢 广播通知
              </button>
            )}
            <button className="add-friend-btn" onClick={() => {setShowAddFriend(true);document.body.style.overflow = 'hidden'
            }}>
              + 添加好友
            </button>
          </div>
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
                  <div className="chat-avatar-wrapper">
                    <img
                      src={getAvatar(conv.friend.avatar, conv.friend.username)}
                      alt={conv.friend.username}
                      className="chat-avatar"
                      onError={(e) => { e.target.src = getAvatar('', conv.friend.username); }}
                    />
                    {onlineUsers.has(conv.friend._id) && <span className="online-dot"></span>}
                  </div>
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
                    <div className="friend-avatar-wrapper">
                      <img
                        src={getAvatar(friend.avatar, friend.username)}
                        alt={friend.username}
                        className="friend-avatar"
                        onError={(e) => { e.target.src = getAvatar('', friend.username); }}
                      />
                      {onlineUsers.has(friend._id) && <span className="online-dot"></span>}
                    </div>
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
              <div className="chat-header-avatar-wrapper">
                <img
                  src={getAvatar(selectedChat.friend?.avatar, selectedChat.friend?.username)}
                  alt={selectedChat.friend?.username}
                  className="chat-header-avatar"
                />
                {onlineUsers.has(selectedChat.friend?._id) && <span className="online-dot online-dot-lg"></span>}
              </div>
              <div>
                <h3>
                  {selectedChat.friend?.username}
                  {selectedChat.friend?.isSystem && <span className="system-tag">官方</span>}
                </h3>
                {typingUser && typingUser.senderId === selectedChat.friend?._id ? (
                  <span className="typing-status">正在输入<span className="typing-dots"><span>.</span><span>.</span><span>.</span></span></span>
                ) : onlineUsers.has(selectedChat.friend?._id) ? (
                  <span className="online-status online">在线</span>
                ) : (
                  <span className="online-status offline">离线</span>
                )}
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
                onChange={handleInputChange}
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

      {/* 广播通知弹窗（仅系统官方） */}
      {showBroadcast && (
        <div className="modal-overlay" onClick={() => setShowBroadcast(false)}>
          <div className="modal-content broadcast-modal" onClick={e => e.stopPropagation()}>
            <div className="broadcast-modal-header">
              <h3>📢 一键广播通知</h3>
              <small>通知将发送给所有用户的私信中</small>
            </div>
            <div className="broadcast-form">
              <label>通知标题（可选）</label>
              <input
                type="text"
                placeholder="如：系统维护通知、新功能上线..."
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                maxLength={100}
              />
              <label>通知内容 *</label>
              <textarea
                placeholder="输入要广播给所有用户的通知内容..."
                value={broadcastContent}
                onChange={(e) => setBroadcastContent(e.target.value)}
                maxLength={5000}
                rows={6}
              />
              <div className="broadcast-char-count">{broadcastContent.length}/5000</div>
              <div className="broadcast-actions">
                <button className="modal-close-btn" onClick={() => setShowBroadcast(false)}>取消</button>
                <button
                  className="broadcast-send-btn"
                  onClick={handleBroadcast}
                  disabled={!broadcastContent.trim() || broadcasting}
                >
                  {broadcasting ? '发送中...' : '📢 发送给所有用户'}
                </button>
              </div>
            </div>

            {/* 广播历史 */}
            {broadcastHistory.length > 0 && (
              <div className="broadcast-history">
                <div className="broadcast-history-header">历史广播</div>
                {broadcastHistory.map(item => (
                  <div key={item._id} className="broadcast-history-item">
                    <div className="broadcast-history-content">
                      <p>{item.content}</p>
                    </div>
                    <div className="broadcast-history-meta">
                      <span>送达 {item.recipientCount} 人</span>
                      <span>{formatTime(item.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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
            <button className="modal-close-btn" onClick={() => { 
              setShowAddFriend(false); 
              document.body.style.overflow = ''; // 加这行
              setSearchQuery(''); 
              setSearchResults([]); 
            }}>
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
