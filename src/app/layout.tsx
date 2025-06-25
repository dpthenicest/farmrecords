import "../globals.css"
import { ReactNode, Suspense } from "react"

export const metadata = {
  title: "Farm Records",
  description: "Farm management and record keeping app",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
          {children}
        </Suspense>
      </body>
    </html>
  )
} 