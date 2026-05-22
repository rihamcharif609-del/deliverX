import { useLanguage } from '../context/LanguageContext';
import React, { useState } from 'react';
import AuthLayout from '../layouts/AuthLayout';
import { useNavigate } from 'react-router-dom';


const Login = ({ setUserRole, setCourierVerified }) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  

  const handleSubmit = (e) => {

  e.preventDefault();

  if (email.includes('admin')) {

    setUserRole('admin');
    navigate('/admin');

  } else if (email.includes('courier')) {
    setUserRole('courier');
    // Ila kan deja verified f localStorage, n-khlliwh true, sinon false
    if (setCourierVerified) {
        setCourierVerified(isAlreadyVerified);
    }
    navigate('/courier');


  } else {

    setUserRole('sender');
    navigate('/sender');
  }
};

const isAlreadyVerified = localStorage.getItem('isCourierVerified') === 'true';

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to your account">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>{t('email')}</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
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
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" /> Remember me
          </label>
          <a href="#" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>Forgot password?</a>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '20px' }}>
          Sign In
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
            className="btn btn-outline" 
            style={{ padding: '8px 16px', fontSize: '12px' }}
            onClick={() => { setUserRole('admin'); navigate('/admin'); }}
          >
            Admin
          </button>
          <button 
            className="btn btn-outline" 
            style={{ padding: '8px 16px', fontSize: '12px' }}
            onClick={() => { setUserRole('sender'); navigate('/sender'); }}
          >
            Sender
          </button>
          <button 
            className="btn btn-outline" 
            style={{ padding: '8px 16px', fontSize: '12px' }}
            onClick={() => {setUserRole('courier');
              if (setCourierVerified) {
                setCourierVerified(false);
              }
              navigate('/courier');
            }}
          >
            Courier
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;