import { NextResponse } from 'next/server';
import { GroqProvider } from '@/services/ai/providers/GroqProvider';
import { checkAndIncrementQuota } from '@/lib/quota';
import { cleanShortText } from '@/services/ai/utils/sanitize';
import { assertBodySize, errorResponse } from '@/lib/http';

export async function POST(req: Request) {
  try {
    assertBodySize(req, 2 * 1024 * 1024);
    const { ast, diagramType } = await req.json();

    if (!ast) {
      return NextResponse.json(
        { message: 'AST data is required.' },
        { status: 400 }
      );
    }

    const quotaResult = await checkAndIncrementQuota(req, 'lldReview');
    if (!quotaResult.success) {
      return NextResponse.json(
        { message: quotaResult.message || 'Limit exceeded' },
        { status: quotaResult.status || 403 }
      );
    }

    const evaluation = await new GroqProvider().evaluateDesign(ast, cleanShortText(diagramType, 100) || 'Unknown Diagram');

    return NextResponse.json(
      {
        message: 'Evaluation successful',
        data: evaluation,
        quota: {
          current: quotaResult.current,
          max: quotaResult.max,
          remaining: quotaResult.remaining,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    return errorResponse(error, 'AI evaluation failed. Please try again.');
  }
}
