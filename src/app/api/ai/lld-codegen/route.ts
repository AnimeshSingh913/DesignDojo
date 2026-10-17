import { NextResponse } from 'next/server';
import { GroqProvider } from '@/services/ai/providers/GroqProvider';
import { getLLDCodeGenPrompt } from '@/services/ai/prompts/LLDCodeGenPrompt';
import { checkAndIncrementQuota } from '@/lib/quota';
import { cleanShortText, serializeAst, stripCodeFences } from '@/services/ai/utils/sanitize';
import { assertBodySize, errorResponse } from '@/lib/http';

export async function POST(req: Request) {
  try {
    assertBodySize(req, 2 * 1024 * 1024);
    const body = await req.json();
    const diagramType = cleanShortText(body.diagramType, 100);
    const language = cleanShortText(body.language, 40);

    if (!body.ast || !diagramType || !language) {
      return NextResponse.json(
        { message: 'AST, diagramType, and language are required fields.' },
        { status: 400 }
      );
    }
    const systemPrompt = getLLDCodeGenPrompt(language, diagramType, serializeAst(body.ast));

    // Code generation shares the LLD assistant quota
    const quotaResult = await checkAndIncrementQuota(req, 'lldChat');
    if (!quotaResult.success) {
      return NextResponse.json(
        { message: quotaResult.message || 'Limit exceeded' },
        { status: quotaResult.status || 403 }
      );
    }

    // Lower temperature for more deterministic code generation
    const response = await new GroqProvider().generateResponse([{ role: 'system', content: systemPrompt }], undefined, 0.2);

    return NextResponse.json({ data: stripCodeFences(response) }, { status: 200 });
  } catch (error) {
    return errorResponse(error, 'Code generation failed. Please try again.');
  }
}
