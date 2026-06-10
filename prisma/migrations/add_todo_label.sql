-- Run this in your Neon SQL editor to add the label column to Todo:
ALTER TABLE "Todo" ADD COLUMN IF NOT EXISTS "label" TEXT NOT NULL DEFAULT 'none';
