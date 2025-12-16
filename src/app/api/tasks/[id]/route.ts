import { NextRequest } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { Errors, Successes } from "@/lib/responses"
import { getTaskById, updateTask, deleteTask, validateTaskData } from "@/services/taskService"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return Errors.Unauthorized()
    }

    const id = parseInt(params.id)
    if (isNaN(id)) {
      return Errors.Validation([{ message: "Invalid task ID" }])
    }

    const task = await getTaskById(id, session.user.id, session.user.role)
    if (!task) {
      return Errors.NotFound()
    }

    return Successes.Ok(task)
  } catch (error) {
    console.error("Error fetching task:", error)
    return Errors.Internal()
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return Errors.Unauthorized()
    }

    const id = parseInt(params.id)
    if (isNaN(id)) {
      return Errors.Validation([{ message: "Invalid task ID" }])
    }

    const body = await request.json()
    
    // Convert dueDate string to Date object if provided
    if (body.dueDate) {
      body.dueDate = new Date(body.dueDate)
    }

    // Validate task data (partial validation for updates)
    if (body.taskTitle !== undefined || body.priority !== undefined || body.status !== undefined) {
      const validationErrors = validateTaskData({ 
        taskTitle: body.taskTitle || "temp", // Provide temp value for validation
        priority: body.priority || "MEDIUM",
        status: body.status || "PENDING",
        ...body 
      })
      if (validationErrors.length > 0) {
        return Errors.Validation(
          validationErrors.map(error => ({ message: error }))
        )
      }
    }

    const task = await updateTask(id, session.user.id, session.user.role, body)
    return Successes.Ok(task)
  } catch (error) {
    console.error("Error updating task:", error)
    if (error instanceof Error && error.message === "Task not found or access denied") {
      return Errors.NotFound()
    }
    return Errors.Internal()
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return Errors.Unauthorized()
    }

    const id = parseInt(params.id)
    if (isNaN(id)) {
      return Errors.Validation([{ message: "Invalid task ID" }])
    }

    await deleteTask(id, session.user.id, session.user.role)
    return Successes.NoContent()
  } catch (error) {
    console.error("Error deleting task:", error)
    if (error instanceof Error && error.message === "Task not found or access denied") {
      return Errors.NotFound()
    }
    return Errors.Internal()
  }
}