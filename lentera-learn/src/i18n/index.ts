import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import Indonesian translation files
import dashboardId from '../locales/id/dashboard.json';
import commonId from '../locales/id/common.json';
import learnId from '../locales/id/learn.json';
import lessonId from '../locales/id/lesson.json';
import practiceId from '../locales/id/practice.json';
import achievementsId from '../locales/id/achievements.json';
import profileId from '../locales/id/profile.json';
import authId from '../locales/id/auth.json';

// Import English translation files
import dashboardEn from '../locales/en/dashboard.json';
import commonEn from '../locales/en/common.json';
import learnEn from '../locales/en/learn.json';
import lessonEn from '../locales/en/lesson.json';
import practiceEn from '../locales/en/practice.json';
import achievementsEn from '../locales/en/achievements.json';
import profileEn from '../locales/en/profile.json';
import authEn from '../locales/en/auth.json';

const resources = {
  id: {
    dashboard: dashboardId,
    common: commonId,
    learn: learnId,
    lesson: lessonId,
    practice: practiceId,
    achievements: achievementsId,
    profile: profileId,
    auth: authId,
  },
  en: {
    dashboard: dashboardEn,
    common: commonEn,
    learn: learnEn,
    lesson: lessonEn,
    practice: practiceEn,
    achievements: achievementsEn,
    profile: profileEn,
    auth: authEn,
  },
};

// Get saved language from localStorage or default to Indonesian
const savedLanguage = localStorage.getItem('lentera-language') || 'id';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'en',
    debug: false,

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'lentera-language',
    },

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },
  });

// Save language changes to localStorage
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('lentera-language', lng);
});

export default i18n;