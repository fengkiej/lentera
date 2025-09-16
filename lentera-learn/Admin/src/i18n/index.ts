import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import commonEn from './locales/en/common.json';
import commonId from './locales/id/common.json';
import formsEn from './locales/en/forms.json';
import formsId from './locales/id/forms.json';
import subjectsEn from './locales/en/subjects.json';
import subjectsId from './locales/id/subjects.json';
import topicsEn from './locales/en/topics.json';
import topicsId from './locales/id/topics.json';
import lessonsEn from './locales/en/lessons.json';
import lessonsId from './locales/id/lessons.json';
import messagesEn from './locales/en/messages.json';
import messagesId from './locales/id/messages.json';
import dashboardEn from './locales/en/dashboard.json';
import dashboardId from './locales/id/dashboard.json';

const resources = {
  en: {
    common: commonEn,
    forms: formsEn,
    subjects: subjectsEn,
    topics: topicsEn,
    lessons: lessonsEn,
    messages: messagesEn,
    dashboard: dashboardEn,
  },
  id: {
    common: commonId,
    forms: formsId,
    subjects: subjectsId,
    topics: topicsId,
    lessons: lessonsId,
    messages: messagesId,
    dashboard: dashboardId,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false,
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;