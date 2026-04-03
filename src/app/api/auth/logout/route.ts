import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set("accessToken", "", { httpOnly: true, path: "/", maxAge: 0 });
  response.cookies.set("refreshToken", "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}

export async function GET() {
  const url = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const response = NextResponse.redirect(`${url}/login`);
  response.cookies.set("accessToken", "", { httpOnly: true, path: "/", maxAge: 0 });
  response.cookies.set("refreshToken", "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}
