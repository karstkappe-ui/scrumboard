-- Scope todos to a project. Every row that exists today belongs to New Mate,
-- the only project that had a todo board before this change.
ALTER TABLE "Todo" ADD COLUMN IF NOT EXISTS "projectId" TEXT NOT NULL DEFAULT 'proj-3';
