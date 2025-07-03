import React, { useEffect, useState } from 'react';
import socket from './socket';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import ChatWindow from './components/ChatWindow';

function App() {
  const [user, setUser] = useState(null);
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    console.log('Connecting socket...');
    socket.connect();

    socket.on('connect', () => {
      console.log('✅ Connected to Socket.IO as:', socket.id);
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

  useEffect(() => {
    if (user?.id && socket.connected) {
      socket.emit('register', user.id);
      console.log('✅ User registered to socket:', user.id);
    }
  }, [user]);

  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>Socket.IO Chat App</h1>
      {!user ? (
        <div style={{ textAlign: 'center' }}>
          {showSignup ? (
            <>
              <SignupForm onSignupSuccess={() => setShowSignup(false)} />
              <p>
                Already have an account?{' '}
                <button onClick={() => setShowSignup(false)}>Log In</button>
              </p>
            </>
          ) : (
            <>
              <LoginForm onLogin={(loggedInUser) => setUser(loggedInUser)} />
              <p>
                Don't have an account?{' '}
                <button onClick={() => setShowSignup(true)}>Sign Up</button>
              </p>
            </>
          )}
        </div>
      ) : (
        <>
          <p style={{ textAlign: 'center' }}>Welcome, {user.username}!</p>
          <ChatWindow user={user} />
        </>
      )}
    </div>
  );
}

export default App;
