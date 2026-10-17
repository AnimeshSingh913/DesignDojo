import { getServerSession } from "next-auth/next";
import mongoose from "mongoose";
import { authOptions } from "@/lib/auth-options";
import { getTokenFromRequest, verifyAuthToken } from "@/lib/jwt";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export interface AuthUserInfo {
  id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin';
}

function toAuthUser(dbUser: any): AuthUserInfo {
  return {
    id: dbUser._id.toString(),
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role === 'admin' ? 'admin' : 'user',
  };
}

/**
 * Resolves the signed-in user from either the email/password JWT cookie or the NextAuth session.
 * The role is always read from the database so that promotions/demotions take effect immediately.
 */
export async function getAuthUser(req: Request): Promise<AuthUserInfo | null> {
  try {
    // 1. Custom JWT cookie (email/password login)
    const token = getTokenFromRequest(req);
    const payload = token ? verifyAuthToken(token) : null;
    if (payload && mongoose.isValidObjectId(payload.id)) {
      await dbConnect();
      const dbUser = await User.findById(payload.id).select('name email role');
      if (dbUser) return toAuthUser(dbUser);
    }

    // 2. NextAuth session (Google / GitHub)
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      await dbConnect();
      const dbUser = await User.findOne({ email: session.user.email.toLowerCase() }).select('name email role');
      if (dbUser) return toAuthUser(dbUser);
    }

    return null;
  } catch (error) {
    console.error("getAuthUser failed:", error);
    return null;
  }
}

export async function checkAuth(req: Request): Promise<boolean> {
  const user = await getAuthUser(req);
  return !!user;
}

export async function requireAdmin(req: Request): Promise<AuthUserInfo | null> {
  const user = await getAuthUser(req);
  if (!user || user.role !== 'admin') {
    return null;
  }
  return user;
}
