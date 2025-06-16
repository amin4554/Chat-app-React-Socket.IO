import React, { useEffect, useRef, useState } from 'react';
import socket from '../socket';

function ChatWindow({ user }) {
  const [users, setUsers] = useState([]);
  const [recipientId, setRecipientId] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState('');
  const [typingStatus, setTypingStatus] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  const chatBoxRef = useRef(null);

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Auto-scroll on new messages
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chat]);

  // Register and handle socket events
  useEffect(() => {
    if (user?.id) {
      socket.emit('register', user.id);
    }

    socket.on('new_message', (msg) => {
      const isForThisChat =
        (msg.senderId === recipientId && msg.recipientId === user.id) ||
        (msg.senderId === user.id && msg.recipientId === recipientId);

      if (isForThisChat) {
        setChat((prev) => [...prev, msg]);
      }
    });

    socket.on('typing', ({ from }) => {
      if (from === recipientId) {
        setTypingStatus(true);
        setTimeout(() => setTypingStatus(false), 1500);
      }
    });

    socket.on('online_users', (ids) => {
      setOnlineUsers(new Set(ids));
    });

    return () => {
      socket.off('new_message');
      socket.off('typing');
      socket.off('online_users');
    };
  }, [recipientId, user.id]);

  // Load users except self
  useEffect(() => {
    fetch('http://localhost:5000/api/users')
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter((u) => u._id !== user.id);
        setUsers(filtered);
      });
  }, [user.id]);

  // Load chat history
  useEffect(() => {
    if (!recipientId) return;

    const selectedUser = users.find((u) => u._id === recipientId);
    setRecipientName(selectedUser?.username || '');

    fetch(`http://localhost:5000/api/messages/${user.id}/${recipientId}`)
      .then((res) => res.json())
      .then((data) => setChat(data))
      .catch((err) => console.error('Error loading chat:', err));
  }, [recipientId, user.id, users]);

  const handleTyping = () => {
    socket.emit('typing', {
      from: user.id,
      to: recipientId
    });
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!recipientId || !message.trim()) return;

    const msg = {
      senderId: user.id,
      recipientId,
      text: message,
      timestamp: new Date().toISOString()
    };

    socket.emit('private_message', msg);
    setMessage('');
  };

  return (
    <div style={{ maxWidth: '600px', margin: 'auto' }}>
      <h2>Chat</h2>

      <label>Select a user to chat with:</label>
      <select
        value={recipientId}
        onChange={(e) => setRecipientId(e.target.value)}
        style={{ marginBottom: '1rem', width: '100%' }}
      >
        <option value="">Choose user</option>
        {users.map((u) => (
          <option key={u._id} value={u._id}>
            {u.username} {onlineUsers.has(u._id) ? '🟢' : '⚪️'}
          </option>
        ))}
      </select>

      {recipientId && (
        <>
          <h4>
            Chatting with {recipientName} {onlineUsers.has(recipientId) ? '🟢' : '⚪️'}
          </h4>

          <div
            ref={chatBoxRef}
            style={{
              height: '300px',
              overflowY: 'auto',
              border: '1px solid #ccc',
              padding: '1rem',
              background: '#fafafa'
            }}
          >
            {chat.map((msg, idx) => {
              const isMe = String(msg.senderId) === String(user.id);
              const sender = isMe ? 'You' : recipientName;

              return (
                <div key={idx} style={{ textAlign: isMe ? 'right' : 'left', marginBottom: '0.75rem' }}>
                  <div
                    style={{
                      display: 'inline-block',
                      background: isMe ? '#dcf8c6' : '#f1f0f0',
                      padding: '0.5rem 1rem',
                      borderRadius: '1rem',
                      maxWidth: '70%'
                    }}
                  >
                    <strong>{sender}</strong>
                    <div>{msg.text}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '0.25rem' }}>
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              );
            })}

            {typingStatus && (
              <div style={{ fontStyle: 'italic', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                {recipientName} is typing...
              </div>
            )}
          </div>

          <form onSubmit={sendMessage} style={{ marginTop: '1rem', display: 'flex' }}>
            <input
              type="text"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleTyping();
              }}
              placeholder="Type a message..."
              style={{ flex: 1, padding: '0.5rem' }}
            />
            <button type="submit" disabled={!message.trim()} style={{ marginLeft: '0.5rem' }}>
              Send
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default ChatWindow;
