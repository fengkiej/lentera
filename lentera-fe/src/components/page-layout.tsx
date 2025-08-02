import { ReactNode } from "react"
import { PageHeader } from "./page-header"
import { PageFooter } from "./page-footer"

interface NavItem {
  label: string
  to: string
  isExternal?: boolean
  onClick?: () => void
}

interface PageLayoutProps {
  children: ReactNode
  headerVariant?: 'default' | 'search' | 'back'
  logoTo?: string
  showTagline?: boolean
  navItems?: NavItem[]
  showFooter?: boolean
  footerLinks?: Array<{
    label: string
    to: string
    isExternal?: boolean
  }>
  footerTextItems?: Array<{
    text: string
    translationKey?: string
  }>
  className?: string
  headerClassName?: string
  contentClassName?: string
  footerClassName?: string
  onLogoClick?: () => void
}

export const PageLayout = ({
  children,
  headerVariant = 'default',
  logoTo = "/",
  showTagline = false,
  navItems,
  showFooter = true,
  footerLinks = [],
  footerTextItems,
  className = "",
  headerClassName = "",
  contentClassName = "",
  footerClassName = "",
  onLogoClick
}: PageLayoutProps) => {
  return (
    <div className={`min-h-screen bg-gradient-subtle flex flex-col ${className}`}>
      <PageHeader
        variant={headerVariant}
        logoTo={logoTo}
        showTagline={showTagline}
        navItems={navItems}
        className={headerClassName}
        onLogoClick={onLogoClick}
      />
      
      <main className={`flex-1 ${contentClassName}`}>
        <div className="content-container">
          {children}
        </div>
      </main>
      
      {showFooter && (
        <PageFooter
          links={footerLinks}
          textItems={footerTextItems}
          className={footerClassName}
        />
      )}
    </div>
  )
}