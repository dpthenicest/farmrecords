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
    { name: 'Animal Purchase', description: 'Buying new goats, fowls, catfish', color: 'red' },
    { name: 'Feed', description: 'Maize, pellets, or other feed', color: 'red' },
    { name: 'Drugs & Vaccines', description: 'Veterinary treatments', color: 'red' },
    { name: 'Workers\' Salary', description: 'Monthly payments to farm workers', color: 'red' },
    { name: 'Facility Costs', description: 'Repairs, water supply, tools', color: 'red' },
    { name: 'Transportation', description: 'Fuel, logistics', color: 'red' },
    { name: 'Utilities', description: 'Electricity, water bills', color: 'red' },
    { name: 'Maintenance', description: 'Cage/tank repair, fencing, etc.', color: 'red' },
    { name: 'Animal Loss', description: 'Death/Loss of Animals.', color: 'red' },
    { name: 'Miscellaneous', description: 'Anything not covered in above', color: 'red' }
  ]

  // Create income categories
  const incomeCategories = [
    { name: 'Sale of Animals', description: 'Revenue from animal sales', color: 'green' },
    { name: 'Manure Sales', description: 'Selling animal waste as fertilizer', color: 'green' },
    { name: 'Subsidies/Support', description: 'Gov\'t support, aid (if any)', color: 'green' },
    { name: 'Other Income', description: 'Rentals, byproducts, etc.', color: 'green' }
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