/*
  Warnings:

  - You are about to drop the column `accountId` on the `History` table. All the data in the column will be lost.
  - You are about to drop the column `action` on the `History` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `History` table. All the data in the column will be lost.
  - You are about to drop the column `entity` on the `History` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `History` table. All the data in the column will be lost.
  - Added the required column `actingAccountId` to the `History` table without a default value. This is not possible if the table is not empty.
  - Added the required column `actionType` to the `History` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ip` to the `History` table without a default value. This is not possible if the table is not empty.
  - Added the required column `objectId` to the `History` table without a default value. This is not possible if the table is not empty.
  - Added the required column `objectType` to the `History` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "History" DROP CONSTRAINT "History_accountId_fkey";

-- AlterTable
ALTER TABLE "History" DROP COLUMN "accountId",
DROP COLUMN "action",
DROP COLUMN "deletedAt",
DROP COLUMN "entity",
DROP COLUMN "updatedAt",
ADD COLUMN     "actingAccountId" INTEGER NOT NULL,
ADD COLUMN     "actionType" TEXT NOT NULL,
ADD COLUMN     "ip" TEXT NOT NULL,
ADD COLUMN     "objectId" INTEGER NOT NULL,
ADD COLUMN     "objectType" TEXT NOT NULL,
ADD COLUMN     "targetAccountId" INTEGER;

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_actingAccountId_fkey" FOREIGN KEY ("actingAccountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_targetAccountId_fkey" FOREIGN KEY ("targetAccountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
