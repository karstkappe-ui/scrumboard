import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { seedDatabase } from '@/lib/seedDb';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const count = await prisma.project.count();
    if (count === 0) {
      await seedDatabase();
    }

    const [projects, sprints, issues, comments, activity] = await Promise.all([
      prisma.project.findMany({ orderBy: { createdAt: 'asc' } }),
      prisma.sprint.findMany({ orderBy: { startDate: 'asc' } }),
      prisma.issue.findMany({ orderBy: { order: 'asc' } }),
      prisma.comment.findMany({ orderBy: { createdAt: 'asc' } }),
      prisma.activityLog.findMany({ orderBy: { createdAt: 'desc' }, take: 200 }),
    ]);

    return NextResponse.json({
      projects: projects.map(toSerializable),
      sprints: sprints.map(toSerializable),
      issues: issues.map(toSerializable),
      comments: comments.map(toSerializable),
      activity: activity.map(toSerializable),
    });
  } catch (err) {
    console.error('[sync] error:', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

function toSerializable(obj: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = v instanceof Date ? v.toISOString() : v;
  }
  return out;
}
