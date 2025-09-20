// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Users
  const owner = await prisma.user.create({
    data: {
      username: "farm_owner",
      email: "owner@example.com",
      passwordHash: "hashedpassword123",
      firstName: "John",
      lastName: "Doe",
      role: "OWNER",
    },
  });

  const manager = await prisma.user.create({
    data: {
      username: "farm_manager",
      email: "manager@example.com",
      passwordHash: "hashedpassword456",  
      firstName: "Jane",
      lastName: "Smith",
      role: "MANAGER",
    },
  });

  // 2. Sales & Expense Categories
  const feedCategory = await prisma.salesExpenseCategory.create({
    data: {
      userId: owner.id,
      categoryName: "Feed",
      categoryType: "EXPENSE",
      description: "Animal feed costs",
    },
  });

  const salesCategory = await prisma.salesExpenseCategory.create({
    data: {
      userId: owner.id,
      categoryName: "Product Sales",
      categoryType: "SALES",
      description: "Income from selling eggs, milk, etc.",
    },
  });

  // 3. Customers
  const customer = await prisma.customer.create({
    data: {
      userId: owner.id,
      customerName: "Local Restaurant",
      customerCode: "CUST001",
      businessName: "Farm to Table Eatery",
      email: "contact@restaurant.com",
      phone: "08012345678",
      customerType: "RESTAURANT",
    },
  });

  // 4. Suppliers
  const supplier = await prisma.supplier.create({
    data: {
      userId: owner.id,
      supplierName: "Agro Supplies Ltd",
      supplierCode: "SUP001",
      supplierType: "FEED",
      email: "sales@agrosupplies.com",
      phone: "08098765432",
    },
  });

  // 5. Inventory
  const maize = await prisma.inventory.create({
    data: {
      userId: owner.id,
      categoryId: feedCategory.id,
      itemName: "Maize",
      itemCode: "INV001",
      unitOfMeasure: "kg",
      currentQuantity: 500,
      reorderLevel: 100,
      unitCost: 50,
      sellingPrice: 70,
      location: "Storehouse A",
    },
  });

  // 6. Asset
  const tractor = await prisma.asset.create({
    data: {
      userId: owner.id,
      categoryId: null,
      assetName: "Tractor",
      assetCode: "AST001",
      assetType: "EQUIPMENT",
      purchaseCost: 1000000,
      purchaseDate: new Date("2023-01-15"),
      salvageValue: 200000,
      usefulLifeYears: 10,
      depreciationRate: 10,
      conditionStatus: "GOOD",
      location: "Garage",
    },
  });

  // 7. Animal Batch
  const layerBatch = await prisma.animalBatch.create({
    data: {
      userId: owner.id,
      categoryId: feedCategory.id,
      batchCode: "BATCH001",
      species: "Chicken",
      breed: "Layers",
      initialQuantity: 200,
      currentQuantity: 195,
      batchStartDate: new Date("2023-02-01"),
      totalCost: 150000,
      batchStatus: "ACTIVE",
      location: "Poultry House 1",
    },
  });

  // 8. Animals
  await prisma.animal.create({
    data: {
      userId: owner.id,
      batchId: layerBatch.id,
      animalTag: "CH001",
      species: "Chicken",
      breed: "Layer",
      gender: "Female",
      birthDate: new Date("2023-01-01"),
      purchaseWeight: 0.5,
      currentWeight: 1.2,
      purchaseCost: 750,
      healthStatus: "Healthy",
    },
  });

  // 9. Task
  await prisma.task.create({
    data: {
      userId: owner.id,
      assignedTo: manager.id,
      taskTitle: "Feed Layer Batch",
      description: "Provide morning feed to Layer Batch BATCH001",
      priority: "HIGH",
      status: "PENDING",
      dueDate: new Date(),
      animalBatchId: layerBatch.id,
    },
  });

  console.log("✅ Seeding completed.");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
