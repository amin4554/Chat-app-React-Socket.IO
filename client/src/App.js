import React, { useEffect, useState } from 'react';
import socket from './socket';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import ChatWindow from './components/ChatWindow';

function App() {
  const [user, setUser] = useState(null);
  const [showSignup, setShowSignup] = useState(false);

  // Extract primitive for safer dependency handling
  const userId = user?.id;

  useEffect(() => {
    console.log('Connecting socket...');
    socket.connect();

    const handleConnect = () => {
      console.log('✅ Connected to Socket.IO as:', socket.id);
      if (userId) {
        socket.emit('register', userId);
        console.log('📌 Re-registering user on connect:', userId);
      }
    };

    const handleError = (err) => {
      console.error('❌ Socket connection error:', err);
    };

    socket.on('connect', handleConnect);
    socket.on('connect_error', handleError);

    return () => {
      console.log('Disconnecting socket...');
      socket.off('connect', handleConnect);
      socket.off('connect_error', handleError);
      socket.disconnect();
    };
  }, [userId]); // ✅ clean dependency array

  // Emit register on user change, if already connected
  useEffect(() => {
    if (userId && socket.connected) {
      socket.emit('register', userId);
      console.log('✅ User registered to socket:', userId);
    }
  }, [userId]);

  return (
    <div>
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
        <ChatWindow user={user} />
      )}
    </div>
  );
}

export default App;
