import OpenAI from 'openai';
import { jsonrepair } from 'jsonrepair';

/**
 * Extracts the most relevant keywords from a query for Kiwix search
 * @param q The query text to extract keywords from
 * @returns An array of relevant keywords
 */
export async function extractKeywords(q: string): Promise<string[]> {
  const openai = new OpenAI({
    baseURL: process.env.OLLAMA_BASE_URL + '/v1' || 'http://127.0.0.1:11434/v1',
    apiKey: 'ollama', // required but unused
  });

  const completion = await openai.chat.completions.create({
    model: 'hf.co/aisingapore/Llama-SEA-LION-v3.5-8B-R-GGUF:Q4_K_M',
    messages: [
      {
        role: 'user',
        content: `Please determine 5 most relevant search keywords for query: ${q}. Respond ONLY in this format: { "keywords": string[] }`,
      },
    ],
    temperature: 0.2,
    max_tokens: 128,
  });

  let content = completion.choices[0]?.message?.content?.trim() || '';

  // Remove Markdown code fences if present
  if (content.startsWith('```')) {
    content = content.replace(/```(?:json)?\n?/, '').replace(/```$/, '').trim();
  }

  // Use jsonrepair to fix any minor issues in the JSON
  const fixed = jsonrepair(content);

  // Parse and return the keywords array
  return JSON.parse(fixed).keywords;
}