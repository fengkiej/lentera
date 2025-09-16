import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { BookOpen, Clock, BarChart3, Eye, EyeOff, CheckIcon, Loader2 } from "lucide-react";
import { useSubjects, useCreateTopic } from "../hooks/useApi";
import { useTranslation } from "react-i18next";



const createTopicFormSchema = (t: (key: string) => string) => z.object({
  subjectId: z.string().min(1, t('validation.subjectRequired')),
  name: z.string().min(1, t('validation.nameRequired')).max(100, t('validation.nameMaxLength')),
  description: z.string().min(1, t('validation.descriptionRequired')).max(500, t('validation.descriptionMaxLength')),
  orderIndex: z.number().min(1, t('validation.orderMinValue')),
  estimatedDuration: z.number().min(1, t('validation.durationMinValue')).max(300, t('validation.durationMaxValue')),
  difficultyLevel: z.enum(["beginner", "intermediate", "advanced"]),
  isActive: z.boolean().default(true),
});

type TopicFormData = z.infer<ReturnType<typeof createTopicFormSchema>>;

interface TopicFormProps {
  onTopicCreated?: () => void;
  onCancel?: () => void;
}

const getDifficultyOptions = (t: (key: string) => string) => [
  { value: "beginner", label: t('difficulty.beginner'), color: "bg-green-100 text-green-800" },
  { value: "intermediate", label: t('difficulty.intermediate'), color: "bg-yellow-100 text-yellow-800" },
  { value: "advanced", label: t('difficulty.advanced'), color: "bg-red-100 text-red-800" },
];

const TopicForm: React.FC<TopicFormProps> = ({ onTopicCreated, onCancel }) => {
  const { t } = useTranslation('topics');
  const { data: subjects = [] } = useSubjects();
  const createTopicMutation = useCreateTopic();
  
  const topicFormSchema = createTopicFormSchema(t);
  const difficultyOptions = getDifficultyOptions(t);

  const form = useForm({
    resolver: zodResolver(topicFormSchema),
    defaultValues: {
      subjectId: "",
      name: "",
      description: "",
      orderIndex: 1,
      estimatedDuration: 30,
      difficultyLevel: "beginner",
      isActive: true,
    },
  });

  const watchedSubjectId = form.watch("subjectId");
  const watchedDifficultyLevel = form.watch("difficultyLevel");
  const watchedIsActive = form.watch("isActive");
  const watchedEstimatedDuration = form.watch("estimatedDuration");



  const onSubmit = async (data: TopicFormData) => {
    createTopicMutation.mutate({
      ...data,
      subjectId: data.subjectId,
    }, {
      onSuccess: () => {
        form.reset();
        if (onTopicCreated) {
          onTopicCreated();
        }
      }
    });
  };

  const selectedSubject = subjects.find((s) => s.id === watchedSubjectId);
  const selectedDifficulty = difficultyOptions.find((d: { value: string; label: string; color: string }) => d.value === watchedDifficultyLevel);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} ${t('duration.minutes')}`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}${t('duration.hoursShort')} ${remainingMinutes}${t('duration.minutesShort')}` : `${hours} ${t('duration.hours')}`;
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {t('form.title')}
          </CardTitle>
          <CardDescription>{t('form.description')}</CardDescription>
        </CardHeader>
        <CardContent>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Preview Card */}
              <div className="p-4 border rounded-lg bg-gray-50">
                <h3 className="text-sm font-medium text-gray-700 mb-2">{t('form.preview.title')}</h3>
                <div className="p-4 rounded-lg bg-white border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-lg">{form.watch("name") || t('form.preview.defaultName')}</h4>
                        {selectedDifficulty && <span className={`px-2 py-1 text-xs rounded-full ${selectedDifficulty.color}`}>{selectedDifficulty.label}</span>}
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{form.watch("description") || t('form.preview.defaultDescription')}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(watchedEstimatedDuration)}
                        </span>
                        <span>{t('form.preview.subject')}: {selectedSubject?.name || t('form.preview.selectSubject')}</span>
                        <span>#{form.watch("orderIndex")}</span>
                      </div>
                    </div>
                    <div className="ml-4">{watchedIsActive ? <Eye className="h-4 w-4 text-green-600" /> : <EyeOff className="h-4 w-4 text-gray-400" />}</div>
                  </div>
                </div>
              </div>

              {/* Subject Selection */}
              <FormField
                control={form.control}
                name="subjectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.fields.subject')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className={`${watchedSubjectId ? "border-blue-500 bg-blue-50" : ""}`}>
                          <div className="flex items-center justify-between w-full">
                            <span className={selectedSubject ? "text-gray-900" : "text-gray-500"}>{selectedSubject ? selectedSubject.name : t('form.fields.selectSubject')}</span>
                            {selectedSubject && <CheckIcon className="h-4 w-4 text-green-600" />}
                          </div>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>{t('form.fields.subjectDescription')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('form.fields.name')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('form.fields.namePlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="orderIndex"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('form.fields.order')}</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" placeholder="1" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 1)} />
                      </FormControl>
                      <FormDescription>{t('form.fields.orderDescription')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.fields.description')}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t('form.fields.descriptionPlaceholder')} className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="estimatedDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {t('form.fields.duration')}
                      </FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="300" placeholder="30" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 30)} />
                      </FormControl>
                      <FormDescription>{t('form.fields.durationDescription')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="difficultyLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        {t('form.fields.difficulty')}
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('form.fields.difficultyPlaceholder')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {difficultyOptions.map((difficulty) => (
                            <SelectItem key={difficulty.value} value={difficulty.value}>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 text-xs rounded-full ${difficulty.color}`}>{difficulty.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">{t('form.fields.activeStatus')}</FormLabel>
                      <FormDescription>{t('form.fields.activeStatusDescription')}</FormDescription>
                    </div>
                    <FormControl>
                      <Button type="button" variant={field.value ? "default" : "outline"} size="sm" onClick={() => field.onChange(!field.value)} className="ml-auto">
                        {field.value ? (
                          <>
                            <Eye className="h-4 w-4 mr-2" /> {t('status.active')}
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-4 w-4 mr-2" /> {t('status.inactive')}
                          </>
                        )}
                      </Button>
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                {onCancel && (
                  <Button type="button" variant="outline" onClick={onCancel}>
                    {t('actions.cancel')}
                  </Button>
                )}
                <Button type="submit" disabled={createTopicMutation.isPending || !watchedSubjectId}>
                  {createTopicMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t('actions.creating')}
                    </>
                  ) : (
                    t('actions.create')
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TopicForm;
