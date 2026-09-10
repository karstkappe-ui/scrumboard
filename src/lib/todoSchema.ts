import { prisma } from './db';
import { PUREFILTER_PROJECT_ID, PUREFILTER_TODOS } from '@/data/purefilterTodos';

let ensured: Promise<void> | null = null;

/**
 * The Todo table lives outside the Prisma schema and is driven by raw SQL, so
 * its migrations in prisma/migrations/*.sql are applied lazily from here. The
 * statement is idempotent and the promise is cached, so it costs one no-op
 * round trip per server process.
 */
export function ensureTodoSchema(): Promise<void> {
  if (!ensured) {
    ensured = prisma
      .$executeRawUnsafe(
        `ALTER TABLE "Todo" ADD COLUMN IF NOT EXISTS "projectId" TEXT NOT NULL DEFAULT 'proj-3'`,
      )
      .then(() => undefined)
      .catch((err) => {
        // Let the next request retry rather than caching the failure.
        ensured = null;
        throw err;
      });
  }
  return ensured;
}

/**
 * Gives a user their starting Purefilter board the first time they open it.
 * Only runs while that board is still empty, so cards the user has since
 * deleted stay deleted.
 */
export async function seedPurefilterTodos(userId: string) {
  const [{ count }] = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) AS "count" FROM "Todo"
    WHERE "userId" = ${userId} AND "projectId" = ${PUREFILTER_PROJECT_ID}
  `;
  if (Number(count) > 0) return;

  const orders: Record<string, number> = {};
  for (const t of PUREFILTER_TODOS) {
    const order = orders[t.category] ?? 0;
    orders[t.category] = order + 1;
    await prisma.$executeRaw`
      INSERT INTO "Todo" ("id", "userId", "title", "category", "priority", "label", "projectId", "order", "createdAt", "updatedAt")
      VALUES (${`${t.id}-${userId}`}, ${userId}, ${t.title}, ${t.category}, 'none', ${t.label}, ${PUREFILTER_PROJECT_ID}, ${order}, NOW(), NOW())
      ON CONFLICT ("id") DO NOTHING
    `;
  }
}
