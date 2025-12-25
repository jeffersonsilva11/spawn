/**
 * Landing Page - Public Homepage
 *
 * Main entry point for non-authenticated users
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import '../styles/Landing.css';

export const Landing: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="container">
          <div className="logo">
            <h1>🎮 Game Backend Platform</h1>
          </div>
          <div className="header-actions">
            <LanguageSwitcher />
            <Link to="/login" className="btn-outline">
              {t('auth.login')}
            </Link>
            <Link to="/register" className="btn-primary">
              {t('auth.register')}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h2 className="hero-title">
              {t('landing.hero_title', { defaultValue: 'Backend Infrastructure for Indie Unity Games' })}
            </h2>
            <p className="hero-subtitle">
              {t('landing.hero_subtitle', { defaultValue: 'Deploy, manage, and scale your multiplayer game servers with ease. Focus on building great games, we handle the infrastructure.' })}
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn-primary btn-lg">
                {t('landing.get_started', { defaultValue: 'Get Started Free' })}
              </Link>
              <Link to="/login" className="btn-outline btn-lg">
                {t('landing.sign_in', { defaultValue: 'Sign In' })}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">
            {t('landing.features_title', { defaultValue: 'Everything You Need' })}
          </h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3>{t('landing.feature1_title', { defaultValue: 'Fast Deployment' })}</h3>
              <p>{t('landing.feature1_desc', { defaultValue: 'Deploy your Unity game servers in seconds with our automated Docker-based infrastructure.' })}</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>{t('landing.feature2_title', { defaultValue: 'Real-time Monitoring' })}</h3>
              <p>{t('landing.feature2_desc', { defaultValue: 'Monitor your servers, track player counts, and get insights on your game performance.' })}</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔧</div>
              <h3>{t('landing.feature3_title', { defaultValue: 'Unity SDK' })}</h3>
              <p>{t('landing.feature3_desc', { defaultValue: 'Seamless integration with Unity using our C# SDK. Connect players to servers automatically.' })}</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>{t('landing.feature4_title', { defaultValue: 'Auto Scaling' })}</h3>
              <p>{t('landing.feature4_desc', { defaultValue: 'Automatically spin up new servers as player demand grows. Scale down to save costs.' })}</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔐</div>
              <h3>{t('landing.feature5_title', { defaultValue: 'Secure & Reliable' })}</h3>
              <p>{t('landing.feature5_desc', { defaultValue: 'Enterprise-grade security with JWT authentication and encrypted connections.' })}</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>{t('landing.feature6_title', { defaultValue: 'Indie Friendly' })}</h3>
              <p>{t('landing.feature6_desc', { defaultValue: 'Affordable pricing designed for indie developers. Pay only for what you use.' })}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <h2>{t('landing.cta_title', { defaultValue: 'Ready to Deploy Your Game?' })}</h2>
          <p>{t('landing.cta_subtitle', { defaultValue: 'Create your free account and deploy your first server in minutes.' })}</p>
          <Link to="/register" className="btn-primary btn-lg">
            {t('landing.create_account', { defaultValue: 'Create Free Account' })}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <p>&copy; 2025 Game Backend Platform. {t('landing.footer_rights', { defaultValue: 'All rights reserved.' })}</p>
        </div>
      </footer>
    </div>
  );
};
