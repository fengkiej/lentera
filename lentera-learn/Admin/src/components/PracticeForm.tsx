import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Trash2, Plus, X, Edit, Sparkles, ArrowLeft } from "lucide-react";
import UniversalForm from "./UniversalForm";
import { useAIGeneration } from "../hooks/useAI";
import { getPracticeQuestionTypeOptions, type PracticeQuestionType } from "../constants/practiceTypes";
import { toast } from "sonner";
import { useUpdatePractice, useCreatePractice } from "../hooks/useApi";


interface LessonData {
  id: string;
  title: string;
  content: string;
  topicId: string;
  orderIndex: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PracticeFormProps {
  lessonId?: string;
  lessonData?: LessonData;
  onPracticeAdded?: () => void;
  // Edit mode props
  mode?: 'create' | 'edit';
  practiceId?: string;
  initialData?: {
    question: string;
    type: string;
    options?: string[] | Array<{ optionText: string; isCorrect: boolean; orderIndex: number }>;
    correctAnswer?: string;
    explanation: string;
    difficultyLevel: string;
    points: number;
  };
  onPracticeUpdated?: () => void;
  onBack?: () => void;
}

const createPracticeFormSchema = (t: (key: string) => string) =>
  z.object({
    question: z
      .string()
      .min(1, t("validation.questionRequired"))
      .refine(
        (val) => {
          // Special validation for fill_blank type
          const underscoreMatches = val.match(/___/g);
          const underscoreCount = underscoreMatches ? underscoreMatches.length : 0;
          const placeholderCount = val.split("___").length - 1;

          // If question contains underscores, validate fill_blank format
          if (underscoreCount > 0) {
            if (underscoreCount !== 1) {
              return false; // Must have exactly 1 set of underscores
            }
            if (placeholderCount !== 1) {
              return false; // Must have exactly 1 placeholder
            }
          }
          return true;
        },
        {
          message: t("validation.fillBlankFormat"),
        }
      ),
    type: z.enum(["multiple_choice", "true_false", "fill_blank", "short_answer", "essay"]),
    options: z.array(z.string()).optional(),
    correctAnswer: z.string().optional(),
    explanation: z.string().min(1, t("validation.explanationRequired")),
    difficultyLevel: z.enum(["beginner", "intermediate", "advanced"]),
    points: z.number().min(1, t("validation.pointsMinimum")),
  });

type PracticeFormData = z.infer<ReturnType<typeof createPracticeFormSchema>>;

interface PracticeQuestion {
  id: string;
  question: string;
  type: string;
  options?: Array<{ optionText: string; isCorrect: boolean; orderIndex: number }>;
  correctAnswer?: string;
  explanation: string;
  difficultyLevel: string;
  points: number;
}

const PracticeForm: React.FC<PracticeFormProps> = ({ 
  lessonId, 
  lessonData, 
  onPracticeAdded,
  mode = 'create',
  practiceId,
  initialData,
  onPracticeUpdated,
  onBack
}) => {
  const { t } = useTranslation("lessons");
  const [practices, setPractices] = useState<PracticeQuestion[]>([]);
  const [message, setMessage] = useState("");
  const [options, setOptions] = useState<string[]>([""]); // For multiple choice options
  const [correctOptionIndex, setCorrectOptionIndex] = useState<number>(0); // Index of correct option
  const [editingPracticeId, setEditingPracticeId] = useState<string | null>(null);
  const [selectedQuestionType, setSelectedQuestionType] = useState<PracticeQuestionType | null>(null);
  const { generatePracticeContent, isGenerating } = useAIGeneration();
  const updatePracticeMutation = useUpdatePractice();
  const createPracticeMutation = useCreatePractice();
  const [isLoading, setIsLoading] = useState(false);

  const practiceFormSchema = createPracticeFormSchema(t);

  const form = useForm({
    resolver: zodResolver(practiceFormSchema),
    defaultValues: {
      question: initialData?.question || "",
      type: (initialData?.type as "multiple_choice" | "true_false" | "fill_blank" | "short_answer" | "essay") || "multiple_choice",
      options: [],
      correctAnswer: initialData?.correctAnswer || "",
      explanation: initialData?.explanation || "",
      difficultyLevel: (initialData?.difficultyLevel as "beginner" | "intermediate" | "advanced") || "beginner",
      points: initialData?.points || 10,
    },
  });

  const watchedQuestionType = form.watch("type");

  // Initialize form state when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData && mode === 'edit') {
      // Set options state if available
      if (initialData.options && initialData.options.length > 0) {
        // Check if options is array of objects or array of strings
        const firstOption = initialData.options[0];
        if (typeof firstOption === 'object' && 'optionText' in firstOption) {
          // Convert array of objects to array of strings
          const optionTexts = initialData.options.map(opt => (opt as { optionText: string; isCorrect: boolean; orderIndex: number }).optionText);
          setOptions(optionTexts);
          
          // Find correct option index for multiple choice and fill_blank
          if (initialData.type === 'multiple_choice' || initialData.type === 'fill_blank') {
            const correctIndex = initialData.options.findIndex(opt => (opt as { optionText: string; isCorrect: boolean; orderIndex: number }).isCorrect === true);
            if (correctIndex !== -1) {
              setCorrectOptionIndex(correctIndex);
            }
          }
        } else {
          // Options is already array of strings
          setOptions(initialData.options as string[]);
          
          // Find correct option index for multiple choice and fill_blank
          if ((initialData.type === 'multiple_choice' || initialData.type === 'fill_blank') && initialData.correctAnswer) {
            const correctIndex = (initialData.options as string[]).findIndex(option => option === initialData.correctAnswer);
            if (correctIndex !== -1) {
              setCorrectOptionIndex(correctIndex);
            }
          }
        }
      }
      
      // Set selected question type
      setSelectedQuestionType(initialData.type as PracticeQuestionType);
    }
  }, [initialData, mode]);

  const addOption = () => {
    setOptions((prev) => [...prev, ""]);
  };

  const removeOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
    // Adjust correctOptionIndex if needed
    if (correctOptionIndex === index) {
      setCorrectOptionIndex(0); // Reset to first option
    } else if (correctOptionIndex > index) {
      setCorrectOptionIndex(correctOptionIndex - 1); // Shift down
    }
  };

  const handleGeneratePractice = async () => {
    if (!selectedQuestionType) {
      toast.error(t("messages.selectQuestionTypeFirst"));
      return;
    }

    try {
      const lessonContext = lessonData
        ? {
            title: lessonData.title,
            content: lessonData.content,
            summary: lessonData.content?.substring(0, 200) + "...",
          }
        : undefined;

      const result = await generatePracticeContent(selectedQuestionType, lessonContext);

      if (result) {
        // Fill form with generated content
        form.setValue("question", result.question);
        form.setValue("type", selectedQuestionType);
        form.setValue("explanation", result.explanation || "");

        if ((selectedQuestionType === "multiple_choice" || selectedQuestionType === "fill_blank") && result.options) {
          setOptions(result.options);
          // Find correct answer index
          const correctIndex = result.options.findIndex((opt) => {
            // For fill_blank, match by letter (A, B, C, D)
            if (selectedQuestionType === "fill_blank") {
              const optionLetter = opt.charAt(0); // Get A, B, C, or D
              return optionLetter === result.correctAnswer;
            }
            // For multiple_choice, match by full option text
            return opt === result.correctAnswer;
          });
          if (correctIndex !== -1) {
            setCorrectOptionIndex(correctIndex);
          }
        } else if (selectedQuestionType === "true_false") {
          // Convert Indonesian answer to English for form
          const normalizedAnswer = result.correctAnswer.toLowerCase();
          let formValue = "";
          if (normalizedAnswer.includes("benar") || normalizedAnswer.includes("true")) {
            formValue = "true";
          } else if (normalizedAnswer.includes("salah") || normalizedAnswer.includes("false")) {
            formValue = "false";
          }
          form.setValue("correctAnswer", formValue);
        } else if (selectedQuestionType === "fill_blank") {
          form.setValue("correctAnswer", result.correctAnswer);
        }

        toast.success(t("messages.practiceGeneratedSuccess"));
      } else {
        toast.error(t("messages.practiceGenerationFailed"));
      }
    } catch (error) {
      console.error("Error generating practice:", error);
      toast.error(t("messages.practiceGenerationError"));
    }
  };

  const updateOption = (index: number, value: string) => {
    setOptions((prev) => prev.map((opt, i) => (i === index ? value : opt)));
  };

  const onSubmit = async (data: PracticeFormData) => {
    if (!lessonId) {
      setMessage(t("messages.lessonIdRequired"));
      return;
    }

    setMessage("");

    try {
      // Prepare options in the format expected by backend
      let formattedOptions: Array<{ optionText: string; isCorrect: boolean; orderIndex: number }> | undefined;
      let finalCorrectAnswer = data.correctAnswer;

      if (data.type === "multiple_choice") {
        const validOptions = options.filter((opt) => opt.trim() !== "");
        formattedOptions = validOptions.map((optionText, index) => ({
          optionText,
          isCorrect: index === correctOptionIndex,
          orderIndex: index,
        }));
        // Set correct answer to the selected option text
        finalCorrectAnswer = validOptions[correctOptionIndex] || "";
      } else if (data.type === "true_false") {
        // Create True/False options based on correctAnswer
        const isCorrectTrue = data.correctAnswer === "true";
        formattedOptions = [
          {
            optionText: "Benar",
            isCorrect: isCorrectTrue,
            orderIndex: 0,
          },
          {
            optionText: "Salah",
            isCorrect: !isCorrectTrue,
            orderIndex: 1,
          },
        ];
        // Keep the original correctAnswer value
        finalCorrectAnswer = data.correctAnswer;
      } else if (data.type === "fill_blank") {
        // For fill_blank, create options from the options array like multiple_choice
        const validOptions = options.filter((opt) => opt.trim() !== "");
        if (validOptions.length > 0) {
          formattedOptions = validOptions.map((optionText, index) => ({
            optionText,
            isCorrect: index === correctOptionIndex,
            orderIndex: index,
          }));
          // Set correct answer to the selected option text
          finalCorrectAnswer = validOptions[correctOptionIndex] || "";
        }
      }

      // Prepare data based on question type
      const submitData = {
        ...data,
        correctAnswer: finalCorrectAnswer,
        lessonId: parseInt(lessonId),
        options: formattedOptions,
      };

      // Validate required IDs based on mode
      if (mode === 'create' && !lessonId) {
        setMessage("Lesson ID is required for creating practice");
        return;
      }
      
      if (mode === 'edit' && !practiceId) {
        setMessage("Practice ID is required for editing practice");
        return;
      }

      setIsLoading(true);
      
      if (mode === 'edit' && practiceId) {
        // Use update mutation
        const difficultyMap = {
          'beginner': 'easy' as const,
          'intermediate': 'medium' as const,
          'advanced': 'hard' as const
        };
        
        await updatePracticeMutation.mutateAsync({
          id: practiceId,
          data: {
            question: submitData.question,
            questionType: submitData.type as "multiple_choice" | "true_false" | "short_answer" | "essay" | "fill_blank",
            explanation: submitData.explanation,
            difficultyLevel: difficultyMap[submitData.difficultyLevel] as "easy" | "medium" | "hard",
            points: submitData.points,
            lessonId: Number(submitData.lessonId).toString(),
            correctAnswer: submitData.correctAnswer || '',
            orderIndex: 0,
            isActive: true,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          options: submitData.options as any
          }
        });
        
        setMessage(t("messages.practiceUpdatedSuccess") || "Practice updated successfully");
        
        if (onPracticeUpdated) {
          onPracticeUpdated();
        }
      } else {
        // Use create mutation
        const difficultyMap = {
          'beginner': 'easy' as const,
          'intermediate': 'medium' as const,
          'advanced': 'hard' as const
        };
        
        await createPracticeMutation.mutateAsync({
          question: submitData.question,
          questionType: submitData.type as "multiple_choice" | "true_false" | "short_answer" | "essay" | "fill_blank",
          explanation: submitData.explanation,
          difficultyLevel: difficultyMap[submitData.difficultyLevel] as "easy" | "medium" | "hard",
          points: submitData.points,
          lessonId: Number(submitData.lessonId).toString(),
          correctAnswer: submitData.correctAnswer || '',
          orderIndex: 0,
          isActive: true,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          options: submitData.options as any
        });
        
        setMessage(t("messages.practiceAddedSuccess"));
        
        form.reset();
        setOptions([""]);
        setCorrectOptionIndex(0);

        if (onPracticeAdded) {
          onPracticeAdded();
        }
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error submitting practice:", error);
      setMessage(t("messages.practiceAddError"));
      setIsLoading(false);
    }
  };

  const removePractice = (index: number) => {
    setPractices((prev) => prev.filter((_, i) => i !== index));
  };

  // Show edit form if editing
  if (editingPracticeId) {
    return (
      <UniversalForm
        mode="edit"
        type="practice"
        lessonId={lessonId || ""}
        itemId={editingPracticeId}
        onSuccess={() => {
          setEditingPracticeId(null);
          if (onPracticeAdded) onPracticeAdded();
        }}
        onCancel={() => setEditingPracticeId(null)}
      />
    );
  }

  const handleGoBack = () => {
    if (onBack) {
      onBack();
    } else if (window.history.length > 1) {
      window.history.back();
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button - Only show in edit mode */}
      {mode === 'edit' && (
        <div className="flex items-center gap-4 mb-6">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGoBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("actions.back") || "Kembali"}
          </Button>
          <h1 className="text-2xl font-bold">
            {t("form.editPracticeTitle") || "Edit Practice"}
          </h1>
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {mode === 'edit' ? (t("form.editPracticeTitle") || "Edit Practice") : t("form.addPracticeTitle")}
          </CardTitle>
          <CardDescription>
            {mode === 'edit' ? (t("form.editPracticeDescription") || "Edit practice information") : t("form.addPracticeDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {message && <div className={`p-3 rounded-md mb-4 ${message.includes("berhasil") || message.includes("success") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{message}</div>}

          {/* Question Type Selection and AI Generation */}
          <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">{t("form.fields.selectQuestionType")}</label>
                <Select value={selectedQuestionType || ""} onValueChange={(value) => setSelectedQuestionType(value as PracticeQuestionType)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("form.fields.selectQuestionTypeForAI")} />
                  </SelectTrigger>
                  <SelectContent>
                    {getPracticeQuestionTypeOptions(t).map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-shrink-0">
                <Button type="button" onClick={handleGeneratePractice} disabled={!selectedQuestionType || isGenerating} className="mt-6">
                  <Sparkles className="h-4 w-4 mr-2" />
                  {isGenerating ? t("actions.creating") : t("actions.generateWithAI")}
                </Button>
              </div>
            </div>
            {selectedQuestionType && (
              <p className="text-sm text-gray-600">
                {t("labels.selectedQuestionType")}: <span className="font-medium">{getPracticeQuestionTypeOptions(t).find((opt) => opt.value === selectedQuestionType)?.label}</span>
              </p>
            )}
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Question */}
              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.fields.question")}</FormLabel>
                    <div className="space-y-2">
                      <FormControl>
                        <Textarea placeholder={t("form.fields.questionPlaceholder")} rows={3} {...field} />
                      </FormControl>
                      {watchedQuestionType === "fill_blank" && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const currentValue = field.value || "";
                            const cursorPosition =
                              document.activeElement === document.querySelector('textarea[name="question"]')
                                ? (document.querySelector('textarea[name="question"]') as HTMLTextAreaElement)?.selectionStart || currentValue.length
                                : currentValue.length;
                            const newValue = currentValue.slice(0, cursorPosition) + "___" + currentValue.slice(cursorPosition);
                            field.onChange(newValue);
                          }}
                          className="w-fit"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {t("actions.addUnderscore")}
                        </Button>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Question Type */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.fields.questionType")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("form.fields.selectQuestionType")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="multiple_choice">{t("form.fields.multipleChoice")}</SelectItem>
                        <SelectItem value="true_false">{t("form.fields.trueFalse")}</SelectItem>
                        <SelectItem value="fill_blank">{t("form.fields.fillBlank")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Options for Multiple Choice and Fill Blank */}
              {(watchedQuestionType === "multiple_choice" || watchedQuestionType === "fill_blank") && (
                <div className="space-y-2">
                  <FormLabel>{t("form.fields.answerOptions")}</FormLabel>
                  {options.map((option, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input type="radio" name="correctOption" checked={correctOptionIndex === index} onChange={() => setCorrectOptionIndex(index)} className="mt-1" />
                      <Input placeholder={`${t("form.fields.option")} ${String.fromCharCode(65 + index)}`} value={option} onChange={(e) => updateOption(index, e.target.value)} className="flex-1" />
                      {options.length > 1 && (
                        <Button type="button" variant="outline" size="sm" onClick={() => removeOption(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addOption}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t("actions.addOption")}
                  </Button>
                  <p className="text-sm text-gray-600">{t("form.fields.selectCorrectAnswer")}</p>
                </div>
              )}

              {/* Correct Answer - Only for true_false, short_answer and essay */}
              {(watchedQuestionType === "true_false" || watchedQuestionType === "short_answer" || watchedQuestionType === "essay") && (
                <FormField
                  control={form.control}
                  name="correctAnswer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.fields.correctAnswer")}</FormLabel>
                      <FormControl>
                        {watchedQuestionType === "true_false" ? (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder={t("form.fields.selectCorrectAnswer")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">{t("form.fields.true")}</SelectItem>
                              <SelectItem value="false">{t("form.fields.false")}</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Textarea placeholder={t("form.fields.correctAnswerPlaceholder")} rows={2} {...field} />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Explanation */}
              <FormField
                control={form.control}
                name="explanation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.fields.explanation")}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t("form.fields.explanationPlaceholder")} rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Difficulty Level */}
                <FormField
                  control={form.control}
                  name="difficultyLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.fields.difficulty")}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("form.fields.selectDifficulty")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="beginner">{t("difficulty.beginner")}</SelectItem>
                          <SelectItem value="intermediate">{t("difficulty.intermediate")}</SelectItem>
                          <SelectItem value="advanced">{t("difficulty.advanced")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Points */}
                <FormField
                  control={form.control}
                  name="points"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.fields.points")}</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder={t("form.fields.pointsPlaceholder")} {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 10)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                disabled={isLoading || (mode === 'create' && !lessonId) || (mode === 'edit' && !practiceId)} 
                className="w-full"
              >
                {isLoading 
                  ? (mode === 'edit' ? t("actions.updatingPractice") || "Updating Practice..." : t("actions.addingPractice"))
                  : (mode === 'edit' ? t("actions.updatePractice") || "Update Practice" : t("actions.addPractice"))
                }
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Practice Questions List */}
      {practices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("labels.addedPractices")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {practices.map((practice, index) => (
                <div key={practice.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{practice.question}</h4>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingPracticeId(practice.id)} className="text-blue-600 hover:text-blue-700">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => removePractice(index)} className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {practice.options && practice.options.length > 0 && (
                    <div className="mb-2">
                      <p className="text-sm font-medium mb-1">{t("labels.options")}:</p>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {practice.options.map((option, optIndex) => (
                          <li key={optIndex} className={option.isCorrect ? "text-green-600 font-medium" : ""}>
                            {String.fromCharCode(65 + optIndex)}. {option.optionText}
                            {option.isCorrect && " ✓"}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {practice.correctAnswer && (
                    <p className="text-sm text-green-600 mb-2">
                      <strong>{t("labels.answer")}:</strong> {practice.correctAnswer}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 mb-2">{practice.explanation}</p>
                  <div className="flex gap-2 text-xs text-gray-400">
                    <span>
                      {t("labels.type")}: {practice.type}
                    </span>
                    <span>•</span>
                    <span>
                      {t("labels.level")}: {practice.difficultyLevel}
                    </span>
                    <span>•</span>
                    <span>
                      {t("labels.points")}: {practice.points}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PracticeForm;
