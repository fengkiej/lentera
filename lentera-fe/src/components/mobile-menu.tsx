import { Link } from "react-router-dom"
import { X, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useTranslation } from "react-i18next"

interface MobileMenuProps {
  items?: Array<{
    label: string
    to: string
    isExternal?: boolean
    onClick?: () => void
  }>
}

export const MobileMenu = ({ 
  items = [
    { label: 'nav.home', to: '/' },
    { label: 'nav.about', to: '/about-lentera' },
    {
      label: 'nav.library',
      to: import.meta.env.VITE_LIBRARY_URL || '/library',
      isExternal: Boolean(import.meta.env.VITE_LIBRARY_URL)
    }
  ]
}: MobileMenuProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useTranslation()

  return (
    <>
      {/* Mobile Hamburger Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden h-10 w-10 p-0"
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </Button>
      
      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="lg:hidden bg-background/95 backdrop-blur-xl border-t border-border/50 fixed top-16 left-0 right-0 z-50">
          <nav className="container max-w-7xl mx-auto px-4 py-4 space-y-2">
            {items.map((item, index) => (
              item.isExternal ? (
                <a
                  key={index}
                  href={item.to}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-left p-3 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => {
                    setIsOpen(false);
                    if (item.onClick) item.onClick();
                  }}
                >
                  {t(item.label)}
                </a>
              ) : (
                <Link
                  key={index}
                  to={item.to}
                  className="block w-full text-left p-3 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => {
                    setIsOpen(false);
                    if (item.onClick) item.onClick();
                  }}
                >
                  {t(item.label)}
                </Link>
              )
            ))}
            {import.meta.env.VITE_CHAT_URL ? (
              <a
                href={import.meta.env.VITE_CHAT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-left p-3 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Lentera Chat
              </a>
            ) : (
              <button className="block w-full text-left p-3 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
                Lentera Chat
              </button>
            )}
          </nav>
        </div>
      )}
    </>
  )
}