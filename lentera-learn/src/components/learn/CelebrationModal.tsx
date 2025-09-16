import { useEffect, useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Star, Sparkles, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactCanvasConfetti from "react-canvas-confetti";

interface ConfettiOptions {
  spread?: number;
  startVelocity?: number;
  decay?: number;
  scalar?: number;
  origin?: { x?: number; y?: number };
  particleCount?: number;
}

type ConfettiFunction = (options: ConfettiOptions) => void;

interface CelebrationModalProps {
  isOpen: boolean;
  score: number;
  totalQuestions: number;
  lessonTitle?: string;
  practiceScore?: number;
  onFinish: () => void;
}

export const CelebrationModal = ({ isOpen, score, totalQuestions, lessonTitle, practiceScore, onFinish }: CelebrationModalProps) => {
  const { t, i18n } = useTranslation(["lesson"]);

  const [animationPhase, setAnimationPhase] = useState(0);
  const refAnimationInstance = useRef<ConfettiFunction | null>(null);

  const percentage = Math.round((score / totalQuestions) * 100);

  // Determine celebration level based on score
  const getCelebrationLevel = () => {
    if (percentage >= 90) return { level: "excellent", message: t("lesson:celebration.excellent"), emoji: "🏆", color: "text-brand-desert-gold-600" };
    if (percentage >= 80) return { level: "great", message: t("lesson:celebration.great"), emoji: "🌟", color: "text-brand-deep-green-600" };
    if (percentage >= 70) return { level: "good", message: t("lesson:celebration.good"), emoji: "👏", color: "text-brand-deep-green-500" };
    return { level: "keep-trying", message: t("lesson:celebration.keepTrying"), emoji: "💪", color: "text-brand-desert-gold-500" };
  };

  const celebration = getCelebrationLevel();

  const getInstance = useCallback((instance: ConfettiFunction) => {
    refAnimationInstance.current = instance;
  }, []);

  const makeShot = useCallback((particleRatio: number, opts: ConfettiOptions) => {
    if (refAnimationInstance.current) {
      refAnimationInstance.current({
        ...opts,
        origin: { y: 0.7 },
        particleCount: Math.floor(200 * particleRatio),
      });
    }
  }, []);

  const fireConfetti = useCallback(() => {
    makeShot(0.25, {
      spread: 26,
      startVelocity: 55,
    });
    makeShot(0.2, {
      spread: 60,
    });
    makeShot(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });
    makeShot(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });
    makeShot(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  }, [makeShot]);

  useEffect(() => {
    if (isOpen) {
      setAnimationPhase(0);

      // Animation sequence
      const timer1 = setTimeout(() => {
        setAnimationPhase(1);
        fireConfetti(); // Fire confetti when modal appears
      }, 300);
      const timer2 = setTimeout(() => setAnimationPhase(2), 800);
      const timer3 = setTimeout(() => setAnimationPhase(3), 1300);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [isOpen, fireConfetti]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      {/* Canvas Confetti */}
      {isOpen && (
        <ReactCanvasConfetti
          onInit={({ confetti }) => getInstance(confetti)}
          style={{
            position: "fixed",
            pointerEvents: "none",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            zIndex: 60,
          }}
        />
      )}

      <Card className={cn("w-full max-w-md mx-auto transform transition-all duration-500", animationPhase >= 1 ? "scale-100 opacity-100" : "scale-75 opacity-0")}>
        <CardContent className="p-8 text-center space-y-6">
          {/* Trophy/Icon Animation */}
          <div className={cn("flex justify-center transform transition-all duration-700", animationPhase >= 1 ? "scale-100 rotate-0" : "scale-0 rotate-180")}>
            <div
              className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center",
                celebration.level === "excellent" ? "bg-brand-desert-gold-100" : celebration.level === "great" ? "bg-brand-deep-green-100" : celebration.level === "good" ? "bg-brand-deep-green-100" : "bg-brand-desert-gold-100"
              )}
            >
              {celebration.level === "excellent" ? (
                <Trophy className={cn("w-10 h-10", celebration.color)} />
              ) : celebration.level === "great" ? (
                <Star className={cn("w-10 h-10", celebration.color)} />
              ) : celebration.level === "good" ? (
                <CheckCircle className={cn("w-10 h-10", celebration.color)} />
              ) : (
                <Sparkles className={cn("w-10 h-10", celebration.color)} />
              )}
            </div>
          </div>

          {/* Main Message */}
          <div className={cn("space-y-2 transform transition-all duration-500 delay-300", animationPhase >= 2 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0")}>
            <h2 className={cn("text-3xl font-bold", celebration.color)}>
              {celebration.message} {celebration.emoji}
            </h2>
            <p className="text-lg text-brand-desert-gold-600">{t("celebration.practiceComplete")}</p>
            {lessonTitle && (
              <p className="text-sm text-brand-deep-green-600">
                {t('celebration.lessonCompleted').replace('{lessonTitle}', lessonTitle)}
              </p>
            )}
          </div>

          {/* Score Display */}
          <div className={cn("space-y-4 transform transition-all duration-500 delay-500", animationPhase >= 3 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0")}>
            <div className="bg-brand-warm-beige rounded-lg p-4">
              <div className="text-4xl font-bold text-brand-deep-green-800 mb-2">
                {score}/{totalQuestions}
              </div>
              <div className={cn("text-2xl font-semibold", celebration.color)}>{percentage}%</div>
            </div>

            {/* Practice Score */}
            {practiceScore !== undefined && (
              <div className="bg-brand-deep-green-50 rounded-lg p-3">
                <p className="text-sm text-brand-deep-green-600">
                  {t('celebration.practiceScore').replace('{score}', practiceScore.toString())}
                </p>
              </div>
            )}

            {/* Motivational Message */}
            <div className="text-sm text-brand-deep-green-600">
              {percentage >= 90 && t("lesson:celebration.motivational.perfect")}
              {percentage >= 80 && percentage < 90 && t("lesson:celebration.motivational.excellent")}
              {percentage >= 70 && percentage < 80 && t("lesson:celebration.motivational.good")}
              {percentage < 70 && t("lesson:celebration.motivational.keepTrying")}
            </div>
          </div>

          {/* Action Button */}
          <div className={cn("transform transition-all duration-500 delay-700", animationPhase >= 3 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0")}>
            <Button onClick={onFinish} className="w-full bg-brand-deep-green-700 hover:bg-brand-deep-green-800 text-white">
              {t("lesson:celebration.finish")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
