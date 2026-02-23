-- AlterTable
ALTER TABLE "public"."invoice_items" ADD COLUMN     "asset_id" INTEGER;

-- AlterTable
ALTER TABLE "public"."purchase_order_items" ADD COLUMN     "animal_batch_id" INTEGER,
ADD COLUMN     "asset_id" INTEGER;

-- CreateIndex
CREATE INDEX "invoice_items_asset_id_idx" ON "public"."invoice_items"("asset_id");

-- CreateIndex
CREATE INDEX "purchase_order_items_asset_id_idx" ON "public"."purchase_order_items"("asset_id");

-- CreateIndex
CREATE INDEX "purchase_order_items_animal_batch_id_idx" ON "public"."purchase_order_items"("animal_batch_id");

-- AddForeignKey
ALTER TABLE "public"."invoice_items" ADD CONSTRAINT "invoice_items_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("asset_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_order_items" ADD CONSTRAINT "purchase_order_items_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("asset_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_order_items" ADD CONSTRAINT "purchase_order_items_animal_batch_id_fkey" FOREIGN KEY ("animal_batch_id") REFERENCES "public"."animal_batches"("batch_id") ON DELETE SET NULL ON UPDATE CASCADE;
