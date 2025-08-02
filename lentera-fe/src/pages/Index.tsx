import { useState } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  Brain,
  CreditCard,
  HelpCircle,
  MapPin,
  FileText,
  Lightbulb,
  PenTool,
  Clock3,
  MessageSquare,
  Calculator,
  BarChart3,
  Repeat,
  Search,
  Sparkles,
  X,
  Menu
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { OfflineIndicator } from "@/components/offline-indicator"
import { LanguageSwitcher } from "@/components/language-switcher"
import { PageLayout } from "@/components/page-layout"
import { SearchBar } from "@/components/search-bar"
import { CTASection } from "@/components/cta-section"

const Index = () => {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTool, setActiveTool] = useState<string>("")

  const aiTools = [
    { icon: Brain, name: "5 Whys", desc: "Analisis mendalam dengan 5 pertanyaan mengapa" },
    { icon: CreditCard, name: "Flashcards", desc: "Kartu belajar otomatis dari materi" },
    { icon: HelpCircle, name: "Quiz", desc: "Soal latihan berbasis AI" },
    { icon: MapPin, name: "Mind Map", desc: "Peta konsep visual" },
    { icon: FileText, name: "Summary", desc: "Ringkasan cerdas konten" },
    { icon: Lightbulb, name: "Simple", desc: "Penjelasan sederhana" },
    { icon: PenTool, name: "Practice", desc: "Latihan soal interaktif" },
    { icon: Clock3, name: "Timeline", desc: "Kronologi peristiwa" },
    { icon: Calculator, name: "Solver", desc: "Pemecah masalah matematika" },
    { icon: BarChart3, name: "Analytics", desc: "Analisis progress belajar" },
    { icon: Repeat, name: "Review", desc: "Sistem pengulangan spaced" }
  ]

  const handleQuickSearch = (query: string) => {
    if (query.trim()) {
      const toolParam = activeTool ? `&tool=${activeTool}` : ''
      window.location.href = `/explore?q=${encodeURIComponent(query)}${toolParam}`
    }
  }

  const toggleTool = (toolName: string) => {
    setActiveTool(prev => prev === toolName ? '' : toolName)
  }

  const handleQAMode = () => {
    window.location.href = '/explore?mode=qa'
  }

  const navItems = [
    { label: 'Tentang Lentera', to: '/about-lentera' },
    { label: 'Jelajahi Pustaka', to: '/explore' }
  ]

  return (
    <PageLayout
      headerVariant="default"
      logoTo="/"
      // navItems={[
      //   { label: 'nav.home', to: '/' },
      //   { label: 'nav.about', to: '/about-lentera' },
      //   { label: 'nav.explore', to: '/explore' }
      // ]}
    >
      {/* Hero Section - Modern & Focused */}
      <section className="relative py-12 sm:py-16 md:py-24 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5"></div>
        
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center space-y-8 sm:space-y-12">
            {/* Main Value Proposition */}
            <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                {t('index.hero.title', {
                  aiTutor: t('index.hero.aiTutor')
                }).split(t('index.hero.aiTutor'))[0]}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  {t('index.hero.aiTutor')}
                </span>
                {t('index.hero.title', {
                  aiTutor: t('index.hero.aiTutor')
                }).split(t('index.hero.aiTutor'))[1]}
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
                {t('index.hero.subtitle')}
              </p>
            </div>

            {/* Main Search */}
            <SearchBar
              placeholder="Mau belajar apa hari ini?"
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSearch={handleQuickSearch}
              buttonLabel="Mulai Belajar"
              buttonShortLabel="Mulai"
              className="px-4 sm:px-0"
            />

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 px-4 sm:px-0">
              <Button
                onClick={handleQAMode}
                size="lg"
                variant="secondary"
                className="gap-2 h-12 px-4 sm:px-6 rounded-xl w-full sm:w-auto"
              >
                <MessageSquare className="h-5 w-5" />
                <span className="sm:hidden">Tanya AI</span>
                <span className="hidden sm:inline">Tanya AI Langsung</span>
              </Button>
              <Link to="/explore" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 h-12 px-4 sm:px-6 rounded-xl w-full"
                >
                  <Search className="h-5 w-5" />
                  Jelajahi Topik
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-24 px-4 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-8 sm:space-y-12">
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Cara Belajar yang <span className="text-primary">Revolusioner</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto px-4">
                Teknologi AI terdepan membantu Anda belajar dengan metode yang terbukti efektif
              </p>
            </div>

            <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
              {/* AI Personalization */}
              <Card className="p-6 sm:p-8 hover:shadow-xl transition-all group border-2 hover:border-primary/20">
                <CardContent className="p-0 text-center space-y-4 sm:space-y-6">
                  <div className="h-12 w-12 sm:h-16 sm:w-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold">Pembelajaran Personal</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    AI yang memahami gaya belajar Anda dan menyesuaikan materi secara otomatis
                  </p>
                </CardContent>
              </Card>

              {/* Interactive Tools */}
              <Card className="p-8 hover:shadow-xl transition-all group border-2 hover:border-primary/20">
                <CardContent className="p-0 text-center space-y-6">
                  <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <PenTool className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold">Tools Interaktif</h3>
                  <p className="text-muted-foreground">
                    Flashcards, quiz, mind map, dan tools pembelajaran lainnya dibuat otomatis
                  </p>
                </CardContent>
              </Card>

              {/* Offline Access */}
              <Card className="p-8 hover:shadow-xl transition-all group border-2 hover:border-primary/20">
                <CardContent className="p-0 text-center space-y-6">
                  <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold">Akses Offline</h3>
                  <p className="text-muted-foreground">
                    Belajar kapan saja, di mana saja, bahkan tanpa koneksi internet
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Tools Preview */}
      <section className="py-12 sm:py-16 md:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-8 sm:space-y-12">
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Tools Pembelajaran <span className="text-primary">Canggih</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto px-4">
                Pilih metode yang paling cocok dengan gaya belajar Anda
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {aiTools.slice(0, 6).map((tool, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="lg"
                  className="h-20 sm:h-24 flex-col gap-1 sm:gap-2 hover:shadow-lg hover:border-primary/30 hover:scale-105 transition-all group p-3"
                  onClick={() => toggleTool(tool.name)}
                >
                  <tool.icon className="h-5 w-5 sm:h-6 sm:w-6 group-hover:scale-110 transition-transform text-primary" />
                  <span className="text-xs sm:text-sm font-medium text-center leading-tight">{tool.name}</span>
                </Button>
              ))}
            </div>

            <Link to="/explore">
              <Button size="lg" className="gap-2">
                Lihat Semua Tools
                <Sparkles className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-4 bg-muted/20">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">100K+</div>
              <div className="text-muted-foreground">Materi Pembelajaran</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">50K+</div>
              <div className="text-muted-foreground">Pengguna Aktif</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">95%</div>
              <div className="text-muted-foreground">Tingkat Kepuasan</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection
        title="Siap untuk Revolusi Belajar?"
        subtitle="Bergabunglah dengan ribuan pelajar yang sudah merasakan perbedaannya"
        buttons={[
          {
            label: "Mulai Belajar Sekarang",
            to: "/explore",
            icon: "search"
          },
          {
            label: "Demo AI Tutor",
            to: "#",
            variant: "outline",
            icon: "messageSquare",
            onClick: handleQAMode
          }
        ]}
      />
    </PageLayout>
  )
}

export default Index
