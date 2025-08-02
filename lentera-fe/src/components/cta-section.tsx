import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowLeft, Search, MessageSquare } from "lucide-react"
import { ReactNode } from "react"

interface CTAButton {
  label: string
  to: string
  variant?: "default" | "outline"
  icon?: "sparkles" | "arrowLeft" | "search" | "messageSquare"
  onClick?: () => void
}

interface CTASectionProps {
  title: string
  subtitle?: string
  titleKey?: string
  subtitleKey?: string
  buttons: CTAButton[]
  className?: string
  centered?: boolean
}

export const CTASection = ({
  title,
  subtitle,
  titleKey,
  subtitleKey,
  buttons,
  className = "",
  centered = true
}: CTASectionProps) => {
  const { t } = useTranslation()

  const renderIcon = (iconName?: string): ReactNode => {
    switch(iconName) {
      case "sparkles":
        return <Sparkles className="h-5 w-5" />
      case "arrowLeft":
        return <ArrowLeft className="h-5 w-5" />
      case "search":
        return <Search className="h-5 w-5" />
      case "messageSquare":
        return <MessageSquare className="h-5 w-5" />
      default:
        return null
    }
  }

  return (
    <section className={`py-16 px-4 ${className}`}>
      <div className={`max-w-4xl mx-auto ${centered ? 'text-center' : ''} space-y-8`}>
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-foreground">
            {titleKey ? t(titleKey) : title}
          </h2>
          {(subtitle || subtitleKey) && (
            <p className="text-xl text-muted-foreground">
              {subtitleKey ? t(subtitleKey) : subtitle}
            </p>
          )}
        </div>
        
        <div className={`flex flex-col sm:flex-row gap-4 ${centered ? 'justify-center' : ''}`}>
          {buttons.map((button, index) => (
            button.onClick ? (
              <Button 
                key={index}
                size="lg" 
                variant={button.variant || "default"}
                onClick={button.onClick}
                className="gap-2 h-14 px-8 text-lg"
              >
                {button.icon && renderIcon(button.icon)}
                {button.label}
              </Button>
            ) : (
              <Link key={index} to={button.to}>
                <Button 
                  size="lg" 
                  variant={button.variant || "default"}
                  className="gap-2 h-14 px-8 text-lg"
                >
                  {button.icon && renderIcon(button.icon)}
                  {button.label}
                </Button>
              </Link>
            )
          ))}
        </div>
      </div>
    </section>
  )
}