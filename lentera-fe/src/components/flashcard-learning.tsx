import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Trophy, RotateCcw, AlertCircle } from 'lucide-react';
import InteractiveFlashcard from './interactive-flashcard';
import { fetchFlashQuiz, FlashQuizResponse, QuizItem, Source } from '@/services/api';
import { LoadingOverlay } from './loading-overlay';
import { getApiLanguageParameter } from '@/utils/language-utils';
import { API_ENDPOINTS, API_BASE_URL, LIBRARY_URL, buildApiUrl } from "@/config/api.config"

// Sample flashcard questions
const sampleQuestions = [
  {
    id: '1',
    question: 'Apa yang dimaksud dengan fotosintesis?',
    options: [
      'Proses pernapasan pada tumbuhan',
      'Proses pembuatan makanan oleh tumbuhan menggunakan cahaya matahari',
      'Proses penyerapan air oleh akar',
      'Proses pertumbuhan tumbuhan'
    ],
    correctAnswer: 1,
    explanation: 'Fotosintesis adalah proses pembuatan makanan (glukosa) oleh tumbuhan hijau menggunakan cahaya matahari, karbon dioksida dari udara, dan air dari tanah. Proses ini sangat penting karena menghasilkan oksigen yang kita hirup.',
    topic: 'Biologi'
  },
  {
    id: '2',
    question: 'Siapa proklamator kemerdekaan Indonesia?',
    options: [
      'Sukarno dan Mohammad Hatta',
      'Sukarno dan Sutan Sjahrir',
      'Mohammad Hatta dan Sutan Sjahrir',
      'Sukarno dan Tan Malaka'
    ],
    correctAnswer: 0,
    explanation: 'Sukarno dan Mohammad Hatta adalah dua tokoh yang memproklamasikan kemerdekaan Indonesia pada tanggal 17 Agustus 1945 di Jakarta. Sukarno membacakan teks proklamasi yang telah disiapkan bersama.',
    topic: 'Sejarah'
  },
  {
    id: '3',
    question: 'Berapakah hasil dari 15 × 8?',
    options: [
      '120',
      '110',
      '130',
      '125'
    ],
    correctAnswer: 0,
    explanation: '15 × 8 = 120. Cara mudah menghitungnya: 15 × 8 = 15 × (10 - 2) = (15 × 10) - (15 × 2) = 150 - 30 = 120.',
    topic: 'Matematika'
  },
  {
    id: '4',
    question: 'Apa ibu kota negara Australia?',
    options: [
      'Sydney',
      'Melbourne',
      'Canberra',
      'Perth'
    ],
    correctAnswer: 2,
    explanation: 'Canberra adalah ibu kota Australia. Meskipun Sydney dan Melbourne adalah kota yang lebih besar dan terkenal, Canberra dipilih sebagai ibu kota pada tahun 1908 sebagai kompromi antara kedua kota besar tersebut.',
    topic: 'Geografi'
  },
  {
    id: '5',
    question: 'Apa rumus kimia untuk air?',
    options: [
      'CO₂',
      'H₂O',
      'NaCl',
      'O₂'
    ],
    correctAnswer: 1,
    explanation: 'H₂O adalah rumus kimia untuk air, yang terdiri dari 2 atom hidrogen (H) dan 1 atom oksigen (O). Air adalah senyawa yang sangat penting untuk kehidupan di Bumi.',
    topic: 'Kimia'
  }
];

interface FlashcardQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic: string;
}

interface FlashcardLearningProps {
  topic?: string;
  searchId?: string | number;
  onClose: () => void;
}

