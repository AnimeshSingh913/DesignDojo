import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { MentorChat } from '@/models/MentorChat';
import { getAuthUser } from '@/lib/auth-check';
import { assertBodySize, errorResponse } from '@/lib/http';
import { pickMentorChatFields } from '@/lib/mentor-chat-input';

// PUT update a chat (title, messages, etc). Creates it if the initial POST hasn't landed yet.
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

    assertBodySize(req, 4 * 1024 * 1024);
    const body = await req.json();
    const { id } = await params;
    if (!/^[\w-]{1,64}$/.test(id)) {
      return NextResponse.json({ message: 'Invalid chat id' }, { status: 400 });
    }

    await dbConnect();

    const existing = await MentorChat.findOne({ id }).select('user').lean<{ user: any }>();
    if (existing && existing.user.toString() !== authUser.id) {
      return NextResponse.json({ message: 'Chat not found or unauthorized' }, { status: 404 });
    }

    // Only whitelisted fields can be written, and only on the caller's own chat
    const updatedChat = await MentorChat.findOneAndUpdate(
      { id, user: authUser.id },
      {
        $set: pickMentorChatFields(body),
        $setOnInsert: { id, user: authUser.id, createdAt: typeof body.createdAt === 'number' ? body.createdAt : Date.now() },
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({ chat: updatedChat }, { status: 200 });
  } catch (error) {
    return errorResponse(error, 'Error updating chat');
  }
}

// DELETE a chat
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

    const { id } = await params;

    await dbConnect();

    const deletedChat = await MentorChat.findOneAndDelete({ id, user: authUser.id });

    if (!deletedChat) {
      return NextResponse.json({ message: 'Chat not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Deleted successfully' }, { status: 200 });
  } catch (error) {
    return errorResponse(error, 'Error deleting chat');
  }
}
