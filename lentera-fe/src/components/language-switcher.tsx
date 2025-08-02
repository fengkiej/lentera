import { Languages, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTranslation } from "react-i18next"
import { saveLanguagePreference } from "@/utils/localStorage"

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "pt", name: "Português", flag: "🇧🇷" },
  { code: "sw", name: "Kiswahili", flag: "🇹🇿" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
  { code: "bn", name: "বাংলা", flag: "🇧🇩" },
  { code: "id", name: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "tl", name: "Tagalog", flag: "🇵🇭" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "ha", name: "Hausa", flag: "🇳🇬" },
  { code: "yo", name: "Yorùbá", flag: "🇳🇬" },
  { code: "am", name: "አማርኛ", flag: "🇪🇹" },
  { code: "ur", name: "اردو", flag: "🇵🇰" },
  { code: "th", name: "ไทย", flag: "🇹🇭" },
  { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
  { code: "my", name: "မြန်မာ", flag: "🇲🇲" },
  { code: "fa", name: "فارسی", flag: "🇮🇷" },
  { code: "rw", name: "Kinyarwanda", flag: "🇷🇼" },
]

interface LanguageSwitcherProps {
  className?: string
}

export function LanguageSwitcher({ 
  className = "" 
}: LanguageSwitcherProps) {
  const { i18n } = useTranslation()
  
  const currentLangData = languages.find(lang => lang.code === i18n.language) || languages[0]

  const handleLanguageChange = (langCode: string) => {
    // Save the language preference to localStorage
    saveLanguagePreference(langCode)
    
    // Change the language in i18n
    i18n.changeLanguage(langCode)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={`${className} h-10`}>
          <Languages className="h-4 w-4" />
          <span className="text-lg">{currentLangData.flag}</span>
          <span className="hidden sm:inline">{currentLangData.name}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`flex items-center gap-3 ${
              i18n.language === language.code ? "bg-accent" : ""
            }`}
          >
            <span className="text-lg">{language.flag}</span>
            <span>{language.name}</span>
            {i18n.language === language.code && (
              <span className="ml-auto text-primary">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}