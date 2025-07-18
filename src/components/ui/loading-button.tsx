import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean
  loadingText?: string
}

export function LoadingButton({ 
  loading = false, 
  loadingText = "Loading...", 
  children, 
  disabled, 
  className,
  ...props 
}: LoadingButtonProps) {
  return (
    <Button
      disabled={disabled || loading}
      className={cn("relative", className)}
      {...props}
    >
      {loading && (
        <LoadingSpinner 
          size="sm" 
          className="mr-2" 
        />
      )}
      {loading ? loadingText : children}
    </Button>
  )
} 