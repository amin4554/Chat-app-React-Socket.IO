import React, { useState } from 'react';
import axios from 'axios';
import socket from '../socket';

function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      return setError('Invalid email format.');
    }

    try {
      const res = await axios.post('http://localhost:5000/api/login', {
        email,
        password,
      });

      const { token, user } = res.data;

      localStorage.setItem('token', token);
      socket.emit('register', user.id);
      onLogin(user);
    } catch (err) {
      setError('Login failed. Please check your credentials.');
      console.error(err);
    }
  };

  const isFormValid = email && password && validateEmail(email);

  return (
    <form onSubmit={handleLogin} style={styles.form}>
      <h2>Login</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={styles.input}
      />
      {!validateEmail(email) && email && (
        <p style={styles.warning}>❌ Invalid email format</p>
      )}

      <div style={{ position: 'relative' }}>
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />
        <span
          onClick={() => setShowPassword(!showPassword)}
          style={styles.eyeToggle}
        >
        </span>
      </div>

      <button
        type="submit"
        disabled={!isFormValid}
        style={{
          ...styles.button,
          backgroundColor: isFormValid ? '#4CAF50' : '#ccc',
          cursor: isFormValid ? 'pointer' : 'not-allowed',
        }}
      >
        Login
      </button>

      {error && <p style={styles.error}>{error}</p>}
    </form>
  );
}

const styles = {
  form: {
    maxWidth: '300px',
    margin: '20px auto',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 0 8px rgba(0,0,0,0.1)',
  },
  input: {
    width: '100%',
    marginBottom: '10px',
    padding: '10px',
    fontSize: '16px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  button: {
    width: '100%',
    padding: '10px',
    color: '#fff',
    border: 'none',
    fontSize: '16px',
    borderRadius: '4px',
    transition: 'all 0.3s',
  },
  error: {
    color: 'red',
    marginTop: '10px',
  },
  warning: {
    color: 'red',
    fontSize: '13px',
    marginTop: '-8px',
    marginBottom: '8px',
  },
  eyeToggle: {
    position: 'absolute',
    top: '32%',
    right: '10px',
    cursor: 'pointer',
    fontSize: '18px',
  },
};

export default LoginForm;
