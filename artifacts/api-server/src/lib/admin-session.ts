import {
  createHmac,
  timingSafeEqual,
} from "node:crypto";
import type { Request, Response } from "express";

const COOKIE_NAME = "portfolio_admin";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

type AdminSession = {
  id: number;
  firstName: string;
  username?: string;
};

function secret(): string {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 16) {
    throw new Error("SESSION_SECRET must be configured with at least 16 characters");
  }
  return value;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function encode(session: AdminSession): string {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function decode(value: string): AdminSession | null {
  const [payload, received] = value.split(".");
  if (!payload || !received) return null;
  const expected = sign(payload);
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);
  if (
    receivedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(receivedBuffer, expectedBuffer)
  ) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString()) as AdminSession;
    if (
      typeof parsed.id !== "number" ||
      typeof parsed.firstName !== "string" ||
      (parsed.username !== undefined && typeof parsed.username !== "string")
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function cookies(req: Request): Record<string, string> {
  const header = req.headers.cookie ?? "";
  return Object.fromEntries(
    header
      .split(";")
      .map((part) => part.trim().split("="))
      .filter(([key, value]) => key && value)
      .map(([key, ...value]) => [key, value.join("=")]),
  );
}

export function getAdminSession(req: Request): AdminSession | null {
  const value = cookies(req)[COOKIE_NAME];
  return value ? decode(decodeURIComponent(value)) : null;
}

export function setAdminSession(res: Response, session: AdminSession): void {
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${encodeURIComponent(encode(session))}; Max-Age=${MAX_AGE_SECONDS}; Path=/; HttpOnly; SameSite=Lax`,
  );
}

export function clearAdminSession(res: Response): void {
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax`,
  );
}

export function requireAdmin(req: Request, res: Response): boolean {
  if (getAdminSession(req)) return true;
  res.status(401).json({ error: "Admin session required" });
  return false;
}