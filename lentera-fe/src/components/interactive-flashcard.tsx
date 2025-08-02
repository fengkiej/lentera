import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, RotateCcw, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface FlashcardQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic: string;
}

interface InteractiveFlashcardProps {
  question: FlashcardQuestion;
  onNext?: (isCorrect: boolean) => void;
  onRestart?: () => void;
}

const InteractiveFlashcard = ({ question, onNext, onRestart }: InteractiveFlashcardProps) => {
  const { t } = useTranslation();
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    
    setSelectedAnswer(answerIndex);
    setTimeout(() => {
      setShowResult(true);
      setTimeout(() => {
        setIsFlipped(true);
      }, 500);
    }, 300);
  };

  const handleRestart = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    setIsFlipped(false);
    onRestart?.();
  };

  const handleNext = () => {
    if (isFlipped) {
      setIsFlipped(false);
      setTimeout(() => {
        setSelectedAnswer(null);
        setShowResult(false);
        onNext?.(isCorrect);
      }, 350);
    } else {
      setSelectedAnswer(null);
      setShowResult(false);
      onNext?.(isCorrect);
    }
  };

  const isCorrect = selectedAnswer === question.correctAnswer;

  return (
    <div className="w-full max-w-5xl mx-auto perspective-1000 overflow-hidden">
      <div className={`relative w-full h-full transition-transform duration-700 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        
        {/* Front of card - Question */}
        <div className="backface-hidden h-full">
          {/* Question Card */}
          <Card className={`w-full bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border ${
            showResult ? (isCorrect ? 'border-green-400' : 'border-red-400') : 'border-primary/20'
          } transition-all duration-300 mb-2 sm:mb-4`} style={{ height: 'calc(38.2% * 1.1)' }}>
            <div className="p-3 sm:p-6 flex flex-col justify-center h-full" style={{ gap: 'calc(1rem / 1.618)' }}>
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <span className="text-[10px] sm:text-xs font-medium text-primary bg-primary/10 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                  {question.topic}
                </span>
                {showResult && (
                  <div className={`flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs ${
                    isCorrect ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
                  }`}>
                    {isCorrect ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    <span className="font-medium">
                      {isCorrect ? t('components.interactiveFlashcard.correct') : t('components.interactiveFlashcard.incorrect')}
                    </span>
                  </div>
                )}
              </div>

              <div className="bg-card p-3 sm:p-5 rounded-lg border border-border/50 my-1 sm:my-2 flex items-center justify-center max-w-3xl mx-auto" style={{ height: 'calc(100% - 3rem)' }}>
                <h3 className="text-base sm:text-xl font-bold text-foreground leading-relaxed text-center">
                  {question.question}
                </h3>
              </div>
            </div>
          </Card>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-2 sm:mb-4 max-w-3xl mx-auto" style={{ marginTop: 'calc(0.5rem / 1.618)' }}>
            {question.options.map((option, index) => {
              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showResult}
                  className={`p-2 sm:p-4 text-left rounded-lg border transition-all duration-300 ${
                    selectedAnswer === index
                      ? showResult
                        ? index === question.correctAnswer
                          ? 'border-green-300 bg-green-50 text-green-800'
                          : 'border-red-300 bg-red-50 text-red-800'
                        : 'border-primary bg-primary/10 text-primary'
                      : showResult && index === question.correctAnswer
                        ? 'border-green-300 bg-green-50 text-green-800'
                        : 'border-border bg-card hover:bg-accent/10 hover:border-accent/30 text-foreground'
                  } ${showResult ? 'cursor-default' : 'cursor-pointer hover:shadow-sm'}`}
                >
                  <div className="flex items-center gap-2 sm:gap-4">
                    <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      selectedAnswer === index
                        ? showResult
                          ? index === question.correctAnswer
                            ? 'border-green-600 bg-green-600 text-white'
                            : 'border-red-600 bg-red-600 text-white'
                          : 'border-primary bg-primary text-primary-foreground'
                        : showResult && index === question.correctAnswer
                          ? 'border-green-600 bg-green-600 text-white'
                          : 'border-muted-foreground bg-background text-muted-foreground'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="font-medium text-sm sm:text-base leading-tight text-left">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Actions */}
          {showResult && !isFlipped && (
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => setIsFlipped(true)}
                variant="secondary"
                size="sm"
              >
                {t('components.interactiveFlashcard.seeExplanation')}
              </Button>
              {onNext && (
                <Button
                  onClick={handleNext}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {t('components.interactiveFlashcard.next')}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Back of card - Explanation */}
        <Card className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 overflow-hidden" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="p-3 sm:p-6 flex flex-col h-full overflow-hidden" style={{ gap: 'calc(0.75rem / 1.618)' }}>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-[10px] sm:text-xs font-medium text-primary bg-primary/10 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                {t('components.interactiveFlashcard.explanation')}
              </span>
              <div className={`flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs ${
                isCorrect ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
              }`}>
                {isCorrect ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                <span className="font-medium">
                  {isCorrect ? t('components.interactiveFlashcard.correctShort') : t('components.interactiveFlashcard.incorrectShort')}
                </span>
              </div>
            </div>

            <div className="bg-card border border-border/50 rounded-lg p-3 sm:p-4 mb-2 sm:mb-3 max-w-3xl mx-auto" style={{ flex: '0.382' }}>
              <h4 className="font-medium text-foreground mb-1 sm:mb-2 text-xs sm:text-sm flex items-center gap-2">
                <span className="bg-primary/20 text-primary w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">
                  {String.fromCharCode(65 + question.correctAnswer)}
                </span>
                <span>{t('components.interactiveFlashcard.correctAnswer')}</span>
              </h4>
              <p className="font-medium text-primary text-xs sm:text-sm">
                {question.options[question.correctAnswer]}
              </p>
            </div>
            
            <div className="overflow-y-auto bg-muted/20 p-3 sm:p-4 rounded-lg mb-2 sm:mb-3 max-w-3xl mx-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent" style={{ flex: '0.618' }}>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                {question.explanation}
              </p>
            </div>

            <div className="flex gap-3 justify-center" style={{ flex: '0.236' }}>
              <Button
                onClick={handleRestart}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                {t('components.interactiveFlashcard.tryAgain')}
              </Button>
              {onNext && (
                <Button
                  onClick={handleNext}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {t('components.interactiveFlashcard.next')}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default InteractiveFlashcard;