import { ReactNode } from "react"
import { ClientLayout } from "@/components/layout/client-layout"
 
export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>
} 