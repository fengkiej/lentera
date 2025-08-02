// API service functions
import i18n from '@/i18n';
import { API_BASE_URL, API_ENDPOINTS, DEFAULT_LANGUAGE, buildApiUrl } from '@/config/api.config';

// FlashQuiz API response types
export interface FlashQuizResponse {
  id: string;
  flashquiz: {
    quizzes: QuizItem[];
    sources: Source[];
  };
}

export interface QuizItem {
  question: string;
  choices: string[];
  correct_answer_choice: string;
}

export interface Source {
  link: string;
  title: string;
}

// MindMap API response types
export interface MindMapResponse {
  id: string;
  mindmap: {
    nodes: MindMapNode[];
    sources?: Source[]; // Make sources optional as it may not be in API response
    centralTopic?: string; // Make centralTopic optional as it may not be in API response
  };
}

export interface MindMapNode {
  facet: string;
  explanation: string;
  subquestions: string[];
}

// ELIx API response type
export interface ELIxResponse {
  text: string;
}

/**
 * Fetches flashcard quiz data from the API
 * @param id The search ID
 * @param language The language for the quiz
 * @returns Promise with flashcard quiz data
 */
export async function fetchFlashQuiz(id: string | number, language: string = DEFAULT_LANGUAGE): Promise<FlashQuizResponse> {
  try {
    // Add a cache-busting parameter to prevent caching
    const timestamp = new Date().getTime();
    
    const response = await fetch(
      buildApiUrl(API_ENDPOINTS.FLASHQUIZ, {
        id,
        language,
        _: timestamp
      })
    );
    
    if (!response.ok) {
      throw new Error(i18n.t('api.errors.flashQuiz', { status: response.status }));
    }
    
    const data = await response.json();
    console.log(`Fetched flashquiz for id ${id} with timestamp ${timestamp}`);
    return data;
  } catch (error) {
    console.error('Error fetching flashcard quiz:', error);
    throw error;
  }
}

/**
 * Fetches age-adapted explanations from the ELIx API
 * @param text The text content to adapt
 * @param ageRange The target age range (e.g., "3-5")
 * @param language The language for the explanation
 * @returns Promise with the adapted explanation
 */
export async function fetchElix(text: string, ageRange: string, language: string = DEFAULT_LANGUAGE): Promise<ELIxResponse> {
  try {
    // Use the buildApiUrl helper for consistent URL construction
    const response = await fetch(
      buildApiUrl(API_ENDPOINTS.ELIX, {
        text: encodeURIComponent(text),
        language,
        ageRange
      })
    );
    
    if (!response.ok) {
      throw new Error(i18n.t('api.errors.elix', { status: response.status }));
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching ELIx explanation:', error);
    throw error;
  }
}

/**
 * Fetches mindmap data from the API
 * @param id The search ID
 * @param language The language for the mindmap
 * @returns Promise with mindmap data
 */
export async function fetchMindMap(id: string | number, language: string = DEFAULT_LANGUAGE): Promise<MindMapResponse> {
  try {
    const apiUrl = buildApiUrl(API_ENDPOINTS.MINDMAP, { id, language });
    console.log(`Fetching mindmap from: ${apiUrl}`);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(i18n.t('api.errors.mindMap', { status: response.status }));
    }
    
    const data = await response.json();
    console.log('MindMap API response:', data);
    
    return data;
  } catch (error) {
    console.error('Error fetching mindmap:', error);
    throw error;
  }
}