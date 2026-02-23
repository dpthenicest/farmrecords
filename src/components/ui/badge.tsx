import * as React from "react"

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outline" | "secondary"
}

export function Badge({ className = "", variant = "default", ...props }: BadgeProps) {
  const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
  
  const variantClasses = {
    default: "bg-gray-100 text-gray-800",
    outline: "border border-gray-200 text-gray-700",
    secondary: "bg-blue-100 text-blue-800"
  }

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    />
  )
}