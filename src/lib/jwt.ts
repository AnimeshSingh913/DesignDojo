import jwt from 'jsonwebtoken';

export const AUTH_COOKIE = 'token';
export const TOKEN_TTL_SECONDS = 24 * 60 * 60; // 24 hours

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be set to a random string of at least 32 characters.');
  }
  return secret;
}

export interface TokenPayload {
  id: string;
}

export function signAuthToken(userId: string): string {
  // Only the user id is stored in the token; role/email are always read fresh from the DB.
  return jwt.sign({ id: userId }, getJwtSecret(), { expiresIn: TOKEN_TTL_SECONDS });
}

export function verifyAuthToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as jwt.JwtPayload;
    return typeof decoded?.id === 'string' ? { id: decoded.id } : null;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(req: Request): string | null {
  const cookieHeader = req.headers.get('cookie');
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === AUTH_COOKIE) return decodeURIComponent(rest.join('='));
  }
  return null;
}
