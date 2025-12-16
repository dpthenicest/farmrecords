import { NextRequest } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { Errors, Successes } from "@/lib/responses"
import { getOverdueTasks } from "@/services/taskService"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return Errors.Unauthorized()
    }

    const tasks = await getOverdueTasks(session.user.id, session.user.role)
    return Successes.Ok(tasks)
  } catch (error) {
    console.error("Error fetching overdue tasks:", error)
    return Errors.Internal()
  }
}