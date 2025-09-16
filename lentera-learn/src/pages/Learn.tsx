import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Clock, BookOpen, ArrowRight, CheckCircle, Play, Filter, X } from "lucide-react";
import { useAllLessons, LessonWithTopicSubject } from "@/services/lessonsService";
import { useSubjects } from "@/services/subjectsService";
import Navigation from "@/components/Navigation";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import SearchBar from "@/components/ui/SearchBar";
import FilterDropdown, { FilterOption } from "@/components/ui/FilterDropdown";

const Learn = () => {
  const { t } = useTranslation(['learn', 'common']);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<(string | number)[]>([]);

  // Prepare search parameters for backend
  const searchParams = useMemo(() => {
    const params: {
      search?: string;
      subjectIds?: number[];
      sortBy?: "title" | "difficulty" | "duration" | "created";
      sortOrder?: "asc" | "desc";
    } = {};

    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }

    if (selectedSubjects.length > 0) {
      params.subjectIds = selectedSubjects.map((id) => parseInt(id.toString()));
    }

    // Default sorting
    params.sortBy = "created";
    params.sortOrder = "asc";

    return params;
  }, [searchQuery, selectedSubjects]);

  const allLessonsQuery = useAllLessons(searchParams);
  const subjectsQuery = useSubjects();
  const {
    data: lessonsData,
    isLoading: lessonsLoading,
    error: lessonsError,
  } = useQuery({
    ...allLessonsQuery,
    placeholderData: (previousData) => previousData,
  });
  const { data: subjectsData, isLoading: subjectsLoading, error: subjectsError } = useQuery(subjectsQuery);

  const lessons = useMemo(() => lessonsData?.data?.lessons || [], [lessonsData]);
  const subjects = useMemo(() => subjectsData?.data?.subjects || [], [subjectsData]);
  const pagination = lessonsData?.data?.pagination;

  // Create filter options from subjects
  const filterOptions: FilterOption[] = useMemo(() => {
    return subjects.map((subject) => ({
      id: subject.id,
      label: subject.name,
      color: subject.color,
      count: lessons.filter((lesson) => lesson.subjectName === subject.name).length,
    }));
  }, [subjects, lessons]);

  // Since filtering and searching is now handled by backend,
  // we use the lessons directly from the API response
  const filteredLessons = lessons;

  const handleLessonClick = (lessonId: number) => {
    navigate(`/learn/lesson/${lessonId}`);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleClearFilters = () => {
    setSelectedSubjects([]);
    setSearchQuery("");
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
        return t('learn:difficulty.beginner');
      case "intermediate":
        return t('learn:difficulty.intermediate');
      case "advanced":
        return t('learn:difficulty.advanced');
      default:
        return t('common:status.unknown', 'Tidak Diketahui');
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} ${t('learn:duration.minutes')}`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}${t('learn:duration.hoursShort')} ${remainingMinutes}${t('learn:duration.minutesShort')}` : `${hours} ${t('learn:duration.hours')}`;
  };

  const getProgressInfo = (lesson: LessonWithTopicSubject) => {
    if (lesson.progress) {
      return {
        percentage: lesson.progress.progressPercentage || 0,
        isCompleted: lesson.progress.isCompleted || false,
        hasProgress: lesson.progress.progressPercentage > 0,
      };
    }
    return {
      percentage: 0,
      isCompleted: false,
      hasProgress: false,
    };
  };

  const getStatusBadge = (progressInfo: { percentage: number; isCompleted: boolean; hasProgress: boolean }) => {
    // Consider lesson completed if percentage is 100% OR isCompleted is true
    if (progressInfo.percentage >= 100 || progressInfo.isCompleted) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200" variant="secondary">
          <CheckCircle className="w-3 h-3 mr-1" />
          {t('learn:status.completed')}
        </Badge>
      );
    } else if (progressInfo.hasProgress && progressInfo.percentage > 0 && progressInfo.percentage < 100) {
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200" variant="secondary">
          <Play className="w-3 h-3 mr-1" />
          {t('learn:status.continue')}
        </Badge>
      );
    } else {
      // Badge for lessons that haven't been started
      return (
        <Badge className="bg-gray-100 text-gray-700 border-gray-200" variant="secondary">
          <BookOpen className="w-3 h-3 mr-1" />
          {t('learn:status.start')}
        </Badge>
      );
    }
  };

  const getCardClassName = (progressInfo: { percentage: number; isCompleted: boolean; hasProgress: boolean }) => {
    // Uniform styling for all cards - only badge differentiates status
    return "cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-gray-200 bg-white hover:border-brand-deep-green-600/50 hover:bg-brand-warm-beige/10 shadow-sm";
  };

  if (lessonsLoading || subjectsLoading) {
    return <Loading message={t('learn:loading.lessons')} />;
  }

  if (lessonsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-warm-beige to-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">{t('common:error.title')}</h2>
          <p className="text-gray-600">{t('learn:error.loadLessons')}</p>
          <Button onClick={() => window.location.reload()} className="mt-4 bg-brand-deep-green-700 hover:bg-brand-deep-green-800">
            {t('common:actions.reload')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-warm-beige to-white flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-brand-deep-green-700 via-brand-deep-green-600 to-brand-deep-green-700 shadow-lg flex-shrink-0 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 -translate-y-12"></div>
          <div className="absolute bottom-0 left-1/4 w-20 h-20 bg-white rounded-full translate-y-10"></div>
        </div>

        <div className="relative px-4 py-5">
          <div className="text-center">
            <div className="flex justify-center items-center mb-2">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 mr-2">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h1 className="font-merriweather font-bold text-2xl text-white">{t('learn:title')}</h1>
            </div>
            <p className="text-brand-warm-beige/90 text-base font-medium">{t('learn:subtitle')}</p>
            <div className="mt-3 flex justify-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                <p className="text-white/90 text-xs font-medium">{filteredLessons.length} {t('learn:lessonsAvailable')}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        <div className="max-w-4xl mx-auto">
          {/* Search and Filter Section - Minimalist Icons Only */}
          <div className="flex justify-center items-center gap-3 mb-6 relative z-10">
            <div className="relative">
              <SearchBar value={searchQuery} onChange={setSearchQuery} onClear={handleClearSearch} placeholder={t('common:actions.search')} className="w-12 h-12" />
            </div>
            <div className="relative">
              <FilterDropdown options={filterOptions} selectedValues={selectedSubjects} onSelectionChange={setSelectedSubjects} placeholder="" className="w-12 h-12" multiSelect />
            </div>
            {(searchQuery || selectedSubjects.length > 0) && (
              <Button variant="outline" onClick={handleClearFilters} className="w-12 h-12 p-0 rounded-full" title={t('common:actions.clearFilters')}>
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>

          {/* Results Summary */}
          {(searchQuery || selectedSubjects.length > 0) && (
            <div className="mb-4">
              <p className="text-gray-600">
                {t('learn:results.showing')} {filteredLessons.length} {t('learn:results.lessons')}
                {pagination && (
                  <span>
                    {" "}
                    ({t('learn:results.page')} {pagination.page} {t('learn:results.of')} {pagination.totalPages}, {t('learn:results.total')} {pagination.total} {t('learn:results.lessons')})
                  </span>
                )}
                {searchQuery && <span> {t('learn:results.forSearch')} "{searchQuery}"</span>}
                {selectedSubjects.length > 0 && <span> {t('learn:results.withFilters')}</span>}
              </p>
            </div>
          )}
          {lessons.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('learn:empty.title')}</h3>
              <p className="text-gray-600">{t('learn:empty.message')}</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredLessons.map((lesson) => {
                const progressInfo = getProgressInfo(lesson);
                const statusBadge = getStatusBadge(progressInfo);
                const cardClassName = getCardClassName(progressInfo);

                return (
                  <Card key={lesson.id} className={cardClassName} onClick={() => handleLessonClick(lesson.id)}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 flex gap-2">
                          <Badge className={getDifficultyColor(lesson.difficultyLevel)} variant="secondary">
                            {getDifficultyLabel(lesson.difficultyLevel)}
                          </Badge>
                          {statusBadge}
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                      <CardTitle className="text-lg font-bold text-brand-deep-green-800 line-clamp-2">{lesson.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {/* Progress Bar */}
                        {progressInfo.hasProgress && (
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-600">{t('learn:progress.label')}</span>
                              <span className="text-xs font-medium text-gray-700">{progressInfo.percentage}%</span>
                            </div>
                            <Progress value={progressInfo.percentage} className="h-2" />
                          </div>
                        )}

                        {/* Subject and Topic Info */}
                        <div className="flex flex-col space-x-2">
                          <div className="flex gap-1">
                            <div className="w-3 h-3 rounded-full self-center" style={{ backgroundColor: lesson.subjectColor }} />
                            <div className="text-sm font-medium text-gray-700">{lesson.subjectName}</div>
                          </div>
                        </div>

                        {/* Summary */}
                        <p className="text-sm text-gray-600 line-clamp-2">{lesson.summary || t('learn:lesson.defaultSummary')}</p>

                        {/* Duration */}
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{formatDuration(lesson.estimatedDuration)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <Navigation />
    </div>
  );
};

export default Learn;
