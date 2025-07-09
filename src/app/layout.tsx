import "./globals.css"
import { ReactNode, Suspense } from "react"
import Loading from "./loading"
import { SessionProvider } from "next-auth/react"
import { MainDataProvider } from "@/providers/main-data-provider"
import { UIProvider } from "@/providers/ui-provider"

export const metadata = {
  title: "Farm Records",
  description: "Farm management and record keeping app",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <MainDataProvider>
            <UIProvider>
              <Suspense fallback={<Loading />}>
                {children}
              </Suspense>
            </UIProvider>
          </MainDataProvider>
        </SessionProvider>
      </body>
    </html>
  )
} 