import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useTranslation } from "react-i18next"
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Brain, 
  Target, 
  Lightbulb,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Sparkles,
  BookOpen,
  Eye,
  MessageCircle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FiveWhysPresentationProps {
  isOpen: boolean
  onClose: () => void
  topic?: string
  searchResults?: any[]
  selectedResult?: any
}

interface CriticalThinkingTip {
  title: string
  description: string
  icon: any
  example: string
}

const criticalThinkingTips = (t: any): CriticalThinkingTip[] => [
  {
    title: t('components.fiveWhys.criticalThinking.lookBeyondSurface.title'),
    description: t('components.fiveWhys.criticalThinking.lookBeyondSurface.description'),
    icon: Eye,
    example: t('components.fiveWhys.criticalThinking.lookBeyondSurface.example')
  },
  {
    title: t('components.fiveWhys.criticalThinking.questionAssumptions.title'),
    description: t('components.fiveWhys.criticalThinking.questionAssumptions.description'),
    icon: HelpCircle,
    example: t('components.fiveWhys.criticalThinking.questionAssumptions.example')
  },
  {
    title: t('components.fiveWhys.criticalThinking.multipleViews.title'),
    description: t('components.fiveWhys.criticalThinking.multipleViews.description'),
    icon: Brain,
    example: t('components.fiveWhys.criticalThinking.multipleViews.example')
  },
  {
    title: t('components.fiveWhys.criticalThinking.rootCauses.title'),
    description: t('components.fiveWhys.criticalThinking.rootCauses.description'),
    icon: Target,
    example: t('components.fiveWhys.criticalThinking.rootCauses.example')
  },
  {
    title: t('components.fiveWhys.criticalThinking.connections.title'),
    description: t('components.fiveWhys.criticalThinking.connections.description'),
    icon: Sparkles,
    example: t('components.fiveWhys.criticalThinking.connections.example')
  }
]

const stepGuidance = [
  {
    step: 1,
    title: "Define the Learning Problem",
    guidance: "Clearly state what specific learning challenge you're facing. Be precise and avoid vague statements.",
    prompts: [
      "What exactly are you struggling to understand?",
      "When does this problem occur most?",
      "How does this affect your learning goals?"
    ],
    criticalThinking: "Critical thinking starts with clarity. A well-defined problem is half solved."
  },
  {
    step: 2,
    title: "First Why - Immediate Cause",
    guidance: "Ask why this learning problem exists. Focus on the most direct, observable cause.",
    prompts: [
      "What is the immediate reason for this difficulty?",
      "What happens right before you encounter this problem?",
      "What makes this topic particularly challenging?"
    ],
    criticalThinking: "Look for evidence-based answers, not assumptions or emotions."
  },
  {
    step: 3,
    title: "Second Why - Deeper Analysis", 
    guidance: "Now ask why that first cause exists. Start digging into underlying factors.",
    prompts: [
      "Why does that immediate cause happen?",
      "What conditions create this situation?",
      "What's missing that would prevent this cause?"
    ],
    criticalThinking: "Question whether your first answer is complete. Are there hidden factors?"
  },
  {
    step: 4,
    title: "Third Why - System Level",
    guidance: "Examine the systems, processes, or patterns that create the deeper causes.",
    prompts: [
      "Why do these conditions exist in your learning environment?",
      "What patterns or habits contribute to this?",
      "How do external factors influence this situation?"
    ],
    criticalThinking: "Think systemically. How do different elements interact to create this problem?"
  },
  {
    step: 5,
    title: "Fourth Why - Fundamental Factors",
    guidance: "Look at fundamental skills, knowledge gaps, or structural issues.",
    prompts: [
      "Why do these patterns persist?",
      "What fundamental skills or knowledge are missing?",
      "What would need to change to prevent this problem?"
    ],
    criticalThinking: "Consider long-term patterns and foundational elements."
  },
  {
    step: 6,
    title: "Fifth Why - Root Cause",
    guidance: "Identify the deepest, most fundamental cause that, if addressed, would solve the problem.",
    prompts: [
      "Why do these fundamental issues exist?",
      "What's the ultimate root of this learning challenge?",
      "If you could change one thing to solve this, what would it be?"
    ],
    criticalThinking: "The root cause should be actionable and within your power to influence."
  }
]

