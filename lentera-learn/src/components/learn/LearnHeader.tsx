import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Lesson } from "@/types/learn";

interface LearnHeaderProps {
  stepTitles: string[];
  currentStep: number;
  currentLessonData: Lesson;
  surahId?: string;
}

export const LearnHeader = ({ stepTitles, currentStep, currentLessonData, surahId }: LearnHeaderProps) => {
  const backUrl = surahId ? `/learn/surah/${surahId}` : "/learn";
  
  return (
    <header className="bg-white shadow-sm border-b border-brand-deep-green-600/50">
      <div className="px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link to={backUrl} className="w-8 h-8 bg-brand-deep-green-700 rounded-lg flex items-center justify-center">
            <ChevronLeft className="h-5 w-5 text-white" />
          </Link>
          <div>
            <h1 className="font-merriweather font-bold text-brand-deep-green-800">{stepTitles[currentStep]}</h1>
            <p className="text-xs text-brand-deep-green-600">
              {currentLessonData.rootWord} - {currentLessonData.meaning}
            </p>
          </div>
        </div>
        <Badge className="bg-brand-deep-green-600/50 text-brand-deep-green-700">{currentLessonData.difficulty}</Badge>
      </div>
    </header>
  );
};
