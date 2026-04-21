import bcrypt from 'bcryptjs';
import { prisma } from './db';
import { MOCK_USERS } from '@/data/users';
import { SEED_PROJECTS } from '@/data/projects';
import {
  SEED_SPRINTS, SEED_SPRINTS_PURE, SEED_SPRINTS_NMATE,
  SEED_ISSUES, SEED_ISSUES_PURE, SEED_ISSUES_NMATE,
  SEED_COMMENTS, SEED_ACTIVITY,
} from '@/data/seed';

export async function seedDatabase() {
  const hash = await bcrypt.hash('scrumboard2026', 10);

  // Users
  for (const u of MOCK_USERS) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: {},
      create: {
        id: u.id,
        name: u.name,
        email: u.email,
        password: hash,
        initials: u.initials,
        color: u.color,
        role: u.role,
      },
    });
  }

  // Projects
  for (const p of SEED_PROJECTS) {
    await prisma.project.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        name: p.name,
        key: p.key,
        description: p.description,
        color: p.color,
        emoji: p.emoji,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
      },
    });
  }

  // Sprints
  const allSprints = [...SEED_SPRINTS, ...SEED_SPRINTS_PURE, ...SEED_SPRINTS_NMATE];
  for (const s of allSprints) {
    await prisma.sprint.upsert({
      where: { id: s.id },
      update: {},
      create: {
        id: s.id,
        name: s.name,
        goal: s.goal,
        startDate: new Date(s.startDate),
        endDate: new Date(s.endDate),
        status: s.status,
        projectId: s.projectId,
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt),
      },
    });
  }

  // Issues (two passes: parents first, then subtasks)
  const allIssues = [...SEED_ISSUES, ...SEED_ISSUES_PURE, ...SEED_ISSUES_NMATE];
  const parents = allIssues.filter((i) => !i.parentId);
  const children = allIssues.filter((i) => i.parentId);

  for (const i of [...parents, ...children]) {
    await prisma.issue.upsert({
      where: { id: i.id },
      update: {},
      create: {
        id: i.id,
        key: i.key,
        title: i.title,
        description: i.description,
        type: i.type,
        status: i.status,
        priority: i.priority,
        assigneeId: i.assigneeId,
        reporterId: i.reporterId,
        sprintId: i.sprintId,
        epicId: i.epicId,
        parentId: i.parentId,
        storyPoints: i.storyPoints,
        labelIds: i.labelIds,
        acceptanceCriteria: i.acceptanceCriteria,
        order: i.order,
        projectId: i.projectId,
        createdAt: new Date(i.createdAt),
        updatedAt: new Date(i.updatedAt),
      },
    });
  }

  // Comments
  for (const c of SEED_COMMENTS) {
    await prisma.comment.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        issueId: c.issueId,
        authorId: c.authorId,
        content: c.content,
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt),
      },
    });
  }

  // Activity
  for (const a of SEED_ACTIVITY) {
    await prisma.activityLog.upsert({
      where: { id: a.id },
      update: {},
      create: {
        id: a.id,
        issueId: a.issueId,
        sprintId: a.sprintId,
        userId: a.userId,
        action: a.action,
        field: a.field,
        oldValue: a.oldValue,
        newValue: a.newValue,
        metadata: a.metadata as object | undefined,
        createdAt: new Date(a.createdAt),
      },
    });
  }
}
