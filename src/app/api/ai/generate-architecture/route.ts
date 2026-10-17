import { NextResponse } from 'next/server';
import { GroqProvider } from '@/services/ai/providers/GroqProvider';
import { checkAndIncrementQuota } from '@/lib/quota';
import { cleanShortText } from '@/services/ai/utils/sanitize';
import { errorResponse } from '@/lib/http';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const prompt = cleanShortText(body.prompt, 4000);
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required (max 4000 characters).' }, { status: 400 });
    }

    const quotaResult = await checkAndIncrementQuota(req, 'aiGenerator');
    if (!quotaResult.success) {
      return NextResponse.json(
        { error: quotaResult.message || 'Limit exceeded' },
        { status: quotaResult.status || 403 }
      );
    }

    const architecture = await new GroqProvider().generateArchitecture(
      prompt,
      cleanShortText(body.complexity, 50),
      cleanShortText(body.cloudProvider, 50)
    );

    return NextResponse.json(architecture);
  } catch (error) {
    return errorResponse(error, 'Failed to generate architecture', 'error');
  }
}
