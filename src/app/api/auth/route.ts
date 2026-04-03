import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

function generateTokens(userId: string, organizationId: string) {
  const accessToken = jwt.sign({ userId, organizationId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
  const refreshToken = jwt.sign({ userId, organizationId, type: "refresh" }, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });
  return { accessToken, refreshToken };
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action } = body;

  if (action === "register") {
    const { email, password, name, organizationName } = body;

    if (!email || !password || !name || !organizationName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const slug = organizationName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const organization = await prisma.organization.create({
      data: {
        name: organizationName,
        slug,
        users: {
          create: { email, passwordHash, name, role: "OWNER" },
        },
      },
      include: { users: true },
    });

    const user = organization.users[0];
    const tokens = generateTokens(user.id, organization.id);

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      organization: { id: organization.id, name: organization.name, slug: organization.slug },
      ...tokens,
    });
  }

  if (action === "login") {
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { organization: true },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const tokens = generateTokens(user.id, user.organizationId);

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      organization: {
        id: user.organization.id,
        name: user.organization.name,
        slug: user.organization.slug,
      },
      ...tokens,
    });
  }

  if (action === "refresh") {
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json({ error: "Missing refresh token" }, { status: 400 });
    }

    try {
      const payload = jwt.verify(refreshToken, JWT_SECRET) as {
        userId: string;
        organizationId: string;
        type: string;
      };

      if (payload.type !== "refresh") {
        return NextResponse.json({ error: "Invalid token type" }, { status: 401 });
      }

      const tokens = generateTokens(payload.userId, payload.organizationId);
      return NextResponse.json(tokens);
    } catch {
      return NextResponse.json({ error: "Invalid or expired refresh token" }, { status: 401 });
    }
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
