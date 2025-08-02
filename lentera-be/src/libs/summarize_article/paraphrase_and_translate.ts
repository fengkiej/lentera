import OpenAI from 'openai';
import { OLLAMA_HOST, DEFAULT_LLM_MODEL, OLLAMA_API_KEY, PARAPHRASE_MAX_TOKENS } from '../../config';

/**
 * Paraphrases and translates text into the specified language
 * @param text The text to paraphrase and translate
 * @param language The target language for translation
 * @returns A paraphrased and translated version of the text
 */
export async function paraphraseAndTranslate(text: string, language: string): Promise<string> {
  const openai = new OpenAI({
    baseURL: OLLAMA_HOST,
    apiKey: OLLAMA_API_KEY, // required but unused
  });

  const completion = await openai.chat.completions.create({
    model: DEFAULT_LLM_MODEL,
    messages: [
      {
        role: 'user',
        content:
          `summarize & translate into clear, easy-to-understand short paragraph without any labels or headings in natural ${language} language:\n\n${text}`,
      },
    ],
    max_tokens: PARAPHRASE_MAX_TOKENS
  });

  return completion.choices[0].message.content || '';
}