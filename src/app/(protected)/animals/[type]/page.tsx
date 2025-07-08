import AnimalTypeClient from './client'

export default async function AnimalTypePage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params
  return <AnimalTypeClient params={{ type }} />
} 