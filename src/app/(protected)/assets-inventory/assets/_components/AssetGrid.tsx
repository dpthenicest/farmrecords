"use client"

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"

interface AssetGridProps {
  assets: any[]
  loading: boolean
  error: string | null
  onView: (asset: any) => void
}

export function AssetGrid({ assets, loading, error, onView }: AssetGridProps) {
  if (loading) {
    return <div className="p-6 text-center">Loading assets...</div>
  }
  if (error) {
    return <div className="p-6 text-red-500">{error}</div>
  }
  if (!assets?.length) {
    return <div className="p-6 text-center text-muted-foreground">No assets available</div>
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {assets.map((asset) => (
        <Card key={asset.id} className="shadow-md">
          <CardHeader>
            <CardTitle>{asset.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Category: {asset.category || "-"}</p>
            <p className="text-sm text-muted-foreground">Location: {asset.location || "-"}</p>
            <p className="text-sm text-muted-foreground">Value: ${asset.value?.toLocaleString()}</p>
          </CardContent>
          <CardFooter>
            <Button size="sm" variant="outline" onClick={() => onView(asset)}>
              <Eye className="h-4 w-4 mr-2" /> View
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
