import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface Subject {
  id: number;
  name: string;
}

interface TopicEditFormProps {
  topicId: string;
  onSave: () => void;
  onCancel: () => void;
}

const TopicEditForm: React.FC<TopicEditFormProps> = ({ topicId, onSave, onCancel }) => {
  const { t } = useTranslation('topics');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    subjectId: "",
  });
  const backendUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchTopic();
    fetchSubjects();
  }, [topicId]);

  const fetchTopic = async () => {
    try {
      const response = await fetch(`${backendUrl}/admin/topics/${topicId}`);
      if (!response.ok) {
        throw new Error(t('error'));
      }
      const data = await response.json();
      const topicData = data.data;
      setFormData({
        name: topicData.name,
        description: topicData.description,
        subjectId: topicData.subjectId.toString(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error'));
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch(`${backendUrl}/admin/subjects`);
      if (!response.ok) {
        throw new Error(t('error'));
      }
      const data = await response.json();
      setSubjects(data.data || []);
    } catch (err) {
      console.error("Error fetching subjects:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error(t('validation.nameRequired'));
      return;
    }

    if (!formData.subjectId) {
      toast.error(t('validation.subjectRequired'));
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`${backendUrl}/admin/topics/${topicId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          subjectId: parseInt(formData.subjectId),
        }),
      });

      if (!response.ok) {
        throw new Error(t('error'));
      }

      toast.success(t('messages.updateSuccess'));
      onSave();
    } catch (err) {
      toast.error(t('messages.updateError') + ': ' + (err instanceof Error ? err.message : t('error')));
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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
          <div className="text-center text-red-600">{t('error')}: {error}</div>
          <div className="text-center mt-4">
            <Button onClick={onCancel}>{t('actions.back')}</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('edit.title')}</CardTitle>
        <CardDescription>{t('edit.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">{t('form.fields.subject')}</Label>
            <Select value={formData.subjectId} onValueChange={(value) => handleInputChange("subjectId", value)}>
              <SelectTrigger>
                <SelectValue placeholder={t('form.fields.selectSubject')} />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id.toString()}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">{t('form.fields.name')}</Label>
            <Input id="name" type="text" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} placeholder={t('form.fields.namePlaceholder')} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('form.fields.description')}</Label>
            <Textarea id="description" value={formData.description} onChange={(e) => handleInputChange("description", e.target.value)} placeholder={t('form.fields.descriptionPlaceholder')} rows={4} />
          </div>

          <div className="flex space-x-2">
            <Button type="submit" disabled={saving}>
              {saving ? t('actions.saving') : t('actions.saveChanges')}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              {t('actions.cancel')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TopicEditForm;
