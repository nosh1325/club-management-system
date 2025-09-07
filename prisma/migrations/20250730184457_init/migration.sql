/*
  Warnings:

  - Made the column `role` on table `memberships` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "memberships" ALTER COLUMN "role" SET NOT NULL;
