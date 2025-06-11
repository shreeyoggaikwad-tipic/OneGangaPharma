import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { Button } from "./button"
import { cn } from "@/lib/utils"

export interface DestructiveButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
}

const DestructiveButton = React.forwardRef<HTMLButtonElement, DestructiveButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const baseStyles = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
    
    const variantStyles = {
      default: "border border-red-600",
      outline: "border border-red-600",
      ghost: "border border-transparent"
    }
    
    const sizeStyles = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10"
    }
    
    // Force inline styles to override all CSS
    const inlineStyles: React.CSSProperties = {
      backgroundColor: variant === "outline" ? "white" : variant === "ghost" ? "transparent" : "#dc2626",
      color: variant === "outline" || variant === "ghost" ? "#dc2626" : "white",
      borderColor: "#dc2626",
      borderWidth: "1px",
      borderStyle: "solid"
    }
    
    // Add hover event handlers
    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (variant === "outline") {
        e.currentTarget.style.backgroundColor = "#fef2f2"
        e.currentTarget.style.color = "#b91c1c"
      } else if (variant === "ghost") {
        e.currentTarget.style.backgroundColor = "#fef2f2"
        e.currentTarget.style.color = "#b91c1c"
      } else {
        e.currentTarget.style.backgroundColor = "#b91c1c"
        e.currentTarget.style.color = "white"
      }
    }
    
    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (variant === "outline") {
        e.currentTarget.style.backgroundColor = "white"
        e.currentTarget.style.color = "#dc2626"
      } else if (variant === "ghost") {
        e.currentTarget.style.backgroundColor = "transparent"
        e.currentTarget.style.color = "#dc2626"
      } else {
        e.currentTarget.style.backgroundColor = "#dc2626"
        e.currentTarget.style.color = "white"
      }
    }
    
    return (
      <Comp
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        style={inlineStyles}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        ref={ref}
        {...props}
      />
    )
  }
)
DestructiveButton.displayName = "DestructiveButton"

export { DestructiveButton }