import { useParams } from "next/navigation"

export default function CategoryPage() {
  const params = useParams<{ type: string }>()
  const type = params?.type
  return (
    <main className="container py-8">
      <h1 className="text-2xl font-bold mb-4">{type?.charAt(0).toUpperCase() + type?.slice(1)} Categories</h1>
      <div className="rounded border p-4 bg-muted">Category list and add form for {type} coming soon...</div>
    </main>
  )
} 