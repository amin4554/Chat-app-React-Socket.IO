import React, { useEffect, useState } from 'react';
import socket from './socket';
import LoginForm from './components/LoginForm';
import ChatWindow from './components/ChatWindow';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    console.log('Connecting socket...');
    socket.connect(); // <-- manually connect here
  
    socket.on('connect', () => {
      console.log('✅ Connected to Socket.IO as:', socket.id);
    });
  
    socket.on('connect_error', (err) => {
      console.error('❌ Socket connection error:', err);
    });
  
    return () => {
      console.log('Disconnecting socket...');
      socket.disconnect();
    };
  }, []);

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
