import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useSubjects } from "@/services/subjectsService";
import { Subject } from "@/types/lentera";
import { BookOpen } from "lucide-react";
import Loading from "@/components/Loading";
import SubjectCard from "@/components/subjects/SubjectCard";
import Breadcrumb from "@/components/Breadcrumb";
import Navigation from "@/components/Navigation";

const SubjectsList: React.FC = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { data: subjectsData, isLoading, error } = useQuery(useSubjects());
  const subjects = subjectsData?.data?.subjects || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('error.title')}</h2>
          <p className="text-gray-600">{t('error.loadSubjects')}</p>
        </div>
      </div>
    );
  }

  const handleSubjectClick = (subjectId: number) => {
    navigate(`/learn/subject/${subjectId}`);
  };

  const getDifficultyLevel = (subject: Subject): "beginner" | "intermediate" | "advanced" => {
    // Simple logic based on progress or can be enhanced with actual difficulty data
    const progress = subject.progressPercentage || 0;
    if (progress === 0) return "beginner";
    if (progress < 50) return "intermediate";
    return "advanced";
  };

  const getEstimatedTime = (subject: Subject): string => {
    // Simple estimation based on topics count
    const topicsCount = subject.topicsCount || 0;
    const estimatedHours = topicsCount * 2; // 2 hours per topic
    return `${estimatedHours} jam`;
  };

  return (
    <>
      <div className="min-h-screen pb-20" style={{ backgroundColor: "var(--gray-50)" }}>
        <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <Breadcrumb items={[{ label: "Pembelajaran", isActive: true }]} className="mb-4" />
          <h1 className="text-heading text-4xl font-bold mb-2" style={{ color: "var(--lentera-blue)" }}>
            Mata Pelajaran Lentera
          </h1>
          <p className="text-body text-lg" style={{ color: "var(--gray-600)" }}>
            Pilih mata pelajaran yang ingin Anda pelajari dan mulai perjalanan belajar Anda
          </p>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects?.map((subject: Subject) => (
            <div key={subject.id} className="animate-slide-up">
              <SubjectCard
                subject={subject}
                progress={subject.progressPercentage || 0}
                isLocked={false} // Can be enhanced with actual lock logic
                estimatedTime={getEstimatedTime(subject)}
                difficulty={getDifficultyLevel(subject)}
                onClick={() => handleSubjectClick(subject.id)}
              />
            </div>
          ))}
        </div>

        {/* Empty State */}
        {subjects && subjects.length === 0 && (
          <div className="text-center py-12 animate-fade-in">
            <div className="flex items-center justify-center w-24 h-24 rounded-full mx-auto mb-6" style={{ backgroundColor: "var(--lentera-blue-100)" }}>
              <BookOpen className="w-12 h-12" style={{ color: "var(--lentera-blue)" }} />
            </div>
            <h3 className="text-heading text-2xl font-bold mb-2" style={{ color: "var(--gray-900)" }}>
              Belum Ada Mata Pelajaran
            </h3>
            <p className="text-body" style={{ color: "var(--gray-600)" }}>
              Mata pelajaran akan segera tersedia. Pantau terus untuk update terbaru!
            </p>
          </div>
        )}
        </div>
      </div>
      <Navigation />
    </>
  );
};

export default SubjectsList;
