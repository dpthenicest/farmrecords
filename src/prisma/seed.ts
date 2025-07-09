import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create animal types
  const animalTypes = [
    { type: 'GOAT' },
    { type: 'FOWL' },
    { type: 'CATFISH' },
    { type: 'COW' },
    { type: 'PIG' },
    { type: 'SHEEP' },
    { type: 'HORSE' },
    { type: 'RABBIT' },
    { type: 'DUCK' },
    { type: 'TURKEY' },
  ]
  for (const animalType of animalTypes) {
    await prisma.animalType.upsert({
      where: { type: animalType.type },
      update: {},
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

  // Create expense categories
  for (const category of expenseCategories) {
    await prisma.category.upsert({
      where: { unique_category_for_user: { name: category.name, userId: user.id } },
      update: {},
      create: {
        name: category.name,
        type: 'EXPENSE',
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
        type: 'INCOME',
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