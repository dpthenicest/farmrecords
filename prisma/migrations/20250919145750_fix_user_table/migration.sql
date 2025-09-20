-- CreateTable
CREATE TABLE "public"."users" (
    "user_id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "role" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "public"."financial_records" (
    "record_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "transaction_type" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "category_id" INTEGER NOT NULL,
    "customer_id" INTEGER,
    "supplier_id" INTEGER,
    "invoice_id" INTEGER,
    "purchase_order_id" INTEGER,
    "transaction_date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "reference_number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_records_pkey" PRIMARY KEY ("record_id")
);

-- CreateTable
CREATE TABLE "public"."invoices" (
    "invoice_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "invoice_date" TIMESTAMP(3) NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "tax_amount" DECIMAL(12,2) NOT NULL,
    "total_amount" DECIMAL(12,2) NOT NULL,
    "status" TEXT NOT NULL,
    "payment_method" TEXT,
    "payment_date" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("invoice_id")
);

-- CreateTable
CREATE TABLE "public"."invoice_items" (
    "item_id" SERIAL NOT NULL,
    "invoice_id" INTEGER NOT NULL,
    "inventory_id" INTEGER,
    "animal_batch_id" INTEGER,
    "item_description" TEXT NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "total_price" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("item_id")
);

-- CreateTable
CREATE TABLE "public"."purchase_orders" (
    "po_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "supplier_id" INTEGER NOT NULL,
    "po_number" TEXT NOT NULL,
    "order_date" TIMESTAMP(3) NOT NULL,
    "expected_delivery_date" TIMESTAMP(3),
    "actual_delivery_date" TIMESTAMP(3),
    "subtotal" DECIMAL(12,2) NOT NULL,
    "tax_amount" DECIMAL(12,2) NOT NULL,
    "total_amount" DECIMAL(12,2) NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("po_id")
);

-- CreateTable
CREATE TABLE "public"."purchase_order_items" (
    "item_id" SERIAL NOT NULL,
    "po_id" INTEGER NOT NULL,
    "inventory_id" INTEGER,
    "item_description" TEXT NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "total_price" DECIMAL(12,2) NOT NULL,
    "received" BOOLEAN NOT NULL DEFAULT false,
    "received_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_order_items_pkey" PRIMARY KEY ("item_id")
);

