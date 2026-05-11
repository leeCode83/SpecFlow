import * as React from "react"
import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value?: number }
>(({ className, value, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-slate-900/50 border border-slate-800",
      className
    )}
    {...props}
  >
    <div
      className={cn(
        "h-full w-full flex-1 bg-orange-500 transition-all",
        value === undefined && "animate-progress-indeterminate origin-left"
      )}
      style={{ transform: value !== undefined ? `translateX(-${100 - (value || 0)}%)` : undefined }}
    />
  </div>
))
Progress.displayName = "Progress"

export { Progress }
