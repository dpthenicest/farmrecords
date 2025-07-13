'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Modal } from '@/components/ui/modal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ViewAnimalRecordsModalProps {
  isOpen: boolean
  onClose: () => void
  animal: any
}

export function ViewAnimalRecordsModal({ isOpen, onClose, animal }: ViewAnimalRecordsModalProps) {
  const { data: session } = useSession()
  const [records, setRecords] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchAnimalRecords = async () => {
      if (!isOpen || !animal?.id || !session?.user?.id) return
      
      try {
        setIsLoading(true)
        const response = await fetch(`/api/records?animalId=${animal.id}&userId=${session.user.id}`)
        if (response.ok) {
          const data = await response.json()
          setRecords(data.records || [])
        }
      } catch (error) {
        console.error('Error fetching animal records:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnimalRecords()
  }, [isOpen, animal?.id, session?.user?.id])

  const calculateTotalIncome = () => {
    return records
      .filter((record: any) => record.category?.categoryType?.name === 'INCOME')
      .reduce((sum: number, record: any) => sum + (record.unitPrice * record.quantity), 0)
  }

  const calculateTotalExpenses = () => {
    return records
      .filter((record: any) => record.category?.categoryType?.name === 'EXPENSE')
      .reduce((sum: number, record: any) => sum + (record.unitPrice * record.quantity), 0)
  }

  const totalIncome = calculateTotalIncome()
  const totalExpenses = calculateTotalExpenses()
  const netProfit = totalIncome - totalExpenses

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${animal?.name || 'Animal'} Records`}
      size="xl"
    >
      <div className="space-y-6">
        {/* Animal Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {animal?.name} ({animal?.animalType?.type || 'Unknown'})
          </h3>
          <p className="text-sm text-gray-600">
            {animal?.description || 'No description available'}
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-green-700">Total Income</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                {isLoading ? 'Loading...' : `₦${totalIncome.toLocaleString()}`}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-red-700">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">
                {isLoading ? 'Loading...' : `₦${totalExpenses.toLocaleString()}`}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-blue-700">Net Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {isLoading ? 'Loading...' : `₦${netProfit.toLocaleString()}`}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Records Table */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading records...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-white z-10">
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium bg-white">Date</th>
                        <th className="text-left py-3 px-4 font-medium bg-white">Category</th>
                        <th className="text-left py-3 px-4 font-medium bg-white">Type</th>
                        <th className="text-left py-3 px-4 font-medium bg-white">Amount</th>
                        <th className="text-left py-3 px-4 font-medium bg-white">Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-gray-500">
                            No records found for this animal
                          </td>
                        </tr>
                      ) : (
                        records.map((record: any) => (
                          <tr key={record.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">
                              {new Date(record.date).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              {record.category?.name || 'Unknown'}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                                record.category?.categoryType?.name === 'INCOME' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {record.category?.categoryType?.name || 'Unknown'}
                              </span>
                            </td>
                            <td className={`py-3 px-4 font-medium ${
                              record.category?.categoryType?.name === 'INCOME' 
                                ? 'text-green-600' 
                                : 'text-red-600'
                            }`}>
                              {record.category?.categoryType?.name === 'INCOME' ? '+' : '-'}₦{(record.unitPrice * record.quantity).toFixed(2)}
                            </td>
                            <td className="py-3 px-4">
                              {record.note || '-'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Modal>
  )
} 