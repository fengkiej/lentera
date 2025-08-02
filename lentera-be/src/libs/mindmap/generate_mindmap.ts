import OpenAI from 'openai';
import { SearchResult } from './prepare_context';
import {
  CONTENT_FETCH_BASE,
  OLLAMA_HOST,
  OLLAMA_API_KEY,
  MINDMAP_MODEL,
  MINDMAP_TEMPERATURE,
  MINDMAP_MAX_TOKENS
} from '../../config';

const openai = new OpenAI({
  baseURL: OLLAMA_HOST,
  apiKey: OLLAMA_API_KEY,
});

export interface FacetNode {
  facet: string;
  explanation: string;
  subquestions: string[];
}

export interface MindMap {
  centralTopic: string;
  nodes: FacetNode[];
  sources: {
    title: string;
    link: string;
  }[];
}

/**
 * Generates a mind map based on a query, language, context, and top search results
 * @param query The query to generate a mind map for
 * @param language The language to use for the mind map
 * @param context The context to use for the mind map
 * @param topResults The top search results to include as sources
 * @returns A mind map object
 */
export async function generateMindMap(
  query: string,
  language: string,
  context: string,
  topResults: SearchResult[]
): Promise<MindMap> {
  const prompt = `You are a helpful assistant who explain with ELI5 method + Feynman Technique and creates conceptual mind maps using the Six Facets of Understanding model.

Context:
${context.replace(/\s+/g, ' ').trim()}

Topic:
"${query}"

Your task:
- Create a structured mind map based on the topic above.
- Use the Six Facets of Understanding: Explanation, Interpretation, Application, Perspective, Empathy, and Self-Knowledge.
- For each facet:
  - Give a brief, concise, clear explanation using active voice, based on the context.
  - List 3 simple questions related this facet's explanation, especially for someone unfamiliar with the topic. Each question should focus on a separate aspect or example.
- Use clear, natural ${language} language.
- Be accurate and specific. Do NOT include anything not grounded in the context.

Return ONLY a valid JSON object (no markdown, no comments), format:
{
  "centralTopic": "string",
  "nodes": [
    {
      "facet": "Explanation",
      "explanation": "string",
      "subquestions": ["string", "string", ...]
    },
    {
      "facet": "Interpretation",
      "explanation": "string",
      "subquestions": ["string", "string", ...]
    },
    ...
  ]
}`;

  const completion = await openai.chat.completions.create({
    model: MINDMAP_MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: MINDMAP_TEMPERATURE,
    max_tokens: MINDMAP_MAX_TOKENS,
  });

  let responseContent = completion.choices[0].message.content || '';
  responseContent = responseContent.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();

  const parsed: Omit<MindMap, 'sources'> = JSON.parse(responseContent);

  return {
    ...parsed,
    sources: topResults.map(r => ({
      title: r.title,
      link: `${r.link}`
    }))
  };
}