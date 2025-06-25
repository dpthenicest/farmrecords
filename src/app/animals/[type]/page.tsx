import { useParams } from "next/navigation"

export default function AnimalTypePage() {
  const params = useParams<{ type: string }>()
  const type = params?.type?.toUpperCase()
  
  const animalTypeMap = {
    'GOAT': 'Goats',
    'FOWL': 'Fowls', 
    'CATFISH': 'Catfish'
  }
  
  const displayName = animalTypeMap[type as keyof typeof animalTypeMap] || type

  return (
    <main className="container py-8">
      <h1 className="text-2xl font-bold mb-4">{displayName}</h1>
      <div className="rounded border p-4 bg-muted">
        Animal list and add form for {displayName} coming soon...
      </div>
    </main>
  )
} 