import { useLanguage } from '../context/LanguageContext';
import React, { useState } from 'react';
import axios from 'axios';
import AuthLayout from '../layouts/AuthLayout';
import { useNavigate } from 'react-router-dom';

const LOGIN_URL = 'http://localhost:8000/api/v1/auth/login';

const roleRoutes = {
  admin: '/admin',
  sender: '/sender',
  courier: '/courier',
};

const Login = ({ setUserRole }) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const completeLogin = (user, token) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
    setUserRole(user.role);
    navigate(roleRoutes[user.role] || '/sender');
  };

  const login = async (loginEmail, loginPassword) => {
    setError('');
    setLoading(true);

    try {
      const { data } = await axios.post(LOGIN_URL, {
        email: loginEmail,
        password: loginPassword,
        device_name: 'deliverx-web',
      });

      completeLogin(data.user, data.token);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.email?.[0] ||
        'Login failed. Please check your credentials and try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password);
  };

  const handleDemoLogin = (demoEmail) => {
    login(demoEmail, 'password');
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to your account">
      <form onSubmit={handleSubmit}>
        {error && (
          <div
            style={{
              marginBottom: '16px',
              padding: '12px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              fontSize: '14px',
            }}
          >
            {error}
          </div>
        )}

        <div className="form-group">
          <label>{t('email')}</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            disabled={loading}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" disabled={loading} /> Remember me
          </label>
          <a href="#" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>Forgot password?</a>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', marginBottom: '20px' }}
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <a
            href="#"
            style={{ color: 'var(--primary-color)', textDecoration: 'none' }}
            onClick={(e) => { e.preventDefault(); navigate('/register'); }}
          >
            Sign up
          </a>
        </p>
      </form>

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '10px' }}>Demo Accounts:</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            type="button"
            className="btn btn-outline"
            style={{ padding: '8px 16px', fontSize: '12px' }}
            disabled={loading}
            onClick={() => handleDemoLogin('admin@deliverx.com')}
          >
            Admin
          </button>
          <button
            type="button"
            className="btn btn-outline"
            style={{ padding: '8px 16px', fontSize: '12px' }}
            disabled={loading}
            onClick={() => handleDemoLogin('sender@deliverx.com')}
          >
            Sender
          </button>
          <button
            type="button"
            className="btn btn-outline"
            style={{ padding: '8px 16px', fontSize: '12px' }}
            disabled={loading}
            onClick={() => handleDemoLogin('courier@deliverx.com')}
          >
            Courier
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
