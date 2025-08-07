import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

// @ts-ignore
export async function verifyToken(token: string): string {
  try {
    const decoded = await jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded?.userId ? decoded.userId : "";
  } catch {
    return "";
  }
}

export async function getUserIdFromRequest(
  request: NextRequest
): Promise<string> {
  const token = request.cookies.get("token")?.value;
  if (!token) return "";

  const decoded = await verifyToken(token);
  return decoded;
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}