export function FiveWhysPresentation({
  isOpen,
  onClose,
  topic = "",
  searchResults = [],
  selectedResult = null
}: FiveWhysPresentationProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0) // 0 = intro, 1-6 = steps
  const [problem, setProblem] = useState("")
  const [userQuestions, setUserQuestions] = useState<string[]>(["", "", "", "", ""])
  const [generatedAnswers, setGeneratedAnswers] = useState<string[]>(["", "", "", "", ""])
  const [currentQuestion, setCurrentQuestion] = useState("")
  const [showHint, setShowHint] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([false, false, false, false, false])
  const { toast } = useToast()
  const tips = criticalThinkingTips(t);

  const generateAutomaticAnswer = (question: string, stepIndex: number) => {
    const searchTopic = selectedResult?.title || topic || "the topic";
    
    const contextualAnswers = [
      `The core concepts in "${searchTopic}" are presented without sufficient foundational knowledge`,
      `Students lack the prerequisite understanding needed to grasp "${searchTopic}" effectively`,
      `The current teaching approach for "${searchTopic}" doesn't match diverse learning styles`,
      `There's insufficient connection between "${searchTopic}" and students' existing knowledge`,
      `The fundamental learning structure for "${searchTopic}" needs systematic improvement`
    ];
    
    return contextualAnswers[stepIndex] || `There are structural gaps in how "${searchTopic}" is approached in education`;
  };

  // Auto-populate problem based on content
  useEffect(() => {
    if (selectedResult) {
      setProblem(`I'm having difficulty understanding "${selectedResult.title}"`)
    } else if (topic) {
      setProblem(`I'm struggling to learn about "${{topic}}"`)
    }
  }, [selectedResult, topic])

  const progress = (currentStep / 6) * 100

  const nextStep = () => {
    if (currentStep === 0) {
      if (!problem.trim()) {
        toast({
          title: t('fiveWhys.toast.defineProblem.title'),
          description: t('fiveWhys.toast.defineProblem.description'),
          variant: "destructive"
        })
        return
      }
    } else if (currentStep >= 1 && currentStep <= 5) {
      if (!currentQuestion.trim()) {
        toast({
          title: t('fiveWhys.toast.completeStep.title', "Complete This Step"),
          description: t('fiveWhys.toast.completeStep.description', "Please formulate a 'why' question before proceeding"),
          variant: "destructive"
        })
        return
      }
      
      // Generate automatic answer and save question
      const answer = generateAutomaticAnswer(currentQuestion, currentStep - 1)
      const newQuestions = [...userQuestions]
      const newAnswers = [...generatedAnswers]
      
      newQuestions[currentStep - 1] = currentQuestion
      newAnswers[currentStep - 1] = answer
      
      setUserQuestions(newQuestions)
      setGeneratedAnswers(newAnswers)
      
      const newCompleted = [...completedSteps]
      newCompleted[currentStep - 1] = true
      setCompletedSteps(newCompleted)
      
      setCurrentQuestion("")
      
      toast({
        title: t('fiveWhys.toast.answerGenerated.title', "Answer Generated!"),
        description: t('fiveWhys.toast.answerGenerated.description', "Your question has been answered. Review it and continue."),
      })
    }
    
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1)
      setShowHint(false)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      if (currentStep >= 2 && currentStep <= 6) {
        setCurrentQuestion(userQuestions[currentStep - 2] || "")
      }
      setCurrentStep(currentStep - 1)
      setShowHint(false)
    }
  }

  const resetAnalysis = () => {
    setCurrentStep(0)
    setProblem("")
    setUserQuestions(["", "", "", "", ""])
    setGeneratedAnswers(["", "", "", "", ""])
    setCurrentQuestion("")
    setCompletedSteps([false, false, false, false, false])
    setShowHint(false)
    toast({
      title: t('fiveWhys.toast.analysisReset.title', "Analysis Reset"),
      description: t('fiveWhys.toast.analysisReset.description', "Ready to start a new 5 Whys critical thinking exercise")
    })
  }

  const generateSolution = () => {
    const completedCount = completedSteps.filter(Boolean).length
    if (completedCount >= 3) {
      toast({
        title: t('fiveWhys.toast.analysisComplete.title', "Critical Thinking Analysis Complete!"),
        description: t('fiveWhys.toast.analysisComplete.description', { count: completedCount }),
      })
    } else {
      toast({
        title: t('fiveWhys.toast.continueAnalysis.title', "Continue Your Analysis"),
        description: t('fiveWhys.toast.continueAnalysis.description', "Complete at least 3 steps to develop meaningful insights"),
        variant: "destructive"
      })
    }
  }

  const loadContentExample = (result: any) => {
    setProblem(`I'm having difficulty understanding "${result.title}" from ${result.source}`)
    setCurrentStep(1)
    toast({
      title: t('fiveWhys.toast.contentLoaded.title', "Content Loaded"),
      description: t('fiveWhys.toast.contentLoaded.description', "Now let's analyze this learning challenge step by step")
    })
  }

  const renderIntroduction = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Brain className="h-16 w-16 mx-auto text-primary mb-4" />
        <h2 className="text-2xl font-bold mb-2">{t('fiveWhys.title')}</h2>
        <p className="text-muted-foreground">
          {t('fiveWhys.description')}
        </p>
      </div>

      {searchResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold">{t('components.fiveWhys.intro.quickStart')}</h3>
          <div className="grid gap-2">
            {searchResults.slice(0, 3).map((result, index) => (
              <Button
                key={index}
                variant="outline"
                onClick={() => loadContentExample(result)}
                className="justify-start text-left p-4 h-auto"
              >
                <div className="text-left">
                  <div className="font-medium text-sm">{result.title}</div>
                  <div className="text-xs text-muted-foreground">{result.source}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="font-semibold">{t('components.fiveWhys.intro.defineChallenge')}</h3>
        <Textarea
          placeholder={t('components.fiveWhys.intro.textarea')}
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          className="min-h-[80px]"
        />
      </div>

      <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          {t('components.fiveWhys.intro.whatYouWillLearn')}
        </h4>
        <ul className="text-sm space-y-1 text-blue-700 dark:text-blue-300">
          <li>• {t('components.fiveWhys.intro.skills.analyze')}</li>
          <li>• {t('components.fiveWhys.intro.skills.questioning')}</li>
          <li>• {t('components.fiveWhys.intro.skills.rootCause')}</li>
          <li>• {t('components.fiveWhys.intro.skills.reasoning')}</li>
        </ul>
      </Card>
    </div>
  )

  const renderStep = (stepIndex: number) => {
    const step = stepGuidance[stepIndex - 1]
    const isFirstWhy = stepIndex === 1
    const previousAnswer = stepIndex > 1 ? generatedAnswers[stepIndex - 2] : problem

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Badge variant="default" className="text-lg px-3 py-1">
              {t('components.fiveWhys.step.stepOf', { step: stepIndex, total: 5 })}
            </Badge>
          </div>
          <h2 className="text-xl font-bold mb-2">{step.title}</h2>
          <p className="text-muted-foreground">{t('components.fiveWhys.step.focus')}</p>
        </div>

        {!isFirstWhy && (
          <Card className="p-4 bg-muted/30">
            <h4 className="font-semibold mb-2">{t('components.fiveWhys.step.previousAnswer')}</h4>
            <p className="text-sm italic">"{previousAnswer}"</p>
          </Card>
        )}

        {generatedAnswers[stepIndex - 1] && (
          <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold mb-2">{t('components.fiveWhys.step.generatedAnswer')}</h4>
            <p className="text-sm">{generatedAnswers[stepIndex - 1]}</p>
          </Card>
        )}

        <div className="space-y-4">
          <div>
            <label className="font-medium text-sm mb-2 block">
              {isFirstWhy ?
                t('components.fiveWhys.step.questionLabel') :
                t('components.fiveWhys.step.nextQuestionLabel', { previous: previousAnswer?.slice(0, 50) + (previousAnswer?.length > 50 ? '...' : '') })}
            </label>
            <Textarea
              placeholder={t('components.fiveWhys.step.placeholder')}
              value={currentQuestion}
              onChange={(e) => setCurrentQuestion(e.target.value)}
              className="min-h-[80px]"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {t('components.fiveWhys.step.questionTip')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHint(!showHint)}
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              {showHint ? t('components.fiveWhys.step.hideTips') : t('components.fiveWhys.step.showTips')}
            </Button>
          </div>

          {showHint && (
            <Card className="p-4 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                {t('components.fiveWhys.step.tipTitle')}
              </h4>
              <ul className="text-sm space-y-1 text-yellow-700 dark:text-yellow-300">
                <li>• {t('components.fiveWhys.step.tips.start')}</li>
                <li>• {t('components.fiveWhys.step.tips.specific')}</li>
                <li>• {t('components.fiveWhys.step.tips.challenge')}</li>
                <li>• {t('components.fiveWhys.step.tips.systemic')}</li>
                <li>• {t('components.fiveWhys.step.tips.perspectives')}</li>
              </ul>
              <div className="mt-3 p-2 bg-yellow-100 dark:bg-yellow-900 rounded text-xs">
                <strong>💡 Critical Thinking Tip:</strong> {step.criticalThinking}
              </div>
            </Card>
          )}
        </div>

        <Card className="p-4 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            {t('components.fiveWhys.step.skillFocus')}
          </h4>
          <div className="text-sm text-green-700 dark:text-green-300">
            {tips[stepIndex - 1] && (
              <div>
                <strong>{tips[stepIndex - 1].title}:</strong> {tips[stepIndex - 1].description}
                <div className="mt-2 italic text-xs">
                  Example: {tips[stepIndex - 1].example}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    )
  }

  const renderSummary = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">{t('components.fiveWhys.summary.title')}</h2>
        <p className="text-muted-foreground">
          {t('components.fiveWhys.summary.description')}
        </p>
      </div>

      <Card className="p-4">
        <h3 className="font-semibold mb-4">{t('components.fiveWhys.summary.yourAnalysis')}</h3>
        <div className="space-y-3">
          <div className="p-3 bg-red-50 dark:bg-red-950 rounded border border-red-200 dark:border-red-800">
            <h4 className="font-semibold text-red-900 dark:text-red-100 text-sm">{t('components.fiveWhys.summary.learningChallenge')}</h4>
            <p className="text-red-700 dark:text-red-300 text-sm">{problem}</p>
          </div>
          
          {userQuestions.map((question, index) => question && (
            <div key={index} className="space-y-2">
              <div className="p-3 bg-muted/30 rounded border-l-4 border-primary">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">{t('components.fiveWhys.summary.question', { number: index + 1 })}</Badge>
                </div>
                <p className="text-sm font-medium">{question}</p>
              </div>
              {generatedAnswers[index] && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded border border-blue-200 dark:border-blue-800 ml-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">{t('components.fiveWhys.summary.generatedAnswer')}</Badge>
                  </div>
                  <p className="text-sm">{generatedAnswers[index]}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          {t('components.fiveWhys.summary.skillsTitle')}
        </h4>
        <div className="grid grid-cols-2 gap-2 text-sm text-blue-700 dark:text-blue-300">
          {completedSteps.map((completed, index) => completed && (
            <div key={index} className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              {tips[index]?.title}
            </div>
          ))}
        </div>
      </Card>

      <div className="flex gap-2">
        <Button onClick={generateSolution} className="flex-1">
          <Target className="h-4 w-4 mr-2" />
          {t('components.fiveWhys.summary.actionPlan')}
        </Button>
        <Button variant="outline" onClick={resetAnalysis}>
          {t('components.fiveWhys.summary.newAnalysis')}
        </Button>
      </div>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 border-b pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold">{t('components.fiveWhys.title')}</DialogTitle>
              <p className="text-sm text-muted-foreground">
                {t('components.fiveWhys.step.stepOfWithTitle', {
                  step: currentStep,
                  total: 6,
                  title: currentStep === 0 ?
                    t('components.fiveWhys.buttons.introduction') :
                    currentStep === 6 ?
                      t('components.fiveWhys.buttons.summary') :
                      stepGuidance[currentStep - 1]?.title
                })}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Progress value={progress} className="mt-2" />
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {currentStep === 0 && renderIntroduction()}
          {currentStep >= 1 && currentStep <= 5 && renderStep(currentStep)}
          {currentStep === 6 && renderSummary()}
        </div>

        <div className="flex-shrink-0 border-t pt-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              {t('components.fiveWhys.buttons.previous')}
            </Button>
            
            <div className="text-sm text-muted-foreground">
              {currentStep === 0 ?
                t('fiveWhys.buttons.readyToBegin') :
                currentStep === 6 ?
                  t('fiveWhys.buttons.analysisComplete') :
                  t('fiveWhys.buttons.stepsCompleted', { completed: completedSteps.filter(Boolean).length, total: 5 })}
            </div>
            
            <Button
              onClick={nextStep}
              disabled={currentStep === 6}
            >
              {currentStep === 0 ?
                t('components.fiveWhys.buttons.start') :
                currentStep === 5 ?
                  t('components.fiveWhys.buttons.complete') :
                  t('components.fiveWhys.buttons.next')}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}