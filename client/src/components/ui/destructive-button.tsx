import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const destructiveButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600",
        outline: "border border-red-200 text-red-600 bg-white hover:bg-red-50 hover:border-red-300 hover:text-red-700",
        ghost: "text-red-600 hover:bg-red-50 hover:text-red-700",
        destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface DestructiveButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof destructiveButtonVariants> {
  asChild?: boolean
}

const DestructiveButton = React.forwardRef<HTMLButtonElement, DestructiveButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(destructiveButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
DestructiveButton.displayName = "DestructiveButton"

export { DestructiveButton, destructiveButtonVariants }