-- CreateTable
CREATE TABLE "public"."sales_expense_categories" (
    "category_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "category_name" TEXT NOT NULL,
    "category_type" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_expense_categories_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "public"."inventory" (
    "inventory_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "category_id" INTEGER,
    "item_name" TEXT NOT NULL,
    "item_code" TEXT NOT NULL,
    "description" TEXT,
    "unit_of_measure" TEXT NOT NULL,
    "current_quantity" DECIMAL(10,2) NOT NULL,
    "reorder_level" DECIMAL(10,2) NOT NULL,
    "unit_cost" DECIMAL(10,2) NOT NULL,
    "selling_price" DECIMAL(10,2) NOT NULL,
    "location" TEXT,
    "expiry_date" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_pkey" PRIMARY KEY ("inventory_id")
);

-- CreateTable
CREATE TABLE "public"."assets" (
    "asset_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "category_id" INTEGER,
    "asset_name" TEXT NOT NULL,
    "asset_code" TEXT NOT NULL,
    "description" TEXT,
    "asset_type" TEXT NOT NULL,
    "purchase_cost" DECIMAL(12,2) NOT NULL,
    "purchase_date" TIMESTAMP(3) NOT NULL,
    "salvage_value" DECIMAL(12,2) NOT NULL,
    "useful_life_years" INTEGER NOT NULL,
    "depreciation_rate" DECIMAL(5,2) NOT NULL,
    "condition_status" TEXT NOT NULL,
    "location" TEXT,
    "warranty_info" TEXT,
    "insurance_info" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("asset_id")
);

-- CreateTable
CREATE TABLE "public"."asset_maintenance" (
    "maintenance_id" SERIAL NOT NULL,
    "asset_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "maintenance_type" TEXT NOT NULL,
    "scheduled_date" TIMESTAMP(3) NOT NULL,
    "completed_date" TIMESTAMP(3),
    "cost" DECIMAL(10,2) NOT NULL,
    "supplier_id" INTEGER,
    "description" TEXT NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asset_maintenance_pkey" PRIMARY KEY ("maintenance_id")
);

-- CreateTable
CREATE TABLE "public"."animals" (
    "animal_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "batch_id" INTEGER,
    "animal_tag" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "breed" TEXT,
    "gender" TEXT,
    "birth_date" TIMESTAMP(3),
    "purchase_weight" DECIMAL(10,2),
    "current_weight" DECIMAL(10,2),
    "purchase_cost" DECIMAL(10,2),
    "health_status" TEXT,
    "last_health_check" TIMESTAMP(3),
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "animals_pkey" PRIMARY KEY ("animal_id")
);

-- CreateTable
CREATE TABLE "public"."animal_batches" (
    "batch_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "category_id" INTEGER,
    "batch_code" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "breed" TEXT,
    "initial_quantity" INTEGER NOT NULL,
    "current_quantity" INTEGER NOT NULL,
    "batch_start_date" TIMESTAMP(3) NOT NULL,
    "total_cost" DECIMAL(12,2) NOT NULL,
    "average_weight" DECIMAL(10,2),
    "batch_status" TEXT NOT NULL,
    "location" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "animal_batches_pkey" PRIMARY KEY ("batch_id")
);

-- CreateTable
CREATE TABLE "public"."animal_records" (
    "record_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "animal_id" INTEGER,
    "batch_id" INTEGER,
    "record_type" TEXT NOT NULL,
    "record_date" TIMESTAMP(3) NOT NULL,
    "weight" DECIMAL(10,2),
    "feed_consumption" DECIMAL(10,2),
    "medication_cost" DECIMAL(10,2),
    "health_status" TEXT,
    "observations" TEXT,
    "temperature" DECIMAL(5,2),
    "mortality_count" INTEGER NOT NULL DEFAULT 0,
    "production_output" DECIMAL(10,2),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "animal_records_pkey" PRIMARY KEY ("record_id")
);

-- CreateTable
CREATE TABLE "public"."customers" (
    "customer_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "customer_name" TEXT NOT NULL,
    "customer_code" TEXT NOT NULL,
    "business_name" TEXT,
    "contact_person" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "customer_type" TEXT NOT NULL,
    "credit_limit" DECIMAL(12,2),
    "payment_terms_days" INTEGER,
    "payment_method_preference" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("customer_id")
);

-- CreateTable
CREATE TABLE "public"."suppliers" (
    "supplier_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "supplier_name" TEXT NOT NULL,
    "supplier_code" TEXT NOT NULL,
    "business_name" TEXT,
    "contact_person" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "supplier_type" TEXT NOT NULL,
    "payment_terms_days" INTEGER,
    "tax_id" TEXT,
    "rating" DECIMAL(2,1),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("supplier_id")
);

-- CreateTable
CREATE TABLE "public"."inventory_movements" (
    "movement_id" SERIAL NOT NULL,
    "inventory_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "movement_type" TEXT NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unit_cost" DECIMAL(10,2) NOT NULL,
    "movement_date" TIMESTAMP(3) NOT NULL,
    "reference_id" INTEGER,
    "reference_type" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_movements_pkey" PRIMARY KEY ("movement_id")
);

-- CreateTable
CREATE TABLE "public"."tasks" (
    "task_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "assigned_to" INTEGER,
    "task_title" TEXT NOT NULL,
    "description" TEXT,
    "priority" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "due_date" TIMESTAMP(3),
    "completed_date" TIMESTAMP(3),
    "animal_batch_id" INTEGER,
    "asset_id" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("task_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "financial_records_user_id_idx" ON "public"."financial_records"("user_id");

-- CreateIndex
CREATE INDEX "financial_records_category_id_idx" ON "public"."financial_records"("category_id");

-- CreateIndex
CREATE INDEX "financial_records_customer_id_idx" ON "public"."financial_records"("customer_id");

-- CreateIndex
CREATE INDEX "financial_records_supplier_id_idx" ON "public"."financial_records"("supplier_id");

-- CreateIndex
CREATE INDEX "financial_records_transaction_date_idx" ON "public"."financial_records"("transaction_date");

-- CreateIndex
CREATE INDEX "invoices_user_id_idx" ON "public"."invoices"("user_id");

-- CreateIndex
CREATE INDEX "invoices_customer_id_idx" ON "public"."invoices"("customer_id");

-- CreateIndex
CREATE INDEX "invoices_status_idx" ON "public"."invoices"("status");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoice_number_user_id_key" ON "public"."invoices"("invoice_number", "user_id");

-- CreateIndex
CREATE INDEX "invoice_items_invoice_id_idx" ON "public"."invoice_items"("invoice_id");

-- CreateIndex
CREATE INDEX "invoice_items_inventory_id_idx" ON "public"."invoice_items"("inventory_id");

-- CreateIndex
CREATE INDEX "invoice_items_animal_batch_id_idx" ON "public"."invoice_items"("animal_batch_id");

-- CreateIndex
CREATE INDEX "purchase_orders_user_id_idx" ON "public"."purchase_orders"("user_id");

-- CreateIndex
CREATE INDEX "purchase_orders_supplier_id_idx" ON "public"."purchase_orders"("supplier_id");

-- CreateIndex
CREATE INDEX "purchase_orders_status_idx" ON "public"."purchase_orders"("status");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_po_number_user_id_key" ON "public"."purchase_orders"("po_number", "user_id");

-- CreateIndex
CREATE INDEX "purchase_order_items_po_id_idx" ON "public"."purchase_order_items"("po_id");

-- CreateIndex
CREATE INDEX "purchase_order_items_inventory_id_idx" ON "public"."purchase_order_items"("inventory_id");

-- CreateIndex
CREATE INDEX "sales_expense_categories_user_id_idx" ON "public"."sales_expense_categories"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "sales_expense_categories_category_name_user_id_key" ON "public"."sales_expense_categories"("category_name", "user_id");

-- CreateIndex
CREATE INDEX "inventory_user_id_idx" ON "public"."inventory"("user_id");

-- CreateIndex
CREATE INDEX "inventory_category_id_idx" ON "public"."inventory"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_item_code_user_id_key" ON "public"."inventory"("item_code", "user_id");

-- CreateIndex
CREATE INDEX "assets_user_id_idx" ON "public"."assets"("user_id");

-- CreateIndex
CREATE INDEX "assets_category_id_idx" ON "public"."assets"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "assets_asset_code_user_id_key" ON "public"."assets"("asset_code", "user_id");

-- CreateIndex
CREATE INDEX "asset_maintenance_asset_id_idx" ON "public"."asset_maintenance"("asset_id");

-- CreateIndex
CREATE INDEX "asset_maintenance_user_id_idx" ON "public"."asset_maintenance"("user_id");

-- CreateIndex
CREATE INDEX "asset_maintenance_supplier_id_idx" ON "public"."asset_maintenance"("supplier_id");

-- CreateIndex
CREATE INDEX "asset_maintenance_scheduled_date_idx" ON "public"."asset_maintenance"("scheduled_date");

-- CreateIndex
CREATE INDEX "animals_user_id_idx" ON "public"."animals"("user_id");

-- CreateIndex
CREATE INDEX "animals_batch_id_idx" ON "public"."animals"("batch_id");

-- CreateIndex
CREATE UNIQUE INDEX "animals_animal_tag_user_id_key" ON "public"."animals"("animal_tag", "user_id");

-- CreateIndex
CREATE INDEX "animal_batches_user_id_idx" ON "public"."animal_batches"("user_id");

-- CreateIndex
CREATE INDEX "animal_batches_category_id_idx" ON "public"."animal_batches"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "animal_batches_batch_code_user_id_key" ON "public"."animal_batches"("batch_code", "user_id");

-- CreateIndex
CREATE INDEX "animal_records_user_id_idx" ON "public"."animal_records"("user_id");

-- CreateIndex
CREATE INDEX "animal_records_animal_id_idx" ON "public"."animal_records"("animal_id");

-- CreateIndex
CREATE INDEX "animal_records_batch_id_idx" ON "public"."animal_records"("batch_id");

-- CreateIndex
CREATE INDEX "animal_records_record_date_idx" ON "public"."animal_records"("record_date");

-- CreateIndex
CREATE INDEX "customers_user_id_idx" ON "public"."customers"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "customers_customer_code_user_id_key" ON "public"."customers"("customer_code", "user_id");

-- CreateIndex
CREATE INDEX "suppliers_user_id_idx" ON "public"."suppliers"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_supplier_code_user_id_key" ON "public"."suppliers"("supplier_code", "user_id");

-- CreateIndex
CREATE INDEX "inventory_movements_inventory_id_idx" ON "public"."inventory_movements"("inventory_id");

-- CreateIndex
CREATE INDEX "inventory_movements_user_id_idx" ON "public"."inventory_movements"("user_id");

-- CreateIndex
CREATE INDEX "inventory_movements_movement_date_idx" ON "public"."inventory_movements"("movement_date");

-- CreateIndex
CREATE INDEX "tasks_user_id_idx" ON "public"."tasks"("user_id");

-- CreateIndex
CREATE INDEX "tasks_assigned_to_idx" ON "public"."tasks"("assigned_to");

-- CreateIndex
CREATE INDEX "tasks_animal_batch_id_idx" ON "public"."tasks"("animal_batch_id");

-- CreateIndex
CREATE INDEX "tasks_asset_id_idx" ON "public"."tasks"("asset_id");

-- CreateIndex
CREATE INDEX "tasks_due_date_idx" ON "public"."tasks"("due_date");

-- AddForeignKey
ALTER TABLE "public"."financial_records" ADD CONSTRAINT "financial_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."financial_records" ADD CONSTRAINT "financial_records_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."sales_expense_categories"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."financial_records" ADD CONSTRAINT "financial_records_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("customer_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."financial_records" ADD CONSTRAINT "financial_records_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("supplier_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."financial_records" ADD CONSTRAINT "financial_records_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("invoice_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."financial_records" ADD CONSTRAINT "financial_records_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("po_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoices" ADD CONSTRAINT "invoices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoices" ADD CONSTRAINT "invoices_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("customer_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("invoice_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoice_items" ADD CONSTRAINT "invoice_items_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventory"("inventory_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoice_items" ADD CONSTRAINT "invoice_items_animal_batch_id_fkey" FOREIGN KEY ("animal_batch_id") REFERENCES "public"."animal_batches"("batch_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_orders" ADD CONSTRAINT "purchase_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_orders" ADD CONSTRAINT "purchase_orders_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("supplier_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_order_items" ADD CONSTRAINT "purchase_order_items_po_id_fkey" FOREIGN KEY ("po_id") REFERENCES "public"."purchase_orders"("po_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_order_items" ADD CONSTRAINT "purchase_order_items_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventory"("inventory_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sales_expense_categories" ADD CONSTRAINT "sales_expense_categories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory" ADD CONSTRAINT "inventory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory" ADD CONSTRAINT "inventory_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."sales_expense_categories"("category_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."assets" ADD CONSTRAINT "assets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."assets" ADD CONSTRAINT "assets_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."sales_expense_categories"("category_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."asset_maintenance" ADD CONSTRAINT "asset_maintenance_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("asset_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."asset_maintenance" ADD CONSTRAINT "asset_maintenance_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."asset_maintenance" ADD CONSTRAINT "asset_maintenance_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("supplier_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."animals" ADD CONSTRAINT "animals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."animals" ADD CONSTRAINT "animals_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "public"."animal_batches"("batch_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."animal_batches" ADD CONSTRAINT "animal_batches_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."animal_batches" ADD CONSTRAINT "animal_batches_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."sales_expense_categories"("category_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."animal_records" ADD CONSTRAINT "animal_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."animal_records" ADD CONSTRAINT "animal_records_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "public"."animals"("animal_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."animal_records" ADD CONSTRAINT "animal_records_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "public"."animal_batches"("batch_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."customers" ADD CONSTRAINT "customers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."suppliers" ADD CONSTRAINT "suppliers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_movements" ADD CONSTRAINT "inventory_movements_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventory"("inventory_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_movements" ADD CONSTRAINT "inventory_movements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tasks" ADD CONSTRAINT "tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tasks" ADD CONSTRAINT "tasks_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tasks" ADD CONSTRAINT "tasks_animal_batch_id_fkey" FOREIGN KEY ("animal_batch_id") REFERENCES "public"."animal_batches"("batch_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tasks" ADD CONSTRAINT "tasks_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("asset_id") ON DELETE SET NULL ON UPDATE CASCADE;
