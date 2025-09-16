import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, ArrowRight, CheckCircle, XCircle, Delete, Volume2 } from "lucide-react";
import { Question, QuestionOption } from "@/types/learn";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";

interface PracticeStepProps {
  practiceQuestions: Question[];
  currentQuestion: number;
  score: number;
  selectedAnswer: string | null;
  showResult: boolean;
  isAnswerCorrect: boolean | null;
  handleAnswerSelect: (optionId: string) => void;
  handleSubmitAnswer: (overrideAnswer?: string) => void;
  handleNextQuestion: () => void;
}

export const PracticeStep = ({ practiceQuestions, currentQuestion, score, selectedAnswer, showResult, isAnswerCorrect, handleAnswerSelect, handleSubmitAnswer, handleNextQuestion }: PracticeStepProps) => {
  const [arrangedWord, setArrangedWord] = useState<string[]>([]);
  const [usedLetters, setUsedLetters] = useState<number[]>([]);
  const [autoCloseTimer, setAutoCloseTimer] = useState<NodeJS.Timeout | null>(null);
  const [fillBlankAnswer, setFillBlankAnswer] = useState<string>("");
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const currentQ = practiceQuestions[currentQuestion];
  const isArrangeWords = currentQ?.type === "arrange-words";
  const isFillBlank = currentQ?.type === "fill_blank";
  const isMultipleChoice = currentQ?.type === "multiple_choice" || currentQ?.type === "guess-meaning";

  // Reset states when question changes
  useEffect(() => {
    if (isArrangeWords) {
      setArrangedWord([]);
      setUsedLetters([]);
    }
    if (isFillBlank) {
      setFillBlankAnswer("");
      setIsAnimating(false);
    }
  }, [currentQuestion, isArrangeWords, isFillBlank]);

  // Reset fill blank answer when showResult becomes false
  useEffect(() => {
    if (!showResult && isFillBlank) {
      setFillBlankAnswer("");
      setIsAnimating(false);
    }
  }, [showResult, isFillBlank]);

  // Auto close timer for last question (non-arrange-words)
  useEffect(() => {
    const isLastQuestion = currentQuestion === practiceQuestions.length - 1;

    if (showResult && isLastQuestion && !isArrangeWords) {
      // Clear any existing timer
      if (autoCloseTimer) {
        clearTimeout(autoCloseTimer);
      }

      // Set timer to auto close after 3 seconds
      const timer = setTimeout(() => {
        handleNextQuestion();
      }, 3000);

      setAutoCloseTimer(timer);
    }

    // Cleanup timer when component unmounts or dependencies change
    return () => {
      if (autoCloseTimer) {
        clearTimeout(autoCloseTimer);
      }
    };
  }, [showResult, currentQuestion, practiceQuestions.length, isArrangeWords, handleNextQuestion, autoCloseTimer]);

  if (practiceQuestions.length === 0) return null;

  const handleLetterSelect = (letter: string, index: number) => {
    if (usedLetters.includes(index) || showResult) return;

    setArrangedWord((prev) => [...prev, letter]);
    setUsedLetters((prev) => [...prev, index]);
  };

  const handleBackspace = () => {
    if (showResult || arrangedWord.length === 0) return;

    const lastLetterIndex = arrangedWord.length - 1;
    const removedLetter = arrangedWord[lastLetterIndex];

    // Find the original index of the last letter to re-enable it
    const originalIndex = currentQ.availableLetters?.findIndex((letter, idx) => letter === removedLetter && usedLetters.includes(idx));

    setArrangedWord((prev) => prev.slice(0, -1));
    if (originalIndex !== undefined && originalIndex !== -1) {
      setUsedLetters((prev) => prev.filter((idx) => idx !== originalIndex));
    }
  };

  const handleArrangeWordsSubmit = () => {
    const userAnswer = arrangedWord.join("");
    const isCorrect = userAnswer === currentQ.targetWord;

    // Simulate the answer selection for arrange-words
    handleAnswerSelect(isCorrect ? "correct" : "incorrect");

    // Submit jawaban untuk menampilkan hasil
    handleSubmitAnswer(isCorrect ? "correct" : "incorrect");
  };

  const handleFillBlankOptionSelect = async (optionText: string, optionId: string) => {
    if (showResult || isAnimating) return;

    setIsAnimating(true);

    // Animate the option text moving to fill the blank
    setTimeout(() => {
      setFillBlankAnswer(optionText);
      handleAnswerSelect(optionId);
      setIsAnimating(false);

      // Auto submit after animation with the specific optionId
      setTimeout(() => {
        handleSubmitAnswer(optionId);
      }, 500);
    }, 800);
  };

  const handleRegularSubmit = () => {
    if (!selectedAnswer) return;

    // Submit jawaban untuk menampilkan hasil
    handleSubmitAnswer();
  };

  return (
    <Card className="shadow-lg border-none">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="border-brand-deep-green-600/50 text-brand-deep-green-700">
            <Target className="h-4 w-4 mr-1" />
            Latihan
          </Badge>
          <div className="text-sm text-brand-deep-green-600">
            Soal {currentQuestion + 1} dari {practiceQuestions.length} | Skor: {score}/{practiceQuestions.length}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Question */}
        <div>
          <h2 className="text-lg font-medium text-brand-deep-green-800 mb-4">{currentQ?.question}</h2>
          {/* Arabic Text for Multiple Choice */}
          {isMultipleChoice && currentQ?.arabicText && (
            <div className="bg-brand-deep-green-600/50 rounded-lg p-4 mb-4">
              <div className="text-center">
                <span className="text-2xl font-arabic text-brand-deep-green-800" dir="rtl">
                  {currentQ.arabicText}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Arrange Words Interface */}
        {isArrangeWords ? (
          <div className="space-y-6">
            {/* Answer Area - Arabic text display */}
            <div className="bg-white border-2 border-brand-deep-green-600/50 rounded-lg p-6">
              <div className="text-center mb-4">
                <p className="text-sm text-brand-deep-green-600 mb-2">Susun kata di sini:</p>
              </div>
              <div className="flex justify-center items-center min-h-[100px]">
                <div className="relative w-full max-w-md">
                  {/* Arabic text display area */}
                  <div className="bg-gray-50 border-2 border-dashed border-brand-deep-green-600/50 rounded-lg p-4 min-h-[60px] flex items-center justify-center">
                    {arrangedWord.length > 0 && (
                      <span className="text-4xl font-arabic text-brand-deep-green-800 text-right" dir="rtl">
                        {arrangedWord}
                      </span>
                    )}
                  </div>

                  {/* Backspace button */}
                  {arrangedWord.length > 0 && !showResult && (
                    <Button onClick={handleBackspace} variant="outline" size="sm" className="absolute -bottom-2 -right-2 w-10 h-10 p-0 border-brand-desert-gold-300 text-brand-desert-gold-600 hover:border-brand-desert-gold-400">
                      <Delete className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              {showResult && (
                <div className="text-center mt-4">
                  <div className="flex items-center justify-center gap-2">
                    {arrangedWord.join("") === currentQ.targetWord ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
                    <span className={`font-medium ${arrangedWord.join("") === currentQ.targetWord ? "text-green-600" : "text-red-600"}`}>{arrangedWord.join("") === currentQ.targetWord ? "Benar!" : "Salah!"}</span>
                  </div>
                  {arrangedWord.join("") !== currentQ.targetWord && (
                    <div className="mt-4">
                      <p className="text-sm text-brand-deep-green-600 mb-2">Jawaban yang benar:</p>
                      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                        <span className="text-3xl font-arabic text-green-700" dir="rtl">
                          {currentQ.targetWord}
                        </span>
                      </div>
                    </div>
                  )}
                  {arrangedWord.join("") === currentQ.targetWord && (
                    <p className="text-sm text-brand-deep-green-600 mt-2">
                      Jawaban yang benar:{" "}
                      <span className="font-arabic text-lg" dir="rtl">
                        {currentQ.targetWord}
                      </span>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Available Letters */}
            <div>
              <p className="text-sm text-brand-deep-green-600 mb-3 text-center">Pilih huruf-huruf di bawah ini:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {currentQ.availableLetters?.map((letter, index) => (
                  <button
                    key={index}
                    onClick={() => handleLetterSelect(letter, index)}
                    disabled={usedLetters.includes(index) || showResult}
                    className={`w-12 h-12 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
                      usedLetters.includes(index) ? "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed" : "border-brand-deep-green-600/50 bg-white cursor-pointer"
                    }`}
                  >
                    <span className="text-xl font-arabic text-brand-deep-green-800">{letter}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : isFillBlank ? (
          /* Fill Blank Gamified Interface */
          <div className="space-y-6">
            {/* Ayat with Blank Space */}
            <div className="bg-gradient-to-br from-brand-deep-green-600/50 to-brand-deep-green-500 border-2 border-brand-deep-green-600/50 rounded-xl p-6">
              <div className="text-center mb-4">
                <p className="text-sm text-brand-deep-green-800 mb-3">Lengkapi ayat berikut:</p>
              </div>

              <div className="flex justify-center items-center min-h-[120px]">
                <div className="text-center">
                  {/* Arabic Text with Blank */}
                  <div className="text-3xl font-arabic leading-relaxed text-brand-deep-green-800 mb-4" dir="rtl">
                    {currentQ?.arabicText ? (
                      <span>
                        {currentQ.arabicText.split("____").map((part, index) => (
                          <span key={index}>
                            {part}
                            {index < currentQ.arabicText.split("____").length - 1 && (
                              <span
                                className={`inline-block min-w-[120px] mx-2 px-4 py-2 border-2 border-dashed rounded-lg transition-all duration-500 ${
                                  fillBlankAnswer ? "border-brand-deep-green-600/50 bg-brand-deep-green-600/50 text-brand-deep-green-800" : "border-brand-deep-green-600/50 bg-white"
                                } ${isAnimating ? "animate-pulse bg-yellow-100" : ""}`}
                              >
                                {fillBlankAnswer || "____"}
                              </span>
                            )}
                          </span>
                        ))}
                      </span>
                    ) : (
                      <span>Teks Arab tidak tersedia</span>
                    )}
                  </div>

                  {/* Instruction */}
                  <p className="text-sm text-brand-desert-gold-50 italic">Pilih salah satu opsi di bawah untuk melengkapi ayat</p>
                </div>
              </div>
            </div>

            {/* Options as Cards */}
            <div className="grid grid-cols-2 gap-4">
              {currentQ?.options.map((option: QuestionOption, index: number) => {
                const isSelected = selectedAnswer === option.id;
                const isCorrect = option.correct;
                const showCorrectAnswer = showResult && isCorrect;
                const showWrongAnswer = showResult && isSelected && !isCorrect;
                const isDisabled = showResult || isAnimating;

                return (
                  <button
                    key={option.id}
                    onClick={() => handleFillBlankOptionSelect(option.text, option.id)}
                    disabled={isDisabled}
                    className={`group relative p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                      showCorrectAnswer
                        ? "border-brand-deep-green-600/50 bg-brand-deep-green-50 shadow-lg scale-105"
                        : showWrongAnswer
                        ? "border-brand-desert-gold-600/50 bg-brand-desert-gold-50 shadow-lg"
                        : isSelected
                        ? "border-brand-deep-green-600/50 bg-brand-deep-green-600/50 shadow-lg"
                        : isDisabled
                        ? "border-gray-300 bg-gray-100 cursor-not-allowed opacity-50"
                        : "border-brand-deep-green-600/50 bg-white cursor-pointer"
                    } ${isAnimating && isSelected ? "animate-bounce" : ""}`}
                  >
                    {/* Option Content */}
                    <div className="text-center">
                      <div className="text-2xl font-arabic mb-2 text-brand-deep-green-800">{option.text}</div>

                      {/* Status Icons */}
                      {showResult && <div className="absolute top-2 right-2">{isCorrect ? <CheckCircle className="h-6 w-6 text-green-600" /> : isSelected ? <XCircle className="h-6 w-6 text-red-600" /> : null}</div>}

                      {/* Hover Effect */}
                      {!isDisabled && !showResult && <div className="absolute inset-0 bg-gradient-to-r from-brand-deep-green-400/10 to-brand-deep-green-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Animation Feedback */}
            {isAnimating && (
              <div className="text-center">
                <p className="text-brand-deep-green-600 animate-pulse">Mengisi ayat...</p>
              </div>
            )}
          </div>
        ) : (
          /* Regular Multiple Choice Options */
          <div className="space-y-3">
            {currentQ?.options.map((option: QuestionOption, index: number) => {
              const isSelected = selectedAnswer === option.id;
              const isCorrect = option.correct;
              const showCorrectAnswer = showResult && isCorrect;
              const showWrongAnswer = showResult && isSelected && !isCorrect;
              const optionLabel = String.fromCharCode(65 + index); // A, B, C, D

              return (
                <button
                  key={option.id}
                  onClick={() => handleAnswerSelect(option.id)}
                  disabled={showResult}
                  className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    showCorrectAnswer
                      ? "border-brand-deep-green-500 bg-brand-deep-green-600/50 text-brand-deep-green-800"
                      : showWrongAnswer
                      ? "border-brand-desert-gold-500 bg-brand-desert-gold-50 text-brand-desert-gold-800"
                      : isSelected
                      ? "border-brand-deep-green-500 bg-brand-deep-green-600/60 text-brand-deep-green-800"
                      : "border-brand-deep-green-600/60 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                          showCorrectAnswer
                            ? "border-brand-deep-green-600/50 bg-brand-deep-green-600/50 text-white"
                            : showWrongAnswer
                            ? "border-brand-desert-gold-500 bg-brand-desert-gold-500 text-white"
                            : isSelected
                            ? "border-brand-deep-green-500 bg-brand-deep-green-600/50 text-white"
                            : "border-brand-deep-green-600/50 text-brand-deep-green-600/50"
                        }`}
                      >
                        {optionLabel}
                      </div>
                      <span className={`font-medium ${isSelected ? "text-white" : ""}`}>{option.text}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Explanation Drawer */}
        <Drawer open={showResult} onOpenChange={() => {}}>
          <DrawerContent className="max-h-[60vh]">
            <DrawerHeader className="sr-only">
              <DrawerTitle>{isAnswerCorrect ? "Jawaban Benar" : "Jawaban Kurang Tepat"}</DrawerTitle>
              <DrawerDescription>
                {isAnswerCorrect ? "Selamat! Anda menjawab dengan benar." : "Jangan khawatir, mari belajar dari kesalahan ini."}
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-6 py-6">
              {/* Status Header */}
              <div className="text-center mb-6">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${isAnswerCorrect ? "bg-green-100" : "bg-red-100"}`}>
                  {isAnswerCorrect ? <CheckCircle className="h-8 w-8 text-green-600" /> : <XCircle className="h-8 w-8 text-red-600" />}
                </div>
                <h3 className={`text-xl font-bold mb-2 ${isAnswerCorrect ? "text-green-800" : "text-red-800"}`}>{isAnswerCorrect ? "Jawaban Benar!" : "Jawaban Kurang Tepat"}</h3>
                <p className="text-gray-600 text-sm">{isAnswerCorrect ? "Selamat! Anda menjawab dengan benar." : "Jangan khawatir, mari belajar dari kesalahan ini."}</p>
              </div>

              {/* Explanation */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-brand-deep-green-800 mb-2">Penjelasan:</h4>
                <p className="text-brand-deep-green-700 leading-relaxed">{currentQ?.explanation}</p>
              </div>

              {/* Next Question Button */}
              <Button onClick={handleNextQuestion} className="w-full bg-brand-deep-green-700 hover:bg-brand-deep-green-800 text-white py-3 rounded-lg">
                {currentQuestion < practiceQuestions.length - 1 ? (
                  <>
                    <ArrowRight className="h-5 w-5 mr-2" />
                    Selanjutnya
                  </>
                ) : (
                  "Selesai"
                )}
              </Button>
            </div>
          </DrawerContent>
        </Drawer>

        {/* Action Buttons */}
        {!showResult && !isFillBlank && (
          <div className="space-y-2">
            <Button
              onClick={isArrangeWords ? handleArrangeWordsSubmit : handleRegularSubmit}
              disabled={isArrangeWords ? arrangedWord.length === 0 : !selectedAnswer}
              className="w-full bg-brand-deep-green-700 hover:bg-brand-deep-green-800 text-white py-3"
            >
              Jawab
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
