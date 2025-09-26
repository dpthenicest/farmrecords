// app/dashboard/_components/MetricCard.tsx
interface MetricCardProps {
  title: string
  value: string
  change?: string
  positive?: boolean
}

export function MetricCard({ title, value, change, positive }: MetricCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        {change && (
          <div className={`flex items-center text-sm font-medium ${
            positive ? 'text-green-600' : 'text-red-600'
          }`}>
            <span>{change}</span>
          </div>
        )}
      </div>
    </div>
  )
}