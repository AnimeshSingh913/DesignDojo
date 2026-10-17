import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { MentorChat } from '@/models/MentorChat';
import { getAuthUser } from '@/lib/auth-check';
import { assertBodySize, errorResponse } from '@/lib/http';
import { pickMentorChatFields } from '@/lib/mentor-chat-input';

// GET all chats for the logged in user
export async function GET(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

    await dbConnect();

    // Sort by updated at descending
    const chats = await MentorChat.find({ user: authUser.id }).sort({ updatedAt: -1 }).limit(200).lean();

    // Map _id and cleanup
    const formattedChats = chats.map((chat: any) => ({
      id: chat.id,
      title: chat.title,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      messages: chat.messages,
      pinned: chat.pinned,
      mode: chat.mode
    }));

    return NextResponse.json({ chats: formattedChats }, { status: 200 });
  } catch (error) {
    return errorResponse(error, 'Error fetching history');
  }
}

// POST create a new chat (idempotent: re-posting the same id just updates it)
export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

    assertBodySize(req, 4 * 1024 * 1024);
    const body = await req.json();
    const id = typeof body.id === 'string' && /^[\w-]{1,64}$/.test(body.id) ? body.id : null;
    if (!id) return NextResponse.json({ message: 'A valid chat id is required' }, { status: 400 });

    await dbConnect();

    const existing = await MentorChat.findOne({ id }).select('user').lean<{ user: any }>();
    if (existing && existing.user.toString() !== authUser.id) {
      return NextResponse.json({ message: 'Chat id already in use' }, { status: 409 });
    }

    const chat = await MentorChat.findOneAndUpdate(
      { id, user: authUser.id },
      {
        $set: pickMentorChatFields(body),
        $setOnInsert: { id, user: authUser.id, createdAt: typeof body.createdAt === 'number' ? body.createdAt : Date.now() },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ chat }, { status: 201 });
  } catch (error) {
    return errorResponse(error, 'Error creating chat');
  }
}