const FlashcardLearning = ({ topic = "Umum", searchId, onClose }: FlashcardLearningProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [completedQuestions, setCompletedQuestions] = useState<Set<string>>(new Set());
  const [wrongAnswers, setWrongAnswers] = useState<Set<string>>(new Set());
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<FlashcardQuestion[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const { i18n, t } = useTranslation();
  
  // Get the full language name for API calls
  const fullLanguageName = getApiLanguageParameter(i18n.language);

  // Reset all state variables when component mounts
  useEffect(() => {
    // Reset all state variables
    setCurrentIndex(0);
    setScore(0);
    setCompletedQuestions(new Set());
    setWrongAnswers(new Set());
    setShowResults(false);
    setIsLoading(true);
    setError(null);
    setQuestions([]);
    setSources([]);
    
    console.log(`FlashcardLearning mounted/reset with searchId: ${searchId}`);
    
    // Use sample questions if no searchId provided (fallback for development)
    if (!searchId) {
      setQuestions(sampleQuestions);
      setIsLoading(false);
      return;
    }
    
    const fetchQuizData = async () => {
      try {
        console.log(`Fetching quiz data for searchId: ${searchId}`);
        const data = await fetchFlashQuiz(searchId, fullLanguageName);
        
        // Transform API data to match our FlashcardQuestion interface
        const transformedQuestions = transformQuizData(data);
        setQuestions(transformedQuestions);
        setSources(data.flashquiz.sources);
        console.log(`Successfully loaded ${transformedQuestions.length} questions`);
      } catch (err) {
        console.error('Failed to fetch flashcard quiz:', err);
        setError(t('modals.flashcard.errorMessage'));
        // Fallback to sample questions
        setQuestions(sampleQuestions);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuizData();
  }, [searchId, fullLanguageName]); // Include fullLanguageName in dependencies
  
  // Transform API quiz data to our format
  const transformQuizData = (data: FlashQuizResponse): FlashcardQuestion[] => {
    return data.flashquiz.quizzes.map((quizItem: QuizItem, index: number) => {
      // Find the index of the correct answer in choices array
      const correctAnswerIndex = quizItem.choices.findIndex(
        choice => choice === quizItem.correct_answer_choice
      );
      
      return {
        id: `quiz-${index}`,
        question: quizItem.question,
        options: quizItem.choices,
        correctAnswer: correctAnswerIndex >= 0 ? correctAnswerIndex : 0,
        explanation: `${t('modals.flashcard.correctAnswerPrefix')} ${quizItem.correct_answer_choice}`,
        topic: topic
      };
    });
  };

  const currentQuestion = questions.length > 0 ? questions[currentIndex] : null;
  const progress = questions.length > 0 ? (completedQuestions.size / questions.length) * 100 : 0;

  const handleNext = (isCorrect: boolean = true) => {
    setCompletedQuestions(prev => new Set([...prev, currentQuestion.id]));
    
    if (!isCorrect) {
      setWrongAnswers(prev => new Set([...prev, currentQuestion.id]));
    }
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setCompletedQuestions(new Set());
    setWrongAnswers(new Set());
    setShowResults(false);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
        <LoadingOverlay isVisible={true} message={t('modals.flashcard.loadingFlashquiz')} />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
        <Card className="w-[85vw] md:w-[75vw] lg:w-[70vw] max-w-4xl bg-card border border-border shadow-xl overflow-hidden flex flex-col">
          <div className="p-8 text-center">
            <div className="bg-destructive/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{t('modals.flashcard.error')}</h2>
            <p className="text-base text-muted-foreground mb-6">
              {error}
            </p>
            <Button onClick={onClose}>{t('modals.flashcard.back')}</Button>
          </div>
        </Card>
      </div>
    );
  }

  // If no questions available
  if (!currentQuestion) {
    return (
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
        <Card className="w-[85vw] md:w-[75vw] lg:w-[70vw] max-w-4xl bg-card border border-border shadow-xl overflow-hidden flex flex-col">
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">{t('modals.flashcard.noQuestions')}</h2>
            <p className="text-base text-muted-foreground mb-6">
              {t('modals.flashcard.noQuestionsAvailable')}
            </p>
            <Button onClick={onClose}>{t('modals.flashcard.back')}</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
        <Card className="w-[85vw] md:w-[75vw] lg:w-[70vw] max-w-4xl h-[85vh] bg-card border border-border shadow-xl overflow-hidden flex flex-col">
          <div className="p-5 text-center bg-gradient-to-br from-primary/5 to-secondary/5 flex-1 flex flex-col justify-center">
            <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{t('modals.flashcard.congratulations')}</h2>
            <p className="text-base text-muted-foreground mb-4">
              {t('modals.flashcard.completed', { completed: completedQuestions.size, total: questions.length })}
            </p>
            
            {/* Sources section */}
            {sources.length > 0 && (
              <div className="mt-4 max-w-md mx-auto text-left">
                <h3 className="text-md font-semibold mb-2">{t('modals.flashcard.sources')}</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {sources.slice(0, 3).map((source, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <a
                        href={`${LIBRARY_URL}${source.link}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary hover:underline truncate"
                      >
                        {source.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="p-4 bg-muted/20 border-t border-border flex gap-4 justify-center">
            <Button onClick={handleRestart} className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              {t('modals.flashcard.retry')}
            </Button>
            <Button onClick={onClose} variant="outline">
              {t('modals.flashcard.back')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      
      <div className="bg-card rounded-xl border border-border shadow-xl w-[90vw] sm:w-[85vw] md:w-[75vw] lg:w-[70vw] max-w-4xl overflow-hidden flex flex-col">
        {/* Header - approximately 1/1.618 = 0.618 of the content height */}
        <div className="border-b border-border p-2 sm:p-3 bg-gradient-to-r from-primary/5 to-secondary/5" style={{ flex: '0.382' }}>
          <div className="flex items-center justify-between">
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('modals.flashcard.close')}
            </Button>
            
            <div className="text-center">
              <h1 className="text-base sm:text-xl font-bold text-foreground">
                {t('modals.flashcard.learnWithFlashcard')}
              </h1>
            </div>

            <div className="text-right flex items-center gap-1 sm:gap-2">
              {/* <div className="px-1.5 sm:px-2.5 py-0.5 bg-primary/10 rounded-full">
                <span className="font-medium text-[10px] sm:text-xs">{{topic}}</span>
              </div> */}
              <div className="px-1.5 sm:px-2.5 py-0.5 bg-primary/20 rounded-full flex items-center gap-1">
                <span className="font-semibold text-[10px] sm:text-xs text-primary">{completedQuestions.size}/{questions.length}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-2 sm:mt-4 flex items-center justify-between">
            <p className="text-xs sm:text-sm text-muted-foreground">
              {i18n.language === 'id'
                ? `Pertanyaan ${currentIndex + 1} dari ${questions.length}`
                : t('modals.flashcard.question', {
                    current: String(currentIndex + 1),
                    total: String(questions.length)
                  })
              }
            </p>
            
            <div className="flex gap-2 items-center">
              {questions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    index === currentIndex
                      ? 'bg-primary scale-125'
                      : completedQuestions.has(question.id)
                        ? wrongAnswers.has(question.id)
                          ? 'bg-red-500' // Wrong answer
                          : 'bg-success' // Correct answer
                        : 'bg-muted/40' // Unanswered
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Progress */}
        <Progress value={progress} className="h-1 rounded-none" />

        {/* Content Area */}
        {/* Content Area - main portion following golden ratio */}
        <div className="overflow-auto p-2 sm:p-4 flex items-center justify-center" style={{ flex: '1' }}>
          {/* Flashcard */}
          <InteractiveFlashcard
            question={currentQuestion}
            onNext={(isCorrect) => handleNext(isCorrect)}
            onRestart={() => {
              // Just restart current question
            }}
          />
        </div>

        {/* Navigation Footer - approximately 1/1.618 = 0.618 of the header */}
        <div className="border-t border-border p-2 sm:p-3 bg-muted/30 flex justify-between" style={{ flex: '0.236' }}>
          <Button
            onClick={handlePrevious}
            variant="outline"
            size="sm"
            disabled={currentIndex === 0}
            className="px-4"
          >
            {t('modals.flashcard.previous')}
          </Button>
          
          <Button
            onClick={() => handleNext(true)}
            size="sm"
            disabled={currentIndex === questions.length - 1 && !completedQuestions.has(currentQuestion.id)}
            className="px-4"
          >
            {currentIndex === questions.length - 1 ? t('modals.flashcard.finish') : t('modals.flashcard.next')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FlashcardLearning;