import React, { useEffect, useState } from 'react';
import socket from '../socket';

function ChatWindow({ user }) {
  const [users, setUsers] = useState([]);
  const [recipientId, setRecipientId] = useState('');
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState('');

  // 🔹 Register socket on mount
  useEffect(() => {
    if (user && user.id) {
      socket.emit('register', user.id);
    }

    // Incoming messages
    socket.on('new_message', (msg) => {
      if (
        (msg.senderId === recipientId && msg.recipientId === user.id) ||
        (msg.senderId === user.id && msg.recipientId === recipientId)
      ) {
        setChat((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.off('new_message');
    };
  }, [recipientId, user.id]);

  // 🔹 Load all users (except self)
  useEffect(() => {
    fetch('http://localhost:5000/api/users')
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter((u) => u._id !== user.id);
        setUsers(filtered);
      });
  }, [user.id]);

  // 🔹 Load chat history
  useEffect(() => {
    if (!recipientId) return;

    fetch(`http://localhost:5000/api/messages/${user.id}/${recipientId}`)
      .then((res) => res.json())
      .then((data) => setChat(data))
      .catch((err) => console.error('Failed to load chat history:', err));
  }, [recipientId, user.id]);

  // 🔹 Send a message
  const sendMessage = (e) => {
    e.preventDefault();
    if (!recipientId || !message.trim()) return;

    // Emit to backend
    socket.emit('private_message', {
      senderId: user.id,
      recipientId,
      text: message,
    });

    // Optimistic UI update
    setChat((prev) => [
      ...prev,
      {
        senderId: user.id,
        recipientId,
        text: message,
        timestamp: new Date().toISOString(),
      },
    ]);

    setMessage('');
  };

  return (
    <div>
      <h2>Chat</h2>

      <select
        value={recipientId}
        onChange={(e) => setRecipientId(e.target.value)}
      >
        <option value="">Select a user</option>
        {users.map((u) => (
          <option key={u._id} value={u._id}>
            {u.username}
          </option>
        ))}
      </select>

      <div style={{ marginTop: '1rem', height: '300px', overflowY: 'auto', border: '1px solid #ccc', padding: '0.5rem' }}>
        {chat.map((msg, idx) => (
          <div
            key={idx}
            style={{
              textAlign: msg.senderId === user.id ? 'right' : 'left',
              marginBottom: '0.5rem'
            }}
          >
            <strong>{msg.senderId === user.id ? 'You' : 'Them'}:</strong>{' '}
            {msg.text}
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} style={{ marginTop: '1rem' }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message"
          style={{ width: '70%' }}
        />
        <button type="submit" style={{ width: '25%' }}>
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatWindow;
