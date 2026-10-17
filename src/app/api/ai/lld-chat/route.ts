import { NextResponse } from 'next/server';
import { GroqProvider } from '@/services/ai/providers/GroqProvider';
import { checkAndIncrementQuota } from '@/lib/quota';
import { cleanShortText, sanitizeChatMessages } from '@/services/ai/utils/sanitize';
import { assertBodySize, errorResponse } from '@/lib/http';

export async function POST(req: Request) {
  try {
    assertBodySize(req, 2 * 1024 * 1024);
    const { messages, ast, diagramType } = await req.json();

    if (!ast) {
      return NextResponse.json(
        { message: 'AST data and messages array are required.' },
        { status: 400 }
      );
    }
    const safeMessages = sanitizeChatMessages(messages);

    const quotaResult = await checkAndIncrementQuota(req, 'lldChat');
    if (!quotaResult.success) {
      return NextResponse.json(
        { message: quotaResult.message || 'Limit exceeded' },
        { status: quotaResult.status || 403 }
      );
    }

    const reply = await new GroqProvider().chatWithDesign(safeMessages, ast, cleanShortText(diagramType, 100) || 'Unknown Diagram');

    return NextResponse.json(
      {
        message: 'Chat successful',
        data: reply,
        quota: {
          current: quotaResult.current,
          max: quotaResult.max,
          remaining: quotaResult.remaining,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    return errorResponse(error, 'AI chat failed. Please try again.');
  }
}
