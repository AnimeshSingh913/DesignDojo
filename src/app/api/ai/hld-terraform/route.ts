import { NextResponse } from 'next/server';
import { GroqProvider } from '@/services/ai/providers/GroqProvider';
import { getHLDTerraformPrompt } from '@/services/ai/prompts/HLDTerraformPrompt';
import { checkAndIncrementQuota } from '@/lib/quota';
import { serializeAst, stripCodeFences } from '@/services/ai/utils/sanitize';
import { assertBodySize, errorResponse } from '@/lib/http';

export async function POST(req: Request) {
  try {
    assertBodySize(req, 2 * 1024 * 1024);
    const { ast } = await req.json();

    if (!ast) {
      return NextResponse.json(
        { message: 'AST data is required.' },
        { status: 400 }
      );
    }
    const systemPrompt = getHLDTerraformPrompt(serializeAst(ast));

    // Terraform generation shares the HLD assistant quota
    const quotaResult = await checkAndIncrementQuota(req, 'hldChat');
    if (!quotaResult.success) {
      return NextResponse.json(
        { message: quotaResult.message || 'Limit exceeded' },
        { status: quotaResult.status || 403 }
      );
    }

    const response = await new GroqProvider().generateResponse([{ role: 'system', content: systemPrompt }], undefined, 0.1);

    return NextResponse.json({ data: stripCodeFences(response) }, { status: 200 });
  } catch (error) {
    return errorResponse(error, 'Terraform generation failed. Please try again.');
  }
}
