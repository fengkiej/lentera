import OpenAI from 'openai';
import { OLLAMA_HOST, DEFAULT_LLM_MODEL, OLLAMA_API_KEY, TRANSLATE_MAX_TOKENS } from '../../config';

/**
 * Translates text from the specified language to English
 * @param text The text to translate
 * @param language The source language of the text
 * @returns The translated text in English
 */
export async function translate(text: string, language: string): Promise<string> {
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
          `You translate text from ${language} to English. Text: ${text}\n\nRespond ONLY in this format: { "translation": "..." }.`,
      },
    ],
    max_tokens: TRANSLATE_MAX_TOKENS,
  });

  let content = completion.choices[0]?.message.content?.trim() || '';

  // Remove code block if present
  if (content.startsWith('```')) {
    content = content.replace(/```(?:json)?\n?/, '').replace(/```$/, '').trim();
  }

  return JSON.parse(content).translation;
}