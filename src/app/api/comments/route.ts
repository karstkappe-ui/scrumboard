import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const comment = await prisma.comment.create({
      data: {
        id: body.id,
        issueId: body.issueId,
        authorId: body.authorId,
        content: body.content,
        createdAt: new Date(body.createdAt),
        updatedAt: new Date(body.updatedAt),
      },
    });
    return NextResponse.json(comment, { status: 201 });
  } catch (err) {
    console.error('[comments POST]', err);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}
