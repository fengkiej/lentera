import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { Loader2, Trash2, Edit } from "lucide-react";
import SubjectEditForm from "./SubjectEditForm";
import { useSubjects, useDeleteSubject } from "../hooks/useApi";
import { useTranslation } from "react-i18next";



const SubjectList: React.FC = () => {
  const { t } = useTranslation('subjects');
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const { data: subjects = [], isLoading: loading, error } = useSubjects();
  const deleteSubjectMutation = useDeleteSubject();

  const handleDelete = (id: string) => {
    deleteSubjectMutation.mutate(id);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">{t('loading')}</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">{t('error', { message: error.message })}</div>
        </CardContent>
      </Card>
    );
  }

  // Show edit form if editing
  if (editingSubjectId) {
    return (
      <SubjectEditForm
        subjectId={editingSubjectId}
        onSave={() => {
          setEditingSubjectId(null);
        }}
        onCancel={() => setEditingSubjectId(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {!Array.isArray(subjects) || subjects.length === 0 ? (
            <div className="text-center text-gray-500 py-8">{t('empty')}</div>
          ) : (
            <div className="space-y-4">
              {subjects.map((subject) => (
                <div key={subject.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{subject.name}</h3>
                    <p className="text-gray-600 mt-1">{subject.description}</p>
                    <p className="text-sm text-gray-400 mt-2">{t('createdAt', { date: new Date(subject.createdAt).toLocaleDateString("id-ID") })}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingSubjectId(subject.id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      {t('actions.edit')}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" disabled={deleteSubjectMutation.isPending}>
                          {deleteSubjectMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 mr-2" />
                          )}
                          {t('actions.delete')}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('deleteDialog.title')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('deleteDialog.description', { name: subject.name })}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('deleteDialog.cancel')}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(subject.id)} className="bg-red-600 hover:bg-red-700">
                            {t('deleteDialog.confirm')}
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

export default SubjectList;
