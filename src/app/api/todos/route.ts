import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const todos = await prisma.$queryRaw`
    SELECT * FROM "Todo" WHERE "userId" = ${userId} ORDER BY "order" ASC, "createdAt" ASC
  `;
  return NextResponse.json(todos);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const body = await req.json();

  await prisma.$executeRaw`
    INSERT INTO "Todo" ("id", "userId", "title", "category", "order", "createdAt", "updatedAt")
    VALUES (${body.id}, ${userId}, ${body.title}, ${body.category}, ${body.order}, NOW(), NOW())
  `;
  return NextResponse.json({ ok: true }, { status: 201 });
}
