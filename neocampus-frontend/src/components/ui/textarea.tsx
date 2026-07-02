import * as React from "react"
import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[60px] w-full rounded-lg border border-neutral-200 bg-transparent px-3 py-2 text-base transition-colors outline-none placeholder:text-neutral-400 focus-visible:border-neutral-900 focus-visible:ring-3 focus-visible:ring-neutral-950/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
