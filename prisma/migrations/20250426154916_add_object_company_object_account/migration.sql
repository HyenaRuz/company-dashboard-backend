/*
  Warnings:

  - You are about to drop the column `actionType` on the `History` table. All the data in the column will be lost.
  - You are about to drop the column `objectId` on the `History` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "History" DROP COLUMN "actionType",
DROP COLUMN "objectId",
ADD COLUMN     "objectAccountId" INTEGER,
ADD COLUMN     "objectCompanyId" INTEGER;

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_objectCompanyId_fkey" FOREIGN KEY ("objectCompanyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_objectAccountId_fkey" FOREIGN KEY ("objectAccountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
