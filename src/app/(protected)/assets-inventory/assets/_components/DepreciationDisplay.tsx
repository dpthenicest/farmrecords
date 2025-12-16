"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingDown, Calculator, Calendar } from "lucide-react"

interface DepreciationDisplayProps {
  asset: any
}

interface DepreciationData {
  currentValue: number
  accumulatedDepreciation: number
  monthlyDepreciation: number
  remainingValue: number
  yearsRemaining: number
}

interface DepreciationScheduleEntry {
  year: number
  depreciationAmount: number
  accumulatedDepreciation: number
  bookValue: number
}

export function DepreciationDisplay({ asset }: DepreciationDisplayProps) {
  const [depreciationData, setDepreciationData] = useState<DepreciationData | null>(null)
  const [schedule, setSchedule] = useState<DepreciationScheduleEntry[]>([])
  const [showFullSchedule, setShowFullSchedule] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!asset?.id) return

    const fetchDepreciationData = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/assets/${asset.id}/depreciation`, {
          credentials: "include"
        })
        if (response.ok) {
          const result = await response.json()
          setDepreciationData(result.data)
          
          // Calculate depreciation schedule
          const scheduleData = calculateDepreciationSchedule(
            Number(asset.purchaseCost),
            Number(asset.salvageValue),
            asset.usefulLifeYears,
            new Date(asset.purchaseDate)
          )
          setSchedule(scheduleData)
        }
      } catch (error) {
        console.error("Failed to fetch depreciation data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDepreciationData()
  }, [asset])

  const calculateDepreciationSchedule = (
    purchaseCost: number,
    salvageValue: number,
    usefulLifeYears: number,
    purchaseDate: Date
  ): DepreciationScheduleEntry[] => {
    const schedule: DepreciationScheduleEntry[] = []
    const depreciationPerYear = (purchaseCost - salvageValue) / usefulLifeYears
    
    for (let year = 1; year <= usefulLifeYears; year++) {
      const accumulatedDepreciation = depreciationPerYear * year
      const bookValue = Math.max(purchaseCost - accumulatedDepreciation, salvageValue)
      
      schedule.push({
        year,
        depreciationAmount: depreciationPerYear,
        accumulatedDepreciation,
        bookValue
      })
    }
    
    return schedule
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getDepreciationPercentage = () => {
    if (!depreciationData) return 0
    const totalDepreciable = Number(asset.purchaseCost) - Number(asset.salvageValue)
    return (depreciationData.accumulatedDepreciation / totalDepreciable) * 100
  }

  const getYearsInUse = () => {
    const purchaseDate = new Date(asset.purchaseDate)
    const now = new Date()
    return Math.floor((now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Depreciation Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Depreciation Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {depreciationData ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(depreciationData.currentValue)}
                </div>
                <div className="text-sm text-muted-foreground">Current Book Value</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(depreciationData.accumulatedDepreciation)}
                </div>
                <div className="text-sm text-muted-foreground">Accumulated Depreciation</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(depreciationData.monthlyDepreciation)}
                </div>
                <div className="text-sm text-muted-foreground">Monthly Depreciation</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {depreciationData.yearsRemaining.toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">Years Remaining</div>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-4">
              Unable to load depreciation data
            </div>
          )}
        </CardContent>
      </Card>

      {/* Depreciation Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Depreciation Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Depreciation Progress</span>
              <span>{getDepreciationPercentage().toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(getDepreciationPercentage(), 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Purchase Cost:</span>
              <div className="font-medium">{formatCurrency(Number(asset.purchaseCost))}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Salvage Value:</span>
              <div className="font-medium">{formatCurrency(Number(asset.salvageValue))}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Useful Life:</span>
              <div className="font-medium">{asset.usefulLifeYears} years</div>
            </div>
            <div>
              <span className="text-muted-foreground">Years in Use:</span>
              <div className="font-medium">{getYearsInUse()} years</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Depreciation Schedule */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Depreciation Schedule
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFullSchedule(!showFullSchedule)}
            >
              {showFullSchedule ? "Show Less" : "Show Full Schedule"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Year</TableHead>
                  <TableHead>Annual Depreciation</TableHead>
                  <TableHead>Accumulated Depreciation</TableHead>
                  <TableHead>Book Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(showFullSchedule ? schedule : schedule.slice(0, 5)).map((entry) => (
                  <TableRow key={entry.year}>
                    <TableCell className="font-medium">Year {entry.year}</TableCell>
                    <TableCell>{formatCurrency(entry.depreciationAmount)}</TableCell>
                    <TableCell>{formatCurrency(entry.accumulatedDepreciation)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(entry.bookValue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {!showFullSchedule && schedule.length > 5 && (
            <div className="text-center text-muted-foreground text-sm mt-2">
              Showing first 5 years of {schedule.length} total years
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}