import "./globals.css"
import { ReactNode, Suspense } from "react"
import Loading from "./loading"

export const metadata = {
  title: "Farm Records",
  description: "Farm management and record keeping app",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={<Loading />}>
          {children}
        </Suspense>
      </body>
    </html>
  )
} 