import OpenAI from 'openai';

export async function elix(text: string, language: string, ageRange: string) {
  const openai = new OpenAI({
    baseURL: process.env.OLLAMA_BASE_URL + '/v1' || 'http://127.0.0.1:11434/v1',
    apiKey: 'ollama', // required but unused
  });

  const completion = await openai.chat.completions.create({
    model: 'hf.co/second-state/gemma-3n-E2B-it-GGUF:Q5_K_S',
    messages: [
      {
        role: 'user',
        content: `Simplify the following text into ${language}, for a person around ${ageRange} years old. 

Only output the simplified version of the text. Do not include titles, comments, or formatting—just the rewritten text, nothing else.

Text: "${text}"`,
      },
    ],
    max_tokens: 256,
  });

  const content = completion.choices[0]?.message.content?.trim() || '';
  return content;
}