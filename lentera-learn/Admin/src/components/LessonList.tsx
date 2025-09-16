import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { Edit, Trash2, Loader2, Eye } from "lucide-react";
import { useLessons, useDeleteLesson } from "../hooks/useApi";
import UniversalForm from "./UniversalForm";
import LessonDetailView from "./LessonDetailView";
import { useTranslation } from "react-i18next";

const LessonList: React.FC = () => {
  const { t } = useTranslation("lessons");
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [viewingLessonId, setViewingLessonId] = useState<string | null>(null);
  const { data: lessons = [], isLoading: loading, error } = useLessons();
  const deleteLessonMutation = useDeleteLesson();

  const handleDelete = (id: string) => {
    deleteLessonMutation.mutate(id);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">{t("loading")}</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            {t("error")}: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show detail view if viewing
  if (viewingLessonId) {
    return <LessonDetailView lessonId={viewingLessonId} onBack={() => setViewingLessonId(null)} />;
  }

  // Show edit form if editing
  if (editingLessonId) {
    const lessonToEdit = lessons.find(lesson => lesson.id === editingLessonId);
    return (
      <UniversalForm
        mode="edit"
        type="lesson"
        itemId={editingLessonId}
        lessonData={lessonToEdit}
        onSuccess={() => {
          setEditingLessonId(null);
        }}
        onCancel={() => setEditingLessonId(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          {lessons.length === 0 ? (
            <div className="text-center text-gray-500 py-8">{t("emptyState")}</div>
          ) : (
            <div className="space-y-4">
              {lessons.map((lesson) => (
                <div key={lesson.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{lesson.title}</h3>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">{t("labels.order")}: {lesson.orderIndex}</span>
                    </div>
                    <p className="text-gray-600 mt-1 line-clamp-2">{lesson.content}</p>

                    <p className="text-sm text-gray-400 mt-2">
                      {t("createdAt")} {new Date(lesson.createdAt).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button variant="outline" size="sm" onClick={() => setViewingLessonId(lesson.id)}>
                      <Eye className="h-4 w-4 mr-2" />
                      {t("actions.view")}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setEditingLessonId(lesson.id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      {t("actions.edit")}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" disabled={deleteLessonMutation.isPending}>
                          {deleteLessonMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                          {t("actions.delete")}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t("deleteDialog.title")}</AlertDialogTitle>
                          <AlertDialogDescription>{t("deleteDialog.description", { title: lesson.title })}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t("actions.cancel")}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(lesson.id)} className="bg-red-600 hover:bg-red-700">
                            {t("actions.delete")}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LessonList;
