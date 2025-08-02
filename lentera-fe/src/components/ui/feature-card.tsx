import { forwardRef } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const featureCardVariants = cva(
  "relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer touch-manipulation",
  {
    variants: {
      variant: {
        primary: "bg-gradient-primary text-primary-foreground shadow-feature hover:shadow-glow",
        secondary: "bg-gradient-learning text-secondary-foreground shadow-feature hover:shadow-glow",
        accent: "bg-gradient-warm text-accent-foreground shadow-feature hover:shadow-glow",
        default: "bg-card text-card-foreground shadow-card hover:shadow-feature border-border/50"
      },
      size: {
        default: "p-6",
        sm: "p-4",
        lg: "p-8"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)

export interface FeatureCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof featureCardVariants> {
  icon?: React.ReactNode
  title: string
  description?: string
  disabled?: boolean
}

const FeatureCard = forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ className, variant, size, icon, title, description, disabled, ...props }, ref) => {
    return (
      <div
        className={cn(
          featureCardVariants({ variant, size, className }),
          disabled && "opacity-50 cursor-not-allowed hover:scale-100 active:scale-100"
        )}
        ref={ref}
        {...props}
      >
        <div className="flex flex-col items-center text-center space-y-3">
          {icon && (
            <div className="p-3 rounded-full bg-white/20 text-2xl">
              {icon}
            </div>
          )}
          <h3 className="text-lg font-semibold leading-tight">{title}</h3>
          {description && (
            <p className="text-sm opacity-90 leading-relaxed">{description}</p>
          )}
        </div>
      </div>
    )
  }
)
FeatureCard.displayName = "FeatureCard"

export { FeatureCard, featureCardVariants }