import { useState } from "react"
import { Search, Mic } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SearchBarProps {
  placeholder?: string
  onSearch?: (query: string) => void
  searchQuery?: string
  setSearchQuery?: (query: string) => void
  showVoiceSearch?: boolean
  className?: string
  buttonLabel?: string
  buttonShortLabel?: string
  isSearching?: boolean
  rounded?: "default" | "large"
}

export const SearchBar = ({
  placeholder,
  onSearch,
  searchQuery = "",
  setSearchQuery,
  showVoiceSearch = true,
  className = "",
  buttonLabel = "Search",
  buttonShortLabel = "🔍",
  isSearching = false,
  rounded = "large"
}: SearchBarProps) => {
  const { t } = useTranslation()
  const [isListening, setIsListening] = useState(false)
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSearch && localSearchQuery.trim()) {
      onSearch(localSearchQuery)
    }
  }

  const handleVoiceSearch = () => {
    setIsListening(!isListening)
    // In real app, implement speech recognition
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalSearchQuery(value)
    if (setSearchQuery) {
      setSearchQuery(value)
    }
  }

  const roundedClass = rounded === "large" ? "rounded-2xl" : "rounded-lg"

  return (
    <form onSubmit={handleSearch} className={`max-w-2xl mx-auto ${className}`}>
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-primary blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
        <div className="relative">
          <Search className="absolute left-4 sm:left-6 top-1/2 transform -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
          <Input
            placeholder={placeholder || t('explore.searchPlaceholder')}
            value={localSearchQuery}
            onChange={handleInputChange}
            className={`pl-12 sm:pl-16 pr-20 sm:pr-32 h-12 sm:h-16 text-base sm:text-lg ${roundedClass} border-2 border-border/50 bg-card shadow-xl focus:border-primary focus:shadow-2xl transition-all`}
          />
          <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 flex gap-2">
            {showVoiceSearch && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={handleVoiceSearch}
                className={`h-8 w-8 sm:h-10 sm:w-10 rounded-xl transition-all ${
                  isListening 
                    ? 'bg-destructive text-destructive-foreground animate-pulse' 
                    : 'hover:bg-muted'
                }`}
              >
                <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            )}
            <Button
              type="submit"
              disabled={!localSearchQuery.trim() || isSearching}
              className="h-8 px-3 sm:h-10 sm:px-6 rounded-xl font-semibold text-sm sm:text-base"
            >
              {isSearching ? (
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="hidden sm:inline">{buttonLabel}</span>
              )}
              {!isSearching && <span className="sm:hidden">{buttonShortLabel}</span>}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}