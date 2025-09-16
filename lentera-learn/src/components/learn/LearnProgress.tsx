import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface LearnProgressProps {
  progress: number;
  currentStep: number;
  steps: string[];
  stepTitles: string[];
  // Practice-specific props
  isPracticeMode?: boolean;
  currentQuestion?: number;
  totalQuestions?: number;
}

export const LearnProgress = ({ progress, currentStep, steps, stepTitles, isPracticeMode = false, currentQuestion = 0, totalQuestions = 0 }: LearnProgressProps) => {
  // Calculate practice progress if in practice mode
  const practiceProgress = isPracticeMode && totalQuestions > 0 ? ((currentQuestion + 1) / totalQuestions) * 100 : progress;

  const displayProgress = isPracticeMode ? practiceProgress : progress;
  const progressLabel = isPracticeMode ? "Progress Latihan" : "Progress Pelajaran";
  const stepInfo = isPracticeMode ? `Soal ${currentQuestion + 1} dari ${totalQuestions}` : `Step ${currentStep + 1} dari ${steps.length}`;
  const stepTitle = isPracticeMode ? "Latihan" : stepTitles[currentStep];

  return (
    <Card className="shadow-lg border-none">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-brand-deep-green-700">{progressLabel}</span>
          <span className="text-sm text-brand-deep-green-600">{Math.round(displayProgress)}%</span>
        </div>
        <Progress value={displayProgress} className="h-2 [&>div]:bg-brand-deep-green-700" />
        <div className="flex justify-between mt-2 text-xs text-brand-deep-green-600">
          <span>{stepInfo}</span>
          <span>{stepTitle}</span>
        </div>
      </CardContent>
    </Card>
  );
};
