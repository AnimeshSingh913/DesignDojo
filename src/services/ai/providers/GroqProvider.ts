import { AIProvider, AIEvaluationResponse, ChatMessage, AIGeneratedArchitecture } from '../types';
import { getLLDReviewPrompt } from '../prompts/LLDReviewPrompt';
import { getLLDChatPrompt } from '../prompts/LLDChatPrompt';
import { getAIGenerationPrompt } from '../prompts/AIGenerationPrompt';
import { serializeAst } from '../utils/sanitize';
import { PublicError } from '@/lib/http';

const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions';
export const DEFAULT_GROQ_MODEL = 'openai/gpt-oss-120b';
const REQUEST_TIMEOUT_MS = 90_000;

/** Server-only Groq key. Never expose it with a NEXT_PUBLIC_ prefix. */
export function getGroqApiKey(): string {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new PublicError('The AI service is not configured. Please set GROQ_API_KEY on the server.', 503);
  }
  return apiKey;
}

export class GroqProvider implements AIProvider {
  private model = DEFAULT_GROQ_MODEL;

  private async complete(body: Record<string, unknown>): Promise<string> {
    const response = await fetch(GROQ_CHAT_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getGroqApiKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model: this.model, ...body }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      console.error('Groq API Error:', response.status, await response.text().catch(() => ''));
      if (response.status === 429) {
        throw new PublicError('The AI service is busy right now. Please try again in a minute.', 503);
      }
      throw new PublicError('The AI service returned an error. Please try again.', 502);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) {
      throw new PublicError('The AI service returned an empty response. Please try again.', 502);
    }
    return content;
  }

  private async completeJSON<T>(body: Record<string, unknown>): Promise<T> {
    const content = await this.complete({ ...body, response_format: { type: 'json_object' } });
    try {
      return JSON.parse(content) as T;
    } catch {
      console.error('Failed to parse Groq output as JSON:', content.slice(0, 500));
      throw new PublicError('Failed to parse AI response. The model did not return valid JSON.', 502);
    }
  }

  async evaluateDesign(ast: any, diagramType: string, customSystemPrompt?: string): Promise<AIEvaluationResponse> {
    const systemPrompt = customSystemPrompt || getLLDReviewPrompt(diagramType);

    return this.completeJSON<AIEvaluationResponse>({
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Evaluate the following AST:\n\n${serializeAst(ast)}\n\nReturn the evaluation in the requested JSON format.`,
        },
      ],
      temperature: 0.1, // Low temperature for more deterministic review
    });
  }

  async chatWithDesign(messages: ChatMessage[], ast: any, diagramType: string, customSystemPrompt?: string): Promise<string> {
    const systemPrompt = customSystemPrompt || getLLDChatPrompt(diagramType);

    // System prompt + AST context + (already sanitised) user conversation
    return this.complete({
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'system',
          content: `CURRENT DIAGRAM AST CONTEXT:\n${serializeAst(ast)}\nUse this context to answer the user's questions.`,
        },
        ...messages,
      ],
      temperature: 0.5, // Slightly higher for chat
    });
  }

  async generateResponse(messages: ChatMessage[], model?: string, temperature?: number): Promise<string> {
    return this.complete({
      ...(model ? { model } : {}),
      messages,
      temperature: temperature ?? 0.2,
    });
  }

  async generateArchitecture(prompt: string, complexity?: string, cloudProvider?: string): Promise<AIGeneratedArchitecture> {
    return this.completeJSON<AIGeneratedArchitecture>({
      messages: [
        { role: 'system', content: getAIGenerationPrompt(complexity, cloudProvider) },
        { role: 'user', content: `Generate an architecture for the following prompt:\n\n${prompt}` },
      ],
      temperature: 0.3,
    });
  }
}
