import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { Edit, Trash2, Loader2 } from "lucide-react";
import { useTopics, useDeleteTopic } from "../hooks/useApi";
import TopicEditForm from "./TopicEditForm";
import { useTranslation } from "react-i18next";

const TopicList: React.FC = () => {
  const { t } = useTranslation('topics');
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const { data: topics = [], isLoading: loading, error } = useTopics();
  const deleteTopicMutation = useDeleteTopic();

  const handleDelete = (id: string) => {
    deleteTopicMutation.mutate(id);
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
          <div className="text-center text-red-600">{t('error')}: {error.message}</div>
        </CardContent>
      </Card>
    );
  }

  // Show edit form if editing
  if (editingTopicId) {
    return (
      <TopicEditForm
        topicId={editingTopicId}
        onSave={() => {
          setEditingTopicId(null);
        }}
        onCancel={() => setEditingTopicId(null)}
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
          {Array.isArray(topics) && topics.length > 0 ? (
            <div className="space-y-4">
              {topics.map((topic) => (
                <div key={topic.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{topic.name}</h3>
                    <p className="text-gray-600 mt-1">{topic.description}</p>
                    <p className="text-sm text-gray-400 mt-2">{t('createdAt')}: {new Date(topic.createdAt).toLocaleDateString("id-ID")}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingTopicId(topic.id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      {t('actions.edit')}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" disabled={deleteTopicMutation.isPending}>
                          {deleteTopicMutation.isPending ? (
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
                            {t('deleteDialog.description', { name: topic.name })}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('actions.cancel')}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(topic.id)} className="bg-red-600 hover:bg-red-700">
                            {t('actions.delete')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">{t('emptyState')}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TopicList;
