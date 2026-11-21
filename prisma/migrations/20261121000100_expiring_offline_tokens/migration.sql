ALTER TABLE "Session"
ADD COLUMN "refreshToken" TEXT,
ADD COLUMN "refreshTokenExpires" TIMESTAMP(3);
