import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ArrowLeft, CheckCircle, Clock, BookOpen, Play, Volume2, Target, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useLesson } from "@/services/lessonsService";
import { useProgressService } from "@/services/progressService";
import { Lesson, LessonExample, PracticeQuestion } from "@/types/lentera";
import Navigation from "@/components/Navigation";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { CelebrationModal } from "@/components/learn/CelebrationModal";

const LessonDetail = () => {
  const { t } = useTranslation(['lesson', 'common']);
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("content");
  const [practiceScore, setPracticeScore] = useState(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [currentPracticeQuestion, setCurrentPracticeQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [fillBlankAnswer, setFillBlankAnswer] = useState<string>("");

  const [showPracticeResult, setShowPracticeResult] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [showAnswerSheet, setShowAnswerSheet] = useState(false);
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const [celebrationShown, setCelebrationShown] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);

  const lessonIdNum = parseInt(lessonId || "0");
  const progressService = useProgressService();
  const queryClient = useQueryClient();

  const lessonQuery = useLesson(lessonIdNum);
  const {
    data: lessonData,
    isLoading,
    error,
  } = useQuery({
    ...lessonQuery,
    retry: 1,
  });

  // Log error for debugging
  if (error) {
    console.error("Error loading lesson:", error);
  }

  const lesson = lessonData?.data?.lesson;
  const examples = lessonData?.data?.examples || [];
  const questions = lessonData?.data?.questions || [];
  const userProgress = lessonData?.data?.progress;

  console.log(lesson)

  // Initialize progress from API data
  useEffect(() => {
    if (userProgress) {
      const apiProgress = userProgress.progressPercentage || 0;
      setCurrentProgress(apiProgress);
      setIsCompleted(userProgress.isCompleted || false);

      // Set review mode if lesson is completed
      if (userProgress.isCompleted && apiProgress >= 100) {
        setIsReviewMode(true);
      }
    }
  }, [userProgress]);

  useEffect(() => {
    if (currentProgress >= 100 && !showCelebrationModal) {
      setIsCompleted(true);
    }
  }, [currentProgress, showCelebrationModal]);

  // Helper function to update progress via API
  const updateProgressAPI = async (progressPercentage: number, completed: boolean = false) => {
    // Don't update progress if in review mode
    if (isReviewMode) {
      console.log(`Skipping progress update in review mode for lesson ${lessonIdNum}`);
      return;
    }

    try {
      await progressService.updateProgress({
        lessonId: lessonIdNum,
        progressPercentage,
        completed,
      });
      console.log(`Progress updated: ${progressPercentage}% for lesson ${lessonIdNum}`);

      // Invalidate dashboard and progress-related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["progress"] });
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
      queryClient.invalidateQueries({ queryKey: ["lesson", lessonIdNum] });
    } catch (error) {
      console.error("Failed to update progress:", error);
    }
  };

  const handleComplete = async () => {
    setCurrentProgress(100);
    setIsCompleted(true);
    await updateProgressAPI(100, true); // Mark as completed
  };

  const handleBack = () => {
    navigate("/learn");
  };

  const handleTabChange = async (value: string) => {
    setActiveTab(value);
    // Update progress based on tab completion
    if (value === "examples" && currentProgress < 33) {
      setCurrentProgress(33);
      await updateProgressAPI(33);
    } else if (value === "practice" && currentProgress < 66) {
      setCurrentProgress(66);
      await updateProgressAPI(66);
    }
  };

  const handleFillBlankOptionSelect = (optionText: string, optionId: string) => {
    if (showPracticeResult || isAnimating) return;

    // Fill the blank with selected answer
    setFillBlankAnswer(optionText);
    setSelectedAnswer(optionId);
    setIsAnimating(true);

    // Show animation effect for a short time
    setTimeout(() => {
      setIsAnimating(false);
    }, 800);
  };

  const handlePracticeAnswer = (optionId: string) => {
    if (showPracticeResult) return;
    setSelectedAnswer(optionId);
  };

  const handleSubmitPracticeAnswer = () => {
    if (!questions) return;

    const currentQuestion = questions[currentPracticeQuestion];
    let isCorrect = false;

    if (currentQuestion.type === "multiple_choice") {
      if (!selectedAnswer) return;
      const correctOption = currentQuestion.options?.find((opt) => opt.isCorrect);
      isCorrect = selectedAnswer === correctOption?.id.toString();
    } else if (currentQuestion.type === "true_false") {
      if (!selectedAnswer) return;
      const correctOption = currentQuestion.options?.find((opt) => opt.isCorrect);
      isCorrect = selectedAnswer === correctOption?.id.toString();
    } else if (currentQuestion.type === "fill_blank") {
      if (!selectedAnswer) return;
      const correctOption = currentQuestion.options?.find((opt) => opt.isCorrect);
      isCorrect = selectedAnswer === correctOption?.id.toString();
    }

    setIsAnswerCorrect(isCorrect);
    setShowPracticeResult(true);
    setShowAnswerSheet(true);

    if (isCorrect) {
      setPracticeScore((prev) => prev + currentQuestion.points);
      setCorrectAnswersCount((prev) => prev + 1);
    }
  };

  const handleNextPracticeQuestion = async () => {
    if (currentPracticeQuestion < (questions?.length || 0) - 1) {
      // Close sheet first to avoid visual glitch
      setShowAnswerSheet(false);

      // Reset states after sheet is closed
      setTimeout(() => {
        setCurrentPracticeQuestion((prev) => prev + 1);
        setSelectedAnswer(null);
        setFillBlankAnswer("");
        setIsAnimating(false);
        setShowPracticeResult(false);
        setIsAnswerCorrect(null);
      }, 100);
    } else {
      // Practice completed - show celebration modal
      setCurrentProgress(100);
      await updateProgressAPI(100, true); // Mark as completed
      setShowAnswerSheet(false);
      setShowCelebrationModal(true);
      setCelebrationShown(true);
    }
  };

  const handlePreviousExample = () => {
    if (currentExampleIndex > 0) {
      setCurrentExampleIndex((prev) => prev - 1);
    }
  };

  const handleNextExample = () => {
    if (currentExampleIndex < examples.length - 1) {
      setCurrentExampleIndex((prev) => prev + 1);
    }
  };

  const handleCelebrationFinish = () => {
    setShowCelebrationModal(false);
    navigate("/learn");
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDifficultyLabel = (level: string) => {
    switch (level) {
      case "beginner":
        return t('lesson:difficulty.beginner');
      case "intermediate":
        return t('lesson:difficulty.intermediate');
      case "advanced":
        return t('lesson:difficulty.advanced');
      default:
        return t('lesson:difficulty.unknown');
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} ${t('lesson:duration.minutes')}`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}${t('lesson:duration.hoursShort')} ${remainingMinutes}${t('lesson:duration.minutesShort')}` : `${hours} ${t('lesson:duration.hours')}`;
  };

  console.log(practiceScore)

  if (isLoading) {
    return <Loading />;
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-warm-beige to-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">{t('common:error.title')}</h2>
          <p className="text-gray-600">{t('lesson:error.loadLesson')}</p>
          <Button onClick={handleBack} className="mt-4 bg-brand-deep-green-700 hover:bg-brand-deep-green-800">
            {t('lesson:actions.backToLessons')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-warm-beige to-white flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-brand-deep-green-600/50 flex-shrink-0">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button onClick={handleBack} className="w-8 h-8 bg-brand-deep-green-700 rounded-lg flex items-center justify-center">
              <ArrowLeft className="h-5 w-5 text-white" />
            </button>
            <div>
              <h1 className="font-merriweather font-bold text-brand-deep-green-800">{lesson.title}</h1>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className={getDifficultyColor(lesson.difficultyLevel)}>{getDifficultyLabel(lesson.difficultyLevel)}</Badge>
                {isReviewMode && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {t('lesson:reviewMode')}
                  </Badge>
                )}
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{formatDuration(lesson.estimatedDuration)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-brand-deep-green-800">{t('lesson:progress.title')}</span>
          <span className="text-sm text-gray-500">{currentProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-brand-deep-green-600 h-2 rounded-full transition-all duration-300" style={{ width: `${currentProgress}%` }} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        <div className="max-w-2xl mx-auto">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content" className={`${activeTab === "content" ? "bg-brand-deep-green-600/50" : ""}`}>
                {t('lesson:tabs.content')}
              </TabsTrigger>
              <TabsTrigger value="examples" className={`${activeTab === "examples" ? "bg-brand-deep-green-600/50" : ""}`} disabled={!examples || examples.length === 0}>
                {t('lesson:tabs.examples')}
              </TabsTrigger>
              <TabsTrigger value="practice" className={`${activeTab === "practice" ? "bg-brand-deep-green-600/50" : ""}`} disabled={!questions || questions.length === 0}>
                {t('lesson:tabs.practice')}
              </TabsTrigger>
            </TabsList>

            {/* Content Tab */}
            <TabsContent value="content" className="mt-6">
              <div className="space-y-6">
                {/* Learning Objectives */}
                {lesson.learningObjectives && lesson.learningObjectives.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Target className="w-5 h-5" />
                        <span>{t('lesson:sections.learningObjectives')}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {lesson.learningObjectives.map((objective, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <CheckCircle className="w-4 h-4 text-brand-deep-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{objective}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Prerequisites */}
                {lesson.prerequisites && lesson.prerequisites.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <BookOpen className="w-5 h-5" />
                        <span>{t('lesson:sections.prerequisites')}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {lesson.prerequisites.map((prerequisite, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-brand-deep-green-600 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-gray-700">{prerequisite}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Main Content */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BookOpen className="w-5 h-5" />
                      <span>{t('lesson:sections.content')}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">{lesson.content || t('lesson:content.placeholder')}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Key Concepts */}
                {lesson.keyConcepts && lesson.keyConcepts.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Target className="w-5 h-5" />
                        <span>{t('lesson:sections.keyConcepts')}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3">
                        {lesson.keyConcepts.map((concept, index) => (
                          <div key={index} className="bg-brand-warm-beige/30 rounded-lg p-3">
                            <span className="text-gray-700 font-medium">{concept}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Practical Applications */}
                {lesson.practicalApplications && lesson.practicalApplications.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Play className="w-5 h-5" />
                        <span>{t('lesson:sections.practicalApplications')}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {lesson.practicalApplications.map((application, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-brand-deep-green-600 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-gray-700">{application}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Navigation Button */}
                <div className="pt-4">
                  <Button onClick={() => handleTabChange("examples")} className="w-full bg-brand-deep-green-700 hover:bg-brand-deep-green-800" disabled={!examples || examples.length === 0}>
                    {t('lesson:actions.nextToExamples')}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Examples Tab */}
            <TabsContent value="examples" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Play className="w-5 h-5" />
                    <span>{t('lesson:sections.examples')}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {examples && examples.length > 0 ? (
                    <div className="space-y-4">
                      {/* Example Counter */}
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="outline" className="text-sm">
                          {currentExampleIndex + 1} {t('lesson:examples.of')} {examples.length}
                        </Badge>
                      </div>

                      {/* Current Example Card */}
                      <Card className="bg-gray-50">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <h4 className="font-semibold text-brand-deep-green-800 text-lg">{examples[currentExampleIndex]?.title}</h4>
                          </div>
                          <div className="space-y-4">
                            <p className="text-gray-700 text-base leading-relaxed">{examples[currentExampleIndex]?.content}</p>
                            {examples[currentExampleIndex]?.explanation && (
                              <div className="bg-white rounded-lg p-4 border-l-4 border-brand-deep-green-600">
                                <p className="text-sm text-gray-600 font-medium mb-2">{t('lesson:examples.explanation')}:</p>
                                <p className="text-sm text-gray-700 leading-relaxed">{examples[currentExampleIndex]?.explanation}</p>
                              </div>
                            )}
                            {examples[currentExampleIndex]?.mediaUrl && (
                              <div className="flex items-center space-x-2 text-sm text-brand-deep-green-600">
                                <Volume2 className="w-4 h-4" />
                                <span>{t('lesson:examples.audioAvailable')}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Navigation Buttons */}
                      <div className="flex items-center justify-between pt-4">
                        <Button variant="outline" onClick={handlePreviousExample} disabled={currentExampleIndex === 0} className="flex items-center -space-x-3">
                          <ChevronLeft className="w-4 h-4" />
                          <ChevronLeft className="w-4 h-4" />
                          {/* <span>Sebelumnya</span> */}
                        </Button>

                        <Button
                          variant="outline"
                          onClick={currentExampleIndex === examples.length - 1 ? () => handleTabChange("practice") : handleNextExample}
                          disabled={currentExampleIndex === examples.length - 1 && (!questions || questions.length === 0)}
                          className={`flex items-center  ${currentExampleIndex === examples.length - 1 ? "bg-brand-deep-green-700 hover:bg-brand-deep-green-800 text-white space-x-2" : "-space-x-3"}`}
                        >
                          <span>{currentExampleIndex === examples.length - 1 ? t('lesson:tabs.practice') : ""}</span>
                          {currentExampleIndex === examples.length - 1 ? <Target className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          {currentExampleIndex === examples.length - 1 ? "" : <ChevronRight className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">{t('lesson:examples.noExamples')}</p>
                      <Button onClick={() => handleTabChange("practice")} className="bg-brand-deep-green-700 hover:bg-brand-deep-green-800" disabled={!questions || questions.length === 0}>
                        <Target className="w-4 h-4 mr-2" />
                        {t('lesson:actions.nextToPractice')}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Practice Tab */}
            <TabsContent value="practice" className="mt-6">
              {questions && questions.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Target className="w-5 h-5" />
                        <span>{t('lesson:practice.title')}</span>
                      </div>
                      <Badge variant="outline">
                        {currentPracticeQuestion + 1} / {questions.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const currentQuestion = questions[currentPracticeQuestion];
                      return (
                        <div className="space-y-4">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-semibold text-brand-deep-green-800 mb-2">{t('lesson:practice.question')}:</h4>
                            {currentQuestion.type !== "fill_blank" && <p className="text-gray-700">{currentQuestion.question}</p>}
                          </div>

                          {/* Multiple Choice Questions */}
                          {currentQuestion.type === "multiple_choice" && currentQuestion.options && (
                            <div className="space-y-2">
                              <h5 className="font-medium text-gray-800">{t('lesson:practice.chooseAnswer')}:</h5>
                              {currentQuestion.options.map((option, index) => (
                                <button
                                  key={option.id}
                                  onClick={() => handlePracticeAnswer(option.id.toString())}
                                  disabled={showPracticeResult}
                                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                                    selectedAnswer === option.id.toString() ? "border-brand-deep-green-600 bg-brand-deep-green-600/50" : "border-gray-200 hover:border-gray-300"
                                  } ${showPracticeResult ? "cursor-not-allowed" : "cursor-pointer"}`}
                                >
                                  <span
                                    className={`inline-block w-6 h-6 rounded-full ${
                                      selectedAnswer === option.id.toString() ? "text-brand-deep-green-600" : "text-brand-desert-gold-700"
                                    } text-brand-deep-green-700 text-sm font-medium mr-3 text-center leading-6 border-brand-deep-green-600`}
                                  >
                                    {String.fromCharCode(65 + index)}
                                  </span>
                                  <span className="text-gray-700">{option.optionText}</span>
                                </button>
                              ))}
                            </div>
                          )}

                          {/* True/False Questions */}
                          {currentQuestion.type === "true_false" && currentQuestion.options && (
                            <div className="space-y-2">
                              <h5 className="font-medium text-gray-800">{t('lesson:practice.chooseAnswer')}:</h5>
                              <div className="flex gap-2">
                                {currentQuestion.options.map((option) => {
                                  const isTrue = option.isCorrect;
                                  const isSelected = selectedAnswer === option.id.toString();
                                  const displayText = isTrue ? t('lesson:practice.true') : t('lesson:practice.false');
                                  
                                  return (
                                    <button
                                      key={option.id}
                                      onClick={() => handlePracticeAnswer(option.id.toString())}
                                      disabled={showPracticeResult}
                                      className={`w-full p-3 rounded-lg border transition-colors text-center ${
                                        isSelected
                                          ? isTrue
                                            ? "border-green-600 bg-green-600/20"
                                            : "border-red-500 bg-red-500/20"
                                          : isTrue
                                          ? "border-green-300 hover:border-green-400 hover:bg-green-50"
                                          : "border-red-300 hover:border-red-400 hover:bg-red-50"
                                      } ${showPracticeResult ? "cursor-not-allowed" : "cursor-pointer"}`}
                                    >
                                      <span className={`font-medium ${
                                        isSelected
                                          ? isTrue
                                            ? "text-green-700"
                                            : "text-red-700"
                                          : isTrue
                                          ? "text-green-600"
                                          : "text-red-600"
                                      }`}>
                                        {displayText}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Fill Blank Questions */}
                          {currentQuestion.type === "fill_blank" && currentQuestion.options && (
                            <div className="space-y-6">
                              {/* Ayat with Blank Space */}
                              <div className="bg-gradient-to-br from-brand-deep-green-600/50 to-brand-deep-green-500 border-2 border-brand-deep-green-600/50 rounded-xl p-6">
                                <div className="flex justify-center items-center min-h-[120px]">
                                  <div className="text-center">
                                    {/* Question Text with Blank */}
                                    <div className="text-2xl leading-relaxed text-brand-deep-green-800 mb-4">
                                      {currentQuestion.question.includes("___") ? (
                                        <span>
                                          {currentQuestion.question.split("___").map((part, index) => (
                                            <span key={index}>
                                              {part}
                                              {index < currentQuestion.question.split("___").length - 1 && (
                                                <span
                                                  className={`inline-block min-w-[120px] mx-2 px-4 py-2 border-2 border-dashed rounded-lg transition-all duration-500 ${
                                                    fillBlankAnswer ? "border-brand-deep-green-600/50 bg-brand-deep-green-600/50 text-brand-deep-green-800" : "border-brand-deep-green-600/50 bg-white"
                                                  } ${isAnimating ? "animate-pulse bg-yellow-100" : ""}`}
                                                >
                                                  {fillBlankAnswer || "___"}
                                                </span>
                                              )}
                                            </span>
                                          ))}
                                        </span>
                                      ) : (
                                        <span>{currentQuestion.question}</span>
                                      )}
                                    </div>

                                    {/* Instruction */}
                                    <p className="text-sm text-brand-desert-gold-50 italic">{t('lesson:practice.fillBlankInstruction')}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Options as Cards */}
                              <div className="grid grid-cols-2 gap-4">
                                {currentQuestion.options.map((option, index) => {
                                  const isSelected = selectedAnswer === option.id.toString();
                                  const isCorrect = option.isCorrect;
                                  const showCorrectAnswer = showPracticeResult && isCorrect;
                                  const showWrongAnswer = showPracticeResult && isSelected && !isCorrect;
                                  const isDisabled = showPracticeResult || isAnimating;

                                  return (
                                    <button
                                      key={option.id}
                                      onClick={() => handleFillBlankOptionSelect(option.optionText, option.id.toString())}
                                      disabled={isDisabled}
                                      className={`group relative p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                                        showCorrectAnswer
                                          ? "border-brand-deep-green-600/50 bg-brand-deep-green-50 shadow-lg scale-105"
                                          : showWrongAnswer
                                          ? "border-red-500 bg-red-50 shadow-lg"
                                          : isSelected
                                          ? "border-brand-deep-green-600/50 bg-brand-deep-green-600/50 shadow-lg"
                                          : isDisabled
                                          ? "border-gray-300 bg-gray-100 cursor-not-allowed opacity-50"
                                          : "border-brand-deep-green-600/50 bg-white cursor-pointer"
                                      }`}
                                    >
                                      {/* Option Content */}
                                      <div className="text-center">
                                        <div className="text-2xl mb-2 text-brand-deep-green-800">{option.optionText}</div>

                                        {/* Status Icons */}
                                        {showPracticeResult && (
                                          <div className="absolute top-2 right-2">{isCorrect ? <CheckCircle className="h-6 w-6 text-green-600" /> : isSelected ? <XCircle className="h-6 w-6 text-red-600" /> : null}</div>
                                        )}

                                        {/* Hover Effect */}
                                        {!isDisabled && !showPracticeResult && (
                                          <div className="absolute inset-0 bg-gradient-to-r from-brand-deep-green-400/10 to-brand-deep-green-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        )}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          <div className="flex space-x-2">
                            <Button onClick={handleSubmitPracticeAnswer} disabled={!selectedAnswer || showPracticeResult} className="flex-1 bg-brand-deep-green-700 hover:bg-brand-deep-green-800">
                              {t('lesson:practice.submitAnswer')}
                            </Button>
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">{t('lesson:practice.noPractice')}</p>
                    <Button onClick={handleComplete} className="bg-brand-deep-green-700 hover:bg-brand-deep-green-800">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      {t('lesson:actions.completeLesson')}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Answer Result Sheet */}
      <Sheet open={showAnswerSheet} onOpenChange={setShowAnswerSheet}>
        <SheetContent side="bottom" className="h-auto max-h-[50vh]">
          <SheetHeader className="text-center">
            <SheetTitle className={`flex items-center justify-center space-x-2 ${isAnswerCorrect ? "text-green-800" : "text-red-800"}`}>
              {isAnswerCorrect ? <CheckCircle className="w-6 h-6 text-green-600" /> : <XCircle className="w-6 h-6 text-red-600" />}
              <span>{isAnswerCorrect ? t('lesson:practice.correctAnswer') : t('lesson:practice.wrongAnswer')}</span>
            </SheetTitle>
            {questions && questions[currentPracticeQuestion]?.explanation && <SheetDescription className="text-center text-gray-700 mt-4">{questions[currentPracticeQuestion].explanation}</SheetDescription>}
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {isAnswerCorrect && (
              <div className="text-center">
                <p className="text-sm text-green-700">+{questions?.[currentPracticeQuestion]?.points || 0} {t('lesson:practice.points')}</p>
              </div>
            )}

            <Button onClick={handleNextPracticeQuestion} className="w-full bg-brand-deep-green-700 hover:bg-brand-deep-green-800">
              {currentPracticeQuestion < (questions?.length || 0) - 1 ? t('lesson:practice.nextQuestion') : t('lesson:practice.finishPractice')}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Celebration Modal */}
      {lesson && (
        <CelebrationModal isOpen={showCelebrationModal} score={correctAnswersCount} totalQuestions={questions?.length || 0} lessonTitle={lesson.title} practiceScore={practiceScore} onFinish={handleCelebrationFinish} />
      )}

      {/* Navigation */}
      <Navigation />
    </div>
  );
};

export default LessonDetail;
