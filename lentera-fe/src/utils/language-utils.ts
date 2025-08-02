/**
 * Utility functions for language handling
 */

/**
 * Maps ISO language codes to their full language names for API calls
 */
const languageCodeToFullName: Record<string, string> = {
  'en': 'english',
  'id': 'indonesia',
  'es': 'spanish',
  'fr': 'french',
  'pt': 'portuguese',
  'sw': 'swahili',
  'ar': 'arabic',
  'hi': 'hindi',
  'bn': 'bengali',
  'tl': 'tagalog',
  'zh': 'chinese',
  'ha': 'hausa',
  'yo': 'yoruba',
  'am': 'amharic',
  'ur': 'urdu',
  'th': 'thai',
  'vi': 'vietnamese',
  'my': 'burmese',
  'fa': 'persian',
  'rw': 'kinyarwanda'
};

/**
 * Converts a language code to its full language name for API calls
 * @param code The ISO language code (e.g., 'en', 'id')
 * @returns The full language name (e.g., 'english', 'indonesia')
 */
export function getFullLanguageName(code: string): string {
  // If the code exists in our mapping, return the full name
  if (code in languageCodeToFullName) {
    return languageCodeToFullName[code];
  }
  
  // If the code doesn't exist in our mapping, return the code itself
  // This is a fallback to ensure the API still works even if we haven't
  // explicitly mapped a language code
  return code;
}

/**
 * Returns the appropriate language parameter to use with API calls
 * @param currentLanguage The current language from i18n
 * @returns The full language name for API calls
 */
export function getApiLanguageParameter(currentLanguage: string): string {
  return getFullLanguageName(currentLanguage);
}