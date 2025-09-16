import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { ArrowLeft, Plus, Edit, Trash2, BookOpen, HelpCircle } from "lucide-react";
import { useLesson, useExamplesByLesson, usePracticeByLesson, useDeleteExample, useDeletePractice } from "../hooks/useApi";
import ExampleForm from "./ExampleForm";
import PracticeForm from "./PracticeForm";
import UniversalForm from "./UniversalForm";
import { useTranslation } from "react-i18next";

interface LessonDetailViewProps {
  lessonId: string;
  onBack: () => void;
}

const LessonDetailView: React.FC<LessonDetailViewProps> = ({ lessonId, onBack }) => {
  const { t } = useTranslation("lessons");
  const [activeTab] = useState("examples");
  const [showAddExample, setShowAddExample] = useState(false);
  const [showAddPractice, setShowAddPractice] = useState(false);
  const [editingExampleId, setEditingExampleId] = useState<string | null>(null);
  const [editingPracticeId, setEditingPracticeId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: "example" | "practice" } | null>(null);

  const { data: lesson, isLoading: lessonLoading, error: lessonError } = useLesson(lessonId);
  const { data: examples = [], isLoading: examplesLoading, refetch: refetchExamples } = useExamplesByLesson(lessonId);
  const { data: practices = [], isLoading: practicesLoading, refetch: refetchPractices } = usePracticeByLesson(lessonId);
  const deleteExample = useDeleteExample();
  const deletePractice = useDeletePractice();

  if (lessonLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">{t("messages.loadingLessonDetails")}</div>
        </CardContent>
      </Card>
    );
  }

  if (lessonError || !lesson) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">{t("messages.errorLoadingLessonDetails")}</div>
        </CardContent>
      </Card>
    );
  }

  const handleExampleAdded = () => {
    setShowAddExample(false);
    refetchExamples();
  };

  const handlePracticeAdded = () => {
    setShowAddPractice(false);
    refetchPractices();
  };

  const handleExampleUpdated = () => {
    setEditingExampleId(null);
    refetchExamples();
  };

  const handlePracticeUpdated = () => {
    setEditingPracticeId(null);
    refetchPractices();
  };

  const handleDeleteExample = (exampleId: string) => {
    setItemToDelete({ id: exampleId, type: "example" });
    setDeleteConfirmOpen(true);
  };

  const handleDeletePractice = (practiceId: string) => {
    setItemToDelete({ id: practiceId, type: "practice" });
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      if (itemToDelete.type === "example") {
        await deleteExample.mutateAsync(itemToDelete.id);
        refetchExamples();
      } else {
        await deletePractice.mutateAsync(itemToDelete.id);
        refetchPractices();
      }
    } catch (error) {
      console.error(`Error deleting ${itemToDelete.type}:`, error);
    } finally {
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  // Show edit forms
  if (editingExampleId) {
    return (
      <UniversalForm
        mode="edit"
        type="example"
        lessonId={lessonId}
        itemId={editingExampleId}
        onSuccess={handleExampleUpdated}
        onCancel={() => setEditingExampleId(null)}
      />
    );
  }

  if (editingPracticeId) {
    return (
      <UniversalForm
        mode="edit"
        type="practice"
        lessonId={lessonId}
        itemId={editingPracticeId}
        onSuccess={handlePracticeUpdated}
        onCancel={() => setEditingPracticeId(null)}
      />
    );
  }

  // Show add forms
  if (showAddExample) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowAddExample(false)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("actions.backToLessonDetail")}
          </Button>
        </div>
        <ExampleForm lessonId={lessonId} onExampleAdded={handleExampleAdded} />
      </div>
    );
  }

  if (showAddPractice) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowAddPractice(false)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("actions.backToLessonDetail")}
          </Button>
        </div>
        <PracticeForm lessonId={lessonId} onPracticeAdded={handlePracticeAdded} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("actions.backToLessonList")}
        </Button>
      </div>

      {/* Lesson Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{lesson.title}</CardTitle>
              <CardDescription className="mt-2">
                {t("labels.topicId")}: {lesson.topicId}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary">
                {t("labels.order")}: {lesson.orderIndex}
              </Badge>
              <Badge variant="outline">{t("difficulty.beginner")}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">{t("labels.lessonContent")}</h4>
              <p className="text-gray-600 whitespace-pre-wrap">{lesson.content}</p>
            </div>

            {lesson.content && (
              <div>
                <h4 className="font-semibold mb-2">{t("labels.summary")}</h4>
                <p className="text-gray-600">{lesson.content}</p>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {lesson.orderIndex && (
                <div>
                  <span className="font-medium">{t("labels.order")}:</span>
                  <p className="text-gray-600">
                    {lesson.orderIndex}
                  </p>
                </div>
              )}
              <div>
                <span className="font-medium">{t("labels.examples")}:</span>
                <p className="text-gray-600">
                  {examples.length} {t("labels.examples").toLowerCase()}
                </p>
              </div>
              <div>
                <span className="font-medium">{t("labels.practice")}:</span>
                <p className="text-gray-600">
                  {practices.length} {t("labels.questions")}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Management Tabs */}
      <Tabs defaultValue={activeTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="examples" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            {t("labels.lessonExamples")} ({examples.length})
          </TabsTrigger>
          <TabsTrigger value="practice" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            {t("labels.practiceQuestions")} ({practices.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="examples" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t("labels.lessonExamples")}</CardTitle>
                  <CardDescription>{t("descriptions.manageExamples")}</CardDescription>
                </div>
                <Button onClick={() => setShowAddExample(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("actions.addExample")}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {examplesLoading ? (
                <div className="text-center py-8">{t("messages.loadingExamples")}</div>
              ) : examples.length === 0 ? (
                <div className="text-center py-8 text-gray-500">{t("messages.noExamplesYet")}</div>
              ) : (
                <div className="space-y-4">
                  {examples.map((example) => (
                    <div key={example.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold">{example.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{example.content}</p>
                          <p className="text-xs text-gray-500 mt-2">{example.content}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button variant="outline" size="sm" onClick={() => setEditingExampleId(example.id)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteExample(example.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex gap-2 text-xs text-gray-400">
                        <span>
                          {t("labels.order")}: {example.orderIndex}
                        </span>
                        <span>•</span>
                        <span>
                          {t("labels.type")}: {t("labels.text")}
                        </span>
                        {example.title && (
                          <>
                            <span>•</span>
                            <span>{t("labels.hasMedia")}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="practice" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t("labels.practiceQuestions")}</CardTitle>
                  <CardDescription>{t("descriptions.managePracticeQuestions")}</CardDescription>
                </div>
                <Button onClick={() => setShowAddPractice(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("actions.addQuestion")}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {practicesLoading ? (
                <div className="text-center py-8">{t("messages.loadingPracticeQuestions")}</div>
              ) : practices.length === 0 ? (
                <div className="text-center py-8 text-gray-500">{t("messages.noPracticeQuestionsYet")}</div>
              ) : (
                <div className="space-y-4">
                  {practices.map((practice) => (
                    <div key={practice.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold">{practice.question}</h4>
                          {practice.correctAnswer && (
                            <div className="mt-2">
                              <p className="text-sm font-medium mb-1">{t("labels.options")}:</p>
                              <ul className="text-sm text-gray-600 list-disc list-inside">
                                <li className="text-green-600 font-medium">A. {practice.correctAnswer} ✓</li>
                              </ul>
                            </div>
                          )}
                          {practice.correctAnswer && (
                            <p className="text-sm text-green-600 mt-2">
                              <strong>{t("labels.answer")}:</strong> {practice.correctAnswer}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">{practice.explanation}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button variant="outline" size="sm" onClick={() => setEditingPracticeId(practice.id)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeletePractice(practice.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex gap-2 text-xs text-gray-400">
                        <span>
                          {t("labels.order")}: {practice.orderIndex}
                        </span>
                        <span>•</span>
                        <span>
                          {t("labels.type")}: {practice.questionType}
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
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dialogs.confirmDeletion")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("dialogs.confirmDeletionMessage", {
                item: itemToDelete?.type === "example" ? t("labels.example") : t("labels.practiceQuestion"),
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("actions.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              {t("actions.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LessonDetailView;
