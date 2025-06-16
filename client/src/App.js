import React, { useEffect, useState } from 'react';
import socket from './socket';
import LoginForm from './components/LoginForm';
import ChatWindow from './components/ChatWindow';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    console.log('Connecting socket...');
    socket.connect(); // Only once, on mount

    socket.on('connect', () => {
      console.log('✅ Connected to Socket.IO as:', socket.id);

      // If user already logged in when socket connects, register them
      if (user?.id) {
        socket.emit('register', user.id);
        console.log('📌 Re-registering user on connect:', user.id);
      }
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Socket connection error:', err);
    });

    return () => {
      console.log('Disconnecting socket...');
      socket.off('connect');
      socket.off('connect_error');
      socket.disconnect();
    };
  }, []);

  // When user logs in, register them to the socket
  useEffect(() => {
    if (user?.id && socket.connected) {
      socket.emit('register', user.id);
      console.log('✅ User registered to socket:', user.id);
    }
  }, [user]);

  return (
    <div>
      <h1>Socket.IO Chat App</h1>
      {!user ? (
        <LoginForm onLogin={(loggedInUser) => setUser(loggedInUser)} />
      ) : (
        <>
          <p>Welcome, {user.username}!</p>
          <ChatWindow user={user} />
        </>
      )}
    </div>
  );
}

export default App;
