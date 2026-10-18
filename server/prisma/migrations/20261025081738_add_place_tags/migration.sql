-- CreateEnum
CREATE TYPE "TagCategory" AS ENUM ('RESTAURANT', 'ATTRACTION', 'HOTEL', 'BEACH', 'NIGHTLIFE', 'SHOPPING', 'NATURE', 'MUSEUM', 'CAFE', 'ACTIVITY');

-- CreateTable
CREATE TABLE "PlaceTag" (
    "id" TEXT NOT NULL,
    "category" "TagCategory" NOT NULL,
    "placeId" TEXT NOT NULL,

    CONSTRAINT "PlaceTag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlaceTag_placeId_category_key" ON "PlaceTag"("placeId", "category");

-- AddForeignKey
ALTER TABLE "PlaceTag" ADD CONSTRAINT "PlaceTag_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;
