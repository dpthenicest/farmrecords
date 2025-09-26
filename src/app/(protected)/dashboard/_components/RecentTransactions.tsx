// app/dashboard/_components/RecentTransactions.tsx
"use client"

import { useRecentTransactions } from "@/hooks/useDashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function RecentTransactions() {
  const { data, loading, error } = useRecentTransactions(5)
  const router = useRouter()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 text-sm">Failed to load transactions</p>
        </CardContent>
      </Card>
    )
  }

  const transactions = data?.data?.records || []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Date</th>
                <th className="py-2">Type</th>
                <th className="py-2">Description</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction: any) => (
                <tr key={transaction.id} className="border-b hover:bg-gray-50">
                  <td className="py-2">
                    {new Date(transaction.transactionDate).toLocaleDateString('en-GB')}
                  </td>
                  <td className="py-2">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      transaction.transactionType === 'INCOME' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.transactionType}
                    </span>
                  </td>
                  <td className="py-2">{transaction.description}</td>
                  <td className="py-2 text-right font-medium">
                    ₦{parseFloat(transaction.amount).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-center">
          <Button 
            variant="outline" 
            onClick={() => router.push('/financials/records')}
          >
            View All Transactions
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
