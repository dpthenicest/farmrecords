"use client"

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import ExpensesTableView from './components/table-view'

export default function ExpensesClient() {
  const { data: session } = useSession()
  const [expenseRecords, setExpenseRecords] = useState([])
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchExpenseRecords = async () => {
      if (!session?.user?.id) return
      
      try {
        setIsLoading(true)
        const response = await fetch(`/api/records?categoryType=EXPENSE&userId=${session.user.id}`)
        if (response.ok) {
          const data = await response.json()
          setExpenseRecords(data.records || [])
          
          // Calculate total expenses
          const total = data.records?.reduce((sum: number, record: any) => {
            return sum + (record.unitPrice * record.quantity)
          }, 0) || 0
          setTotalExpenses(total)
        }
      } catch (error) {
        console.error('Error fetching expense records:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchExpenseRecords()
  }, [session?.user?.id])

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Expense Records</h1>
      {/* Analytics summary */}
      <div className="flex space-x-6 mb-6">
        <div className="bg-red-50 rounded-lg p-4 flex flex-col items-center shadow border border-red-100">
          <span className="text-lg font-semibold text-red-700">Total Expenses</span>
          <span className="text-2xl font-bold text-red-900">
            {isLoading ? 'Loading...' : `₦${totalExpenses.toLocaleString()}`}
          </span>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 flex flex-col items-center shadow border border-blue-100">
          <span className="text-lg font-semibold text-blue-700">Number of Records</span>
          <span className="text-2xl font-bold text-blue-900">
            {isLoading ? 'Loading...' : expenseRecords.length}
          </span>
        </div>
      </div>
      <ExpensesTableView records={expenseRecords} isLoading={isLoading} />
    </div>
  )
} 