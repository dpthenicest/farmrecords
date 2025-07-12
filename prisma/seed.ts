import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create a default user for seeding
  const user = await prisma.user.upsert({
    where: { email: 'admin@farm.com' },
    update: {},
    create: {
      email: 'admin@farm.com',
      name: 'Farm Admin',
      password: 'hashedpassword123', // In real app, hash this
    },
  })

  // Create category types first
  const incomeCategoryType = await prisma.categoryType.upsert({
    where: { name: 'INCOME' },
    update: {},
    create: { name: 'INCOME', description: 'Income categories' },
  })

  const expenseCategoryType = await prisma.categoryType.upsert({
    where: { name: 'EXPENSE' },
    update: {},
    create: { name: 'EXPENSE', description: 'Expense categories' },
  })

  // Create animal types with emoji
  const animalTypes = [
    { type: 'GOAT', emoji: '🐐' },
    { type: 'FOWL', emoji: '🐔' },
    { type: 'CATFISH', emoji: '🐟' },
    { type: 'COW', emoji: '🐄' },
    { type: 'PIG', emoji: '🐖' },
    { type: 'SHEEP', emoji: '🐑' },
    { type: 'HORSE', emoji: '🐎' },
    { type: 'RABBIT', emoji: '🐇' },
    { type: 'DUCK', emoji: '🦆' },
    { type: 'TURKEY', emoji: '🦃' },
  ]
  
  for (const animalType of animalTypes) {
    await prisma.animalType.upsert({
      where: { type: animalType.type },
      update: { emoji: animalType.emoji },
      create: animalType,
    })
  }

  // Create expense categories
  const expenseCategories = [
    { name: 'Animal Purchase', description: 'Buying new goats, fowls, catfish' },
    { name: 'Feed', description: 'Maize, pellets, or other feed' },
    { name: 'Drugs & Vaccines', description: 'Veterinary treatments' },
    { name: 'Workers\' Salary', description: 'Monthly payments to farm workers' },
    { name: 'Facility Costs', description: 'Repairs, water supply, tools' },
    { name: 'Transportation', description: 'Fuel, logistics' },
    { name: 'Utilities', description: 'Electricity, water bills' },
    { name: 'Maintenance', description: 'Cage/tank repair, fencing, etc.' },
    { name: 'Miscellaneous', description: 'Anything not covered in above' }
  ]

  // Create income categories
  const incomeCategories = [
    { name: 'Sale of Goats', description: 'Revenue from goat sales' },
    { name: 'Sale of Fowls', description: 'Revenue from chicken sales' },
    { name: 'Sale of Catfish', description: 'Revenue from catfish sales' },
    { name: 'Manure Sales', description: 'Selling animal waste as fertilizer' },
    { name: 'Subsidies/Support', description: 'Gov\'t support, aid (if any)' },
    { name: 'Other Income', description: 'Rentals, byproducts, etc.' }
  ]

  // Create expense categories
  for (const category of expenseCategories) {
    await prisma.category.upsert({
      where: { unique_category_for_user: { name: category.name, userId: user.id } },
      update: {},
      create: {
        name: category.name,
        categoryTypeId: expenseCategoryType.id,
        description: category.description,
        userId: user.id,
      },
    })
  }

  // Create income categories
  for (const category of incomeCategories) {
    await prisma.category.upsert({
      where: { unique_category_for_user: { name: category.name, userId: user.id } },
      update: {},
      create: {
        name: category.name,
        categoryTypeId: incomeCategoryType.id,
        description: category.description,
        userId: user.id,
      },
    })
  }

  // Get animal types for creating animals
  const goatType = await prisma.animalType.findUnique({ where: { type: 'GOAT' } })
  const fowlType = await prisma.animalType.findUnique({ where: { type: 'FOWL' } })
  const catfishType = await prisma.animalType.findUnique({ where: { type: 'CATFISH' } })

  // Create sample animals
  if (goatType) {
    await prisma.animal.upsert({
      where: { id: 'goat-batch-a' },
      update: {},
      create: {
        id: 'goat-batch-a',
        name: 'Goat Batch A',
        animalTypeId: goatType.id,
        description: 'Young goats for breeding',
        userId: user.id,
      },
    })
  }

  if (fowlType) {
    await prisma.animal.upsert({
      where: { id: 'fowl-layer-2024' },
      update: {},
      create: {
        id: 'fowl-layer-2024',
        name: 'Fowl Layer 2024',
        animalTypeId: fowlType.id,
        description: 'Egg-laying chickens',
        userId: user.id,
      },
    })
  }

  if (catfishType) {
    await prisma.animal.upsert({
      where: { id: 'catfish-pond-1' },
      update: {},
      create: {
        id: 'catfish-pond-1',
        name: 'Catfish Pond 1',
        animalTypeId: catfishType.id,
        description: 'Freshwater catfish',
        userId: user.id,
      },
    })
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 