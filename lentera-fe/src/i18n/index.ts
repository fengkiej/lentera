import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLanguagePreference } from '@/utils/localStorage';

// Import translation files
import en from './locales/en.json';
import es from './locales/es.json';
import sw from './locales/sw.json';
import tl from './locales/tl.json';
import fr from './locales/fr.json';
import pt from './locales/pt.json';
import ar from './locales/ar.json';
import hi from './locales/hi.json';
import bn from './locales/bn.json';
import id from './locales/id.json';
import zh from './locales/zh.json';
import ha from './locales/ha.json';
import yo from './locales/yo.json';
import am from './locales/am.json';
import ur from './locales/ur.json';
import th from './locales/th.json';
import vi from './locales/vi.json';
import my from './locales/my.json';
import fa from './locales/fa.json';
import rw from './locales/rw.json';

const resources = {
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  pt: { translation: pt },
  sw: { translation: sw },
  ar: { translation: ar },
  hi: { translation: hi },
  bn: { translation: bn },
  id: { translation: id },
  tl: { translation: tl },
  zh: { translation: zh },
  ha: { translation: ha },
  yo: { translation: yo },
  am: { translation: am },
  ur: { translation: ur },
  th: { translation: th },
  vi: { translation: vi },
  my: { translation: my },
  fa: { translation: fa },
  rw: { translation: rw },
};

// Get saved language preference from localStorage, or use 'en' as default
const savedLanguage = getLanguagePreference();

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage || 'en', // Use saved language if available, otherwise default to English
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;