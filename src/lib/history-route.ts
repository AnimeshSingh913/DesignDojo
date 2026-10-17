import { NextResponse } from 'next/server';
import type { Model } from 'mongoose';
import dbConnect from '@/lib/db';
import { getAuthUser } from '@/lib/auth-check';
import { assertBodySize, errorResponse } from '@/lib/http';
import { cleanShortText } from '@/services/ai/utils/sanitize';

const MAX_BODY_BYTES = 8 * 1024 * 1024; // keep well under MongoDB's 16 MB document limit
const MAX_PREVIEW_CHARS = 3 * 1024 * 1024;
const MAX_CHAT_MESSAGES = 200;
const MAX_RECORDS_RETURNED = 50;

/** Shared GET/POST handlers for the per-user HLD/LLD review history collections. */
export function createHistoryHandlers(HistoryModel: Model<any>, label: string) {
  async function POST(req: Request) {
    try {
      const authUser = await getAuthUser(req);
      if (!authUser) {
        return NextResponse.json({ message: 'Please sign in to save history.' }, { status: 401 });
      }

      assertBodySize(req, MAX_BODY_BYTES);
      const { diagramType, ast, elements, previewImage, evaluation, chatHistory } = await req.json();
      const type = cleanShortText(diagramType, 100);

      if (!type || !ast || !evaluation) {
        return NextResponse.json(
          { message: 'diagramType, ast, and evaluation are required fields.' },
          { status: 400 }
        );
      }

      const safePreview =
        typeof previewImage === 'string' && previewImage.startsWith('data:image/') && previewImage.length <= MAX_PREVIEW_CHARS
          ? previewImage
          : undefined;

      await dbConnect();
      const historyRecord = await HistoryModel.create({
        userId: authUser.id,
        diagramType: type,
        ast,
        elements: Array.isArray(elements) ? elements : undefined,
        previewImage: safePreview,
        evaluation,
        chatHistory: Array.isArray(chatHistory) ? chatHistory.slice(-MAX_CHAT_MESSAGES) : [],
      });

      return NextResponse.json(
        { message: 'History saved successfully.', data: historyRecord },
        { status: 201 }
      );
    } catch (error) {
      return errorResponse(error, `Failed to save ${label} history.`);
    }
  }

  async function GET(req: Request) {
    try {
      const authUser = await getAuthUser(req);
      if (!authUser) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
      }

      await dbConnect();
      const histories = await HistoryModel.find({ userId: authUser.id })
        .sort({ createdAt: -1 })
        .limit(MAX_RECORDS_RETURNED)
        .lean();
      return NextResponse.json({ data: histories }, { status: 200 });
    } catch (error) {
      return errorResponse(error, `Failed to load ${label} history.`);
    }
  }

  return { GET, POST };
}
