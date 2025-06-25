import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function SignupPage() {
  return (
    <main className="container py-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
      <form className="space-y-4">
        <Input type="email" placeholder="Email" required />
        <Input type="text" placeholder="Name" required />
        <Input type="password" placeholder="Password" required />
        <Button type="submit" className="w-full">Sign Up</Button>
      </form>
    </main>
  )
} 