import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "jee_session";
const DEV_SECRET_FALLBACK = "dev-secret-change-me-in-production";
/** Cost-12 hash of a throwaway password — compared against when the email is unknown so login timing can't reveal account existence. */
const DUMMY_PASSWORD_HASH = "$2b$12$elq/SmpvLFEzoswRtLtSRO990yIiBwNVtpKlc0g65uGk4yndL8ebG";

let cachedSecret: Uint8Array | null = null;
function getSecret(): Uint8Array {
  cachedSecret ??= new TextEncoder().encode(requireSecret());
  return cachedSecret;
}
function requireSecret(): string {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET is not set. Generate one with `openssl rand -base64 32`.");
  }
  return DEV_SECRET_FALLBACK;
}

/** Post-login redirect target — same-origin relative paths only, so `next=//evil.com` or `next=https://…` cannot redirect off-site. Whitespace is rejected too: browsers strip it from URLs, which would turn `/\tevil.com` into a protocol-relative URL. */
export function safeNextPath(raw: FormDataEntryValue | null | undefined): string {
  const next = String(raw ?? "");
  return /^\/[^\s/\\]\S*$/.test(next) ? next : "/dashboard";
}

export type SessionUser = {
  id: string;
  email: string;
  name: string;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({ sub: user.id, email: user.email, name: user.name })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return { id: payload.sub as string, email: payload.email as string, name: payload.name as string };
  } catch {
    return null;
  }
}

/** Throws if unauthenticated — use in server actions/route handlers. */
export async function requireUser() {
  const user = await getSessionUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function signup(email: string, password: string, name: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with this email already exists." as const };
  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash: await hashPassword(password),
      profile: { create: {} },
      preferences: { create: {} },
    },
  });
  return { user: { id: user.id, email: user.email, name: user.name } };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_PASSWORD_HASH);
  if (!user || !ok) return { error: "Invalid email or password." as const };
  return { user: { id: user.id, email: user.email, name: user.name } };
}
