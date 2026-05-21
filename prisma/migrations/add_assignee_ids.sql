-- Run this in your Neon SQL editor (or via psql) to add the assigneeIds column:
ALTER TABLE "Issue" ADD COLUMN IF NOT EXISTS "assigneeIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
