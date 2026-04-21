import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const issue = await prisma.issue.create({
      data: {
        id: body.id,
        key: body.key,
        title: body.title,
        description: body.description ?? null,
        type: body.type,
        status: body.status,
        priority: body.priority,
        assigneeId: body.assigneeId ?? null,
        reporterId: body.reporterId,
        sprintId: body.sprintId ?? null,
        epicId: body.epicId ?? null,
        parentId: body.parentId ?? null,
        storyPoints: body.storyPoints ?? null,
        labelIds: body.labelIds ?? [],
        acceptanceCriteria: body.acceptanceCriteria ?? null,
        order: body.order ?? 0,
        projectId: body.projectId,
        createdAt: new Date(body.createdAt),
        updatedAt: new Date(body.updatedAt),
      },
    });
    return NextResponse.json(issue, { status: 201 });
  } catch (err) {
    console.error('[issues POST]', err);
    return NextResponse.json({ error: 'Failed to create issue' }, { status: 500 });
  }
}
