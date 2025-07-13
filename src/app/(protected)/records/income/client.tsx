"use client"

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import IncomeTableView from './components/table-view'

export default function IncomeClient() {
  const { data: session } = useSession()
  const [incomeRecords, setIncomeRecords] = useState([])
  const [totalIncome, setTotalIncome] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchIncomeRecords = async () => {
      if (!session?.user?.id) return
      
      try {
        setIsLoading(true)
        const response = await fetch(`/api/records?categoryType=INCOME&userId=${session.user.id}`)
        if (response.ok) {
          const data = await response.json()
          setIncomeRecords(data.records || [])
          
          // Calculate total income
          const total = data.records?.reduce((sum: number, record: any) => {
            return sum + (record.unitPrice * record.quantity)
          }, 0) || 0
          setTotalIncome(total)
        }
      } catch (error) {
        console.error('Error fetching income records:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchIncomeRecords()
  }, [session?.user?.id])

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Income Records</h1>
      {/* Analytics summary */}
      <div className="flex space-x-6 mb-6">
        <div className="bg-green-50 rounded-lg p-4 flex flex-col items-center shadow border border-green-100">
          <span className="text-lg font-semibold text-green-700">Total Income</span>
          <span className="text-2xl font-bold text-green-900">
            {isLoading ? 'Loading...' : `₦${totalIncome.toLocaleString()}`}
          </span>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 flex flex-col items-center shadow border border-blue-100">
          <span className="text-lg font-semibold text-blue-700">Number of Records</span>
          <span className="text-2xl font-bold text-blue-900">
            {isLoading ? 'Loading...' : incomeRecords.length}
          </span>
        </div>
      </div>
      <IncomeTableView records={incomeRecords} isLoading={isLoading} />
    </div>
  )
} 