import React, { useState, useEffect } from "react";
import { Brain, Sparkles, BookOpen, Lightbulb, Zap, Star } from "lucide-react";
import { useTranslation } from "react-i18next";

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

// Bright matte rainbow colors for the progress bar
const matteRainbowColors = [
  "#B87FD9", // Bright Matte Violet
  "#7986CB", // Bright Matte Indigo
  "#64B5F6", // Bright Matte Blue
  "#81C784", // Bright Matte Green
  "#FFD54F", // Bright Matte Yellow
  "#FFB74D", // Bright Matte Orange
  "#E57373", // Bright Matte Red
];


export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message = ""
}) => {
  const { t } = useTranslation();
  // Use default message from translations if none provided
  const displayMessage = message || t('loading.messages.searching');
  
  // Get educational facts from translations
  const educationalFacts = t('loading.educationalFacts', { returnObjects: true }) as string[];
  
  const [factIndex, setFactIndex] = useState(0);
  const [loadingStep, setLoadingStep] = useState(0);
  const [factCountdown, setFactCountdown] = useState(100); // 100% full
  const [currentColorIndex, setCurrentColorIndex] = useState(0); // Current color
  const [nextColorIndex, setNextColorIndex] = useState(1); // Next color
  
  const FACT_DURATION = 4000; // 4 seconds per fact
  const COUNTDOWN_INTERVAL = 50; // Update progress bar every 50ms
  
  // Rotate through facts and manage countdown
  useEffect(() => {
    if (!isVisible) return;
    
    // Fact rotation interval
    const factInterval = setInterval(() => {
      setFactIndex(prev => (prev + 1) % educationalFacts.length);
      setFactCountdown(100); // Reset countdown when fact changes
      
      // Update both colors simultaneously - ensuring they are different
      setCurrentColorIndex(prev => (prev + 1) % matteRainbowColors.length);
      setNextColorIndex(prev => (prev + 2) % matteRainbowColors.length);
    }, FACT_DURATION);
    
    // Countdown progress bar interval
    const countdownInterval = setInterval(() => {
      setFactCountdown(prev => {
        const decrementAmount = (COUNTDOWN_INTERVAL / FACT_DURATION) * 100;
        return Math.max(0, prev - decrementAmount);
      });
    }, COUNTDOWN_INTERVAL);
    
    // Simulated loading progression
    const loadingInterval = setInterval(() => {
      setLoadingStep(prev => (prev + 1) % 4);
    }, 800);
    
    return () => {
      clearInterval(factInterval);
      clearInterval(loadingInterval);
      clearInterval(countdownInterval);
    };
  }, [isVisible]);
  
  if (!isVisible) return null;
  
  // Icons for animated loading steps
  const stepIcons = [
    { Icon: Brain, color: "text-blue-500" },
    { Icon: Sparkles, color: "text-purple-500" },
    { Icon: BookOpen, color: "text-green-500" },
    { Icon: Lightbulb, color: "text-yellow-500" }
  ];
  
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-background/95 via-background/90 to-primary/5 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card rounded-2xl shadow-2xl border border-primary/20 p-8 max-w-lg w-full animate-fade-in">
        <div className="flex flex-col items-center justify-center">
          {/* Simple Animated Spinner with Icons */}
          <div className="relative h-28 w-28 mb-6">
            {/* Outer Spinning Circle
            <div className="absolute inset-0 rounded-full border-4 border-primary/30 border-dashed animate-spin-slow"></div>
             */}
            {/* Center Circle */}
            <div className="absolute top-1/2 left-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background/80 border border-primary/20 flex items-center justify-center shadow-lg">
              <Zap className="h-8 w-8 text-primary animate-pulse" />
            </div>
            
            {/* Orbiting Icons */}
            {stepIcons.map(({ Icon, color }, index) => (
              <div
                key={index}
                className={`absolute h-10 w-10 rounded-full bg-background shadow-lg border border-border flex items-center justify-center transition-all duration-500 ${loadingStep === index ? 'opacity-100 scale-110' : 'opacity-50 scale-90'}`}
                style={{
                  left: `${50 + 42 * Math.cos(2 * Math.PI * index / 4)}%`,
                  top: `${50 + 42 * Math.sin(2 * Math.PI * index / 4)}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
            ))}
          </div>
          
          {/* Loading Message */}
          <h3 className="text-xl font-semibold text-foreground mb-2 animate-pulse">{displayMessage}</h3>
          
          {/* Dynamic Loading Status */}
          <div className="flex items-center justify-center gap-1 mb-6">
            <div className={`h-2 w-2 rounded-full ${loadingStep >= 0 ? 'bg-primary' : 'bg-muted'} transition-all duration-300`}></div>
            <div className={`h-2 w-2 rounded-full ${loadingStep >= 1 ? 'bg-primary' : 'bg-muted'} transition-all duration-300`}></div>
            <div className={`h-2 w-2 rounded-full ${loadingStep >= 2 ? 'bg-primary' : 'bg-muted'} transition-all duration-300`}></div>
            <div className={`h-2 w-2 rounded-full ${loadingStep >= 3 ? 'bg-primary' : 'bg-muted'} transition-all duration-300`}></div>
          </div>
          
          {/* Educational Fact with Countdown Border */}
          <div
            className="bg-muted/50 rounded-xl p-4 max-w-sm relative border border-border/50 overflow-hidden"
          >
            {/* Background color (next color) - always full width */}
            <div
              className="absolute bottom-0 left-0 right-0 h-0.5"
              style={{
                backgroundColor: matteRainbowColors[nextColorIndex],
              }}
            ></div>
            
            {/* Foreground color (current color) - shrinks to reveal background */}
            <div
              className="absolute bottom-0 left-0 h-0.5 transition-all duration-50 ease-linear"
              style={{
                width: `${factCountdown}%`,
                backgroundColor: matteRainbowColors[currentColorIndex],
                transition: "width 50ms linear"
              }}
            ></div>
            
            <div className="flex items-start gap-3">
              <Star className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground animate-fade-in-fast">
                  {educationalFacts[factIndex]}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};