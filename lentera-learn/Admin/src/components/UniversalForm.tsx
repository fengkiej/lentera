import React from "react";
import { useTranslation } from "react-i18next";
import LessonForm from "./LessonForm";
import ExampleForm from "./ExampleForm";
import PracticeForm from "./PracticeForm";
import { useExample, usePracticeItem } from "../hooks/useApi";

type FormMode = 'create' | 'edit';
type FormType = 'lesson' | 'example' | 'practice';

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

interface UniversalFormProps {
  mode: FormMode;
  type: FormType;
  lessonId?: string;
  itemId?: string; // exampleId or practiceId for edit mode (currently unused)
  lessonData?: LessonData; // For AI generation context
  onSuccess?: () => void;
  onCancel?: () => void;
}

const UniversalForm: React.FC<UniversalFormProps> = ({
  mode,
  type,
  lessonId,
  itemId,
  lessonData,
  onSuccess,
  onCancel,
}) => {
  const { t } = useTranslation();
  
  // Fetch example data for edit mode
  const { data: exampleData, isLoading: isLoadingExample } = useExample(
    mode === 'edit' && type === 'example' && itemId ? itemId : ''
  );
  
  // Fetch practice data for edit mode
  const { data: practiceData, isLoading: isLoadingPractice, refetch: refetchPractice } = usePracticeItem(
    mode === 'edit' && type === 'practice' && itemId ? itemId : ''
  );
  
  // Create a callback that refetches data after successful update
  const handlePracticeUpdateSuccess = () => {
    if (mode === 'edit' && type === 'practice' && itemId) {
      refetchPractice();
    }
    if (onSuccess) {
      onSuccess();
    }
  };

  // Render appropriate form based on mode and type
  switch (type) {
    case 'lesson':
      return (
        <LessonForm 
          mode={mode}
          lessonId={mode === 'edit' ? itemId : undefined}
          initialData={mode === 'edit' ? lessonData : undefined}
          onLessonUpdated={onSuccess}
          onCancel={onCancel}
        />
      );
    case 'example':
      // Show loading state while fetching example data in edit mode
      if (mode === 'edit' && itemId && isLoadingExample) {
        return <div>{t('common.loading')}</div>;
      }
      
      return (
        <ExampleForm
          mode={mode}
          lessonId={lessonId}
          lessonData={lessonData}
          exampleId={itemId}
          initialData={mode === 'edit' && exampleData ? exampleData : undefined}
          onExampleAdded={mode === 'create' ? onSuccess : undefined}
          onExampleUpdated={mode === 'edit' ? onSuccess : undefined}
        />
      );
    case 'practice': {
      // Show loading state while fetching practice data in edit mode
      if (mode === 'edit' && itemId && isLoadingPractice) {
        return <div>{t('common.loading')}</div>;
      }
      
      // Convert Practice API data to PracticeForm expected format
      const convertedPracticeData = practiceData ? {
        question: practiceData.question,
        type: practiceData.questionType,
        options: Array.isArray(practiceData.options) ? practiceData.options.map((option, index) => 
          typeof option === 'string' ? 
            { optionText: option, isCorrect: false, orderIndex: index } : 
            { optionText: option.optionText, isCorrect: option.isCorrect, orderIndex: option.orderIndex || index }
        ) : [],
        correctAnswer: practiceData.correctAnswer,
        explanation: practiceData.explanation || '',
        difficultyLevel: practiceData.difficultyLevel === 'easy' ? 'beginner' : 
                        practiceData.difficultyLevel === 'medium' ? 'intermediate' : 'advanced',
        points: practiceData.points
      } : undefined;
      
      return (
        <PracticeForm
          mode={mode}
          lessonId={lessonId}
          lessonData={lessonData}
          practiceId={itemId}
          initialData={convertedPracticeData}
          onPracticeAdded={mode === 'create' ? onSuccess : undefined}
          onPracticeUpdated={mode === 'edit' ? handlePracticeUpdateSuccess : undefined}
          onBack={onCancel}
        />
      );
    }
    default:
      return <div>{t('common.error.unsupportedFormType')}</div>;
  }
};

export default UniversalForm;