import { Link } from "react-router-dom"
import { Sparkles } from "lucide-react"
import { useTranslation } from "react-i18next"

interface FooterLinkItem {
  label: string
  to: string
  isExternal?: boolean
}

interface FooterTextItem {
  text?: string
  translationKey?: string
  values?: Record<string, any>
}

interface PageFooterProps {
  links?: FooterLinkItem[]
  textItems?: FooterTextItem[]
  showLogo?: boolean
  className?: string
}

export const PageFooter = ({
  links = [],
  textItems = [
    { translationKey: "pageFooter.madeWith" },
    { translationKey: "pageFooter.copyright", values: { year: new Date().getFullYear() } }
  ],
  showLogo = true,
  className = ""
}: PageFooterProps) => {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()

  return (
    <footer className={`py-8 px-4 w-full border-t border-border/50 bg-muted/10 ${className}`}>
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col items-center justify-between gap-4 w-full">
          {showLogo && (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-foreground">{t('splash.brandName')}</span>
            </div>
          )}
          
          {links.length > 0 && (
            <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
              {links.map((link, index) => (
                <div key={index}>
                  {link.isExternal ? (
                    <a 
                      href={link.to} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link 
                      to={link.to}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-center text-sm text-muted-foreground flex-wrap justify-center">
            {textItems.map((item, index) => (
              <span key={index}>
                {index > 0 && <span className="mx-2 inline">•</span>}
                {/* Use the translation key if available */}
                {item.translationKey && (
                  <>
                    {t(item.translationKey, item.values || {})}
                  </>
                )}
                {/* Use the text with year replacement if no translation key */}
                {!item.translationKey && item.text && (
                  <>
                    {item.text.replace('2025', currentYear.toString())}
                  </>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}