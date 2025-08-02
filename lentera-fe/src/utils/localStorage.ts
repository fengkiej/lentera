// Storage keys
export const STORAGE_KEYS = {
  LANGUAGE_PREFERENCE: 'Lentera-language-preference',
};

/**
 * Saves the language preference to localStorage
 * @param languageCode - The language code to save
 */
export const saveLanguagePreference = (languageCode: string): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE_PREFERENCE, languageCode);
  } catch (error) {
    console.error('Failed to save language preference to localStorage:', error);
  }
};

/**
 * Gets the saved language preference from localStorage
 * @returns The saved language code or null if not found
 */
export const getLanguagePreference = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEYS.LANGUAGE_PREFERENCE);
  } catch (error) {
    console.error('Failed to get language preference from localStorage:', error);
    return null;
  }
};

/**
 * Clears the saved language preference from localStorage
 */
export const clearLanguagePreference = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.LANGUAGE_PREFERENCE);
  } catch (error) {
    console.error('Failed to clear language preference from localStorage:', error);
  }
};