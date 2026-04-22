import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const { title, category } = await req.json();

  if (title !== undefined) {
    await prisma.$executeRaw`
      UPDATE "Todo" SET "title" = ${title}, "updatedAt" = NOW()
      WHERE "id" = ${params.id} AND "userId" = ${userId}
    `;
  }
  if (category !== undefined) {
    await prisma.$executeRaw`
      UPDATE "Todo" SET "category" = ${category}, "updatedAt" = NOW()
      WHERE "id" = ${params.id} AND "userId" = ${userId}
    `;
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  await prisma.$executeRaw`
    DELETE FROM "Todo" WHERE "id" = ${params.id} AND "userId" = ${userId}
  `;
  return NextResponse.json({ ok: true });
}
