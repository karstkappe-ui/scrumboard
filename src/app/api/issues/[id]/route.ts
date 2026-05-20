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
    if (data.createdAt) delete data.createdAt;

    // When moving back to backlog, also reset status to 'backlog'
    if ('sprintId' in data && data.sprintId === null && !('status' in data)) {
      data.status = 'backlog';
    }

    const issue = await prisma.issue.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json(issue);
  } catch (err) {
    console.error('[issues PATCH]', err);
    return NextResponse.json({ error: 'Failed to update issue' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await prisma.issue.delete({ where: { id: params.id } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error('[issues DELETE]', err);
    return NextResponse.json({ error: 'Failed to delete issue' }, { status: 500 });
  }
}
