import { ChatMessage, Attachment } from '@/store/useMentorStore';

export interface AIContextPayload {
  /** Recent user/assistant turns only — the system prompt is built on the server. */
  messages: { role: 'user' | 'assistant'; content: string }[];
  /** Text extracted from PDFs attached to the current turn. */
  documents: { fileName: string; text: string }[];
}

/**
 * Context Manager for AI Design Mentor
 * Trims history to the most recent turns and collects active attachments.
 */
export class ContextManager {
  static buildPayload(
    history: ChatMessage[],
    activeAttachments: Attachment[],
    maxRecentMessages: number = 10
  ): AIContextPayload {
    const messages = history
      .filter((msg) => (msg.role === 'user' || msg.role === 'assistant') && msg.content && msg.content !== '...')
      .slice(-maxRecentMessages)
      .map((msg) => ({ role: msg.role as 'user' | 'assistant', content: msg.content }));

    const documents = activeAttachments
      .filter((att) => att.type === 'pdf' && att.extractedText)
      .map((att) => ({ fileName: att.fileName, text: att.extractedText as string }));

    return { messages, documents };
  }
}
