import "./globals.css"
import { ReactNode, Suspense } from "react"
import Loading from "./loading"
import SessionProviderWrapper from "@/components/session-provider-wrapper"
import { MainDataProvider } from "@/providers/main-data-provider"

export const metadata = {
  title: "Farm Records",
  description: "Farm management and record keeping app",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProviderWrapper>
          <MainDataProvider>
            <Suspense fallback={<Loading />}>
              {children}
            </Suspense>
          </MainDataProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  )
} 