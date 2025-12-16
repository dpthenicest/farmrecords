import { NextRequest } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { Errors, Successes } from "@/lib/responses"
import { getTasks, createTask, validateTaskData } from "@/services/taskService"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return Errors.Unauthorized()
    }

    const { searchParams } = new URL(request.url)
    
    // Pagination
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    
    // Filters
    const filters = {
      priority: searchParams.get("priority") || undefined,
      status: searchParams.get("status") || undefined,
      assignedTo: searchParams.get("assignedTo") ? parseInt(searchParams.get("assignedTo")!) : undefined,
      animalBatchId: searchParams.get("animalBatchId") ? parseInt(searchParams.get("animalBatchId")!) : undefined,
      assetId: searchParams.get("assetId") ? parseInt(searchParams.get("assetId")!) : undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      sortBy: searchParams.get("sortBy") || undefined,
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
    }

    const result = await getTasks(
      session.user.id,
      session.user.role,
      filters,
      { page, limit }
    )

    return Successes.Ok(result)
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return Errors.Internal()
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return Errors.Unauthorized()
    }

    const body = await request.json()
    
    // Convert dueDate string to Date object if provided
    if (body.dueDate) {
      body.dueDate = new Date(body.dueDate)
    }

    // Validate task data
    const validationErrors = validateTaskData(body)
    if (validationErrors.length > 0) {
      return Errors.Validation(
        validationErrors.map(error => ({ message: error }))
      )
    }

    const task = await createTask(session.user.id, body)
    return Successes.Created(task)
  } catch (error) {
    console.error("Error creating task:", error)
    return Errors.Internal()
  }
}