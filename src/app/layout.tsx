import "./globals.css"
import { ReactNode, Suspense } from "react"
import Loading from "./loading"
import SessionProviderWrapper from "@/providers/session-provider-wrapper"

export const metadata = {
  title: "Farm Records",
  description: "Farm management and record keeping app",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProviderWrapper>
            <Suspense fallback={<Loading />}>
              {children}
            </Suspense>
        </SessionProviderWrapper>
      </body>
    </html>
  )
} 