"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function AnimalGrid({ animals, loading, error, page, totalPages, onPageChange, onView, onEdit }: any) {
  if (loading) return <p>Loading animals...</p>
  if (error) return <p className="text-red-600">{error.message}</p>
  if (!animals?.length) return <p>No animals found</p>

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {animals.map((a: any) => (
          <Card key={a.id} className="hover:shadow-lg transition cursor-pointer">
            <CardHeader>
              <CardTitle>{a.tag}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Species: {a.species}</p>
              <p>Batch: {a.batch}</p>
              <p>Weight: {a.weight}</p>
              <p>Health: {a.healthStatus}</p>
              <p>Last Check: {a.lastCheck}</p>
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="outline" onClick={() => onView(a.id)}>View</Button>
                <Button size="sm" variant="secondary" onClick={() => onEdit(a.id)}>Edit</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <Button key={p} size="sm" variant={p === page ? "default" : "outline"} onClick={() => onPageChange(p)}>
              {p}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
