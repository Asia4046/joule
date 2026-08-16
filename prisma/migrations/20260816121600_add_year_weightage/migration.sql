-- CreateTable
CREATE TABLE "ChapterWeightage" (
    "id" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "exam" TEXT NOT NULL,
    "questions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "weightage" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "ChapterWeightage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChapterWeightage_chapterId_year_idx" ON "ChapterWeightage"("chapterId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "ChapterWeightage_chapterId_year_exam_key" ON "ChapterWeightage"("chapterId", "year", "exam");

-- AddForeignKey
ALTER TABLE "ChapterWeightage" ADD CONSTRAINT "ChapterWeightage_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
