import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const userId = (session.user as { id: string }).id;
    const raw = await prisma.$queryRaw<Record<string, unknown>[]>`
      SELECT
        "id",
        "userId",
        "title",
        "category",
        COALESCE("priority", 'none') AS "priority",
        CAST("order" AS INTEGER) AS "order",
        to_char("createdAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "createdAt",
        to_char("updatedAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "updatedAt"
      FROM "Todo"
      WHERE "userId" = ${userId}
      ORDER BY "order" ASC, "createdAt" ASC
    `;
    return NextResponse.json(raw);
  } catch (err) {
    console.error('[GET /api/todos]', err);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const body = await req.json();

  const priority = body.priority ?? 'none';
  await prisma.$executeRaw`
    INSERT INTO "Todo" ("id", "userId", "title", "category", "priority", "order", "createdAt", "updatedAt")
    VALUES (${body.id}, ${userId}, ${body.title}, ${body.category}, ${priority}, ${body.order}, NOW(), NOW())
  `;
  return NextResponse.json({ ok: true }, { status: 201 });
}
