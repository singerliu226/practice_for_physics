/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `password_reset_codes` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "password_reset_codes_email_key" ON "password_reset_codes"("email");
