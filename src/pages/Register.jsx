import { useLanguage } from '../context/LanguageContext';
import React, { useState } from 'react';
import axios from 'axios';
import AuthLayout from '../layouts/AuthLayout';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

const REGISTER_URL = 'http://localhost:8000/api/v1/auth/register';

const Register = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'sender'
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });

    if (errors[name] || errors.form) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        [name]: undefined,
        form: undefined,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');
    setLoading(true);

    try {
      const { data } = await axios.post(REGISTER_URL, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        role: formData.role,
        device_name: 'deliverx-web',
      });

      setSuccessMessage(data.message || 'Registration successful. Redirecting to login...');

      window.setTimeout(() => {
        navigate('/login');
      }, 1200);
    } catch (err) {
      const validationErrors = err.response?.data?.errors || {};
      const message =
        err.response?.data?.message ||
        'Registration failed. Please check your information and try again.';

      setErrors({
        ...validationErrors,
        form: [message],
      });
    } finally {
      setLoading(false);
    }
  };

  const fieldError = (field) => errors[field]?.[0];

  return (
    <AuthLayout title="Create Account" subtitle="Join DeliverX today">
      <form onSubmit={handleSubmit}>
        {errors.form && (
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
            {errors.form[0]}
          </div>
        )}

        {successMessage && (
          <div
            style={{
              marginBottom: '16px',
              padding: '12px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#10b981',
              fontSize: '14px',
            }}
          >
            {successMessage}
          </div>
        )}

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
            disabled={loading}
          />
          {fieldError('name') && (
            <div style={{ marginTop: '6px', color: '#ef4444', fontSize: '13px' }}>
              {fieldError('name')}
            </div>
          )}
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
            disabled={loading}
          />
          {fieldError('email') && (
            <div style={{ marginTop: '6px', color: '#ef4444', fontSize: '13px' }}>
              {fieldError('email')}
            </div>
          )}
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
            disabled={loading}
          />
          {fieldError('password') && (
            <div style={{ marginTop: '6px', color: '#ef4444', fontSize: '13px' }}>
              {fieldError('password')}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            name="password_confirmation"
            className="form-control"
            value={formData.password_confirmation}
            onChange={handleChange}
            placeholder="Confirm your password"
            required
            disabled={loading}
          />
          {fieldError('password_confirmation') && (
            <div style={{ marginTop: '6px', color: '#ef4444', fontSize: '13px' }}>
              {fieldError('password_confirmation')}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>I want to</label>
          <select 
            name="role" 
            className="form-control"
            value={formData.role}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="sender">Send Packages</option>
            <option value="courier">Deliver Packages</option>
          </select>
          {fieldError('role') && (
            <div style={{ marginTop: '6px', color: '#ef4444', fontSize: '13px' }}>
              {fieldError('role')}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" required disabled={loading} /> I agree to the{' '}
            <a href="#" style={{ color: 'var(--primary-color)' }}>Terms & Conditions</a>
          </label>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', marginBottom: '20px' }}
          disabled={loading}
        >
          {loading ? <LoadingSpinner inline label="Creating account..." size={16} /> : 'Sign Up'}
        </button>

        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <a 
            href="#" 
            style={{ color: 'var(--primary-color)', textDecoration: 'none' }}
            onClick={(e) => {
              e.preventDefault();
              if (!loading) {
                navigate('/login');
              }
            }}
          >
            Sign in
          </a>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Register;
