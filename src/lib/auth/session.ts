import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export interface SessionUser {
  userId: string;
  organizationId: string;
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET) as SessionUser;
    return { userId: payload.userId, organizationId: payload.organizationId };
  } catch {
    return null;
  }
}

export function setAuthCookies(
  accessToken: string,
  refreshToken: string
): Array<{ name: string; value: string; options: Record<string, unknown> }> {
  const secure = process.env.NODE_ENV === "production";
  return [
    {
      name: "accessToken",
      value: accessToken,
      options: {
        httpOnly: true,
        secure,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 15, // 15 minutes
      },
    },
    {
      name: "refreshToken",
      value: refreshToken,
      options: {
        httpOnly: true,
        secure,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      },
    },
  ];
}

export function clearAuthCookies(): Array<{ name: string; value: string; options: Record<string, unknown> }> {
  return [
    { name: "accessToken", value: "", options: { httpOnly: true, path: "/", maxAge: 0 } },
    { name: "refreshToken", value: "", options: { httpOnly: true, path: "/", maxAge: 0 } },
  ];
}
