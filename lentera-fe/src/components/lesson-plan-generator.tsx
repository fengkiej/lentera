import { useState } from "react"
import { X, BookOpen, Clock, Target, Users, CheckCircle, Lightbulb, HelpCircle, ClipboardList, Wrench, FileText, BarChart3, ClipboardCheck, GraduationCap, Library, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface LessonPlanGeneratorProps {
  isOpen: boolean
  onClose: () => void
  topic?: string
  searchResults?: any[]
  selectedResult?: any
}

interface LessonPlanData {
  title: string
  timeAllocation: string
  learningObjectives: string
  learningFlow: string
  completionCriteria: string
  meaningfulUnderstanding: string
  triggerQuestions: string
  assessments: string
  remedialEnrichment: string
  learningStages: string
  assessmentSheets: string
  assessmentInstruments: string
  assessmentRubric: string
  summativeQuestions: string
  learningMaterials: string
}

const initialData: LessonPlanData = {
  title: "",
  timeAllocation: "",
  learningObjectives: "",
  learningFlow: "",
  completionCriteria: "",
  meaningfulUnderstanding: "",
  triggerQuestions: "",
  assessments: "",
  remedialEnrichment: "",
  learningStages: "",
  assessmentSheets: "",
  assessmentInstruments: "",
  assessmentRubric: "",
  summativeQuestions: "",
  learningMaterials: ""
}

const lessonPlanSections = [
  { 
    key: "title", 
    label: "Judul Topik", 
    icon: BookOpen, 
    placeholder: "Contoh: Kebutuhan Manusia dan Kelangkaan",
    description: "Bisa diubah sesuai materi ajar yang dibahas",
    type: "input"
  },
  { 
    key: "timeAllocation", 
    label: "Alokasi Waktu", 
    icon: Clock, 
    placeholder: "Contoh: 3 x 40 menit",
    description: "Disesuaikan dengan kompleksitas topik",
    type: "input"
  },
  { 
    key: "learningObjectives", 
    label: "Tujuan Pembelajaran", 
    icon: Target, 
    placeholder: "Format: Peserta didik mampu ... + [kompetensi]",
    description: "Diubah sesuai capaian pembelajaran yang ingin dicapai",
    type: "textarea"
  },
  { 
    key: "learningFlow", 
    label: "Alur Tujuan Pembelajaran", 
    icon: Users, 
    placeholder: "Format naratif/berurutan, misalnya poin 1 → poin 2 → dst.",
    description: "Menjelaskan tahapan logis dalam mencapai tujuan pembelajaran",
    type: "textarea"
  },
  { 
    key: "completionCriteria", 
    label: "Kriteria Ketuntasan Tujuan Pembelajaran", 
    icon: CheckCircle, 
    placeholder: "Contoh: Minimal 75% peserta didik mencapai skor ≥ 70 pada asesmen formatif",
    description: "Ditentukan berdasarkan target kompetensi",
    type: "textarea"
  },
  { 
    key: "meaningfulUnderstanding", 
    label: "Pemahaman Bermakna", 
    icon: Lightbulb, 
    placeholder: "Contoh: Manusia harus membuat pilihan karena sumber daya terbatas.",
    description: "Dirumuskan dari nilai inti yang ingin ditanamkan",
    type: "textarea"
  },
  { 
    key: "triggerQuestions", 
    label: "Pertanyaan Pemantik", 
    icon: HelpCircle, 
    placeholder: "Contoh: Mengapa kita tidak bisa memiliki semua yang kita inginkan?",
    description: "Merangsang berpikir kritis sesuai konteks topik",
    type: "textarea"
  },
  { 
    key: "assessments", 
    label: "Asesmen Diagnostik / Formatif / Sumatif", 
    icon: ClipboardList, 
    placeholder: "Format: tabel/daftar jenis, bentuk, dan tujuan asesmen",
    description: "Disesuaikan dengan fase pembelajaran dan tingkat pencapaian siswa",
    type: "textarea"
  },
  { 
    key: "remedialEnrichment", 
    label: "Remedial & Pengayaan", 
    icon: Wrench, 
    placeholder: "Format: dua bagian – Remedial (untuk yang belum tuntas) dan Pengayaan (untuk yang sudah tuntas)",
    description: "Menyesuaikan kebutuhan peserta didik dengan hasil asesmen",
    type: "textarea"
  },
  { 
    key: "learningStages", 
    label: "Tahapan Pembelajaran (Pendahuluan, Inti, Penutup)", 
    icon: FileText, 
    placeholder: "Format kronologis aktivitas + estimasi waktu + strategi",
    description: "Disesuaikan dengan model/metode pembelajaran dan tujuan ajar",
    type: "textarea"
  },
  { 
    key: "assessmentSheets", 
    label: "Lembar Penilaian (LKPD, Role Play, dsb.)", 
    icon: BarChart3, 
    placeholder: "Format: file LKPD, tugas, atau skenario bermain peran",
    description: "Diubah sesuai dengan pendekatan dan topik ajar",
    type: "textarea"
  },
  { 
    key: "assessmentInstruments", 
    label: "Instrumen Asesmen (Pengetahuan, Sikap, Keterampilan)", 
    icon: ClipboardCheck, 
    placeholder: "Format: lembar observasi, soal pilihan ganda, rubrik praktik, jurnal, dll.",
    description: "Disesuaikan dengan aspek kompetensi yang diukur pada materi",
    type: "textarea"
  },
  { 
    key: "assessmentRubric", 
    label: "Rubrik Penilaian Ketercapaian Tujuan Pembelajaran", 
    icon: GraduationCap, 
    placeholder: "Format tabel: Kurang Mampu – Cukup Mampu – Mampu – Sangat Mampu",
    description: "Kriteria dibuat berdasarkan indikator pencapaian pembelajaran",
    type: "textarea"
  },
  { 
    key: "summativeQuestions", 
    label: "Soal Asesmen Sumatif", 
    icon: ClipboardCheck, 
    placeholder: "Format: soal + kunci jawaban + rubrik penilaian (jika uraian)",
    description: "Isi sepenuhnya bergantung pada materi/topik ajar",
    type: "textarea"
  },
  { 
    key: "learningMaterials", 
    label: "Materi Pembelajaran", 
    icon: Library, 
    placeholder: "Format: ringkasan materi, gambar, artikel, infografik, video, dsb.",
    description: "Disusun agar mendukung ketercapaian tujuan pembelajaran",
    type: "textarea"
  }
]

export function LessonPlanGenerator({ isOpen, onClose, topic, searchResults, selectedResult }: LessonPlanGeneratorProps) {
  const [currentSection, setCurrentSection] = useState(0)
  const [lessonPlan, setLessonPlan] = useState<LessonPlanData>(() => {
    const initial = { ...initialData }
    if (topic || selectedResult?.title) {
      initial.title = selectedResult?.title || topic || ""
    }
    return initial
  })
  const [isGenerating, setIsGenerating] = useState(false)

  if (!isOpen) return null

  const generateSuggestion = async (sectionKey: string) => {
    setIsGenerating(true)
    
    // Simulate AI generation based on topic
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const topicContext = selectedResult?.title || topic || "pembelajaran umum"
    const suggestions: Record<string, string> = {
      title: topicContext,
      timeAllocation: "2 x 40 menit (80 menit)",
      learningObjectives: `Peserta didik mampu memahami konsep dasar ${topicContext}, menganalisis komponen-komponen utama, dan menerapkan pengetahuan dalam konteks nyata.`,
      learningFlow: `1. Pemahaman konsep dasar ${topicContext}\n2. Identifikasi komponen dan karakteristik\n3. Analisis hubungan antar elemen\n4. Penerapan dalam situasi praktis\n5. Evaluasi dan refleksi`,
      completionCriteria: "Minimal 80% peserta didik mencapai skor ≥ 75 pada asesmen formatif dan mampu menjelaskan konsep dengan benar",
      meaningfulUnderstanding: `${topicContext} adalah konsep fundamental yang mempengaruhi kehidupan sehari-hari dan pengambilan keputusan.`,
      triggerQuestions: `1. Bagaimana ${topicContext} mempengaruhi kehidupan kita?\n2. Apa yang terjadi jika kita tidak memahami ${topicContext}?\n3. Bagaimana cara menerapkan konsep ini dalam situasi nyata?`,
      assessments: "1. Diagnostik: Pre-test konsep dasar\n2. Formatif: Diskusi kelompok dan presentasi\n3. Sumatif: Tes tertulis dan proyek praktis",
      remedialEnrichment: "Remedial: Tutorial tambahan dan latihan terbimbing\nPengayaan: Proyek penelitian lanjutan dan studi kasus kompleks",
      learningStages: "Pendahuluan (15 menit): Apersepsi dan motivasi\nInti (50 menit): Eksplorasi, elaborasi, konfirmasi\nPenutup (15 menit): Kesimpulan dan refleksi",
      assessmentSheets: "1. LKPD eksplorasi konsep\n2. Lembar observasi diskusi kelompok\n3. Rubrik presentasi\n4. Format laporan proyek",
      assessmentInstruments: "1. Soal pilihan ganda (pengetahuan)\n2. Lembar observasi sikap\n3. Rubrik keterampilan praktik\n4. Jurnal refleksi",
      assessmentRubric: "Kurang Mampu (1): Belum memahami konsep dasar\nCukup Mampu (2): Memahami sebagian konsep\nMampu (3): Memahami dan dapat menerapkan\nSangat Mampu (4): Menguasai dan dapat menganalisis",
      summativeQuestions: "1. Jelaskan konsep dasar [topik]!\n2. Analisis contoh kasus yang diberikan!\n3. Berikan solusi untuk masalah praktis!",
      learningMaterials: "1. Modul pembelajaran\n2. Video edukasi\n3. Artikel referensi\n4. Infografik konsep\n5. Studi kasus nyata"
    }

    setLessonPlan(prev => ({
      ...prev,
      [sectionKey]: suggestions[sectionKey] || ""
    }))
    
    setIsGenerating(false)
  }

  const handleInputChange = (key: string, value: string) => {
    setLessonPlan(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const exportLessonPlan = () => {
    const content = lessonPlanSections.map((section, index) => 
      `${index + 1}. ${section.label}\n${lessonPlan[section.key as keyof LessonPlanData] || 'Belum diisi'}\n\n`
    ).join('')

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lesson-plan-${lessonPlan.title || 'untitled'}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const currentSectionData = lessonPlanSections[currentSection]
  const progress = ((currentSection + 1) / lessonPlanSections.length) * 100

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 overflow-hidden">
      <div className="container mx-auto px-4 py-6 h-full flex flex-col max-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-primary" />
            <div>
              <h2 className="text-2xl font-bold">Generator Lesson Plan</h2>
              <p className="text-muted-foreground">
                Buat rencana pembelajaran yang komprehensif untuk {topic || selectedResult?.title || "topik pembelajaran"}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Bagian {currentSection + 1} dari {lessonPlanSections.length}
            </span>
            <span className="text-sm font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-secondary h-2 rounded-full">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
          {/* Sidebar Navigation */}
          <div className="col-span-3 space-y-2 overflow-y-auto pr-2">
            {lessonPlanSections.map((section, index) => {
              const Icon = section.icon
              const isCompleted = lessonPlan[section.key as keyof LessonPlanData]?.length > 0
              const isCurrent = index === currentSection
              
              return (
                <button
                  key={section.key}
                  onClick={() => setCurrentSection(index)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    isCurrent 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex-shrink-0 ${isCurrent ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium truncate">{section.label}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={isCompleted ? "default" : "secondary"} className="text-xs">
                          {isCompleted ? "Selesai" : "Kosong"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Main Content */}
          <div className="col-span-9 flex flex-col min-h-0">
            <Card className="flex-1 flex flex-col overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <currentSectionData.icon className="h-6 w-6 text-primary" />
                  <div>
                    <CardTitle className="text-xl">{currentSectionData.label}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {currentSectionData.description}
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col space-y-4 overflow-hidden">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateSuggestion(currentSectionData.key)}
                    disabled={isGenerating}
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    {isGenerating ? "Menghasilkan..." : "Saran AI"}
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {currentSectionData.type === "input" ? (
                    <Input
                      placeholder={currentSectionData.placeholder}
                      value={lessonPlan[currentSectionData.key as keyof LessonPlanData]}
                      onChange={(e) => handleInputChange(currentSectionData.key, e.target.value)}
                      className="w-full"
                    />
                  ) : (
                    <Textarea
                      placeholder={currentSectionData.placeholder}
                      value={lessonPlan[currentSectionData.key as keyof LessonPlanData]}
                      onChange={(e) => handleInputChange(currentSectionData.key, e.target.value)}
                      className="w-full min-h-[300px] resize-none"
                    />
                  )}
                </div>

                <Separator />

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                    disabled={currentSection === 0}
                  >
                    Sebelumnya
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={exportLessonPlan}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    
                    {currentSection < lessonPlanSections.length - 1 ? (
                      <Button
                        onClick={() => setCurrentSection(currentSection + 1)}
                      >
                        Selanjutnya
                      </Button>
                    ) : (
                      <Button
                        onClick={exportLessonPlan}
                        className="bg-success text-success-foreground hover:bg-success/90"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Selesai
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}