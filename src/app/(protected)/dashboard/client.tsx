'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Users, DollarSign } from "lucide-react"
import { AddAnimalModal } from '@/components/modals/add-animal-modal'
import { AddRecordModal } from '@/components/modals/add-record-modal'
import { useMainData } from '@/providers/main-data-provider'

export default function DashboardClient() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isAddAnimalModalOpen, setIsAddAnimalModalOpen] = useState(false)
  const [isAddRecordModalOpen, setIsAddRecordModalOpen] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const { addAnimal, addRecord, fetchAnimals, fetchRecords } = useMainData()

  useEffect(() => {
    async function fetchStats() {
      setLoading(true)
      const res = await fetch('/api/stats')
      const data = await res.json()
      setStats(data)
      setLoading(false)
    }
    fetchStats()
  }, [])

  const handleAddAnimal = async (data: any) => {
    setModalLoading(true)
    try {
      await addAnimal(data)
      setIsAddAnimalModalOpen(false)
      fetchAnimals()
    } finally {
      setModalLoading(false)
    }
  }

  const handleAddRecord = async (data: any) => {
    setModalLoading(true)
    try {
      await addRecord(data)
      setIsAddRecordModalOpen(false)
      fetchRecords()
    } finally {
      setModalLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your farm records dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {loading ? '...' : `₦${stats?.totalIncome?.toLocaleString() || 0}`}
            </div>
            {/* <p className="text-xs text-muted-foreground">+20.1% from last month</p> */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {loading ? '...' : `₦${stats?.totalExpenses?.toLocaleString() || 0}`}
            </div>
            {/* <p className="text-xs text-muted-foreground">+12.3% from last month</p> */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {loading ? '...' : `₦${stats?.netProfit?.toLocaleString() || 0}`}
            </div>
            {/* <p className="text-xs text-muted-foreground">+15.2% from last month</p> */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Animals</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {loading ? '...' : stats?.totalAnimals || 0}
            </div>
            {/* <p className="text-xs text-muted-foreground">+3 new this month</p> */}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Records</CardTitle>
            <CardDescription>Latest transactions and activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="text-gray-500">Loading...</div>
              ) : stats?.recentRecords?.length === 0 ? (
                <div className="text-gray-500">No recent records found.</div>
              ) : (
                stats.recentRecords.map((record: any) => (
                  <div key={record.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{record.category?.name || 'Unknown'}</p>
                      <p className="text-sm text-gray-600">{record.note || ''}</p>
                    </div>
                    <div className="text-right">
                      <p className={
                        'font-medium ' +
                        (record.category?.categoryType?.name === 'INCOME'
                          ? 'text-green-600'
                          : 'text-red-600')
                      }>
                        {record.category?.categoryType?.name === 'INCOME' ? '+' : '-'}₦{(record.unitPrice * record.quantity).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">{new Date(record.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <button
                className="p-4 border rounded-lg hover:bg-gray-50 text-left"
                onClick={() => setIsAddRecordModalOpen(true)}
              >
                <p className="font-medium">Add Record</p>
                <p className="text-sm text-gray-600">Create new transaction</p>
              </button>
              <button
                className="p-4 border rounded-lg hover:bg-gray-50 text-left"
                onClick={() => setIsAddAnimalModalOpen(true)}
              >
                <p className="font-medium">Add Animal</p>
                <p className="text-sm text-gray-600">Register new animal</p>
              </button>
              <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
                <p className="font-medium">View Reports</p>
                <p className="text-sm text-gray-600">Financial reports</p>
              </button>
              <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
                <p className="font-medium">Settings</p>
                <p className="text-sm text-gray-600">App configuration</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <AddAnimalModal
        isOpen={isAddAnimalModalOpen}
        onClose={() => setIsAddAnimalModalOpen(false)}
        onSubmit={handleAddAnimal}
        isLoading={modalLoading}
      />
      <AddRecordModal
        isOpen={isAddRecordModalOpen}
        onClose={() => setIsAddRecordModalOpen(false)}
        onSubmit={handleAddRecord}
        isLoading={modalLoading}
      />
    </div>
  )
} 