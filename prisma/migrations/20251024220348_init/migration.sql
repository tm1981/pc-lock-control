-- CreateTable
CREATE TABLE "pcs" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "ip_address" TEXT NOT NULL,
    "port" INTEGER NOT NULL DEFAULT 8080,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "pcs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pc_schedules" (
    "id" UUID NOT NULL,
    "pc_id" UUID NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "pc_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pc_schedules_pc_id_key" ON "pc_schedules"("pc_id");

-- AddForeignKey
ALTER TABLE "pc_schedules" ADD CONSTRAINT "pc_schedules_pc_id_fkey" FOREIGN KEY ("pc_id") REFERENCES "pcs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
