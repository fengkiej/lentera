import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { OfflineIndicator } from "@/components/offline-indicator"
import { LanguageSwitcher } from "@/components/language-switcher"
import { BrandLogo } from "@/components/brand-logo"
import { MobileMenu } from "@/components/mobile-menu"

interface NavItem {
  label: string
  to: string
  isExternal?: boolean
  onClick?: () => void
}

interface PageHeaderProps {
  variant?: 'default' | 'search' | 'back'
  logoTo?: string
  showTagline?: boolean
  navItems?: NavItem[]
  className?: string
  onLogoClick?: () => void
}

export const PageHeader = ({
  variant = 'default',
  logoTo = "/",
  showTagline = false,
  navItems = [
    { label: 'nav.home', to: '/' },
    // { label: 'nav.about', to: '/about-lentera' },
    {
      label: 'nav.library',
      to: import.meta.env.VITE_LIBRARY_URL || '/library',
      isExternal: Boolean(import.meta.env.VITE_LIBRARY_URL)
    }
  ],
  className = "",
  onLogoClick
}: PageHeaderProps) => {
  const { t } = useTranslation()
  
  // Create a modified navItems array with onLogoClick for the home item
  const modifiedNavItems = navItems.map(item => {
    // If this is the home navigation item (to="/"), add the onLogoClick handler
    if (item.to === '/' && onLogoClick) {
      return { ...item, onClick: onLogoClick };
    }
    return item;
  });

  return (
    <header className={`sticky top-0 z-50 w-full bg-background/95 backdrop-blur-xl border-b border-border/50 ${className || ''}`}>
      <div className="container flex h-16 items-center justify-between px-4 max-w-7xl mx-auto">
        <BrandLogo variant={variant} to={logoTo} showTagline={showTagline} onNavigate={onLogoClick} />
        
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {modifiedNavItems.map((item, index) => (
              <Button 
                key={index}
                variant="ghost" 
                size="sm"
                asChild
                className="text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 px-3 py-2 rounded-lg hover:shadow-sm"
              >
                {item.isExternal ? (
                  <a href={item.to} target="_blank" rel="noopener noreferrer">
                    {t(item.label)}
                  </a>
                ) : (
                  <Link to={item.to} onClick={item.onClick}>{t(item.label)}</Link>
                )}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 px-3 py-2 rounded-lg hover:shadow-sm"
            >
              {import.meta.env.VITE_CHAT_URL ? (
                <a href={import.meta.env.VITE_CHAT_URL} target="_blank" rel="noopener noreferrer">
                  {t('pageHeader.lenteraChat')}
                </a>
              ) : (
                <span>{t('pageHeader.lenteraChat')}</span>
              )}
            </Button>
          </nav>
          
          <div className="h-6 w-px bg-border hidden lg:block"></div>
          
          {/* <OfflineIndicator isOnline={false} batteryLevel={85} /> */}
          <LanguageSwitcher />
          
          {/* Mobile Menu */}
          <MobileMenu items={modifiedNavItems} />
        </div>
      </div>
    </header>
  )
}