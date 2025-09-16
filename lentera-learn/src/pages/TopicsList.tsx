import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAllTopics, AllTopicsResponse } from "@/services/subjectsService";
import { useTopicsService } from "@/services/topicsService";
import { BookOpen, Clock, Star } from "lucide-react";
import Loading from "@/components/Loading";
import Breadcrumb from "@/components/Breadcrumb";

const TopicsList: React.FC = () => {
  const navigate = useNavigate();
  const { getTopicLessons } = useTopicsService();

  const topicsQuery = useAllTopics();
  const { data: topicsData, isLoading, error } = useQuery(topicsQuery);

  const topics = useMemo(() => {
    return (topicsData as AllTopicsResponse)?.data?.topics || [];
  }, [topicsData]);

  const handleTopicSelect = async (topicId: number) => {
    try {
      // Use the topicsService to get lessons
      const response = await getTopicLessons(topicId);

      if (response.success && response.data) {
        const lessons = response.data;
        console.log(lessons);

        if (lessons && lessons.length > 0) {
          // Navigate to first lesson
          const firstLesson = lessons[0];
          navigate(`/learn/lesson/${firstLesson.id}`);
        } else {
          // Fallback to topic page if no lessons
          navigate(`/learn/topic/${topicId}`);
        }
      } else {
        // Fallback to topic page if API fails
        navigate(`/learn/topic/${topicId}`);
      }
    } catch (error) {
      console.error("Error fetching topic lessons:", error);
      // Fallback to topic page if error occurs
      navigate(`/learn/topic/${topicId}`);
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "var(--green-500)";
      case "intermediate":
        return "var(--yellow-500)";
      case "advanced":
        return "var(--red-500)";
      default:
        return "var(--gray-500)";
    }
  };

  const getDifficultyLabel = (level: string) => {
    switch (level) {
      case "beginner":
        return "Pemula";
      case "intermediate":
        return "Menengah";
      case "advanced":
        return "Lanjutan";
      default:
        return "Tidak Diketahui";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--gray-50)" }}>
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--gray-50)" }}>
        <div className="text-center">
          <h2 className="text-heading text-2xl font-bold mb-2" style={{ color: "var(--gray-900)" }}>
            Terjadi Kesalahan
          </h2>
          <p className="text-body" style={{ color: "var(--gray-600)" }}>
            Gagal memuat daftar topik. Silakan coba lagi.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--gray-50)" }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <Breadcrumb items={[{ label: "Pembelajaran", isActive: true }]} className="mb-4" />
          <p className="text-body text-lg" style={{ color: "var(--gray-600)" }}>
            Pilih mata pelajaran yang ingin Anda pelajari dan mulai perjalanan belajar Anda
          </p>
        </div>

        {/* Topics Grid */}
        <div className="max-w-6xl mx-auto">
          {topics.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  onClick={() => handleTopicSelect(topic.id)}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105"
                  style={{ borderColor: "var(--gray-200)" }}
                >
                  {/* Subject Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: topic.subjectColor + "20",
                        color: topic.subjectColor,
                      }}
                    >
                      {topic.subjectName}
                    </span>
                    <div className="flex items-center text-xs" style={{ color: "var(--gray-500)" }}>
                      <Star className="w-3 h-3 mr-1" style={{ color: getDifficultyColor(topic.difficultyLevel) }} />
                      {getDifficultyLabel(topic.difficultyLevel)}
                    </div>
                  </div>

                  {/* Topic Info */}
                  <h3 className="text-heading text-lg font-bold mb-2" style={{ color: "var(--gray-900)" }}>
                    {topic.name}
                  </h3>
                  <p className="text-body text-sm mb-4" style={{ color: "var(--gray-600)" }}>
                    {topic.description}
                  </p>

                  {/* Progress and Duration */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs" style={{ color: "var(--gray-500)" }}>
                      <Clock className="w-3 h-3 mr-1" />
                      {topic.estimatedDuration} menit
                    </div>
                    {topic.progressPercentage !== undefined && (
                      <div className="text-xs font-medium" style={{ color: "var(--lentera-blue)" }}>
                        {topic.progressPercentage}% selesai
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {topic.progressPercentage !== undefined && (
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${topic.progressPercentage}%`,
                            backgroundColor: "var(--lentera-blue)",
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-12 animate-fade-in">
              <div className="flex items-center justify-center w-24 h-24 rounded-full mx-auto mb-6" style={{ backgroundColor: "var(--lentera-blue-100)" }}>
                <BookOpen className="w-12 h-12" style={{ color: "var(--lentera-blue)" }} />
              </div>
              <h3 className="text-heading text-2xl font-bold mb-2" style={{ color: "var(--gray-900)" }}>
                Belum Ada Topik
              </h3>
              <p className="text-body" style={{ color: "var(--gray-600)" }}>
                Topik pembelajaran akan segera tersedia. Pantau terus untuk update terbaru!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopicsList;
