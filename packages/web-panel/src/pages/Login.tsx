/**
 * Login Page
 *
 * User authentication page
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import '../styles/Auth.css';

export const Login: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

    if (!email.trim() || !password) {
      setError(t('auth.fields_required', { defaultValue: 'Please fill in all fields' }));
      return;
    }

    try {
      setLoading(true);
      await login(email.trim(), password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
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
            {t('auth.login_title', { defaultValue: 'Welcome Back' })}
          </h1>
          <p className="auth-subtitle">
            {t('auth.login_subtitle', { defaultValue: 'Sign in to your account to continue' })}
          </p>

          {error && (
            <div className="auth-error">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
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
                autoFocus
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
            </div>

            <button
              type="submit"
              className="btn-primary btn-full"
              disabled={loading}
            >
              {loading
                ? t('auth.logging_in', { defaultValue: 'Signing in...' })
                : t('auth.login', { defaultValue: 'Sign In' })}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              {t('auth.no_account', { defaultValue: "Don't have an account?" })}{' '}
              <Link to="/register" className="auth-link">
                {t('auth.create_account', { defaultValue: 'Create one' })}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
