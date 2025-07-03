import React, { useEffect, useRef, useState, useCallback } from 'react';
import socket from '../socket';
import axios from 'axios';
import './ChatWindow.css';

function ChatWindow({ user }) {
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState('');
  const [typingStatus, setTypingStatus] = useState(false);
  const [showNewChatForm, setShowNewChatForm] = useState(false);
  const [newChatUsername, setNewChatUsername] = useState('');
  const chatBoxRef = useRef(null);
  const selectedUserRef = useRef(null);


  const loadConnections = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/users/${user.id}`);
      setFriends(res.data.friends || []);
      setFriendRequests(res.data.friendRequests || []);
    } catch (err) {
      console.error('Error loading connections:', err);
    }
  }, [user.id]);
  
  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  useEffect(() => {
    if (!user?.id) return;
    socket.emit('register', user.id);

    const handleNewMessage = (msg) => {
      const currentUser = selectedUserRef.current;
    
      const isForCurrentChat =
        (msg.senderId === currentUser?._id && msg.recipientId === user.id) ||
        (msg.senderId === user.id && msg.recipientId === currentUser?._id);
    
      if (isForCurrentChat) {
        setChat((prev) => [...prev, msg]);
    
        if (msg.recipientId === user.id && !msg.delivered) {
          socket.emit('mark_as_delivered', { messageId: msg._id });
        }
      }
    };
    

    const handleTyping = ({ from }) => {
      if (selectedUser && from === selectedUser._id) {
        setTypingStatus(true);
        setTimeout(() => setTypingStatus(false), 1500);
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('typing', handleTyping);
    socket.on('new_friend_request', loadConnections);
    socket.on('friend_request_accepted', ({ userId }) => {
      if (userId === user.id) loadConnections();
    });
    socket.on('friend_request_declined', ({ userId }) => {
      if (userId === user.id) loadConnections();
    });
    socket.on('refresh_connections', loadConnections);
    socket.on('message_read', ({ messageId }) => {
      setChat((prev) =>
        prev.map((msg) => (msg._id === messageId ? { ...msg, read: true } : msg))
      );
    });
    socket.on('message_delivered', ({ messageId }) => {
      setChat((prev) =>
        prev.map((msg) => (msg._id === messageId ? { ...msg, delivered: true } : msg))
      );
    });

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('typing', handleTyping);
      socket.off('new_friend_request', loadConnections);
      socket.off('friend_request_accepted');
      socket.off('friend_request_declined');
      socket.off('refresh_connections');
      socket.off('message_read');
      socket.off('message_delivered');
      socket.off('new_message', handleNewMessage);

    };
  }, [selectedUser, user.id, loadConnections]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chat]);

  // Mark as read when chat updates
  useEffect(() => {
    const unreadMessages = chat.filter(
      (msg) => msg.recipientId === user.id && !msg.read
    );

    unreadMessages.forEach((msg) => {
      socket.emit('mark_as_read', { messageId: msg._id });
    });
  }, [chat, user.id]);

  const markMessagesAsDelivered = useCallback((messages) => {
    messages.forEach((msg) => {
      if (msg.recipientId === user.id && !msg.delivered) {
        socket.emit('mark_as_delivered', { messageId: msg._id });
      }
    });
  }, [user.id]);
  
  // Fetch messages + mark as delivered
  useEffect(() => {
    if (!selectedUser) return;
    axios
      .get(`http://localhost:5000/api/messages/${user.id}/${selectedUser._id}`)
      .then((res) => {
        setChat(res.data);
        markMessagesAsDelivered(res.data);
      })
      .catch((err) => console.error('Chat fetch error:', err));
  }, [selectedUser, user.id, markMessagesAsDelivered]);

  const handleTyping = () => {
    socket.emit('typing', { from: user.id, to: selectedUser._id });
  };


  

  const sendMessage = (e) => {
    e.preventDefault();
    if (!selectedUser || !message.trim()) return;
  
    const msg = {
      senderId: user.id,
      recipientId: selectedUser._id,
      text: message,
      timestamp: new Date().toISOString(),
      delivered: false,
      read: false
    };
  
    socket.emit('private_message', msg);
    setMessage('');
  };
  

  const acceptRequest = async (requesterId) => {
    await axios.post('http://localhost:5000/api/friends/accept', {
      currentUserId: user.id,
      requesterId,
    });
    socket.emit('friend_request_accepted', {
      fromUserId: requesterId,
      toUserId: user.id,
    });
    loadConnections();
  };

  const declineRequest = async (requesterId) => {
    await axios.post('http://localhost:5000/api/friends/decline', {
      currentUserId: user.id,
      requesterId,
    });
    socket.emit('friend_request_declined', {
      fromUserId: requesterId,
      toUserId: user.id,
    });
    loadConnections();
  };

  const sendFriendRequest = async () => {
    if (!newChatUsername.trim()) return;

    try {
      const res = await axios.post('http://localhost:5000/api/friends/request', {
        fromUserId: user.id,
        toUsername: newChatUsername.trim(),
      });

      if (res.data.toUserId) {
        socket.emit('send_friend_request', {
          toUserId: res.data.toUserId,
        });
      }

      setNewChatUsername('');
      setShowNewChatForm(false);
    } catch (err) {
      console.error('Friend request failed:', err.response?.data || err.message);
    }
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateGroup = (isoString) => {
    const date = new Date(isoString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isToday =
      date.toDateString() === today.toDateString();
    const isYesterday =
      date.toDateString() === yesterday.toDateString();

    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';

    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="chat-app-container">
      <div className="chat-box">
        {/* LEFT CHAT AREA */}
        <div className="chat-left-panel">
          {selectedUser ? (
            <>
              <h3>Chatting with {selectedUser.username}</h3>
              <div ref={chatBoxRef} className="chat-messages">
                {(() => {
                  const grouped = {};
                  chat.forEach((msg) => {
                    const group = formatDateGroup(msg.timestamp);
                    if (!grouped[group]) grouped[group] = [];
                    grouped[group].push(msg);
                  });
  
                  return Object.entries(grouped).map(([date, messages]) => (
                    <div key={date}>
                      <div className="date-divider">{date}</div>
                      {messages.map((msg, idx) => {
                        const isMe = msg.senderId === user.id;
                        return (
                          <div
                            key={idx}
                            className={`chat-message ${isMe ? 'me' : 'other'} ${
                              isMe && msg.read ? 'read' : ''
                            }`}
                          >
                            <div className="chat-bubble">
                              <div>{msg.text}</div>
                              <div className="timestamp">
                                {formatTime(msg.timestamp)}
                                {isMe && (
                                  <span className={`tick ${msg.read ? 'read' : ''}`}>
                                    {msg.read ? '✓✓' : msg.delivered ? '✓✓' : '✓'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ));
                })()}
                {typingStatus && (
                  <div className="typing-indicator">
                    {selectedUser.username} is typing...
                  </div>
                )}
              </div>
  
              <form onSubmit={sendMessage} className="chat-input-form">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    handleTyping();
                  }}
                  placeholder="Type a message..."
                />
                <button type="submit" disabled={!message.trim()}>Send</button>
              </form>
            </>
          ) : (
            <p>Select a friend from the right panel to start chatting.</p>
          )}
        </div>
  
        {/* RIGHT PANEL */}
        <div className="chat-right-panel">
          <p className="welcome">Welcome, {user.username}!</p>
  
          <h3>Friend Requests</h3>
          {friendRequests.length === 0 && <p>No requests</p>}
          {friendRequests.map((req) => (
            <div key={req._id} className="friend-request">
              <span>{req.username}</span>
              <button onClick={() => acceptRequest(req._id)}>Accept</button>
              <button onClick={() => declineRequest(req._id)}>Decline</button>
            </div>
          ))}
  
          <h3>Chats</h3>
          {friends.length === 0 && <p>No friends yet</p>}
          {friends.map((f) => (
            <div
              key={f._id}
              onClick={() => setSelectedUser(f)}
              className={`friend-item ${selectedUser?._id === f._id ? 'active' : ''}`}
            >
              {f.username}
            </div>
          ))}
  
          {/* Floating "+" Button */}
          <button className="fab" onClick={() => setShowNewChatForm(true)}>+</button>
  
          {/* New Chat Form */}
          {showNewChatForm && (
            <div className="new-chat-form">
              <h4>Start New Chat</h4>
              <input
                type="text"
                placeholder="Enter username"
                value={newChatUsername}
                onChange={(e) => setNewChatUsername(e.target.value)}
              />
              <button onClick={sendFriendRequest}>Send Request</button>
              <button onClick={() => setShowNewChatForm(false)}>Cancel</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;
