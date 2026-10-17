import { NextResponse } from 'next/server';
import { PDFParse } from 'pdf-parse';
import { getAuthUser } from '@/lib/auth-check';
import { assertBodySize, errorResponse } from '@/lib/http';
import { limitByIp } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const MAX_PDF_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_PAGES = 50;
const MAX_TEXT_CHARS = 50_000;

export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Please sign in to upload files.' }, { status: 401 });
    }

    const limited = limitByIp(req, 'parse-pdf', 20, 60 * 60 * 1000);
    if (limited) return limited;

    assertBodySize(req, MAX_PDF_BYTES + 64 * 1024);
    const formData = await req.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (file.size > MAX_PDF_BYTES) {
      return NextResponse.json({ error: 'PDF is too large (max 10 MB).' }, { status: 413 });
    }

    const data = new Uint8Array(await file.arrayBuffer());
    // Every PDF starts with the "%PDF" magic bytes
    if (data.length < 4 || String.fromCharCode(...data.subarray(0, 4)) !== '%PDF') {
      return NextResponse.json({ error: 'Only PDF files are supported.' }, { status: 400 });
    }

    const parser = new PDFParse({ data });
    try {
      const result = await parser.getText({ first: MAX_PAGES });
      const text = result.text.slice(0, MAX_TEXT_CHARS);
      return NextResponse.json({ text, truncated: result.text.length > MAX_TEXT_CHARS || result.total > MAX_PAGES });
    } finally {
      await parser.destroy();
    }
  } catch (error) {
    return errorResponse(error, 'Failed to parse PDF', 'error');
  }
}
