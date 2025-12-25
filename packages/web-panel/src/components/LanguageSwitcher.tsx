/**
 * Language Switcher Component
 *
 * Dropdown to switch between available languages.
 * Persists selection to localStorage and updates i18n.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LANGUAGES, SupportedLanguage } from '../i18n';

interface LanguageSwitcherProps {
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className = '' }) => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = i18n.language as SupportedLanguage;

  const changeLanguage = (lng: SupportedLanguage) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);

    // Optional: Sync to backend
    // syncLanguageToBackend(lng);
  };

  return (
    <div className={`language-switcher ${className}`}>
      {/* Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="language-switcher__button"
        aria-label={t('language.select')}
        aria-expanded={isOpen}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M10 2C5.58 2 2 5.58 2 10C2 14.42 5.58 18 10 18C14.42 18 18 14.42 18 10C18 5.58 14.42 2 10 2ZM16.13 6H13.42C13.18 5.03 12.85 4.08 12.43 3.17C14.07 3.67 15.47 4.65 16.13 6ZM10 4.03C10.64 5.03 11.14 6.12 11.47 7H8.53C8.86 6.12 9.36 5.03 10 4.03ZM4.26 12C4.1 11.36 4 10.69 4 10C4 9.31 4.1 8.64 4.26 8H7.64C7.56 8.66 7.5 9.32 7.5 10C7.5 10.68 7.56 11.34 7.64 12H4.26ZM5.87 14H8.58C8.82 14.97 9.15 15.92 9.57 16.83C7.93 16.33 6.53 15.35 5.87 14ZM8.58 6H5.87C6.53 4.65 7.93 3.67 9.57 3.17C9.15 4.08 8.82 5.03 8.58 6ZM10 15.97C9.36 14.97 8.86 13.88 8.53 13H11.47C11.14 13.88 10.64 14.97 10 15.97ZM11.93 12H8.07C7.96 11.34 7.9 10.68 7.9 10C7.9 9.32 7.96 8.66 8.07 8H11.93C12.04 8.66 12.1 9.32 12.1 10C12.1 10.68 12.04 11.34 11.93 12ZM12.43 16.83C12.85 15.92 13.18 14.97 13.42 14H16.13C15.47 15.35 14.07 16.33 12.43 16.83ZM12.36 12C12.44 11.34 12.5 10.68 12.5 10C12.5 9.32 12.44 8.66 12.36 8H15.74C15.9 8.64 16 9.31 16 10C16 10.69 15.9 11.36 15.74 12H12.36Z"
            fill="currentColor"
          />
        </svg>
        <span className="language-switcher__text">
          {LANGUAGES[currentLanguage]?.nativeName || 'English'}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`language-switcher__arrow ${isOpen ? 'open' : ''}`}
          aria-hidden="true"
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="language-switcher__backdrop"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Menu */}
          <div className="language-switcher__menu" role="menu">
            {Object.entries(LANGUAGES).map(([code, lang]) => (
              <button
                key={code}
                onClick={() => changeLanguage(code as SupportedLanguage)}
                className={`language-switcher__item ${
                  currentLanguage === code ? 'active' : ''
                }`}
                role="menuitem"
              >
                <span className="language-switcher__item-native">
                  {lang.nativeName}
                </span>
                {currentLanguage === code && (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M13.3334 4L6.00002 11.3333L2.66669 8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

/**
 * Optional: Sync language preference to backend
 */
async function syncLanguageToBackend(language: SupportedLanguage) {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    await fetch(`${import.meta.env.VITE_API_URL}/users/preferences`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ language }),
    });
  } catch (error) {
    console.error('Failed to sync language to backend:', error);
    // Non-critical - don't throw
  }
}
