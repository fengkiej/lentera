import React from 'react';
import { Subject } from '@/types/lentera';
import { Clock, BookOpen, Lock, Play, RotateCcw } from 'lucide-react';

interface SubjectCardProps {
  subject: Subject;
  progress: number;
  isLocked: boolean;
  estimatedTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  onClick: () => void;
}

const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  progress,
  isLocked,
  estimatedTime,
  difficulty,
  onClick
}) => {
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'Pemula';
      case 'intermediate':
        return 'Menengah';
      case 'advanced':
        return 'Lanjutan';
      default:
        return 'Tidak Diketahui';
    }
  };

  const getProgressColor = () => {
    if (progress === 0) return 'var(--gray-200)';
    if (progress < 30) return 'var(--lentera-red)';
    if (progress < 70) return 'var(--lentera-gold)';
    return 'var(--lentera-green)';
  };

  const circumference = 2 * Math.PI * 28; // radius = 28
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div 
      className={`card-base cursor-pointer transition-all duration-200 w-full max-w-sm mx-auto ${
        isLocked ? 'opacity-60 cursor-not-allowed' : 'hover:scale-102'
      }`}
      onClick={!isLocked ? onClick : undefined}
    >
      {/* Header with Progress Ring */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1 pr-4">
          <h3 className="text-heading text-lg font-bold text-gray-900 mb-2 leading-tight">
            {subject.name}
          </h3>
          <p className="text-body text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {subject.description}
          </p>
        </div>
        
        {/* Progress Ring */}
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg className="progress-ring w-16 h-16" viewBox="0 0 64 64">
            <circle
              className="progress-ring-circle"
              cx="32"
              cy="32"
              r="28"
              strokeWidth="3"
              fill="none"
              stroke="var(--gray-200)"
            />
            <circle
              className="progress-ring-progress"
              cx="32"
              cy="32"
              r="28"
              strokeWidth="3"
              fill="none"
              stroke={getProgressColor()}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            {isLocked ? (
              <Lock className="w-6 h-6 text-gray-400" />
            ) : (
              <span className="text-xs font-semibold text-gray-700">
                {Math.round(progress)}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Subject Icon */}
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 mb-6">
        <BookOpen className="w-6 h-6 text-white" />
      </div>

      {/* Footer */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          {/* Difficulty Badge */}
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(difficulty)}`}>
            {getDifficultyText(difficulty)}
          </span>
          
          {/* Estimated Time */}
          <div className="flex items-center text-gray-500">
            <Clock className="w-4 h-4 mr-1" />
            <span className="text-xs">{estimatedTime}</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          className={`btn-base w-full px-4 py-3 text-sm font-medium ${
            isLocked
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : progress > 0
              ? 'btn-secondary'
              : 'btn-primary'
          }`}
          disabled={isLocked}
        >
          {isLocked ? (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Terkunci
            </>
          ) : progress > 0 ? (
            <>
              <RotateCcw className="w-4 h-4 mr-2" />
              Lanjutkan
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Mulai
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SubjectCard;