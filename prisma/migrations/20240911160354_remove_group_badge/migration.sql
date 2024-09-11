/*
  Warnings:

  - You are about to drop the `GroupBadge` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "GroupBadge" DROP CONSTRAINT "GroupBadge_badgeId_fkey";

-- DropForeignKey
ALTER TABLE "GroupBadge" DROP CONSTRAINT "GroupBadge_groupId_fkey";

-- AlterTable
CREATE SEQUENCE badge_id_seq;
ALTER TABLE "Badge" ALTER COLUMN "id" SET DEFAULT nextval('badge_id_seq');
ALTER SEQUENCE badge_id_seq OWNED BY "Badge"."id";

-- DropTable
DROP TABLE "GroupBadge";

-- CreateTable
CREATE TABLE "_GroupBadges" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_GroupBadges_AB_unique" ON "_GroupBadges"("A", "B");

-- CreateIndex
CREATE INDEX "_GroupBadges_B_index" ON "_GroupBadges"("B");

-- AddForeignKey
ALTER TABLE "_GroupBadges" ADD CONSTRAINT "_GroupBadges_A_fkey" FOREIGN KEY ("A") REFERENCES "Badge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupBadges" ADD CONSTRAINT "_GroupBadges_B_fkey" FOREIGN KEY ("B") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
