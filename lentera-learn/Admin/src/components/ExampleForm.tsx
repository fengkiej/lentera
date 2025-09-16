import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Trash2, Plus, Sparkles } from "lucide-react";
import { useAIGeneration } from "../hooks/useAI";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useUpdateExample } from "../hooks/useApi";

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

interface ExampleFormProps {
  lessonId?: string;
  lessonData?: LessonData;
  onExampleAdded?: () => void;
  // Edit mode props
  mode?: 'create' | 'edit';
  exampleId?: string;
  initialData?: {
    title: string;
    content: string;
    explanation: string;
    exampleType: string;
    mediaUrl?: string;
  };
  onExampleUpdated?: () => void;
}

const createExampleFormSchema = (t: (key: string, options?: Record<string, unknown>) => string) =>
  z.object({
    title: z.string().min(1, t("validation.titleRequired")).max(100, t("validation.titleMaxLength")),
    content: z.string().min(1, t("validation.contentRequired")),
    explanation: z.string().min(1, t("validation.explanationRequired")),
    exampleType: z.enum(["text", "image", "video", "audio"]),
    mediaUrl: z.string().optional(),
  });

type ExampleFormData = z.infer<ReturnType<typeof createExampleFormSchema>>;

interface Example {
  id: string;
  title: string;
  content: string;
  explanation: string;
  exampleType: string;
  mediaUrl?: string;
}

const ExampleForm: React.FC<ExampleFormProps> = ({ 
  lessonId, 
  lessonData, 
  onExampleAdded,
  mode = 'create',
  exampleId,
  initialData,
  onExampleUpdated
}) => {
  const { t } = useTranslation("lessons");
  const [examples, setExamples] = useState<Example[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { generateExampleContent, isGenerating } = useAIGeneration();
  const [message, setMessage] = useState("");
  const updateExample = useUpdateExample();
  const backendUrl = import.meta.env.VITE_API_BASE_URL;

  const form = useForm({
    resolver: zodResolver(createExampleFormSchema(t)),
    defaultValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
      explanation: initialData?.explanation || "",
      exampleType: (initialData?.exampleType as "text" | "image" | "video" | "audio") || "text",
      mediaUrl: initialData?.mediaUrl || "",
    },
  });

  const handleGenerateExample = async () => {
    try {
      // Use lesson data if available, otherwise fallback to generic context
      const context = lessonData ? `Lesson: ${lessonData.title}\n\nKonten: ${lessonData.content}\n\nRingkasan: ${lessonData.summary}` : "lesson pembelajaran";

      const result = await generateExampleContent(context);
      if (result) {
        form.setValue("title", result.title);
        form.setValue("content", result.content);
        form.setValue("explanation", result.explanation);
        toast.success(t("messages.exampleGeneratedSuccess"));
      } else {
        toast.error(t("messages.exampleGenerationFailed"));
      }
    } catch (error) {
      console.error("Error generating example:", error);
      toast.error(t("messages.exampleGenerationError"));
    }
  };

  const onSubmit = async (data: ExampleFormData) => {
    if (!lessonId && mode === 'create') {
      setMessage(t("messages.lessonIdRequired"));
      return;
    }

    if (!exampleId && mode === 'edit') {
      setMessage(t("messages.exampleIdRequired"));
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      if (mode === 'edit' && exampleId) {
        // Use React Query hook for edit mode
        await updateExample.mutateAsync({
          id: exampleId,
          data: {
            ...data,
            lessonId: lessonId ? lessonId : undefined,
          }
        });
        
        // Call callback after successful update
        if (onExampleUpdated) {
          onExampleUpdated();
        }
      } else {
        // Keep fetch API for create mode
        const url = `${backendUrl}/admin/examples`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...data,
            lessonId: parseInt(lessonId!),
          }),
        });

        if (response.ok) {
          const result = await response.json();
          const successMessage = t("messages.exampleAddedSuccess");
          
          console.log(successMessage);
          setMessage(successMessage);
          form.reset();
          
          // Add to local state
          const newExample: Example = {
            id: result.data.id.toString(),
            ...data,
          };
          setExamples((prev) => [...prev, newExample]);
          
          // Call callback
          if (onExampleAdded) {
            onExampleAdded();
          }
        } else {
          const errorData = await response.json();
          const errorMessage = errorData.message || t("messages.exampleAddFailed");
          setMessage(errorMessage);
        }
      }
    } catch (error) {
      console.error(`Error ${mode === 'edit' ? 'updating' : 'adding'} example:`, error);
      const errorMessage = mode === 'edit'
        ? t("messages.exampleUpdateError")
        : t("messages.exampleAddError");
      setMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const removeExample = (index: number) => {
    setExamples((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {mode === 'edit' ? t("form.editExampleTitle") : t("form.addExampleTitle")}
          </CardTitle>
          <CardDescription>
            {mode === 'edit' ? t("form.editExampleDescription") : t("form.addExampleDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {message && <div className={`p-3 rounded-md mb-4 ${message.includes("berhasil") || message.includes("success") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{message}</div>}

          <div className="mb-4">
            <Button type="button" variant="outline" onClick={handleGenerateExample} disabled={isGenerating} className="w-full">
              <Sparkles className="h-4 w-4 mr-2" />
              {isGenerating ? t("actions.generating") : t("actions.generateWithAI")}
            </Button>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.fields.exampleTitle")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("form.fields.exampleTitlePlaceholder")} {...field} />
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
                    <FormLabel>{t("form.fields.exampleContent")}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t("form.fields.exampleContentPlaceholder")} rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              {/* Example Type */}
              <FormField
                control={form.control}
                name="exampleType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.fields.exampleType")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("form.fields.selectExampleType")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="text">{t("form.fields.typeText")}</SelectItem>
                        <SelectItem value="image">{t("form.fields.typeImage")}</SelectItem>
                        <SelectItem value="video">{t("form.fields.typeVideo")}</SelectItem>
                        <SelectItem value="audio">{t("form.fields.typeAudio")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Media URL */}
              <FormField
                control={form.control}
                name="mediaUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.fields.mediaUrl")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("form.fields.mediaUrlPlaceholder")} {...field} />
                    </FormControl>
                    <FormDescription>{t("form.fields.mediaUrlDescription")}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button 
                type="submit" 
                disabled={isLoading || (mode === 'create' && !lessonId) || (mode === 'edit' && !exampleId)} 
                className="w-full"
              >
                {isLoading 
                  ? (mode === 'edit' ? t("actions.updatingExample") : t("actions.addingExample"))
                  : (mode === 'edit' ? t("actions.updateExample") : t("actions.addExample"))
                }
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Examples List */}
      {examples.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("labels.addedExamples")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {examples.map((example, index) => (
                <div key={example.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{example.title}</h4>
                    <Button variant="outline" size="sm" onClick={() => removeExample(index)} className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{example.content}</p>
                  <p className="text-xs text-gray-500 mb-2">{example.explanation}</p>
                  <div className="flex gap-2 text-xs text-gray-400">
                    <span>
                      {t("labels.type")}: {example.exampleType}
                    </span>
                    {example.mediaUrl && (
                      <>
                        <span>•</span>
                        <span>
                          {t("labels.media")}: {t("labels.available")}
                        </span>
                      </>
                    )}
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

export default ExampleForm;
