import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const sprint = await prisma.sprint.create({
      data: {
        id: body.id,
        name: body.name,
        goal: body.goal ?? null,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        status: body.status,
        projectId: body.projectId,
        createdAt: new Date(body.createdAt),
        updatedAt: new Date(body.updatedAt),
      },
    });
    return NextResponse.json(sprint, { status: 201 });
  } catch (err) {
    console.error('[sprints POST]', err);
    return NextResponse.json({ error: 'Failed to create sprint' }, { status: 500 });
  }
}
