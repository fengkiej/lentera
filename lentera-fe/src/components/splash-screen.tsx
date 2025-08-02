import { useState, useEffect } from "react"
import { Sparkles, Book, Brain, Zap } from "lucide-react"
import { useTranslation } from "react-i18next"

interface SplashScreenProps {
  onComplete: () => void
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const { t } = useTranslation()
  const [currentText, setCurrentText] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  
  const texts = [
    t('splash.platformLoading'),
    t('splash.preparingAI'),
    t('splash.readyToLearn')
  ]

  const features = [
    { icon: Brain, text: t('splash.features.aiLearning') },
    { icon: Book, text: t('splash.features.digitalLibrary') },
    { icon: Zap, text: t('splash.features.fastLearning') }
  ]

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentText < texts.length - 1) {
        setCurrentText(currentText + 1)
      } else {
        setTimeout(() => {
          setIsVisible(false)
          setTimeout(onComplete, 800) // Longer delay for fade out
        }, 1500) // More time to appreciate the final state
      }
    }, 1200)

    return () => clearTimeout(timer)
  }, [currentText, onComplete, texts.length])

  if (!isVisible) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-primary via-primary to-secondary z-50 flex items-center justify-center transition-opacity duration-1000 opacity-0">
        {/* Clean expanding effect */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-ping absolute h-40 w-40 rounded-full bg-primary-foreground/15"></div>
          <div className="animate-ping absolute h-60 w-60 rounded-full bg-primary-foreground/8" style={{ animationDelay: '0.3s' }}></div>
        </div>
        
        {/* Central logo with smooth scale out */}
        <div className="animate-scale-out relative z-10">
          <div className="h-24 w-24 rounded-full bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center">
            <Sparkles className="h-12 w-12 text-primary-foreground" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary via-primary to-secondary z-50 flex items-center justify-center overflow-hidden">
      <div className="text-center space-y-12 animate-fade-in relative z-10">
        {/* Clean central logo */}
        <div className="relative" style={{ animationDelay: '0.3s' }}>
          <div className="h-20 w-20 mx-auto rounded-3xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center shadow-2xl transition-transform duration-300 hover:scale-110">
            <Sparkles className="h-10 w-10 text-primary-foreground" style={{ animationDuration: '2s' }} />
          </div>
          <div className="absolute -inset-6 bg-primary-foreground/5 rounded-full blur-2xl animate-pulse"></div>
        </div>

        {/* Brand with smooth entrance */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground animate-fade-in" style={{ animationDelay: '0.6s' }}>
            {t('splash.brandName')}
          </h1>
          <p className="text-xl text-primary-foreground/80 animate-fade-in" style={{ animationDelay: '0.8s' }}>
            {t('splash.tagline')}
          </p>
        </div>

        {/* Feature icons with wave bounce pattern */}
        <div className="flex justify-center gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="text-center space-y-2 transition-transform duration-300 hover:scale-105"
              style={{ animationDelay: `${1 + index * 0.3}s` }}
            >
              <div className="h-12 w-12 mx-auto rounded-2xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:bg-primary-foreground/30 animate-bounce" 
                   style={{ 
                     animationDuration: '2s', 
                     animationDelay: `${index * 0.3}s`,
                     animationTimingFunction: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
                   }}>
                <feature.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <p className="text-sm text-primary-foreground/70 font-medium">
                {feature.text}
              </p>
            </div>
          ))}
        </div>

        {/* Loading text with smooth progress */}
        <div className="space-y-4 animate-fade-in" style={{ animationDelay: '1.6s' }}>
          <p className="text-lg text-primary-foreground/90 transition-all duration-500">
            {texts[currentText]}
          </p>
          
          {/* Infinitely looping progress dots */}
          <div className="flex justify-center gap-3">
            {texts.map((_, index) => (
              <div
                key={index}
                className="h-2 w-2 rounded-full bg-primary-foreground/30 animate-pulse"
                style={{ 
                  animationDuration: '1s',
                  animationDelay: `${index * 0.5}s`
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}