import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTopicWithLessons } from "@/services/topicsService";
import Navigation from "@/components/Navigation";
import Loading from "@/components/Loading";
import Breadcrumb from "@/components/Breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Clock, Play, CheckCircle, ArrowRight, FileText } from "lucide-react";
import { Lesson, TopicWithLessons } from "@/types/lentera";

const LessonsList = () => {
  const { subjectId, topicId } = useParams<{ subjectId: string; topicId: string }>();
  const navigate = useNavigate();

  const topicIdNum = parseInt(topicId || "0");

  // Get topic with lessons
  const topicQuery = useTopicWithLessons(topicIdNum);
  const { data: topicData, isLoading, error } = useQuery(topicQuery);

  const topic = topicData?.data;
  const lessons = topic?.lessons || [];

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-warm-beige to-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Terjadi Kesalahan</h2>
          <p className="text-gray-600">Gagal memuat pelajaran. Silakan coba lagi.</p>
        </div>
      </div>
    );
  }

  const handleLessonClick = (lesson: Lesson) => {
    navigate(`/learn/subject/${subjectId}/topic/${topicId}/lesson/${lesson.id}`);
  };

  const handleBackClick = () => {
    navigate(`/learn/subject/${subjectId}`);
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  const getProgressPercentage = (lesson: Lesson) => {
    return lesson.progressPercentage || 0;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} menit`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}j ${remainingMinutes}m` : `${hours} jam`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-warm-beige to-white flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-brand-deep-green-600/50 flex-shrink-0">
        <div className="px-4 py-4">
          <Breadcrumb
            items={[
              { label: "Pembelajaran", href: "/learn" },
              { label: "Topik", href: `/learn/subject/${subjectId}` },
              { label: "Pelajaran", isActive: true },
            ]}
            className="mb-4"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button onClick={handleBackClick} className="w-8 h-8 bg-brand-deep-green-700 rounded-lg flex items-center justify-center">
                <ArrowLeft className="h-5 w-5 text-white" />
              </button>
              <div>
                <h1 className="font-merriweather font-bold text-brand-deep-green-800">{topic?.name || "Pelajaran"}</h1>
                <p className="text-xs text-brand-deep-green-600">{lessons.length} pelajaran tersedia</p>
              </div>
            </div>
            {topic && (
              <div className="flex items-center space-x-2">
                <Badge className={getDifficultyColor(topic.difficultyLevel)}>{getDifficultyLabel(topic.difficultyLevel)}</Badge>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Topic Description */}
      {topic && (
        <div className="px-4 py-4 bg-white border-b border-gray-100">
          <p className="text-sm text-gray-600 leading-relaxed mb-3">{topic.description}</p>
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{formatDuration(topic.estimatedDuration)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <BookOpen className="w-3 h-3" />
              <span>{lessons.length} pelajaran</span>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-20">
        <div className="max-w-2xl mx-auto space-y-4">
          {lessons.length > 0 ? (
            lessons.map((lesson, index) => {
              const progressPercentage = getProgressPercentage(lesson);
              const isCompleted = progressPercentage >= 100;
              const hasProgress = progressPercentage > 0;
              const isUnlocked = index === 0 || (lessons[index - 1]?.progressPercentage || 0) >= 100;

              return (
                <Card
                  key={lesson.id}
                  className={`transition-all duration-200 ${isUnlocked ? "cursor-pointer hover:shadow-lg hover:scale-[1.02] border-brand-deep-green-600/20" : "opacity-60 cursor-not-allowed border-gray-200"}`}
                  onClick={() => isUnlocked && handleLessonClick(lesson)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`text-sm font-medium px-2 py-1 rounded ${isUnlocked ? "bg-brand-deep-green-100 text-brand-deep-green-800" : "bg-gray-100 text-gray-500"}`}>#{index + 1}</span>
                          {!isUnlocked && (
                            <Badge variant="outline" className="text-xs text-gray-500">
                              Terkunci
                            </Badge>
                          )}
                        </div>
                        <h3 className={`font-merriweather font-bold text-lg mb-2 ${isUnlocked ? "text-brand-deep-green-800" : "text-gray-500"}`}>{lesson.title}</h3>
                        <p className={`text-sm line-clamp-2 mb-3 ${isUnlocked ? "text-gray-600" : "text-gray-400"}`}>{lesson.content ? lesson.content.substring(0, 100) + "..." : "Konten pelajaran"}</p>

                        <div className="flex items-center space-x-4 text-xs">
                          <div className={`flex items-center space-x-1 ${isUnlocked ? "text-gray-500" : "text-gray-400"}`}>
                            <Clock className="w-3 h-3" />
                            <span>{formatDuration(lesson.estimatedDuration)}</span>
                          </div>
                          <Badge className={getDifficultyColor(lesson.difficultyLevel)}>{getDifficultyLabel(lesson.difficultyLevel)}</Badge>
                        </div>
                      </div>

                      <div className="flex flex-col items-end space-y-2 ml-4">
                        {isCompleted && <CheckCircle className="w-6 h-6 text-emerald-600" />}
                        <Badge className={isCompleted ? "bg-emerald-100 text-emerald-800" : "bg-brand-deep-green-100 text-brand-deep-green-800"}>{isCompleted ? "Selesai" : `${progressPercentage}%`}</Badge>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className={`flex items-center gap-2 text-sm ${isUnlocked ? "text-gray-600" : "text-gray-400"}`}>
                        <FileText className="w-4 h-4" />
                        <span>Pelajaran</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className={`h-2 rounded-full transition-all duration-300 ${isUnlocked ? "bg-emerald-600" : "bg-gray-300"}`} style={{ width: isUnlocked ? `${progressPercentage}%` : "0%" }} />
                      </div>
                    </div>

                    {isUnlocked && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {hasProgress && (
                              <Badge variant="outline" className="text-xs">
                                Sedang Belajar
                              </Badge>
                            )}
                          </div>
                          <Button
                            size="sm"
                            className="bg-brand-deep-green-700 hover:bg-brand-deep-green-800"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLessonClick(lesson);
                            }}
                          >
                            {hasProgress ? (
                              <>
                                <Play className="w-4 h-4 mr-1" />
                                Lanjutkan
                              </>
                            ) : (
                              <>
                                <ArrowRight className="w-4 h-4 mr-1" />
                                Mulai
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada pelajaran</h3>
                <p className="text-gray-500">Pelajaran untuk topik ini belum tersedia.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Navigation */}
      <Navigation />
    </div>
  );
};

export default LessonsList;
