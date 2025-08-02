import { Link } from "react-router-dom"
import { Sparkles, Search, ArrowLeft } from "lucide-react"
import { useTranslation } from "react-i18next"

interface BrandLogoProps {
  variant?: 'default' | 'search' | 'back'
  to?: string
  showTagline?: boolean
  onNavigate?: () => void
}

export const BrandLogo = ({
  variant = 'default',
  to = "/",
  showTagline = false,
  onNavigate
}: BrandLogoProps) => {
  const { t } = useTranslation()
  
  const getIcon = () => {
    switch (variant) {
      case 'search':
        return <Search className="h-4 w-4 text-white" />
      case 'back':
        return (
          <>
            <ArrowLeft className="h-5 w-5" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            </div>
          </>
        )
      default:
        return (
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
          </div>
        )
    }
  }

  return (
    <Link
      to={to}
      className="flex items-center gap-3 hover:opacity-80 transition-opacity"
      onClick={() => {
        if (onNavigate) onNavigate();
      }}
    >
      {getIcon()}
      <div>
        <span className={`${variant === 'back' ? 'text-xl' : 'text-lg sm:text-xl'} font-bold text-foreground`}>{t('splash.brandName')}</span>
        {showTagline && <p className="text-xs text-muted-foreground hidden sm:block">{t('splash.tagline')}</p>}
      </div>
    </Link>
  )
}