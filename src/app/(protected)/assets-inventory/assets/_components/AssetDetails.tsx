"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface AssetDetailsProps {
  asset: any
  onClose: () => void
}

export function AssetDetails({ asset }: AssetDetailsProps) {
  if (!asset) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>{asset.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p><strong>Category:</strong> {asset.category || "-"}</p>
        <p><strong>Location:</strong> {asset.location || "-"}</p>
        <p><strong>Status:</strong> {asset.status || "Active"}</p>
        <p><strong>Value:</strong> ${asset.value?.toLocaleString()}</p>
        <p><strong>Description:</strong> {asset.description || "N/A"}</p>

        <div className="mt-4">
          <h3 className="font-semibold mb-2">Maintenance History</h3>
          {asset.maintenance?.length ? (
            <ul className="list-disc pl-5 text-sm space-y-1">
              {asset.maintenance.map((m: any, idx: number) => (
                <li key={idx}>
                  {m.date} - {m.description} (${m.cost})
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">No maintenance records</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
