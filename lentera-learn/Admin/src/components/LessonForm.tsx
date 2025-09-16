import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { CheckIcon, Loader2, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";

import ExampleForm from "./ExampleForm";
import PracticeForm from "./PracticeForm";
import { useSubjects, useTopicsBySubject, useCreateLesson, useTopic, useUpdateLesson } from "../hooks/useApi";
import { useAIGeneration } from "../hooks/useAI";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface LessonData {
  id: string;
  title: string;
  content: string;
  topicId: string;
  orderIndex: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  summary?: string;
  learningObjectives?: string;
  prerequisites?: string;
  keyConcepts?: string;
  practicalApplications?: string;
  mediaContent?: string;
  estimatedDuration?: number;
  difficultyLevel?: string;
  difficultySubLevel?: number;
}

const createLessonFormSchema = (t: (key: string, options?: Record<string, unknown>) => string, mode: 'create' | 'edit' = 'create') =>
  z.object({
    title: z.string().min(1, t("validation.titleRequired")).max(100, t("validation.titleMaxLength")),
    content: z.string().min(1, t("validation.contentRequired")),
    summary: z.string().min(1, t("validation.summaryRequired")).max(500, t("validation.summaryMaxLength")),
    subjectId: mode === 'edit' ? z.string().optional() : z.string().min(1, t("validation.subjectRequired")),
    topicId: mode === 'edit' ? 
      z.union([z.string(), z.number()]).transform((val) => {
        if (typeof val === 'string') {
          const num = parseInt(val);
          if (isNaN(num)) throw new Error("Topic ID must be a valid number");
          return num;
        }
        return val;
      }).optional() : 
      z.union([z.string(), z.number()]).transform((val) => {
        if (typeof val === 'string') {
          // Allow empty string during form initialization, but require it for validation
          if (val === '') return '';
          if (!val.trim()) throw new Error(t("validation.topicRequired"));
          const num = parseInt(val);
          if (isNaN(num)) throw new Error("Topic ID must be a valid number");
          return num;
        }
        return val;
      }).refine((val) => val !== '', { message: t("validation.topicRequired") }),
    estimatedDuration: z.number().min(1, t("validation.durationMin")).max(300, t("validation.durationMax")),
    difficultyLevel: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
    learningObjectives: z.string().optional(),
    prerequisites: z.string().optional(),
    keyConcepts: z.string().optional(),
    practicalApplications: z.string().optional(),
    mediaContent: z.string().optional(),
  });

interface LessonFormProps {
  mode?: 'create' | 'edit';
  lessonId?: string;
  initialData?: LessonData;
  onLessonUpdated?: () => void;
  onCancel?: () => void;
}

const LessonForm: React.FC<LessonFormProps> = ({ 
  mode = 'create',
  lessonId,
  initialData,
  onLessonUpdated,
  onCancel
}) => {
  const { t } = useTranslation("lessons");
  const [currentStep, setCurrentStep] = useState(1);
  const [createdLessonId, setCreatedLessonId] = useState<string | null>(null);
  const [createdLessonData, setCreatedLessonData] = useState<LessonData | undefined>(undefined);
  const { data: subjects = [] } = useSubjects();
  const createLessonMutation = useCreateLesson();
  const updateLessonMutation = useUpdateLesson();
  const { isGenerating, generateLessonSummary, generateLessonContent, generateLearningObjectives, generatePrerequisites, generateKeyConcepts, generatePracticalApplications } = useAIGeneration();
  
  // Get topic data to extract subjectId in edit mode
  const { data: topicData } = useTopic(initialData?.topicId || "");

  // Helper function to parse array data from JSON string or newline-separated string
  const parseArrayData = (data: string | undefined): string[] => {
    if (!data) return [""];
    
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed.filter(item => item && item.trim());
      }
    } catch {
      // If JSON parsing fails, try newline-separated format
      const items = data.split('\n').filter(item => item.trim());
      if (items.length > 0) {
        return items;
      }
    }
    
    return [""];
  };

  const [arrayFields, setArrayFields] = useState({
    learningObjectives: parseArrayData(initialData?.learningObjectives),
    prerequisites: parseArrayData(initialData?.prerequisites),
    keyConcepts: parseArrayData(initialData?.keyConcepts),
    practicalApplications: parseArrayData(initialData?.practicalApplications),
  });

  const form = useForm({
    resolver: zodResolver(createLessonFormSchema(t, mode)),
    defaultValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
      summary: initialData?.summary || "",
      subjectId: "", // Will be set based on topicId if in edit mode
      topicId: initialData?.topicId || "",
      estimatedDuration: initialData?.estimatedDuration || 30,
      difficultyLevel: (initialData?.difficultyLevel as "beginner" | "intermediate" | "advanced") || "beginner",
      learningObjectives: initialData?.learningObjectives || undefined,
      prerequisites: initialData?.prerequisites || undefined,
      keyConcepts: initialData?.keyConcepts || undefined,
      practicalApplications: initialData?.practicalApplications || undefined,
      mediaContent: initialData?.mediaContent || undefined,
    },
  });

  // Watch for subject and topic changes
  const watchedSubjectId = form.watch("subjectId");
  const watchedTopicId = form.watch("topicId");
  const watchedTitle = form.watch("title");
  const watchedSummary = form.watch("summary");
  const watchedContent = form.watch("content");

  // Check if form is valid for submit button
  const isFormValid = mode === 'edit' ? 
    (watchedTitle && watchedContent && watchedSummary && (initialData?.topicId || watchedTopicId)) : 
    (watchedTitle && watchedContent && watchedSummary && watchedSubjectId && watchedTopicId);

  // Debug log
  console.log('Form validation debug:', {
    mode,
    watchedTitle: !!watchedTitle,
    watchedContent: !!watchedContent,
    watchedSummary: !!watchedSummary,
    watchedSubjectId: !!watchedSubjectId,
    watchedTopicId: !!watchedTopicId,
    formStateIsValid: form.formState.isValid,
    isFormValid,
    formErrors: form.formState.errors,
    // Additional debug info
    allFormValues: form.getValues(),
    isDirty: form.formState.isDirty,
    isSubmitting: form.formState.isSubmitting,
    touchedFields: form.formState.touchedFields,
    dirtyFields: form.formState.dirtyFields
  });



  const { data: filteredTopics = [] } = useTopicsBySubject(watchedSubjectId || '');

  // Reset topicId when subject changes
  useEffect(() => {
    if (watchedSubjectId) {
      form.setValue("topicId", "");
    }
  }, [watchedSubjectId, form]);

  // Set subjectId based on topicId in edit mode
  useEffect(() => {
    if (mode === 'edit' && topicData && topicData.subjectId) {
      form.setValue("subjectId", topicData.subjectId.toString());
    }
  }, [mode, topicData, form]);

  const addArrayItem = (field: keyof typeof arrayFields) => {
    setArrayFields((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeArrayItem = (field: keyof typeof arrayFields, index: number) => {
    setArrayFields((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const updateArrayItem = (field: keyof typeof arrayFields, index: number, value: string) => {
    setArrayFields((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const handleGenerateSummary = async () => {
    if (!watchedTitle.trim()) {
      toast.error(t("messages.fillTitleFirst"));
      return;
    }

    const generatedSummary = await generateLessonSummary(watchedTitle);
    if (generatedSummary) {
      form.setValue("summary", generatedSummary, { shouldTouch: true, shouldDirty: true });
      toast.success(t("messages.summaryGenerated"));
    }
  };

  const handleGenerateContent = async () => {
    if (!watchedTitle.trim()) {
      toast.error(t("messages.fillTitleFirst"));
      return;
    }
    if (!watchedSummary.trim()) {
      toast.error(t("messages.fillSummaryFirst"));
      return;
    }

    const generatedContent = await generateLessonContent(watchedTitle, watchedSummary);
    if (generatedContent) {
      form.setValue("content", generatedContent, { shouldTouch: true, shouldDirty: true });
      toast.success(t("messages.contentGenerated"));
    }
  };

  const handleGenerateLearningObjectives = async () => {
    if (!watchedTitle.trim() || !watchedSummary.trim() || !watchedContent.trim()) {
      toast.error(t("messages.fillTitleSummaryContentFirst"));
      return;
    }

    const generatedObjectives = await generateLearningObjectives(watchedTitle, watchedSummary, watchedContent);
    if (generatedObjectives && generatedObjectives.length > 0) {
      setArrayFields((prev) => ({
        ...prev,
        learningObjectives: generatedObjectives,
      }));
      toast.success(t("messages.learningObjectivesGenerated"));
    }
  };

  const handleGeneratePrerequisites = async () => {
    if (!watchedTitle.trim() || !watchedSummary.trim()) {
      toast.error(t("messages.fillTitleSummaryFirst"));
      return;
    }

    const generatedPrerequisites = await generatePrerequisites(watchedTitle, watchedSummary);
    if (generatedPrerequisites && generatedPrerequisites.length > 0) {
      setArrayFields((prev) => ({
        ...prev,
        prerequisites: generatedPrerequisites,
      }));
      toast.success(t("messages.prerequisitesGenerated"));
    }
  };

  const handleGenerateKeyConcepts = async () => {
    if (!watchedTitle.trim() || !watchedContent.trim()) {
      toast.error(t("messages.fillTitleContentFirst"));
      return;
    }

    const generatedKeyConcepts = await generateKeyConcepts(watchedTitle, watchedContent);
    if (generatedKeyConcepts && generatedKeyConcepts.length > 0) {
      setArrayFields((prev) => ({
        ...prev,
        keyConcepts: generatedKeyConcepts,
      }));
      toast.success(t("messages.keyConceptsGenerated"));
    }
  };

  const handleGeneratePracticalApplications = async () => {
    if (!watchedTitle.trim() || !watchedContent.trim()) {
      toast.error(t("messages.fillTitleContentFirst"));
      return;
    }

    const generatedApplications = await generatePracticalApplications(watchedTitle, watchedContent);
    if (generatedApplications && generatedApplications.length > 0) {
      setArrayFields((prev) => ({
        ...prev,
        practicalApplications: generatedApplications,
      }));
      toast.success(t("messages.practicalApplicationsGenerated"));
    }
  };

  const onSubmit = async (data: z.infer<ReturnType<typeof createLessonFormSchema>>) => {
    
    const lessonData = {
      isActive: true,
      ...data,
      topicId: mode === 'edit' ? (initialData?.topicId ? initialData.topicId.toString() : '') : (data.topicId ? data.topicId.toString() : ''),
      orderIndex: 1, // Will be auto-generated by backend
      learningObjectives: arrayFields.learningObjectives.filter((item) => item.trim() !== "").length > 0 ? JSON.stringify(arrayFields.learningObjectives.filter((item) => item.trim() !== "")) : undefined,
      prerequisites: arrayFields.prerequisites.filter((item) => item.trim() !== "").length > 0 ? JSON.stringify(arrayFields.prerequisites.filter((item) => item.trim() !== "")) : undefined,
      keyConcepts: arrayFields.keyConcepts.filter((item) => item.trim() !== "").length > 0 ? JSON.stringify(arrayFields.keyConcepts.filter((item) => item.trim() !== "")) : undefined,
      practicalApplications: arrayFields.practicalApplications.filter((item) => item.trim() !== "").length > 0 ? JSON.stringify(arrayFields.practicalApplications.filter((item) => item.trim() !== "")) : undefined,
      mediaContent: data.mediaContent || undefined,
    };

    if (mode === 'edit' && initialData?.id) {
      // Handle edit mode - call update API
      
      updateLessonMutation.mutate(
          { id: initialData.id, data: lessonData },
          {
            onSuccess: () => {
              if (onLessonUpdated) {
                onLessonUpdated();
              }
            },
            onError: () => {
              // Handle error
            },
          }
        );
      return;
    }

    // Create mode
    createLessonMutation.mutate(lessonData, {
      onSuccess: (result) => {
        setCreatedLessonId(result.data.data.id.toString());
        setCreatedLessonData(result.data.data);
        setCurrentStep(2); // Move to examples step
      },
    });
  };

  const handleSkipStep = () => {
    if (currentStep === 2) {
      setCurrentStep(3); // Skip examples, go to practice
    } else if (currentStep === 3) {
      // Finish the process
      setCurrentStep(1);
      setCreatedLessonId(null);
      form.reset();
    }
  };

  const handleFinish = () => {
    toast.success(t("messages.lessonCreated"));
    setCurrentStep(1);
    setCreatedLessonId(null);
    setCreatedLessonData(undefined);
    form.reset();
    setArrayFields({
      learningObjectives: [""],
      prerequisites: [""],
      keyConcepts: [""],
      practicalApplications: [""],
    });
  };

  const renderStepIndicator = () => {
    const steps = [
      { number: 1, title: t("buttons.createLesson"), completed: currentStep > 1 },
      { number: 2, title: t("steps.addExamplesTitle"), completed: currentStep > 2 },
      { number: 3, title: t("steps.addPracticeTitle"), completed: false },
    ];

    return (
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${step.completed ? "bg-green-500 text-white" : currentStep === step.number ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"}`}>
              {step.completed ? "✓" : step.number}
            </div>
            <span className={`ml-2 text-sm ${currentStep === step.number ? "text-blue-600 font-medium" : "text-gray-600"}`}>{step.title}</span>
            {index < steps.length - 1 && <div className="w-8 h-px bg-gray-300 mx-4"></div>}
          </div>
        ))}
      </div>
    );
  };

  const handleGoBack = () => {
    if (onCancel) {
      // Use the provided onCancel callback for proper navigation
      onCancel();
    } else if (window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback: navigate to lessons list
      window.location.href = '/admin/lessons';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Back Button and Title - Only show in edit mode */}
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
            {t("titles.editLesson") || "Edit Pelajaran"}
          </h1>
        </div>
      )}
      {mode === 'create' && renderStepIndicator()}

      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {mode === 'edit' ? t("steps.editLessonTitle") || "Edit Lesson" : t("steps.createLessonTitle")}
            </CardTitle>
            <CardDescription>
              {mode === 'edit' ? t("steps.editLessonDescription") || "Update lesson information" : t("steps.createLessonDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Subject Selection - Only show in create mode */}
                {mode === 'create' && (
                  <FormField
                    control={form.control}
                    name="subjectId"
                    render={({ field }) => {
                      const selectedSubject = Array.isArray(subjects) ? subjects.find((s) => s.id === watchedSubjectId) : null;
                      return (
                        <FormItem>
                          <FormLabel>{t("form.fields.subject")}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className={`${watchedSubjectId ? "border-blue-500 bg-blue-50" : ""}`}>
                                <SelectValue placeholder={t("form.fields.selectSubject")}>
                                  {selectedSubject ? (
                                    <div className="flex items-center justify-between w-full">
                                      <span className="text-gray-900">{selectedSubject.name}</span>
                                      <CheckIcon className="h-4 w-4 text-green-600" />
                                    </div>
                                  ) : (
                                    <span className="text-gray-500">{t("form.fields.selectSubject")}</span>
                                  )}
                                </SelectValue>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.isArray(subjects) &&
                                subjects.map((subject) => (
                                  <SelectItem key={subject.id} value={subject.id}>
                                    {subject.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                )}

                {/* Topic Selection - Only show in create mode */}
                {mode === 'create' && (
                  <FormField
                    control={form.control}
                    name="topicId"
                    render={({ field }) => {
                      const selectedTopic = Array.isArray(filteredTopics) ? filteredTopics.find((t) => t.id === watchedTopicId) : null;
                      const placeholderText = !watchedSubjectId ? t("form.fields.selectSubjectFirst") : t("form.fields.selectTopic");
                      return (
                        <FormItem>
                          <FormLabel>{t("form.fields.topic")}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value?.toString()} defaultValue={field.value?.toString()} disabled={!watchedSubjectId}>
                            <FormControl>
                              <SelectTrigger className={`${watchedTopicId ? "border-blue-500 bg-blue-50" : ""} ${!watchedSubjectId ? "opacity-50" : ""}`}>
                                <SelectValue placeholder={placeholderText}>
                                  {selectedTopic ? (
                                    <div className="flex items-center justify-between w-full">
                                      <span className="text-gray-900">{selectedTopic.name}</span>
                                      <CheckIcon className="h-4 w-4 text-green-600" />
                                    </div>
                                  ) : (
                                    <span className="text-gray-500">{placeholderText}</span>
                                  )}
                                </SelectValue>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.isArray(filteredTopics) &&
                                filteredTopics.map((topic) => (
                                  <SelectItem key={topic.id} value={topic.id}>
                                    {topic.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                )}

                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.fields.title")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("form.fields.titlePlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Summary */}
                <FormField
                  control={form.control}
                  name="summary"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>{t("form.fields.summary")}</FormLabel>
                        <Button type="button" variant="outline" size="sm" onClick={handleGenerateSummary} disabled={isGenerating || !watchedTitle.trim()} className="text-xs">
                          {isGenerating ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              {t("actions.generating")}
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-3 w-3 mr-1" />
                              {t("actions.generateWithAI")}
                            </>
                          )}
                        </Button>
                      </div>
                      <FormControl>
                        <Textarea placeholder={t("form.fields.summaryPlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Content */}
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>{t("form.fields.content")}</FormLabel>
                        <Button type="button" variant="outline" size="sm" onClick={handleGenerateContent} disabled={isGenerating || !watchedTitle.trim() || !watchedSummary.trim()} className="text-xs">
                          {isGenerating ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              {t("actions.generating")}
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-3 w-3 mr-1" />
                              {t("actions.generateWithAI")}
                            </>
                          )}
                        </Button>
                      </div>
                      <FormControl>
                        <Textarea placeholder={t("form.fields.contentPlaceholder")} rows={8} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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

                {/* Estimated Duration */}
                <FormField
                  control={form.control}
                  name="estimatedDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.fields.duration")}</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="300" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                      </FormControl>
                      <FormDescription>{t("form.fields.durationDescription")}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Learning Objectives */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">{t("form.fields.learningObjectives")}</label>
                    <Button type="button" variant="outline" size="sm" onClick={handleGenerateLearningObjectives} disabled={isGenerating || !watchedTitle.trim() || !watchedSummary.trim() || !watchedContent.trim()} className="text-xs">
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          {t("actions.generating")}
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3 w-3 mr-1" />
                          {t("actions.generateWithAI")}
                        </>
                      )}
                    </Button>
                  </div>
                  {arrayFields.learningObjectives.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Input value={item} onChange={(e) => updateArrayItem("learningObjectives", index, e.target.value)} placeholder={t("form.fields.learningObjectivesPlaceholder")} className="flex-1" />
                      {arrayFields.learningObjectives.length > 1 && (
                        <Button type="button" variant="outline" size="sm" onClick={() => removeArrayItem("learningObjectives", index)}>
                          {t("actions.remove")}
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem("learningObjectives")}>
                    {t("actions.addLearningObjective")}
                  </Button>
                  <p className="text-sm text-gray-500">{t("form.fields.learningObjectivesExample")}</p>
                </div>

                {/* Prerequisites */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">{t("form.fields.prerequisites")}</label>
                    <Button type="button" variant="outline" size="sm" onClick={handleGeneratePrerequisites} disabled={isGenerating || !watchedTitle.trim() || !watchedSummary.trim()} className="text-xs">
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          {t("actions.generating")}
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3 w-3 mr-1" />
                          {t("actions.generateWithAI")}
                        </>
                      )}
                    </Button>
                  </div>
                  {arrayFields.prerequisites.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Input value={item} onChange={(e) => updateArrayItem("prerequisites", index, e.target.value)} placeholder={t("form.fields.prerequisitesPlaceholder")} className="flex-1" />
                      {arrayFields.prerequisites.length > 1 && (
                        <Button type="button" variant="outline" size="sm" onClick={() => removeArrayItem("prerequisites", index)}>
                          {t("actions.remove")}
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem("prerequisites")}>
                    {t("actions.addPrerequisite")}
                  </Button>
                  <p className="text-sm text-gray-500">{t("form.fields.prerequisitesExample")}</p>
                </div>

                {/* Key Concepts */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">{t("form.fields.keyConcepts")}</label>
                    <Button type="button" variant="outline" size="sm" onClick={handleGenerateKeyConcepts} disabled={isGenerating || !watchedTitle.trim() || !watchedContent.trim()} className="text-xs">
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          {t("actions.generating")}
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3 w-3 mr-1" />
                          {t("actions.generateWithAI")}
                        </>
                      )}
                    </Button>
                  </div>
                  {arrayFields.keyConcepts.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Input value={item} onChange={(e) => updateArrayItem("keyConcepts", index, e.target.value)} placeholder={t("form.fields.keyConceptsPlaceholder")} className="flex-1" />
                      {arrayFields.keyConcepts.length > 1 && (
                        <Button type="button" variant="outline" size="sm" onClick={() => removeArrayItem("keyConcepts", index)}>
                          {t("actions.remove")}
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem("keyConcepts")}>
                    {t("actions.addKeyConcept")}
                  </Button>
                  <p className="text-sm text-gray-500">{t("form.fields.keyConceptsExample")}</p>
                </div>

                {/* Practical Applications */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">{t("form.fields.practicalApplications")}</label>
                    <Button type="button" variant="outline" size="sm" onClick={handleGeneratePracticalApplications} disabled={isGenerating || !watchedTitle.trim() || !watchedContent.trim()} className="text-xs">
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          {t("actions.generating")}
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3 w-3 mr-1" />
                          {t("actions.generateWithAI")}
                        </>
                      )}
                    </Button>
                  </div>
                  {arrayFields.practicalApplications.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Input value={item} onChange={(e) => updateArrayItem("practicalApplications", index, e.target.value)} placeholder={t("form.fields.practicalApplicationsPlaceholder")} className="flex-1" />
                      {arrayFields.practicalApplications.length > 1 && (
                        <Button type="button" variant="outline" size="sm" onClick={() => removeArrayItem("practicalApplications", index)}>
                          {t("actions.remove")}
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem("practicalApplications")}>
                    {t("actions.addPracticalApplication")}
                  </Button>
                  <p className="text-sm text-gray-500">{t("form.fields.practicalApplicationsExample")}</p>
                </div>

                {/* Media Content */}
                <FormField
                  control={form.control}
                  name="mediaContent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.fields.mediaContent")}</FormLabel>
                      <FormControl>
                        <Textarea placeholder={t("form.fields.mediaContentPlaceholder")} {...field} />
                      </FormControl>
                      <FormDescription>{t("form.fields.mediaContentExample")}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  disabled={(
                    mode === 'create' && (
                      createLessonMutation.isPending || 
                      !watchedSubjectId || 
                      !watchedTopicId || 
                      !isFormValid
                    )
                  ) || (
                    mode === 'edit' && (
                      updateLessonMutation.isPending ||
                      !lessonId || 
                      !isFormValid
                    )
                  )} 
                  className="w-full"
                >
                  {(mode === 'create' && createLessonMutation.isPending) || (mode === 'edit' && updateLessonMutation.isPending) ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {mode === 'edit' ? t("actions.updating") || "Updating..." : t("actions.creating")}
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-4 w-4 mr-2" />
                      {mode === 'edit' ? t("buttons.updateLesson") || "Update Lesson" : t("buttons.createLesson")}
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Examples - Only show in create mode */}
      {mode === 'create' && currentStep === 2 && createdLessonId && (
        <Card>
          <CardHeader>
            <CardTitle>{t("steps.step2Title")}</CardTitle>
            <CardDescription>{t("steps.step2Description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ExampleForm
              lessonId={createdLessonId}
              lessonData={createdLessonData}
              onExampleAdded={() => {
                // Optional: refresh or update state
              }}
            />
            <div className="flex gap-4 mt-6">
              <Button variant="outline" onClick={handleSkipStep} className="flex-1">
                {t("actions.skipForNow")}
              </Button>
              <Button onClick={() => setCurrentStep(3)} className="flex-1">
                {t("actions.continueToExercises")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Practice Questions - Only show in create mode */}
      {mode === 'create' && currentStep === 3 && createdLessonId && (
        <Card>
          <CardHeader>
            <CardTitle>{t("steps.step3Title")}</CardTitle>
            <CardDescription>{t("steps.step3Description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <PracticeForm
              lessonId={createdLessonId}
              lessonData={createdLessonData}
              onPracticeAdded={() => {
                // Optional: refresh or update state
              }}
            />
            <div className="flex gap-4 mt-6">
              <Button variant="outline" onClick={handleSkipStep} className="flex-1">
                {t("actions.skipForNow")}
              </Button>
              <Button onClick={handleFinish} className="flex-1">
                {t("actions.finish")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LessonForm;
