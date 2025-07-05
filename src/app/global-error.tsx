'use client'

import { useEffect } from 'react'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global application error:', error)
  }, [error])

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="max-w-md w-full mx-auto p-6">
            <div className="text-center space-y-4">
              <div className="text-6xl mb-4">🚨</div>
              <h1 className="text-2xl font-bold text-foreground">
                Critical Error
              </h1>
              <p className="text-muted-foreground">
                A critical error occurred. Please refresh the page or contact support.
              </p>
              
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                    Error Details (Development)
                  </summary>
                  <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto">
                    {error.message}
                    {error.stack && (
                      <>
                        {'\n\n'}
                        {error.stack}
                      </>
                    )}
                  </pre>
                </details>
              )}
              
              <div className="flex gap-3 justify-center mt-6">
                <button
                  onClick={reset}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                >
                  Try Again
                </button>
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 border border-input bg-background rounded hover:bg-accent"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
} 