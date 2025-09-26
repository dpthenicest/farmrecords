// app/dashboard/_components/PendingTasks.tsx
"use client"

import { usePendingTasks } from "@/hooks/useDashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, AlertCircle } from "lucide-react"

export function PendingTasks() {
  const { data, loading, error } = usePendingTasks()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            Pending Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
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
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            Pending Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 text-sm">Failed to load tasks</p>
        </CardContent>
      </Card>
    )
  }

  const tasks = data?.data || []

  if (tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-600 text-sm">No pending tasks!</p>
        </CardContent>
      </Card>
    )
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'HIGH':
      case 'URGENT':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'MEDIUM':
        return <Clock className="w-4 h-4 text-yellow-500" />
      default:
        return <Clock className="w-4 h-4 text-blue-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
      case 'URGENT':
        return 'border-red-200 bg-red-50'
      case 'MEDIUM':
        return 'border-yellow-200 bg-yellow-50'
      default:
        return 'border-blue-200 bg-blue-50'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-500" />
          Pending Tasks ({tasks.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tasks.map((task: any) => (
            <div key={task.id} className={`p-3 border rounded-lg ${getPriorityColor(task.priority)}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getPriorityIcon(task.priority)}
                    <p className="font-medium text-sm">{task.taskTitle}</p>
                  </div>
                  {task.dueDate && (
                    <p className="text-xs text-gray-600">
                      Due: {new Date(task.dueDate).toLocaleDateString('en-GB')}
                    </p>
                  )}
                  {task.animalBatch && (
                    <p className="text-xs text-gray-600">
                      Batch: {task.animalBatch.batchCode}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" className="text-xs">
                    View
                  </Button>
                  <Button size="sm" className="text-xs">
                    Complete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Button variant="outline" size="sm">
            View All Tasks
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}