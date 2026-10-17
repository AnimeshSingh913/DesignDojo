const MODES = ['mentor', 'interview', 'review', 'learning'];
const ROLES = ['user', 'assistant', 'system', 'error'];
const MAX_MESSAGES = 500;
const MAX_MESSAGE_CHARS = 100_000;
const MAX_EXTRACTED_TEXT = 50_000;

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : undefined);

function cleanAttachment(a: any) {
  if (!a || typeof a !== 'object' || !['image', 'pdf'].includes(a.type)) return null;
  return {
    id: str(a.id, 64) || 'attachment',
    type: a.type,
    fileName: str(a.fileName, 200) || 'file',
    url: '', // binary/base64 payloads are never persisted
    extractedText: str(a.extractedText, MAX_EXTRACTED_TEXT),
  };
}

function cleanMessage(m: any) {
  if (!m || typeof m !== 'object' || !ROLES.includes(m.role) || typeof m.content !== 'string') return null;
  return {
    id: str(m.id, 64) || String(Math.random()).slice(2),
    role: m.role,
    content: m.content.slice(0, MAX_MESSAGE_CHARS) || ' ',
    createdAt: typeof m.createdAt === 'number' ? m.createdAt : Date.now(),
    attachments: Array.isArray(m.attachments) ? m.attachments.map(cleanAttachment).filter(Boolean).slice(0, 10) : [],
  };
}

/**
 * Whitelists the fields a client may write on a mentor chat document.
 * Prevents mass-assignment (e.g. overwriting `user` to move a chat into another account).
 */
export function pickMentorChatFields(body: any) {
  const update: Record<string, unknown> = {};
  if (!body || typeof body !== 'object') return update;

  const title = str(body.title, 200);
  if (title) update.title = title;
  if (typeof body.pinned === 'boolean') update.pinned = body.pinned;
  if (MODES.includes(body.mode)) update.mode = body.mode;
  if (Array.isArray(body.messages)) {
    update.messages = body.messages.slice(-MAX_MESSAGES).map(cleanMessage).filter(Boolean);
  }
  update.updatedAt = typeof body.updatedAt === 'number' ? body.updatedAt : Date.now();
  return update;
}
