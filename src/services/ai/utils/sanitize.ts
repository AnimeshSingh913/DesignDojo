import { PublicError } from '@/lib/http';

export interface SafeChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Keeps only user/assistant turns with string content, so clients can never inject
 * their own `system` prompt, and caps history size to bound token usage.
 */
export function sanitizeChatMessages(
  messages: unknown,
  { maxMessages = 20, maxCharsPerMessage = 8000, maxTotalChars = 60000 } = {}
): SafeChatMessage[] {
  if (!Array.isArray(messages)) {
    throw new PublicError('messages must be an array.', 400);
  }

  const cleaned = messages
    .filter((m: any) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m: any) => ({ role: m.role, content: m.content.slice(0, maxCharsPerMessage) }) as SafeChatMessage)
    .slice(-maxMessages);

  // Drop the oldest turns until the total fits the budget
  let total = cleaned.reduce((sum, m) => sum + m.content.length, 0);
  while (cleaned.length > 1 && total > maxTotalChars) {
    total -= cleaned.shift()!.content.length;
  }

  if (cleaned.length === 0 || cleaned[cleaned.length - 1].role !== 'user') {
    throw new PublicError('The last message must be a user message.', 400);
  }

  return cleaned;
}

/** Serialises a diagram AST for the prompt, rejecting absurdly large payloads. */
export function serializeAst(ast: unknown, maxChars = 120_000): string {
  const json = JSON.stringify(ast, null, 2) ?? '';
  if (json.length > maxChars) {
    throw new PublicError('The diagram is too large to analyse. Try splitting it into smaller diagrams.', 413);
  }
  return json;
}

/** Removes markdown code fences in case the model ignored the "raw code only" instruction. */
export function stripCodeFences(text: string): string {
  return text.replace(/^\s*```[a-zA-Z]*\s*\n/gm, '').replace(/^\s*```\s*$/gm, '').trim();
}

export function cleanShortText(value: unknown, maxLength: number): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, maxLength) : undefined;
}
