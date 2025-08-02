// API Configuration
// This file centralizes all API-related configuration

// Base URL for the API
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.99:3000';

// API Endpoints (relative to base URL)
export const API_ENDPOINTS = {
  // Lentera API endpoints
  FLASHQUIZ: '/lentera/flashquiz',
  ELIX: '/lentera/elix',
  MINDMAP: '/lentera/mindmap',
  SEARCH: '/lentera/search',
  SEARCH_SUMMARY: '/lentera/search_summary',
  ARTICLE_SUMMARY: '/lentera/get_article_summary',
};

// Other API-related configuration
export const DEFAULT_LANGUAGE = 'indonesia';

// External service URLs
export const LIBRARY_URL = import.meta.env.VITE_LIBRARY_URL || '';
export const CHAT_URL = import.meta.env.VITE_CHAT_URL || '';

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string, params: Record<string, string | number | boolean>) => {
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  
  // Add all params to the URL
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });
  
  return url.toString();
};