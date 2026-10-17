import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-check';
import { errorResponse } from '@/lib/http';
import { rateLimit } from '@/lib/rate-limit';
import { cleanShortText } from '@/services/ai/utils/sanitize';
import { DEFAULT_GROQ_MODEL, getGroqApiKey } from '@/services/ai/providers/GroqProvider';

export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    if (!rateLimit(`mentor-title:${authUser.id}`, 30, 60 * 60 * 1000)) {
      return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
    }

    const { message } = await req.json().catch(() => ({}));
    const prompt = cleanShortText(message, 1000);
    if (!prompt) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    const groq = createOpenAI({
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey: getGroqApiKey(),
    });

    const { text } = await generateText({
      model: groq.chat(DEFAULT_GROQ_MODEL),
      system: 'You are a title generator. Given a user prompt, generate a short, concise, and professional title (max 5 words) summarizing it. Do not include quotes or punctuation at the end.',
      prompt,
      temperature: 0.3,
    });

    const title = text.trim().replace(/^["']|["']$/g, '').slice(0, 80);
    return NextResponse.json({ title });
  } catch (error) {
    return errorResponse(error, 'Failed to generate title', 'error');
  }
}
