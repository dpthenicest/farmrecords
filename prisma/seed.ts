// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding comprehensive farm management database...");

  // 1. Users - Create multiple user roles
  const owner = await prisma.user.create({
    data: {
      username: "john_owner",
      email: "john@riversfarm.ng",
      passwordHash: "$2b$12$hashed_password_owner",
      firstName: "John",
      lastName: "Okoro",
      role: "OWNER",
      lastLogin: new Date("2024-09-03T09:15:00Z"),
    },
  });

  const accountant = await prisma.user.create({
    data: {
      username: "mary_accountant",
      email: "mary@riversfarm.ng",
      passwordHash: "$2b$12$hashed_password_accountant",
      firstName: "Mary",
      lastName: "Adaora",
      role: "ACCOUNTANT",
      lastLogin: new Date("2024-09-03T07:30:00Z"),
    },
  });

  const worker = await prisma.user.create({
    data: {
      username: "peter_worker",
      email: "peter@riversfarm.ng",
      passwordHash: "$2b$12$hashed_password_worker",
      firstName: "Peter",
      lastName: "Chukwu",
      role: "WORKER",
      lastLogin: new Date("2024-09-02T18:45:00Z"),
    },
  });

  const manager = await prisma.user.create({
    data: {
      username: "grace_manager",
      email: "grace@riversfarm.ng",
      passwordHash: "$2b$12$hashed_password_manager",
      firstName: "Grace",
      lastName: "Ibeh",
      role: "MANAGER",
      lastLogin: new Date("2024-09-03T16:20:00Z"),
    },
  });

  console.log("✅ Created users");

  // 2. Sales & Expense Categories
  const fishSalesCategory = await prisma.salesExpenseCategory.create({
    data: {
      userId: owner.id,
      categoryName: "Fish Sales",
      categoryType: "SALES",
      description: "Revenue from selling fish (catfish, tilapia)",
    },
  });

  const eggSalesCategory = await prisma.salesExpenseCategory.create({
    data: {
      userId: owner.id,
      categoryName: "Egg Sales",
      categoryType: "SALES",
      description: "Revenue from selling chicken eggs",
    },
  });

  const chickenSalesCategory = await prisma.salesExpenseCategory.create({
    data: {
      userId: owner.id,
      categoryName: "Chicken Sales",
      categoryType: "SALES",
      description: "Revenue from selling broiler chickens",
    },
  });

  const goatSalesCategory = await prisma.salesExpenseCategory.create({
    data: {
      userId: owner.id,
      categoryName: "Goat Sales",
      categoryType: "SALES",
      description: "Revenue from selling goats and goat milk",
    },
  });

  const fishFeedCategory = await prisma.salesExpenseCategory.create({
    data: {
      userId: owner.id,
      categoryName: "Fish Feed Expenses",
      categoryType: "EXPENSE",
      description: "Cost of fish feed and supplements",
    },
  });

  const chickenFeedCategory = await prisma.salesExpenseCategory.create({
    data: {
      userId: owner.id,
      categoryName: "Chicken Feed Expenses",
      categoryType: "EXPENSE",
      description: "Cost of chicken feed and supplements",
    },
  });

  const veterinaryCategory = await prisma.salesExpenseCategory.create({
    data: {
      userId: owner.id,
      categoryName: "Veterinary Expenses",
      categoryType: "EXPENSE",
      description: "Medical treatment and medications",
    },
  });

  const maintenanceCategory = await prisma.salesExpenseCategory.create({
    data: {
      userId: owner.id,
      categoryName: "Equipment Maintenance",
      categoryType: "EXPENSE",
      description: "Repair and maintenance of farm equipment",
    },
  });

  console.log("✅ Created categories");

  // 3. Customers
  const goldenGateRestaurant = await prisma.customer.create({
    data: {
      userId: owner.id,
      customerName: "Golden Gate Restaurant",
      customerCode: "CUST001",
      businessName: "Golden Gate Restaurant Ltd",
      contactPerson: "Emmanuel Okafor",
      email: "orders@goldengate.ng",
      phone: "+234-803-123-4567",
      address: "Plot 45, Aba Road, Port Harcourt, Rivers State",
      customerType: "RESTAURANT",
      creditLimit: 500000.00,
      paymentTermsDays: 30,
      paymentMethodPreference: "bank_transfer",
      notes: "Regular customer, orders fish weekly",
    },
  });

  const mile3Market = await prisma.customer.create({
    data: {
      userId: owner.id,
      customerName: "Mile 3 Fish Market",
      customerCode: "CUST002",
      businessName: "Mile 3 Fish Market Vendors Association",
      contactPerson: "Grace Ibeh",
      email: "grace@mile3market.ng",
      phone: "+234-805-987-6543",
      address: "Mile 3 Market, Port Harcourt, Rivers State",
      customerType: "MARKET",
      creditLimit: 200000.00,
      paymentTermsDays: 7,
      paymentMethodPreference: "cash",
      notes: "Bulk buyer, weekend orders",
    },
  });

  const chickenRepublic = await prisma.customer.create({
    data: {
      userId: owner.id,
      customerName: "Chicken Republic PH",
      customerCode: "CUST003",
      businessName: "Chicken Republic Port Harcourt",
      contactPerson: "David Nkanu",
      email: "supply@chickenrepublic.ng",
      phone: "+234-809-444-7777",
      address: "Ikwerre Road, Port Harcourt",
      customerType: "RESTAURANT",
      creditLimit: 800000.00,
      paymentTermsDays: 21,
      paymentMethodPreference: "bank_transfer",
      notes: "Large chain, regular egg orders",
    },
  });

  const chiefAmadi = await prisma.customer.create({
    data: {
      userId: owner.id,
      customerName: "Chief Amadi",
      customerCode: "CUST004",
      businessName: "Private Individual",
      contactPerson: "Chief Amadi",
      email: "amadi@email.com",
      phone: "+234-807-555-1234",
      address: "12 Rumuola Road, Port Harcourt",
      customerType: "INDIVIDUAL",
      creditLimit: 50000.00,
      paymentTermsDays: 14,
      paymentMethodPreference: "cash",
      notes: "Occasional buyer for events",
    },
  });

  console.log("✅ Created customers");

  // 4. Suppliers
  const riversFeedMills = await prisma.supplier.create({
    data: {
      userId: owner.id,
      supplierName: "Rivers Feed Mills",
      supplierCode: "SUPP001",
      businessName: "Rivers Feed Mills Limited",
      contactPerson: "Joseph Dike",
      email: "sales@riversfeed.ng",
      phone: "+234-802-111-2222",
      address: "Km 10 Aba Road, Port Harcourt",
      supplierType: "FEED",
      paymentTermsDays: 30,
      taxId: "TAX123456789",
      rating: 4.5,
      notes: "Main feed supplier, good quality",
    },
  });

  const drEzeVet = await prisma.supplier.create({
    data: {
      userId: owner.id,
      supplierName: "Dr. Eze Veterinary Services",
      supplierCode: "SUPP002",
      businessName: "Dr. Eze Veterinary Clinic",
      contactPerson: "Dr. Francis Eze",
      email: "info@ezevetclinic.ng",
      phone: "+234-803-333-4444",
      address: "15 Artillery Road, Port Harcourt",
      supplierType: "VETERINARY",
      paymentTermsDays: 14,
      taxId: "TAX987654321",
      rating: 4.8,
      notes: "Reliable vet, emergency services",
    },
  });

  const equipmentWorld = await prisma.supplier.create({
    data: {
      userId: owner.id,
      supplierName: "Equipment World Nigeria",
      supplierCode: "SUPP003",
      businessName: "Equipment World Nigeria Ltd",
      contactPerson: "Mrs. Joy Okoro",
      email: "sales@equipmentworld.ng",
      phone: "+234-805-666-7777",
      address: "Trans Amadi, Port Harcourt",
      supplierType: "EQUIPMENT",
      paymentTermsDays: 45,
      taxId: "TAX456789123",
      rating: 4.2,
      notes: "Farm equipment and spare parts",
    },
  });

  const fingerlingHatchery = await prisma.supplier.create({
    data: {
      userId: owner.id,
      supplierName: "Fingerling Hatchery Ltd",
      supplierCode: "SUPP004",
      businessName: "Fingerling Hatchery Limited",
      contactPerson: "Mr. Paul Nwachukwu",
      email: "orders@fingerhatchery.ng",
      phone: "+234-807-888-9999",
      address: "Eleme, Rivers State",
      supplierType: "FINGERLINGS",
      paymentTermsDays: 21,
      taxId: "TAX789123456",
      rating: 4.6,
      notes: "Quality fingerling supplier",
    },
  });

  console.log("✅ Created suppliers");

  // 5. Inventory Items
  const catfishFeed = await prisma.inventory.create({
    data: {
      userId: owner.id,
      categoryId: fishFeedCategory.id,
      itemName: "Catfish Feed 15% Protein",
      itemCode: "FEED001",
      description: "High protein floating pellets for catfish",
      unitOfMeasure: "kg",
      currentQuantity: 250.00,
      reorderLevel: 500.00,
      unitCost: 180.00,
      sellingPrice: 220.00,
      location: "Feed Store",
      expiryDate: new Date("2025-01-15"),
    },
  });

  const layerFeed = await prisma.inventory.create({
    data: {
      userId: owner.id,
      categoryId: chickenFeedCategory.id,
      itemName: "Layer Feed 16% Protein",
      itemCode: "FEED002",
      description: "Complete feed for laying hens",
      unitOfMeasure: "kg",
      currentQuantity: 180.00,
      reorderLevel: 300.00,
      unitCost: 165.00,
      sellingPrice: 200.00,
      location: "Feed Store",
      expiryDate: new Date("2025-02-10"),
    },
  });

  const broilerFeed = await prisma.inventory.create({
    data: {
      userId: owner.id,
      categoryId: chickenFeedCategory.id,
      itemName: "Broiler Starter Feed",
      itemCode: "FEED003",
      description: "High energy feed for young broilers",
      unitOfMeasure: "kg",
      currentQuantity: 95.00,
      reorderLevel: 200.00,
      unitCost: 190.00,
      sellingPrice: 230.00,
      location: "Feed Store",
      expiryDate: new Date("2025-01-25"),
    },
  });

  const multivitamins = await prisma.inventory.create({
    data: {
      userId: owner.id,
      categoryId: veterinaryCategory.id,
      itemName: "Multivitamin Supplement",
      itemCode: "MED001",
      description: "Water soluble vitamin supplement",
      unitOfMeasure: "bottle",
      currentQuantity: 12.00,
      reorderLevel: 20.00,
      unitCost: 2500.00,
      sellingPrice: 3200.00,
      location: "Medicine Cabinet",
      expiryDate: new Date("2026-06-30"),
    },
  });

  const freshEggs = await prisma.inventory.create({
    data: {
      userId: owner.id,
      categoryId: eggSalesCategory.id,
      itemName: "Fresh Eggs Grade A",
      itemCode: "EGG001",
      description: "Large fresh eggs from layers",
      unitOfMeasure: "crate",
      currentQuantity: 45.00,
      reorderLevel: 50.00,
      unitCost: 180.00,
      sellingPrice: 220.00,
      location: "Egg Storage Room",
      expiryDate: new Date("2024-09-08"),
    },
  });

  console.log("✅ Created inventory items");

  // 6. Assets
  const fishPond1 = await prisma.asset.create({
    data: {
      userId: owner.id,
      categoryId: fishSalesCategory.id,
      assetName: "Fish Pond 1",
      assetCode: "POND001",
      description: "Main catfish pond, 20m x 15m x 2m deep",
      assetType: "INFRASTRUCTURE",
      purchaseCost: 2500000.00,
      purchaseDate: new Date("2023-08-15"),
      salvageValue: 200000.00,
      usefulLifeYears: 15,
      depreciationRate: 6.67,
      conditionStatus: "excellent",
      location: "North section of farm",
      warrantyInfo: "5 year warranty on liner",
      insuranceInfo: "Covered under farm insurance",
    },
  });

  const chickenCoopA = await prisma.asset.create({
    data: {
      userId: owner.id,
      categoryId: eggSalesCategory.id,
      assetName: "Chicken Coop A",
      assetCode: "COOP001",
      description: "Battery cage system for 500 layers",
      assetType: "INFRASTRUCTURE",
      purchaseCost: 1800000.00,
      purchaseDate: new Date("2023-10-20"),
      salvageValue: 150000.00,
      usefulLifeYears: 10,
      depreciationRate: 10.00,
      conditionStatus: "good",
      location: "East section of farm",
      warrantyInfo: "2 year warranty on cages",
      insuranceInfo: "Covered under farm insurance",
    },
  });

  const goatPenComplex = await prisma.asset.create({
    data: {
      userId: owner.id,
      categoryId: goatSalesCategory.id,
      assetName: "Goat Pen Complex",
      assetCode: "PEN001",
      description: "Concrete block pen with 8 compartments",
      assetType: "INFRASTRUCTURE",
      purchaseCost: 1200000.00,
      purchaseDate: new Date("2023-09-10"),
      salvageValue: 100000.00,
      usefulLifeYears: 20,
      depreciationRate: 5.00,
      conditionStatus: "good",
      location: "West section of farm",
      warrantyInfo: "No warranty",
      insuranceInfo: "Covered under farm insurance",
    },
  });

  const cameraSystem = await prisma.asset.create({
    data: {
      userId: owner.id,
      categoryId: maintenanceCategory.id,
      assetName: "Security Camera System",
      assetCode: "CAM001",
      description: "CCTV system with 8 cameras and NVR",
      assetType: "EQUIPMENT",
      purchaseCost: 450000.00,
      purchaseDate: new Date("2024-01-30"),
      salvageValue: 50000.00,
      usefulLifeYears: 5,
      depreciationRate: 20.00,
      conditionStatus: "excellent",
      location: "Throughout farm",
      warrantyInfo: "3 year warranty",
      insuranceInfo: "Not insured separately",
    },
  });

  const waterPump = await prisma.asset.create({
    data: {
      userId: owner.id,
      categoryId: maintenanceCategory.id,
      assetName: "Water Pump System",
      assetCode: "PUMP001",
      description: "3HP submersible pump with control panel",
      assetType: "EQUIPMENT",
      purchaseCost: 320000.00,
      purchaseDate: new Date("2023-11-15"),
      salvageValue: 30000.00,
      usefulLifeYears: 8,
      depreciationRate: 12.50,
      conditionStatus: "good",
      location: "Pump house",
      warrantyInfo: "2 year warranty",
      insuranceInfo: "Covered under equipment insurance",
    },
  });

  console.log("✅ Created assets");

  // 7. Animal Batches
  const catfishBatch1 = await prisma.animalBatch.create({
    data: {
      userId: owner.id,
      categoryId: fishSalesCategory.id,
      batchCode: "BATCH001",
      species: "fish",
      breed: "catfish",
      initialQuantity: 2000,
      currentQuantity: 1850,
      batchStartDate: new Date("2024-03-01"),
      totalCost: 400000.00,
      averageWeight: 0.25,
      batchStatus: "GROWING",
      location: "Pond 1",
      notes: "Current batch, 6 months old",
    },
  });

  const broilerBatch1 = await prisma.animalBatch.create({
    data: {
      userId: owner.id,
      categoryId: chickenSalesCategory.id,
      batchCode: "BATCH002",
      species: "chicken",
      breed: "broiler",
      initialQuantity: 500,
      currentQuantity: 480,
      batchStartDate: new Date("2024-07-15"),
      totalCost: 240000.00,
      averageWeight: 1.8,
      batchStatus: "GROWING",
      location: "Coop B",
      notes: "Fast-growing broilers, 7 weeks old",
    },
  });

  const layerBatch1 = await prisma.animalBatch.create({
    data: {
      userId: owner.id,
      categoryId: eggSalesCategory.id,
      batchCode: "BATCH003",
      species: "chicken",
      breed: "layer",
      initialQuantity: 300,
      currentQuantity: 295,
      batchStartDate: new Date("2024-01-10"),
      totalCost: 450000.00,
      averageWeight: 1.5,
      batchStatus: "PRODUCING",
      location: "Coop A",
      notes: "Productive layers, laying 280 eggs/day",
    },
  });

  const goatBatch1 = await prisma.animalBatch.create({
    data: {
      userId: owner.id,
      categoryId: goatSalesCategory.id,
      batchCode: "BATCH004",
      species: "goat",
      breed: "west_african_dwarf",
      initialQuantity: 25,
      currentQuantity: 24,
      batchStartDate: new Date("2023-12-01"),
      totalCost: 600000.00,
      averageWeight: 35.0,
      batchStatus: "MATURE",
      location: "Pen Complex",
      notes: "Breeding stock, 2 pregnant does",
    },
  });

  console.log("✅ Created animal batches");

  // 8. Individual Animals
  const catfish1 = await prisma.animal.create({
    data: {
      userId: owner.id,
      batchId: catfishBatch1.id,
      animalTag: "FISH001",
      species: "fish",
      breed: "catfish",
      gender: "unknown",
      birthDate: new Date("2024-03-01"),
      purchaseWeight: 0.02,
      currentWeight: 0.28,
      purchaseCost: 200.00,
      healthStatus: "healthy",
      lastHealthCheck: new Date("2024-08-30"),
      notes: "Good growth rate",
    },
  });

  const broiler1 = await prisma.animal.create({
    data: {
      userId: owner.id,
      batchId: broilerBatch1.id,
      animalTag: "BROILER001",
      species: "chicken",
      breed: "broiler",
      gender: "male",
      birthDate: new Date("2024-07-15"),
      purchaseWeight: 0.05,
      currentWeight: 1.9,
      purchaseCost: 480.00,
      healthStatus: "healthy",
      lastHealthCheck: new Date("2024-09-02"),
      notes: "Ready for market",
    },
  });

  const layer1 = await prisma.animal.create({
    data: {
      userId: owner.id,
      batchId: layerBatch1.id,
      animalTag: "LAYER001",
      species: "chicken",
      breed: "layer",
      gender: "female",
      birthDate: new Date("2024-01-10"),
      purchaseWeight: 0.04,
      currentWeight: 1.6,
      purchaseCost: 1500.00,
      healthStatus: "healthy",
      lastHealthCheck: new Date("2024-09-01"),
      notes: "Excellent layer",
    },
  });

  const goat1 = await prisma.animal.create({
    data: {
      userId: owner.id,
      batchId: goatBatch1.id,
      animalTag: "GOAT001",
      species: "goat",
      breed: "west_african_dwarf",
      gender: "female",
      birthDate: new Date("2023-08-15"),
      purchaseWeight: 8.0,
      currentWeight: 38.0,
      purchaseCost: 25000.00,
      healthStatus: "pregnant",
      lastHealthCheck: new Date("2024-08-28"),
      notes: "Due to kid in October",
    },
  });

  const goat2 = await prisma.animal.create({
    data: {
      userId: owner.id,
      batchId: goatBatch1.id,
      animalTag: "GOAT002",
      species: "goat",
      breed: "west_african_dwarf",
      gender: "male",
      birthDate: new Date("2023-06-10"),
      purchaseWeight: 12.0,
      currentWeight: 42.0,
      purchaseCost: 30000.00,
      healthStatus: "healthy",
      lastHealthCheck: new Date("2024-08-28"),
      notes: "Breeding buck",
    },
  });

  console.log("✅ Created individual animals");

  // 9. Animal Records
  const feedingRecord1 = await prisma.animalRecord.create({
    data: {
      userId: owner.id,
      animalId: catfish1.id,
      batchId: catfishBatch1.id,
      recordType: "FEEDING",
      recordDate: new Date("2024-09-03"),
      weight: 0.28,
      feedConsumption: 0.15,
      healthStatus: "healthy",
      observations: "Active feeding, good appetite",
      temperature: 28.5,
      notes: "Normal behavior observed",
    },
  });

  const weighingRecord1 = await prisma.animalRecord.create({
    data: {
      userId: owner.id,
      animalId: broiler1.id,
      batchId: broilerBatch1.id,
      recordType: "WEIGHING",
      recordDate: new Date("2024-09-02"),
      weight: 1.9,
      feedConsumption: 0.12,
      healthStatus: "healthy",
      observations: "Ready for market weight",
      temperature: 32.0,
      notes: "Target weight achieved",
    },
  });

  const productionRecord1 = await prisma.animalRecord.create({
    data: {
      userId: owner.id,
      animalId: layer1.id,
      batchId: layerBatch1.id,
      recordType: "PRODUCTION",
      recordDate: new Date("2024-09-03"),
      weight: 1.6,
      feedConsumption: 0.13,
      healthStatus: "healthy",
      observations: "Laid 1 egg today",
      temperature: 31.5,
      productionOutput: 1.00,
      notes: "Good laying performance",
    },
  });

  const healthRecord1 = await prisma.animalRecord.create({
    data: {
      userId: owner.id,
      animalId: goat1.id,
      batchId: goatBatch1.id,
      recordType: "HEALTH_CHECK",
      recordDate: new Date("2024-08-28"),
      weight: 38.0,
      feedConsumption: 2.5,
      medicationCost: 500.00,
      healthStatus: "pregnant",
      observations: "Pregnancy progressing well",
      temperature: 38.8,
      notes: "Vitamins administered",
    },
  });

  const mortalityRecord1 = await prisma.animalRecord.create({
    data: {
      userId: owner.id,
      batchId: catfishBatch1.id,
      recordType: "MORTALITY",
      recordDate: new Date("2024-08-15"),
      healthStatus: "dead",
      observations: "Disease outbreak in pond section",
      temperature: 35.2,
      mortalityCount: 50,
      notes: "Isolated dead fish, treated remaining",
    },
  });

  console.log("✅ Created animal records");

  // 10. Purchase Orders
  const po1 = await prisma.purchaseOrder.create({
    data: {
      userId: owner.id,
      supplierId: riversFeedMills.id,
      poNumber: "PO2024001",
      orderDate: new Date("2024-08-25"),
      expectedDeliveryDate: new Date("2024-08-30"),
      actualDeliveryDate: new Date("2024-08-29"),
      subtotal: 180000.00,
      taxAmount: 14400.00,
      totalAmount: 194400.00,
      status: "RECEIVED",
      notes: "Monthly feed order",
    },
  });

  const po2 = await prisma.purchaseOrder.create({
    data: {
      userId: owner.id,
      supplierId: fingerlingHatchery.id,
      poNumber: "PO2024002",
      orderDate: new Date("2024-07-10"),
      expectedDeliveryDate: new Date("2024-07-15"),
      actualDeliveryDate: new Date("2024-07-14"),
      subtotal: 80000.00,
      taxAmount: 6400.00,
      totalAmount: 86400.00,
      status: "RECEIVED",
      notes: "New fingerling stock",
    },
  });

  const po3 = await prisma.purchaseOrder.create({
    data: {
      userId: owner.id,
      supplierId: drEzeVet.id,
      poNumber: "PO2024003",
      orderDate: new Date("2024-09-01"),
      expectedDeliveryDate: new Date("2024-09-05"),
      subtotal: 25000.00,
      taxAmount: 2000.00,
      totalAmount: 27000.00,
      status: "SENT",
      notes: "Vaccination for chickens",
    },
  });

  console.log("✅ Created purchase orders");

  // 11. Purchase Order Items
  await prisma.purchaseOrderItem.create({
    data: {
      poId: po1.id,
      inventoryId: catfishFeed.id,
      itemDescription: "Catfish Feed 15% Protein - 1000kg",
      quantity: 1000.00,
      unitPrice: 180.00,
      totalPrice: 180000.00,
      received: true,
      receivedDate: new Date("2024-08-29"),
    },
  });

  await prisma.purchaseOrderItem.create({
    data: {
      poId: po2.id,
      itemDescription: "Catfish Fingerlings - 2000 pieces",
      quantity: 2000.00,
      unitPrice: 40.00,
      totalPrice: 80000.00,
      received: true,
      receivedDate: new Date("2024-07-14"),
    },
  });

  await prisma.purchaseOrderItem.create({
    data: {
      poId: po3.id,
      inventoryId: multivitamins.id,
      itemDescription: "Newcastle Disease Vaccine",
      quantity: 10.00,
      unitPrice: 2500.00,
      totalPrice: 25000.00,
      received: false,
    },
  });

  console.log("✅ Created purchase order items");

  // 12. Invoices
  const invoice1 = await prisma.invoice.create({
    data: {
      userId: owner.id,
      customerId: goldenGateRestaurant.id,
      invoiceNumber: "INV2024001",
      invoiceDate: new Date("2024-08-30"),
      dueDate: new Date("2024-09-29"),
      subtotal: 220000.00,
      taxAmount: 17600.00,
      totalAmount: 237600.00,
      status: "SENT",
      notes: "Weekly fish order for restaurant",
    },
  });

  const invoice2 = await prisma.invoice.create({
    data: {
      userId: owner.id,
      customerId: chickenRepublic.id,
      invoiceNumber: "INV2024002",
      invoiceDate: new Date("2024-09-01"),
      dueDate: new Date("2024-09-22"),
      subtotal: 66000.00,
      taxAmount: 5280.00,
      totalAmount: 71280.00,
      status: "PAID",
      paymentMethod: "bank_transfer",
      paymentDate: new Date("2024-09-03"),
      notes: "Bulk egg order",
    },
  });

  const invoice3 = await prisma.invoice.create({
    data: {
      userId: owner.id,
      customerId: mile3Market.id,
      invoiceNumber: "INV2024003",
      invoiceDate: new Date("2024-09-02"),
      dueDate: new Date("2024-09-09"),
      subtotal: 96000.00,
      taxAmount: 7680.00,
      totalAmount: 103680.00,
      status: "SENT",
      paymentMethod: "cash",
      notes: "Weekend fish order",
    },
  });

  console.log("✅ Created invoices");

  // 13. Invoice Items
  await prisma.invoiceItem.create({
    data: {
      invoiceId: invoice1.id,
      animalBatchId: catfishBatch1.id,
      itemDescription: "Fresh Catfish - 1000kg",
      quantity: 1000.00,
      unitPrice: 220.00,
      totalPrice: 220000.00,
    },
  });

  await prisma.invoiceItem.create({
    data: {
      invoiceId: invoice2.id,
      inventoryId: freshEggs.id,
      itemDescription: "Fresh Eggs Grade A - 300 crates",
      quantity: 300.00,
      unitPrice: 220.00,
      totalPrice: 66000.00,
    },
  });

  await prisma.invoiceItem.create({
    data: {
      invoiceId: invoice3.id,
      animalBatchId: catfishBatch1.id,
      itemDescription: "Fresh Catfish - 800kg",
      quantity: 800.00,
      unitPrice: 120.00,
      totalPrice: 96000.00,
    },
  });

  console.log("✅ Created invoice items");

  // 14. Financial Records
  await prisma.financialRecord.create({
    data: {
      userId: owner.id,
      transactionType: "INCOME",
      amount: 237600.00,
      categoryId: fishSalesCategory.id,
      customerId: goldenGateRestaurant.id,
      invoiceId: invoice1.id,
      transactionDate: new Date("2024-08-30"),
      description: "Sale to Golden Gate Restaurant",
      referenceNumber: "INV2024001",
    },
  });

  await prisma.financialRecord.create({
    data: {
      userId: owner.id,
      transactionType: "INCOME",
      amount: 71280.00,
      categoryId: eggSalesCategory.id,
      customerId: chickenRepublic.id,
      invoiceId: invoice2.id,
      transactionDate: new Date("2024-09-03"),
      description: "Egg sales to Chicken Republic",
      referenceNumber: "INV2024002",
    },
  });

  await prisma.financialRecord.create({
    data: {
      userId: owner.id,
      transactionType: "EXPENSE",
      amount: 194400.00,
      categoryId: fishFeedCategory.id,
      supplierId: riversFeedMills.id,
      purchaseOrderId: po1.id,
      transactionDate: new Date("2024-08-29"),
      description: "Feed purchase from Rivers Feed Mills",
      referenceNumber: "PO2024001",
    },
  });

  await prisma.financialRecord.create({
    data: {
      userId: owner.id,
      transactionType: "EXPENSE",
      amount: 86400.00,
      categoryId: fishSalesCategory.id,
      supplierId: fingerlingHatchery.id,
      purchaseOrderId: po2.id,
      transactionDate: new Date("2024-07-14"),
      description: "Fingerling purchase",
      referenceNumber: "PO2024002",
    },
  });

  await prisma.financialRecord.create({
    data: {
      userId: owner.id,
      transactionType: "EXPENSE",
      amount: 15000.00,
      categoryId: maintenanceCategory.id,
      supplierId: equipmentWorld.id,
      transactionDate: new Date("2024-08-20"),
      description: "Water pump repair",
      referenceNumber: "MAINT001",
    },
  });

  console.log("✅ Created financial records");

  // 15. Inventory Movements
  await prisma.inventoryMovement.create({
    data: {
      inventoryId: catfishFeed.id,
      userId: owner.id,
      movementType: "PURCHASE",
      quantity: 1000.00,
      unitCost: 180.00,
      movementDate: new Date("2024-08-29"),
      referenceId: po1.id,
      referenceType: "purchase_order",
      notes: "Received feed delivery",
    },
  });

  await prisma.inventoryMovement.create({
    data: {
      inventoryId: freshEggs.id,
      userId: owner.id,
      movementType: "PRODUCTION",
      quantity: 280.00,
      unitCost: 180.00,
      movementDate: new Date("2024-09-01"),
      referenceId: layerBatch1.id,
      referenceType: "animal_batch",
      notes: "Daily egg collection from layers",
    },
  });

  await prisma.inventoryMovement.create({
    data: {
      inventoryId: catfishFeed.id,
      userId: owner.id,
      movementType: "CONSUMPTION",
      quantity: 150.00,
      unitCost: 180.00,
      movementDate: new Date("2024-09-01"),
      referenceId: catfishBatch1.id,
      referenceType: "animal_batch",
      notes: "Fed to catfish in Pond 1",
    },
  });

  await prisma.inventoryMovement.create({
    data: {
      inventoryId: freshEggs.id,
      userId: owner.id,
      movementType: "SALE",
      quantity: 300.00,
      unitCost: 180.00,
      movementDate: new Date("2024-09-01"),
      referenceId: invoice2.id,
      referenceType: "invoice",
      notes: "Sold eggs to Chicken Republic",
    },
  });

  console.log("✅ Created inventory movements");

  // 16. Asset Maintenance Records
  await prisma.assetMaintenance.create({
    data: {
      assetId: waterPump.id,
      userId: owner.id,
      maintenanceType: "REPAIR",
      scheduledDate: new Date("2024-08-20"),
      completedDate: new Date("2024-08-20"),
      cost: 15000.00,
      supplierId: equipmentWorld.id,
      description: "Water pump motor replacement",
      notes: "Pump was not priming properly",
      status: "COMPLETED",
    },
  });

  await prisma.assetMaintenance.create({
    data: {
      assetId: cameraSystem.id,
      userId: owner.id,
      maintenanceType: "MAINTENANCE",
      scheduledDate: new Date("2024-09-15"),
      cost: 0.00,
      description: "Quarterly camera system check",
      notes: "Scheduled maintenance for CCTV",
      status: "SCHEDULED",
    },
  });

  await prisma.assetMaintenance.create({
    data: {
      assetId: fishPond1.id,
      userId: worker.id,
      maintenanceType: "CLEANING",
      scheduledDate: new Date("2024-09-05"),
      cost: 2000.00,
      description: "Pond cleaning and water change",
      notes: "Monthly pond maintenance",
      status: "SCHEDULED",
    },
  });

  console.log("✅ Created asset maintenance records");

  // 17. Tasks
  await prisma.task.create({
    data: {
      userId: owner.id,
      assignedTo: worker.id,
      taskTitle: "Daily Fish Feeding - Pond 1",
      description: "Feed catfish in pond 1, monitor behavior and water quality",
      priority: "HIGH",
      status: "COMPLETED",
      dueDate: new Date("2024-09-03"),
      completedDate: new Date("2024-09-03"),
      animalBatchId: catfishBatch1.id,
      notes: "Fish are feeding well, no issues",
    },
  });

  await prisma.task.create({
    data: {
      userId: owner.id,
      assignedTo: worker.id,
      taskTitle: "Collect Eggs from Coop A",
      description: "Morning egg collection from layer chickens",
      priority: "HIGH",
      status: "COMPLETED",
      dueDate: new Date("2024-09-03"),
      completedDate: new Date("2024-09-03"),
      animalBatchId: layerBatch1.id,
      notes: "Collected 285 eggs today",
    },
  });

  await prisma.task.create({
    data: {
      userId: owner.id,
      assignedTo: owner.id,
      taskTitle: "Check Pregnant Goats",
      description: "Monitor pregnant does for signs of labor",
      priority: "MEDIUM",
      status: "PENDING",
      dueDate: new Date("2024-09-04"),
      animalBatchId: goatBatch1.id,
      notes: "Check daily until kidding",
    },
  });

  await prisma.task.create({
    data: {
      userId: owner.id,
      assignedTo: worker.id,
      taskTitle: "Clean Water Troughs",
      description: "Clean and refill water containers in goat pen",
      priority: "MEDIUM",
      status: "PENDING",
      dueDate: new Date("2024-09-04"),
      animalBatchId: goatBatch1.id,
      notes: "Weekly cleaning scheduled",
    },
  });

  await prisma.task.create({
    data: {
      userId: owner.id,
      assignedTo: owner.id,
      taskTitle: "Service Camera System",
      description: "Quarterly maintenance check on CCTV system",
      priority: "LOW",
      status: "SCHEDULED",
      dueDate: new Date("2024-09-15"),
      assetId: cameraSystem.id,
      notes: "Contact technician to schedule",
    },
  });

  console.log("✅ Created tasks");

  console.log(`
🎉 Database seeding completed successfully!

Summary of seeded data:
- 4 Users (Owner, Accountant, Manager, Worker)
- 8 Sales & Expense Categories
- 4 Customers (Restaurant, Market, Chain, Individual)
- 4 Suppliers (Feed, Veterinary, Equipment, Fingerlings)
- 5 Inventory Items (Feeds, Medicine, Eggs)
- 5 Assets (Pond, Coops, Pen, Camera, Pump)
- 4 Animal Batches (Catfish, Broiler, Layer, Goats)
- 5 Individual Animals
- 5 Animal Records (Feeding, Weighing, Production, Health, Mortality)
- 3 Purchase Orders with Items
- 3 Invoices with Items
- 5 Financial Records
- 4 Inventory Movements
- 3 Asset Maintenance Records
- 5 Tasks

The farm now has realistic operational data for:
🐟 Fish farming (catfish in pond)
🐔 Chicken operations (layers for eggs, broilers for meat)
🐐 Goat farming (breeding stock)
💰 Complete financial tracking
📦 Inventory management
🔧 Asset maintenance
📋 Task management

Ready for testing the comprehensive farm management system!
  `);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });