import OpenAI from 'openai';
import {
  CONTENT_FETCH_BASE,
  OLLAMA_HOST,
  OLLAMA_API_KEY,
  SUMMARY_MODEL,
  SUMMARY_TEMPERATURE,
  SUMMARY_MAX_TOKENS
} from '../../config';

const openai = new OpenAI({
  baseURL: OLLAMA_HOST,
  apiKey: OLLAMA_API_KEY,
});

export interface SearchResult {
  link: string;
  score: number;
  title: string;
  bookTitle: string;
  wordCount: number;
  description: {
    b: string[];
    "#text": string;
  };
}

export interface GroundedResponse {
  answer: string;
  sources: {
    title: string;
    link: string;
  }[];
}

/**
 * Generates a search summary based on a query, language, context, and top search results
 * @param query The query to generate a summary for
 * @param language The language to use for the summary
 * @param context The context to use for the summary
 * @param topResults The top search results to include as sources
 * @returns A grounded response object
 */
export async function generateSearchSummary(
  query: string,
  language: string,
  context: string,
  topResults: SearchResult[]
): Promise<GroundedResponse> {
  const prompt = `You are a helpful assistant and using ELI5 & feynman technique without losing details to answer query from various sources.

  ${context
      .replace(/\s+/g, ' ')     // Collapse all whitespace into a single space
      .replace(/^\s+|\s+$/g, '') // Trim start/end
    }

  Question: ${query}

  IMPORTANT: 
    - Be accurate and don't make up information, if not sure answer with "sorry, I could not find reliable source for the information asked".
    - ONLY Answer the question in natural ${language} language based on available sources. 
    - Use active voice.
    - ONLY answer what is asked, NO introductions, NO headings, NO closing paragraph.
    - DO NOT mention any techniques, just reply the content!.`;

  const completion = await openai.chat.completions.create({
    model: SUMMARY_MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: SUMMARY_TEMPERATURE,
    max_tokens: SUMMARY_MAX_TOKENS
  });

  let responseContent = completion.choices[0].message.content || '';
  responseContent = responseContent.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();

  return {
    answer: responseContent,
    sources: topResults.map(r => ({
      title: r.title,
      link: `${CONTENT_FETCH_BASE}${r.link}`
    }))
  };
}