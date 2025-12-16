"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"

interface AnimalFiltersProps {
  filters: {
    species: string
    breed: string
    gender: string
    healthStatus: string
    startDate: string
    endDate: string
  }
  onFiltersChange: (filters: any) => void
  onApplyFilters: () => void
  onResetFilters: () => void
}

export function AnimalFilters({
  filters,
  onFiltersChange,
  onApplyFilters,
  onResetFilters,
}: AnimalFiltersProps) {
  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="space-y-2">
            <Label htmlFor="species">Species</Label>
            <Input
              id="species"
              placeholder="e.g., Cattle, Poultry"
              value={filters.species}
              onChange={(e) => handleFilterChange("species", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="breed">Breed</Label>
            <Input
              id="breed"
              placeholder="e.g., Holstein, Angus"
              value={filters.breed}
              onChange={(e) => handleFilterChange("breed", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select
              value={filters.gender}
              onValueChange={(value) => handleFilterChange("gender", value)}
            >
              <option value="">All Genders</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="healthStatus">Health Status</Label>
            <Select
              value={filters.healthStatus}
              onValueChange={(value) => handleFilterChange("healthStatus", value)}
            >
              <option value="">All Statuses</option>
              <option value="HEALTHY">Healthy</option>
              <option value="SICK">Sick</option>
              <option value="RECOVERING">Recovering</option>
              <option value="QUARANTINE">Quarantine</option>
              <option value="DECEASED">Deceased</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button onClick={onApplyFilters}>Apply Filters</Button>
          <Button variant="outline" onClick={onResetFilters}>
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}