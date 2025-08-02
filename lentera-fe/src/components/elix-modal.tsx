import React, { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { X, Maximize2, Minimize2, BookOpen, Brain, SendHorizonal, RotateCcw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getApiLanguageParameter } from "@/utils/language-utils"
import { LoadingOverlay } from "./loading-overlay"
import { fetchElix } from "@/services/api"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface ELIxModalProps {
  isOpen: boolean
  onClose: () => void
  topic: string
  summary?: string
}

// Age range presets with labels
const ageRangePresets = (t: any) => [
  { label: t("ageRanges.preschool.label", "3-5 tahun"), value: [3, 5], description: t("ageRanges.preschool.description", "Anak balita") },
  { label: t("ageRanges.earlyElementary.label", "6-8 tahun"), value: [5, 8], description: t("ageRanges.earlyElementary.description", "Anak kecil") },
  { label: t("ageRanges.elementary.label", "9-12 tahun"), value: [9, 12], description: t("ageRanges.elementary.description", "Anak SD") },
  { label: t("ageRanges.middleSchool.label", "13-15 tahun"), value: [13, 15], description: t("ageRanges.middleSchool.description", "Remaja SMP") },
  { label: t("ageRanges.highSchool.label", "16-18 tahun"), value: [16, 18], description: t("ageRanges.highSchool.description", "Remaja SMA") },
  { label: t("ageRanges.adult.label", "Dewasa"), value: [19, 99], description: t("ageRanges.adult.description", "Umum") }
]

export const ELIxModal = ({ isOpen, onClose, topic, summary = "" }: ELIxModalProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [ageRange, setAgeRange] = useState<number[]>([3, 5])
  const [userSummary, setUserSummary] = useState(summary)
  const [adaptedExplanation, setAdaptedExplanation] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [activePreset, setActivePreset] = useState<number>(0)
  const { toast } = useToast()
  const { t, i18n } = useTranslation()
  
  // Get age range presets with translations
  const translatedAgeRangePresets = ageRangePresets(t)
  
  // Get the full language name for API calls
  const fullLanguageName = getApiLanguageParameter(i18n.language)

  // Update the summary if the prop changes
  useEffect(() => {
    setUserSummary(summary)
  }, [summary])

  // Function to generate an age-adapted explanation using the ELIx API
  const generateExplanation = async () => {
    if (!userSummary.trim()) {
      toast({
        title: t("modals.elix.emptySummary", "Ringkasan Kosong"),
        description: t("modals.elix.enterSummary", "Masukkan ringkasan utama terlebih dahulu"),
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)
    
    try {
      // Get the current age range
      const [minAge, maxAge] = ageRange
      const ageRangeParam = `${minAge}-${maxAge}`
      
      // Call the ELIx API
      const response = await fetchElix(userSummary, ageRangeParam, fullLanguageName)
      
      // Set the adapted explanation from the API response
      setAdaptedExplanation(response.text)
    } catch (error) {
      console.error('Error generating explanation:', error)
      toast({
        title: t("modals.elix.error", "Terjadi Kesalahan"),
        description: t("modals.elix.adaptationFailed", "Gagal mengadaptasi penjelasan. Silakan coba lagi."),
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }


  // Handle age preset selection
  const handlePresetClick = (index: number) => {
    setActivePreset(index)
    setAgeRange(translatedAgeRangePresets[index].value)
  }

  // Reset to initial state
  const handleReset = () => {
    setAdaptedExplanation("")
    setAgeRange([5, 12])
    setActivePreset(0)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={`${
          isFullscreen 
            ? "max-w-screen max-h-screen w-screen h-screen m-0 rounded-none" 
            : "max-w-4xl w-full max-h-[85vh]"
        } bg-white transition-all duration-300 overflow-hidden flex flex-col`}
      >
        {isGenerating && <LoadingOverlay isVisible={true} message={t("modals.elix.adaptingExplanation", "Mengadaptasi penjelasan...")} />}
        
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <span className="text-2xl">🧠</span> {t("modals.elix.title", "ELIx: Explain Like I'm {{ageRange}}", {
              ageRange: ageRange[0] < 19 ? `${ageRange[0]}-${ageRange[1]}` : t('common.adult', 'Adult')
            })}
          </DialogTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="text-slate-600 hover:bg-slate-100"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </DialogHeader>
        
        {/* Content */}
        <div className="flex-1 overflow-auto p-4 bg-gradient-to-b from-slate-50 to-white">
          <div className="space-y-6">
            {/* Topic Title */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-primary">{topic}</h2>
              <p className="text-muted-foreground text-sm">{t("modals.elix.adaptiveExplanation", "Penjelasan adaptif berdasarkan rentang usia")}</p>
            </div>
            
            {/* Age Range Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{t("modals.elix.selectAgeRange", "Pilih Rentang Usia:")}</h3>
              
              {/* Age Presets */}
              <div className="flex flex-wrap gap-2">
                {translatedAgeRangePresets.map((preset, index) => (
                  <Button
                    key={index}
                    variant={activePreset === index ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePresetClick(index)}
                    className="flex flex-col py-2 h-auto"
                  >
                    <span className="font-medium">{preset.label}</span>
                    <span className="text-xs opacity-80">{preset.description}</span>
                  </Button>
                ))}
              </div>
              
              {/* Age range indicator removed */}
            </div>
            
            {/* Main Summary Input */}
            {!adaptedExplanation && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  {t("modals.elix.mainSummary", "Ringkasan Utama:")}
                </h3>
                <Textarea
                  placeholder={t("modals.elix.summaryPlaceholder", "Masukkan ringkasan yang ingin diadaptasi berdasarkan usia...")}
                  value={userSummary}
                  onChange={(e) => setUserSummary(e.target.value)}
                  className="min-h-[120px] border-primary/20"
                />
                <div className="flex justify-end">
                  <Button 
                    onClick={generateExplanation}
                    className="flex items-center gap-2"
                    disabled={!userSummary.trim()}
                  >
                    <Brain className="h-4 w-4" />
                    {t("modals.elix.adaptFor", "Adaptasi untuk Usia {{ageRange}}", {
                      ageRange: ageRange[0] < 19 ? `${ageRange[0]}-${ageRange[1]}` : t('modals.elix.adult', 'Dewasa')
                    })}
                  </Button>
                </div>
              </div>
            )}
            
            {/* Adapted Explanation Result */}
            {adaptedExplanation && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    {t("modals.elix.explanationFor", "Penjelasan untuk Usia {{ageRange}}:", {
                      ageRange: ageRange[0] < 19 ? `${ageRange[0]}-${ageRange[1]}` : t('modals.elix.adult', 'Dewasa')
                    })}
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    className="flex items-center gap-1"
                  >
                    <RotateCcw className="h-3 w-3" />
                    {t("modals.elix.reset", "Reset")}
                  </Button>
                </div>
                
                <Card className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20">
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc pl-5 mb-4">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-5 mb-4">{children}</ol>,
                        li: ({ children }) => <li className="mb-1">{children}</li>,
                        h1: ({ children }) => <h1 className="text-xl font-bold mb-4">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-lg font-bold mb-3">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-md font-bold mb-2">{children}</h3>,
                        blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4">{children}</blockquote>,
                        a: ({ href, children }) => <a href={href} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                        code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded">{children}</code>,
                        pre: ({ children }) => <pre className="bg-gray-100 p-4 rounded my-4 overflow-x-auto">{children}</pre>,
                        table: ({ children }) => <table className="border-collapse border border-gray-300 my-4 w-full">{children}</table>,
                        thead: ({ children }) => <thead className="bg-gray-100">{children}</thead>,
                        tbody: ({ children }) => <tbody>{children}</tbody>,
                        tr: ({ children }) => <tr className="border-b border-gray-300">{children}</tr>,
                        th: ({ children }) => <th className="border border-gray-300 px-4 py-2 text-left">{children}</th>,
                        td: ({ children }) => <td className="border border-gray-300 px-4 py-2">{children}</td>,
                      }}
                    >
                      {adaptedExplanation}
                    </ReactMarkdown>
                  </div>
                </Card>
                
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(adaptedExplanation);
                      toast({
                        title: t("modals.elix.copied", "Disalin!"),
                        description: t("modals.elix.explanationCopied", "Penjelasan telah disalin ke clipboard"),
                      });
                    }}
                  >
                    {t("common.copy", "Salin")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAdaptedExplanation("");
                    }}
                  >
                    {t("modals.elix.editSummary", "Edit Ringkasan")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="pt-2 border-t text-xs text-gray-500 text-center">
          <span>{t("modals.elix.adaptationNote", "Adaptasi penjelasan berdasarkan rentang usia untuk pembelajaran yang lebih efektif")}</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}