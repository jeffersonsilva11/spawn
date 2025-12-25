/**
 * i18n Configuration
 *
 * Internationalization setup for the web panel.
 * Supports: English (default), Spanish, Portuguese (Brazil)
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import en from './locales/en.json';
import es from './locales/es.json';
import ptBR from './locales/pt-BR.json';

// Available languages
export const LANGUAGES = {
  en: { name: 'English', nativeName: 'English' },
  es: { name: 'Spanish', nativeName: 'Español' },
  'pt-BR': { name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)' },
} as const;

export type SupportedLanguage = keyof typeof LANGUAGES;

// Default language
const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

// Language detection order
const DETECTION_OPTIONS = {
  order: [
    'localStorage',      // Check localStorage first (user preference)
    'navigator',         // Then browser language
    'htmlTag',           // Then HTML lang attribute
  ],
  lookupLocalStorage: 'i18nextLng',  // Key for localStorage
  caches: ['localStorage'],           // Persist to localStorage
  excludeCacheFor: ['cimode'],        // Don't cache for cimode
};

i18n
  // Language detector
  .use(LanguageDetector)

  // React integration
  .use(initReactI18next)

  // Initialize
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
      'pt-BR': { translation: ptBR },
    },

    fallbackLng: DEFAULT_LANGUAGE,

    detection: DETECTION_OPTIONS,

    interpolation: {
      escapeValue: false, // React already escapes
    },

    // Namespace
    defaultNS: 'translation',

    // React specific
    react: {
      useSuspense: false, // Disable suspense for simpler error handling
    },

    // Debug mode (disable in production)
    debug: process.env.NODE_ENV === 'development',
  });

export default i18n;
