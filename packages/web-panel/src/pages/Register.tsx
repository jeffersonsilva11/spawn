/**
 * Register Page
 *
 * Studio registration page
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import '../styles/Auth.css';

export const Register: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [studioName, setStudioName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already logged in
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password || !studioName.trim()) {
      setError(t('auth.fields_required', { defaultValue: 'Please fill in all fields' }));
      return;
    }

    if (password.length < 6) {
      setError(t('auth.password_too_short', { defaultValue: 'Password must be at least 6 characters' }));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('auth.passwords_dont_match', { defaultValue: 'Passwords do not match' }));
      return;
    }

    try {
      setLoading(true);
      await register(email.trim(), password, studioName.trim());
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-header">
        <Link to="/" className="auth-logo">
          🎮 Game Backend Platform
        </Link>
        <LanguageSwitcher />
      </div>

      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">
            {t('auth.register_title', { defaultValue: 'Create Studio Account' })}
          </h1>
          <p className="auth-subtitle">
            {t('auth.register_subtitle', { defaultValue: 'Get started with your game backend platform' })}
          </p>

          {error && (
            <div className="auth-error">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="studioName">
                {t('auth.studio_name', { defaultValue: 'Studio Name' })}
              </label>
              <input
                id="studioName"
                type="text"
                className="form-input"
                value={studioName}
                onChange={(e) => setStudioName(e.target.value)}
                placeholder="My Awesome Studio"
                disabled={loading}
                autoFocus
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">
                {t('auth.email', { defaultValue: 'Email' })}
              </label>
              <input
                id="email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                {t('auth.password', { defaultValue: 'Password' })}
              </label>
              <input
                id="password"
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                required
              />
              <small className="form-hint">
                {t('auth.password_hint', { defaultValue: 'Minimum 6 characters' })}
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">
                {t('auth.confirm_password', { defaultValue: 'Confirm Password' })}
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary btn-full"
              disabled={loading}
            >
              {loading
                ? t('auth.creating_account', { defaultValue: 'Creating account...' })
                : t('auth.register', { defaultValue: 'Create Account' })}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              {t('auth.have_account', { defaultValue: 'Already have an account?' })}{' '}
              <Link to="/login" className="auth-link">
                {t('auth.sign_in', { defaultValue: 'Sign in' })}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
