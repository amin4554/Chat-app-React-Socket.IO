import React, { useState } from 'react';
import axios from 'axios';

function SignupForm({ onSignupSuccess }) {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === 'password') {
      setPasswordStrength(evaluateStrength(value));
    }
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const evaluateStrength = (password) => {
    if (!password) return '';
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    const mediumRegex = /^((?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,})$/;

    if (strongRegex.test(password)) return 'Strong';
    if (mediumRegex.test(password)) return 'Medium';
    return 'Weak';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { username, email, password, confirmPassword } = form;

    if (!validateEmail(email)) return setError('Invalid email format.');
    if (password !== confirmPassword) return setError('Passwords do not match.');
    if (evaluateStrength(password) === 'Weak') return setError('Please use a stronger password.');

    try {
      await axios.post('http://localhost:5000/api/register', {
        username,
        email,
        password,
      });
      setSuccess('Signup successful! You can now log in.');
      onSignupSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed.');
    }
  };

  const getStrengthColor = (strength) => {
    switch (strength) {
      case 'Strong':
        return 'green';
      case 'Medium':
        return 'orange';
      case 'Weak':
        return 'red';
      default:
        return '#ccc';
    }
  };

  const isFormValid =
    form.username &&
    validateEmail(form.email) &&
    form.password === form.confirmPassword &&
    passwordStrength !== 'Weak';

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2>Sign Up</h2>

      {error && <p style={styles.error}>{error}</p>}
      {success && <p style={styles.success}>{success}</p>}

      <input
        name="username"
        placeholder="Username"
        value={form.username}
        onChange={handleChange}
        required
        style={styles.input}
      />

      <input
        name="email"
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        required
        style={styles.input}
      />
      {!validateEmail(form.email) && form.email && (
        <p style={styles.warning}>❌ Invalid email format</p>
      )}

      {/* Password input with toggle */}
      <div style={{ position: 'relative' }}>
        <input
          name="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <span
          onClick={() => setShowPassword(!showPassword)}
          style={styles.eyeToggle}
        >
          
        </span>
      </div>

      {/* Strength bar */}
      {form.password && (
        <div style={{ marginBottom: 10 }}>
          <div style={styles.strengthBarContainer}>
            <div
              style={{
                ...styles.strengthBar,
                backgroundColor: getStrengthColor(passwordStrength),
                width:
                  passwordStrength === 'Strong'
                    ? '100%'
                    : passwordStrength === 'Medium'
                    ? '60%'
                    : '30%',
              }}
            />
          </div>
          <p style={{ color: getStrengthColor(passwordStrength), marginTop: 5 }}>
            {passwordStrength} Password
          </p>
        </div>
      )}

      {/* Confirm password */}
      <input
        name="confirmPassword"
        type="password"
        placeholder="Confirm Password"
        value={form.confirmPassword}
        onChange={handleChange}
        required
        style={styles.input}
      />
      {form.confirmPassword &&
        form.password !== form.confirmPassword && (
          <p style={styles.warning}>❌ Passwords do not match</p>
        )}

      <button
        type="submit"
        disabled={!isFormValid}
        style={{
          ...styles.button,
          backgroundColor: isFormValid ? '#4CAF50' : '#ccc',
          cursor: isFormValid ? 'pointer' : 'not-allowed',
        }}
      >
        Sign Up
      </button>
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
    marginBottom: '10px',
  },
  success: {
    color: 'green',
    marginBottom: '10px',
  },
  warning: {
    color: 'red',
    fontSize: '13px',
    marginTop: '-8px',
    marginBottom: '8px',
  },
  strengthBarContainer: {
    width: '100%',
    height: '10px',
    backgroundColor: '#e0e0e0',
    borderRadius: '5px',
    overflow: 'hidden',
  },
  strengthBar: {
    height: '10px',
    borderRadius: '5px',
    transition: 'width 0.3s ease',
  },
  eyeToggle: {
    position: 'absolute',
    top: '32%',
    right: '10px',
    cursor: 'pointer',
    fontSize: '18px',
  },
};

export default SignupForm;
