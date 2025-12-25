/**
 * Main App Component - Example with i18n Integration
 *
 * This example shows how to integrate i18n into your React app.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import './components/LanguageSwitcher.css';

// Initialize i18n (import at app entry point)
import './i18n';

function App() {
  const { t } = useTranslation();

  return (
    <div className="app">
      {/* Header with Language Switcher */}
      <header className="app-header">
        <h1>{t('dashboard.title')}</h1>
        <LanguageSwitcher />
      </header>

      {/* Main Content - Examples */}
      <main className="app-main">
        {/* Example: Simple translation */}
        <section>
          <h2>{t('projects.title')}</h2>
          <button>{t('projects.create')}</button>
        </section>

        {/* Example: Translation with interpolation */}
        <section>
          <p>{t('dashboard.welcome', { name: 'Developer' })}</p>
        </section>

        {/* Example: Common translations */}
        <div className="button-group">
          <button>{t('common.save')}</button>
          <button>{t('common.cancel')}</button>
        </div>

        {/* Example: Error messages */}
        <div className="error-message">
          {t('errors.network')}
        </div>

        {/* Example: Server status */}
        <div className="server-card">
          <span className="status">{t('servers.status_running')}</span>
          <span className="ip">{t('servers.ip_address')}: 192.168.1.1</span>
          <span className="port">{t('servers.port')}: 7001</span>
        </div>
      </main>
    </div>
  );
}

export default App;
