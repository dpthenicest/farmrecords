import { NextRequest } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { Errors, Successes } from "@/lib/responses"
import { getTasksAssignedToMe } from "@/services/taskService"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return Errors.Unauthorized()
    }

    const tasks = await getTasksAssignedToMe(session.user.id)
    return Successes.Ok(tasks)
  } catch (error) {
    console.error("Error fetching assigned tasks:", error)
    return Errors.Internal()
  }
}