import { NextRequest } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { Errors, Successes } from "@/lib/responses"
import { completeTask } from "@/services/taskService"

export async function POST(
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
    const { notes } = body

    const task = await completeTask(id, session.user.id, session.user.role, notes)
    return Successes.Ok(task)
  } catch (error) {
    console.error("Error completing task:", error)
    if (error instanceof Error && error.message === "Task not found or access denied") {
      return Errors.NotFound()
    }
    return Errors.Internal()
  }
}