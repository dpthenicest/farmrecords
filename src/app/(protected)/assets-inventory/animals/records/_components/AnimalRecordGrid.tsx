"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function AnimalRecordGrid({ records, loading, error, page, totalPages, onPageChange, onView, onEdit, onDelete }: any) {
  if (loading) return <p>Loading records...</p>
  if (error) return <p className="text-red-600">{error.message}</p>
  if (!records?.length) return <p>No records found</p>

  const getRecordTypeColor = (type: string) => {
    switch (type) {
      case "HEALTH_CHECK":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "VACCINATION":
        return "bg-green-100 text-green-800 border-green-200"
      case "FEEDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "PRODUCTION":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "MORTALITY":
        return "bg-red-100 text-red-800 border-red-200"
      case "BREEDING":
        return "bg-pink-100 text-pink-800 border-pink-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case "HEALTHY":
        return "bg-green-100 text-green-800"
      case "SICK":
        return "bg-red-100 text-red-800"
      case "RECOVERING":
        return "bg-yellow-100 text-yellow-800"
      case "QUARANTINE":
        return "bg-orange-100 text-orange-800"
      case "DECEASED":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {records.map((r: any) => (
          <Card key={r.id} className={`hover:shadow-lg transition cursor-pointer border-l-4 ${getRecordTypeColor(r.recordType)}`}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">
                  {r.recordType.replace("_", " ")}
                </CardTitle>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRecordTypeColor(r.recordType)}`}>
                  {new Date(r.recordDate).toLocaleDateString()}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Animal/Batch Information */}
              <div className="space-y-1">
                {r.animal ? (
                  <div className="text-sm">
                    <div className="font-medium flex items-center gap-1">
                      🐄 <span>{r.animal.animalTag}</span>
                    </div>
                    <div className="text-muted-foreground">{r.animal.species}</div>
                  </div>
                ) : r.batch ? (
                  <div className="text-sm">
                    <div className="font-medium flex items-center gap-1">
                      📦 <span>{r.batch.batchCode}</span>
                    </div>
                    <div className="text-muted-foreground">{r.batch.species}</div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No association</div>
                )}
              </div>

              {/* Health Status */}
              {r.healthStatus && (
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthStatusColor(r.healthStatus)}`}>
                    {r.healthStatus}
                  </span>
                </div>
              )}

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Weight:</span>
                  <div className="font-medium">
                    {r.weight ? `${Number(r.weight).toFixed(1)} kg` : "-"}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Feed:</span>
                  <div className="font-medium">
                    {r.feedConsumption ? `${Number(r.feedConsumption).toFixed(1)} kg` : "-"}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Production:</span>
                  <div className="font-medium">
                    {r.productionOutput ? `${Number(r.productionOutput).toFixed(1)}` : "-"}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Temp:</span>
                  <div className="font-medium">
                    {r.temperature ? `${Number(r.temperature).toFixed(1)}°C` : "-"}
                  </div>
                </div>
              </div>

              {/* Observations Preview */}
              {r.observations && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Notes:</span>
                  <p className="text-xs mt-1 line-clamp-2">{r.observations}</p>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" onClick={() => onView(r.id)}>View</Button>
                <Button size="sm" variant="secondary" onClick={() => onEdit(r.id)}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => onDelete(r.id)}>Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <Button key={p} size="sm" variant={p === page ? "default" : "outline"} onClick={() => onPageChange(p)}>{p}</Button>
          ))}
        </div>
      )}
    </div>
  )
}
