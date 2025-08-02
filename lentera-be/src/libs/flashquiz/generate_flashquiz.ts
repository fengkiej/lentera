import OpenAI from 'openai';
import {
  CONTENT_FETCH_BASE,
  OLLAMA_HOST,
  OLLAMA_API_KEY,
  FLASHQUIZ_MODEL,
  FLASHQUIZ_TEMPERATURE,
  FLASHQUIZ_MAX_TOKENS,
  DEFAULT_QUESTION_COUNT
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

export interface QuizEntry {
  question: string;
  choices: string[];
  correct_answer_choice: string;
}

export interface GroundedQuizSet {
  quizzes: QuizEntry[];
  sources: {
    title: string;
    link: string;
  }[];
}

/**
 * Generates a set of multiple-choice quiz questions based on the provided query and context
 * @param query The query to generate quiz questions for
 * @param language The language to use for the quiz questions
 * @param context The context to use for generating quiz questions
 * @param topResults The top search results to include as sources
 * @param questionCount The number of questions to generate (default: 3)
 * @returns A set of grounded quiz questions with sources
 */
export async function generateFlashquiz(
  query: string,
  language: string,
  context: string,
  topResults: SearchResult[],
  questionCount: number = DEFAULT_QUESTION_COUNT
): Promise<GroundedQuizSet> {
  const prompt = `You are a helpful assistant who creates multiple-choice quizzes using the Feynman technique, with clear and accurate details.

Context:
${context.replace(/\s+/g, ' ').trim()}

Create ${questionCount} multiple-choice quiz question(s) based on this query:
"${query}"

Requirements:
- Use natural ${language} language.
- Each question must have exactly 4 answer choices.
- Clearly mark the correct answer.
- ONLY reply the structured output, NO introductions, NO backticks and NO headings.
- If you can't generate ${questionCount} questions, return fewer based on available info.

Return ONLY a valid JSON array (no markdown, no comments), format:
[
  {
    "question": "string",
    "choices": ["string", "string", "string", "string"],
    "correct_answer_choice": "string"
  },
  ...
]
`;

  const completion = await openai.chat.completions.create({
    model: FLASHQUIZ_MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: FLASHQUIZ_TEMPERATURE,
    max_tokens: FLASHQUIZ_MAX_TOKENS,
  });

  let responseContent = completion.choices[0].message.content || '';
  responseContent = responseContent.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();

  const parsed: QuizEntry[] = JSON.parse(responseContent);

  return {
    quizzes: parsed,
    sources: topResults.map(r => ({
      title: r.title,
      link: `${r.link}`
    }))
  };
}

/**
 * Main function to generate flashquiz
 * @param query The query to generate quiz questions for
 * @param language The language to use for the quiz questions
 * @param context The context to use for generating quiz questions
 * @param topResults The top search results to include as sources
 * @param questionCount The number of questions to generate (default: 3)
 * @returns A set of grounded quiz questions with sources
 */
export async function main(
  query: string,
  language: string,
  context: string,
  topResults: SearchResult[],
  questionCount: number = 3
): Promise<GroundedQuizSet> {
  return generateFlashquiz(query, language, context, topResults, questionCount);
}