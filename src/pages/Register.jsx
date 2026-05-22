import { useLanguage } from '../context/LanguageContext';
import React, { useState } from 'react';
import AuthLayout from '../layouts/AuthLayout';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'sender'
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/login');
  };

  return (
    <AuthLayout title="Create Account" subtitle="Join DeliverX today">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            name="name"
            className="form-control"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="form-group">
          <label>{t('email')}</label>
          <input
            type="email"
            name="email"
            className="form-control"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            className="form-control"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a password"
            required
          />
        </div>

        <div className="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            className="form-control"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            required
          />
        </div>

        <div className="form-group">
          <label>I want to</label>
          <select 
            name="role" 
            className="form-control"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="sender">Send Packages</option>
            <option value="courier">Deliver Packages</option>
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" required /> I agree to the{' '}
            <a href="#" style={{ color: 'var(--primary-color)' }}>Terms & Conditions</a>
          </label>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '20px' }}>
          Sign Up
        </button>

        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <a 
            href="#" 
            style={{ color: 'var(--primary-color)', textDecoration: 'none' }}
            onClick={(e) => { e.preventDefault(); navigate('/login'); }}
          >
            Sign in
          </a>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Register;