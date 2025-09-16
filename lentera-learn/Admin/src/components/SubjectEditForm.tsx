import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface SubjectEditFormProps {
  subjectId: string;
  onSave: () => void;
  onCancel: () => void;
}

const SubjectEditForm: React.FC<SubjectEditFormProps> = ({ subjectId, onSave, onCancel }) => {
  const { t } = useTranslation('subjects');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const backendUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchSubject();
  }, [subjectId]);

  const fetchSubject = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${backendUrl}/admin/subjects/${subjectId}`);
      if (!response.ok) {
        throw new Error(t('errors.fetchFailed'));
      }
      const data = await response.json();
      const subjectData = data.data;
      setFormData({
        name: subjectData.name,
        description: subjectData.description,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.fetchFailed'));
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

    try {
      setSaving(true);
      const response = await fetch(`${backendUrl}/admin/subjects/${subjectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(t('errors.updateFailed'));
      }

      toast.success(t('messages.updateSuccess'));
      onSave();
    } catch (err) {
      toast.error(t('messages.updateError') + ": " + (err instanceof Error ? err.message : t('errors.unknown')));
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
        <CardTitle>{t('editForm.title')}</CardTitle>
        <CardDescription>{t('editForm.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('form.name')}</Label>
            <Input id="name" type="text" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} placeholder={t('form.namePlaceholder')} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('form.description')}</Label>
            <Textarea id="description" value={formData.description} onChange={(e) => handleInputChange("description", e.target.value)} placeholder={t('form.descriptionPlaceholder')} rows={4} />
          </div>

          <div className="flex space-x-2">
            <Button type="submit" disabled={saving}>
              {saving ? t('editForm.saving') : t('editForm.save')}
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

export default SubjectEditForm;
