import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const data: Record<string, unknown> = { ...body, updatedAt: new Date() };
    if (data.id) delete data.id;
    if (data.createdAt) delete data.createdAt;
    if (data.startDate) data.startDate = new Date(data.startDate as string);
    if (data.endDate) data.endDate = new Date(data.endDate as string);

    const sprint = await prisma.sprint.update({ where: { id: params.id }, data });
    return NextResponse.json(sprint);
  } catch (err) {
    console.error('[sprints PATCH]', err);
    return NextResponse.json({ error: 'Failed to update sprint' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await prisma.sprint.delete({ where: { id: params.id } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error('[sprints DELETE]', err);
    return NextResponse.json({ error: 'Failed to delete sprint' }, { status: 500 });
  }
}
