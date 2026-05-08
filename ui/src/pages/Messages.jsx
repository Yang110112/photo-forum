import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import '../css/Messages.css';

// 模拟用户数据
const mockUsers = [
  { _id: 'user-1', username: '摄影达人', avatar: '', bio: '热爱风光摄影' },
  { _id: 'user-2', username: '城市猎人', avatar: '', bio: '城市街拍爱好者' },
  { _id: 'user-3', username: '光线大师', avatar: '', bio: '人像摄影师' },
  { _id: 'user-4', username: '星空探索者', avatar: '', bio: '天文摄影师' },
  { _id: 'user-5', username: '自然之子', avatar: '', bio: '野生动物摄影师' },
];

export default function Messages() {
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chats'); // 'chats' | 'friends' | 'discover'
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [conversations, setConversations] = useState([]);
  const [friends, setFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddFriend, setShowAddFriend] = useState(false);

  // 初始化加载数据
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // 从localStorage加载会话和好友数据
    const savedConversations = localStorage.getItem('conversations');
    const savedFriends = localStorage.getItem('friends');

    if (savedConversations) {
      setConversations(JSON.parse(savedConversations));
    }

    if (savedFriends) {
      setFriends(JSON.parse(savedFriends));
    }
  }, [user, navigate]);

  // 保存会话到localStorage
  const saveConversations = (newConversations) => {
    localStorage.setItem('conversations', JSON.stringify(newConversations));
    setConversations(newConversations);
  };

  // 保存好友到localStorage
  const saveFriends = (newFriends) => {
    localStorage.setItem('friends', JSON.stringify(newFriends));
    setFriends(newFriends);
  };

  // 发送消息
  const sendMessage = () => {
    if (!messageText.trim() || !selectedChat) return;

    const newMessage = {
      _id: `msg-${Date.now()}`,
      sender: user.username,
      text: messageText.trim(),
      timestamp: new Date().toISOString(),
      isOwn: true
    };

    const updatedConversations = conversations.map(conv => {
      if (conv.userId === selectedChat.userId) {
        return {
          ...conv,
          messages: [...conv.messages, newMessage],
          lastMessage: newMessage.text,
          lastTime: newMessage.timestamp
        };
      }
      return conv;
    });

    saveConversations(updatedConversations);
    setMessageText('');
  };

  // 添加好友
  const addFriend = (friendUser) => {
    if (friends.find(f => f._id === friendUser._id)) {
      alert('已经是好友了');
      return;
    }

    const newFriend = {
      ...friendUser,
      addedAt: new Date().toISOString()
    };

    saveFriends([...friends, newFriend]);

    // 同时创建会话
    const newConversation = {
      userId: friendUser._id,
      username: friendUser.username,
      avatar: friendUser.avatar,
      messages: [],
      lastMessage: '',
      lastTime: null
    };

    saveConversations([...conversations, newConversation]);
    setShowAddFriend(false);
    alert(`已添加 ${friendUser.username} 为好友`);
  };

  // 开始聊天
  const startChat = (friendUser) => {
    // 检查是否已有会话
    const existingConv = conversations.find(c => c.userId === friendUser._id);
    if (!existingConv) {
      const newConversation = {
        userId: friendUser._id,
        username: friendUser.username,
        avatar: friendUser.avatar,
        messages: [],
        lastMessage: '',
        lastTime: null
      };
      saveConversations([...conversations, newConversation]);
    }

    const conv = conversations.find(c => c.userId === friendUser._id) || {
      userId: friendUser._id,
      username: friendUser.username,
      avatar: friendUser.avatar,
      messages: []
    };

    setSelectedChat(conv);
    setActiveTab('chats');
  };

  // 删除好友
  const removeFriend = (friendId) => {
    if (!confirm('确定要删除该好友吗？')) return;

    const updatedFriends = friends.filter(f => f._id !== friendId);
    saveFriends(updatedFriends);

    // 同时删除会话
    const updatedConversations = conversations.filter(c => c.userId !== friendId);
    saveConversations(updatedConversations);

    if (selectedChat?.userId === friendId) {
      setSelectedChat(null);
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

  // 过滤搜索结果
  const filteredUsers = mockUsers.filter(u =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="messages-container">
      {/* 侧边栏 */}
      <div className="messages-sidebar">
        <div className="sidebar-header">
          <h2>💬 消息</h2>
          <button className="add-friend-btn" onClick={() => setShowAddFriend(true)}>
            ＋ 添加好友
          </button>
        </div>

        {/* 标签切换 */}
        <div className="tab-switch">
          <button
            className={`tab-btn ${activeTab === 'chats' ? 'active' : ''}`}
            onClick={() => setActiveTab('chats')}
          >
            💬 聊天
          </button>
          <button
            className={`tab-btn ${activeTab === 'friends' ? 'active' : ''}`}
            onClick={() => setActiveTab('friends')}
          >
            👥 好友
          </button>
          <button
            className={`tab-btn ${activeTab === 'discover' ? 'active' : ''}`}
            onClick={() => setActiveTab('discover')}
          >
            🔍 发现
          </button>
        </div>

        {/* 聊天列表 */}
        {activeTab === 'chats' && (
          <div className="chat-list">
            {conversations.length === 0 ? (
              <div className="empty-state">
                <p>暂无聊天记录</p>
                <small>开始添加好友聊天吧</small>
              </div>
            ) : (
              conversations.map(conv => (
                <div
                  key={conv.userId}
                  className={`chat-item ${selectedChat?.userId === conv.userId ? 'active' : ''}`}
                  onClick={() => setSelectedChat(conv)}
                >
                  <img
                    src={conv.avatar || `https://ui-avatars.com/api/?name=${conv.username}&background=random&color=fff`}
                    alt={conv.username}
                    className="chat-avatar"
                  />
                  <div className="chat-info">
                    <div className="chat-header-row">
                      <span className="chat-name">{conv.username}</span>
                      <span className="chat-time">{formatTime(conv.lastTime)}</span>
                    </div>
                    <p className="chat-preview">{conv.lastMessage || '开始聊天吧...'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 好友列表 */}
        {activeTab === 'friends' && (
          <div className="friends-list">
            {friends.length === 0 ? (
              <div className="empty-state">
                <p>暂无好友</p>
                <small>去发现页添加好友吧</small>
              </div>
            ) : (
              friends.map(friend => (
                <div key={friend._id} className="friend-item">
                  <img
                    src={friend.avatar || `https://ui-avatars.com/api/?name=${friend.username}&background=random&color=fff`}
                    alt={friend.username}
                    className="friend-avatar"
                  />
                  <div className="friend-info">
                    <span className="friend-name">{friend.username}</span>
                    <span className="friend-bio">{friend.bio}</span>
                  </div>
                  <div className="friend-actions">
                    <button className="chat-btn" onClick={() => startChat(friend)}>💬</button>
                    <button className="remove-btn" onClick={() => removeFriend(friend._id)}>✕</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 发现用户 */}
        {activeTab === 'discover' && (
          <div className="discover-list">
            <div className="search-box">
              <input
                type="text"
                placeholder="搜索用户..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {filteredUsers.map(u => (
              <div key={u._id} className="user-item">
                <img
                  src={u.avatar || `https://ui-avatars.com/api/?name=${u.username}&background=random&color=fff`}
                  alt={u.username}
                  className="user-avatar"
                />
                <div className="user-info">
                  <span className="user-name">{u.username}</span>
                  <span className="user-bio">{u.bio}</span>
                </div>
                {friends.find(f => f._id === u._id) ? (
                  <span className="already-friend">已添加</span>
                ) : (
                  <button className="add-btn" onClick={() => addFriend(u)}>＋</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 聊天区域 */}
      <div className="chat-area">
        {selectedChat ? (
          <>
            <div className="chat-header">
              <img
                src={selectedChat.avatar || `https://ui-avatars.com/api/?name=${selectedChat.username}&background=random&color=fff`}
                alt={selectedChat.username}
                className="chat-header-avatar"
              />
              <div>
                <h3>{selectedChat.username}</h3>
                <span className="online-status">在线</span>
              </div>
            </div>

            <div className="messages-list">
              {selectedChat.messages.length === 0 ? (
                <div className="no-messages">
                  <p>还没有消息，开始聊天吧！</p>
                </div>
              ) : (
                selectedChat.messages.map(msg => (
                  <div key={msg._id} className={`message ${msg.isOwn ? 'own' : ''}`}>
                    <div className="message-bubble">
                      <p>{msg.text}</p>
                      <span className="message-time">{formatTime(msg.timestamp)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="message-input-area">
              <input
                type="text"
                placeholder="输入消息..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button onClick={sendMessage} disabled={!messageText.trim()}>
                发送
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
        <div className="modal-overlay" onClick={() => setShowAddFriend(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>添加好友</h3>
            <input
              type="text"
              placeholder="搜索用户名..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <div className="modal-user-list">
              {filteredUsers.map(u => (
                <div key={u._id} className="modal-user-item">
                  <img
                    src={u.avatar || `https://ui-avatars.com/api/?name=${u.username}&background=random&color=fff`}
                    alt={u.username}
                    className="modal-user-avatar"
                  />
                  <span>{u.username}</span>
                  {friends.find(f => f._id === u._id) ? (
                    <span className="already-added">已是好友</span>
                  ) : (
                    <button onClick={() => addFriend(u)}>添加</button>
                  )}
                </div>
              ))}
            </div>
            <button className="modal-close-btn" onClick={() => setShowAddFriend(false)}>
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
