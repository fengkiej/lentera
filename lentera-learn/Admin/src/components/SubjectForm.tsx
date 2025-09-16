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
import { BookOpen, Palette, Hash, Eye, EyeOff, Loader2 } from "lucide-react";
import { useCreateSubject } from "../hooks/useApi";
import { useTranslation } from "react-i18next";

const createSubjectFormSchema = (t: (key: string) => string) => z.object({
  name: z.string().min(1, t('validation.nameRequired')).max(100, t('validation.nameMaxLength')),
  description: z.string().min(1, t('validation.descriptionRequired')).max(500, t('validation.descriptionMaxLength')),
  icon: z.string().optional(),
  color: z.string().optional(),
  orderIndex: z.number().min(1, t('validation.orderMinValue')),
  isActive: z.boolean().default(true),
});

type SubjectFormData = z.infer<ReturnType<typeof createSubjectFormSchema>>;

interface SubjectFormProps {
  onSubjectCreated?: () => void;
  onCancel?: () => void;
}

const getColorOptions = (t: (key: string) => string) => [
  { value: "blue", label: t('colors.blue'), color: "bg-blue-500" },
  { value: "green", label: t('colors.green'), color: "bg-green-500" },
  { value: "purple", label: t('colors.purple'), color: "bg-purple-500" },
  { value: "red", label: t('colors.red'), color: "bg-red-500" },
  { value: "yellow", label: t('colors.yellow'), color: "bg-yellow-500" },
  { value: "indigo", label: t('colors.indigo'), color: "bg-indigo-500" },
  { value: "pink", label: t('colors.pink'), color: "bg-pink-500" },
  { value: "gray", label: t('colors.gray'), color: "bg-gray-500" },
];

const getIconOptions = (t: (key: string) => string) => [
  { value: "book-open", label: t('icons.book') },
  { value: "graduation-cap", label: t('icons.academic') },
  { value: "calculator", label: t('icons.math') },
  { value: "globe", label: t('icons.geography') },
  { value: "atom", label: t('icons.science') },
  { value: "palette", label: t('icons.art') },
  { value: "music", label: t('icons.music') },
  { value: "dumbbell", label: t('icons.sports') },
];

const SubjectForm: React.FC<SubjectFormProps> = ({ onSubjectCreated, onCancel }) => {
  const { t } = useTranslation('subjects');
  const createSubjectMutation = useCreateSubject();
  const subjectFormSchema = createSubjectFormSchema(t);
  const colorOptions = getColorOptions(t);
  const iconOptions = getIconOptions(t);

  const form = useForm({
    resolver: zodResolver(subjectFormSchema),
    defaultValues: {
      name: "",
      description: "",
      icon: "book-open",
      color: "blue",
      orderIndex: 1,
      isActive: true,
    },
  });

  const watchedColor = form.watch("color");
  const watchedIcon = form.watch("icon");
  const watchedIsActive = form.watch("isActive");

  const onSubmit = async (data: SubjectFormData) => {
    try {
      await createSubjectMutation.mutateAsync(data);
      form.reset();
      if (onSubjectCreated) {
        onSubjectCreated();
      }
    } catch (error) {
      // Error handling sudah dilakukan di useCreateSubject hook
      console.error("Error creating subject:", error);
    }
  };

  const selectedColor = colorOptions.find((c) => c.value === watchedColor);
  const selectedIcon = iconOptions.find((i) => i.value === watchedIcon);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <BookOpen className="h-5 w-5 text-blue-600" />
            {t('form.title')}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {t('form.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Preview Card */}
              <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  {t('preview.title')}
                </h3>
                <div className={`p-4 rounded-lg ${selectedColor?.color || "bg-blue-500"} text-white shadow-md transition-all duration-200`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{selectedIcon?.label.split(" ")[0] || "📚"}</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{form.watch("name") || t('preview.defaultName')}</h4>
                      <p className="text-sm opacity-90 mt-1">{form.watch("description") || t('preview.defaultDescription')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 text-xs bg-white/20 text-white rounded-full border border-white/30 font-medium">
                        #{form.watch("orderIndex")}
                      </span>
                      {watchedIsActive ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4 opacity-60" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">{t('form.name')}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t('form.namePlaceholder')} 
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500" 
                          {...field} 
                        />
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
                      <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        {t('form.order')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="1"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormDescription className="text-gray-500">
                        {t('form.orderDescription')}
                      </FormDescription>
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
                    <FormLabel className="text-gray-700 font-medium">{t('form.description')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('form.descriptionPlaceholder')}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-[100px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-gray-500">
                      {t('form.descriptionHint')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        {t('form.color')}
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder={t('form.colorPlaceholder')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {colorOptions.map((color) => (
                            <SelectItem key={color.value} value={color.value}>
                              <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded-full ${color.color}`}></div>
                                {color.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-gray-500">
                        {t('form.colorDescription')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">{t('form.icon')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder={t('form.iconPlaceholder')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {iconOptions.map((icon) => (
                            <SelectItem key={icon.value} value={icon.value}>
                              {icon.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-gray-500">
                        {t('form.iconDescription')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-4 bg-gray-50/50">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base font-medium text-gray-700">
                        {t('form.activeStatus')}
                      </FormLabel>
                      <FormDescription className="text-gray-500">
                        {t('form.activeStatusDescription')}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Button
                        type="button"
                        variant={field.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => field.onChange(!field.value)}
                        className={`min-w-[80px] ${field.value ? 'bg-green-600 hover:bg-green-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                      >
                        {field.value ? (
                          <>
                            <Eye className="h-4 w-4 mr-1" />
                            {t('status.active')}
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-4 w-4 mr-1" />
                            {t('status.inactive')}
                          </>
                        )}
                      </Button>
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                <Button
                  type="submit"
                  disabled={createSubjectMutation.isPending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 transition-colors"
                >
                  {createSubjectMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t('actions.creating')}
                    </>
                  ) : (
                    <>
                      <BookOpen className="h-4 w-4 mr-2" />
                      {t('actions.create')}
                    </>
                  )}
                </Button>
                {onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={createSubjectMutation.isPending}
                    className="flex-1 sm:flex-none sm:min-w-[120px] border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2.5"
                  >
                    {t('actions.cancel')}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubjectForm;
