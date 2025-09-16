import { Button } from "@/components/ui/button";
import { ChevronLeft, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

interface LearnNavigationProps {
  currentStep: number;
  currentDerivativeIndex: number;
  totalDerivatives: number;
  handlePrevStep: () => void;
  handleNextStep: () => void;
}

export const LearnNavigation = ({ currentStep, currentDerivativeIndex, totalDerivatives, handlePrevStep, handleNextStep }: LearnNavigationProps) => {
  const { t } = useTranslation(['learn', 'common']);
  
  if (currentStep >= 2) return null;

  // Tentukan teks tombol berdasarkan konteks
  const getNextButtonText = () => {
    if (currentStep === 0) {
      return t('learn:navigation.next');
    } else if (currentStep === 1) {
      if (currentDerivativeIndex < totalDerivatives - 1) {
        return `${t('learn:navigation.derivative')} ${currentDerivativeIndex + 2}`;
      } else {
        return t('learn:navigation.startPractice');
      }
    }
    return t('learn:navigation.next');
  };

  return (
    <div className="flex justify-between items-center mt-6">
      <Button variant="outline" onClick={handlePrevStep} disabled={currentStep === 0} className="flex items-center space-x-2 border-brand-deep-green-600/50 text-brand-deep-green-700">
        <ChevronLeft className="h-4 w-4" />
        <span>{t('learn:navigation.previous')}</span>
      </Button>

      <Button onClick={handleNextStep} disabled={currentStep === 2} className="flex items-center space-x-2 bg-brand-deep-green-700 hover:bg-brand-deep-green-800 text-white">
        <span>{getNextButtonText()}</span>
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
