import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Play, BookOpen, Trophy, Calendar, Clock, Loader2, Target, Award, TrendingUp, Book } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";

import { useDashboardData } from "@/hooks/useUserData";
import { useJwtApiClient } from "@/services/apiClient";
import { useDashboardService, Subject, ContinueLearningItem, LearningOverview, QuickStats } from "@/services/dashboardService";

const Dashboard = () => {
  const { t } = useTranslation(['dashboard', 'common']);
  const [menuOpen, setMenuOpen] = useState(false);
  const apiClient = useJwtApiClient();
  const { userProfile, userStats, progressSummary, recommendedLessons, continueLearningLessons, isLoading, isError, error } = useDashboardData();

  // Check if user is authenticated
  const isAuthenticated = apiClient.isAuthenticated();

  // Show error toast if API fails
  useEffect(() => {
    if (isError && error) {
      toast({
        title: t('dashboard:toast.loadDataFailed'),
        description: t('dashboard:toast.usingOfflineData'),
        variant: "destructive",
      });
    }
  }, [isError, error, t]);

  // Combine API data with fallback mock data for new Lentera platform
  const displayData = {
    name: userProfile?.data?.name ?? t('dashboard:defaultData.demoUser', 'Demo User'),
    totalSubjects: progressSummary?.data?.totalSubjects ?? 5,
    activeSubjects: progressSummary?.data?.totalSubjects ?? 3,
    completedLessonsThisWeek: progressSummary?.data?.completedLessons ?? userStats?.data?.lessonsCompleted ?? 2,
    currentStreak: progressSummary?.data?.currentStreak ?? userStats?.data?.currentStreak ?? 7,
    totalStudyTime: progressSummary?.data?.totalTimeSpent ?? 120,
    level: progressSummary?.data?.level ?? t('learn:difficulty.beginner'),
    totalPoints: progressSummary?.data?.points ?? userStats?.data?.totalPoints ?? 850,
    completedTopics: progressSummary?.data?.completedTopics ?? 8,
    totalAchievements: 5, // Will be implemented in future
    weeklyGoalProgress: Math.min(Math.round((progressSummary?.data?.completionRate ?? 0) * 100), 100),
    // New data structure fields
    startedLessons: progressSummary?.data?.startedLessons ?? 0,
    totalLessons: progressSummary?.data?.totalLessons ?? 0,
    totalTopics: progressSummary?.data?.totalTopics ?? 0,
    completionRate: progressSummary?.data?.completionRate ?? 0,
    averageProgress: progressSummary?.data?.averageProgress ?? 0,
    // Legacy data for backward compatibility
    completedLessons: progressSummary?.data?.completedLessons ?? userStats?.data?.lessonsCompleted ?? 2,
  };

  // Get overall learning progress percentage
  const getProgressPercentage = () => {
    // Calculate based on completed lessons this week vs weekly goal
    const weeklyGoal = 5; // Default weekly goal
    return Math.min(Math.round((displayData.completedLessonsThisWeek / weeklyGoal) * 100), 100);
  };

  const progressPercentage = progressSummary?.data?.progressPercentage ?? getProgressPercentage();

  // Check if we have actual API data (not just loading state)
  const hasApiData = userProfile?.data || userStats?.data || progressSummary?.data;
  const shouldShowRealData = !isLoading && hasApiData;

  // Debug: Log all dashboard data
  // console.log('=== DASHBOARD DEBUG DATA ===');
  // console.log('User Profile:', userProfile);
  // console.log('User Profile Data:', userProfile?.data);
  // console.log('User Stats:', userStats);
  // console.log('User Stats Data:', userStats?.data);
  // console.log('Progress Summary:', progressSummary);
  // console.log('Progress Summary Data:', progressSummary?.data);
  // console.log('Recommended Lessons:', recommendedLessons);
  // console.log('Continue Learning Lessons:', continueLearningLessons);
  // console.log('Continue Learning Data:', continueLearningLessons?.data);
  // console.log('Is Loading:', isLoading);
  // console.log('Is Error:', isError);
  // console.log('Error:', error);
  // console.log('Has API Data:', hasApiData);
  // console.log('Should Show Real Data:', shouldShowRealData);
  // console.log('Display Data:', displayData);
  // console.log('=== END DEBUG DATA ===');

  // Process lessons data with new structure
  const displayLessons =
    Array.isArray(continueLearningLessons?.data) && continueLearningLessons.data.length > 0
      ? continueLearningLessons.data.slice(0, 3).map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          subjectName: lesson.subjectName || t('learn:subjects.title'),
          topicName: lesson.topicName || t('learn:topics.title'),
          progress: lesson.progressPercentage || 0,
          difficulty: lesson.difficulty || t('dashboard:defaultData.easy'),
          estimatedDuration: lesson.estimatedDuration || 30,
          orderIndex: lesson.orderIndex || 0,
        }))
      : [
          {
            id: "default-1",
            title: t('dashboard:defaultData.firstLesson'),
            subjectName: t('dashboard:defaultData.generalSubject'),
            topicName: t('dashboard:defaultData.introduction'),
            difficulty: t('dashboard:defaultData.easy'),
            progress: 0,
            estimatedDuration: 30,
            orderIndex: 1,
          },
        ];

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen pb-16 bg-gradient-to-br from-brand-warm-beige to-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-brand-deep-green-700" />
          <p className="text-brand-deep-green-600">{t('dashboard:loading.dashboard')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10 bg-gradient-to-br from-brand-warm-beige to-white">
      <div className="px-4 py-6 space-y-6">
        {/* Welcome Section */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-merriweather font-bold text-brand-deep-green-800">
            {t('dashboard:welcome.title')} <br />
            {displayData.name}
          </h2>
          <p className="text-brand-deep-green-600">{t('dashboard:welcome.subtitle')}</p>
        </div>

        {/* Learning Overview */}
        <Card className="shadow-lg border-none bg-gradient-to-r from-brand-deep-green-700 to-brand-deep-green-800 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">{t('dashboard:overview.title')}</h3>
                <p className="text-brand-warm-beige-100 text-sm">{displayData.completedLessonsThisWeek} {t('dashboard:overview.lessonsThisWeek')}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{progressPercentage}%</div>
                <p className="text-brand-warm-beige-100 text-sm">{t('dashboard:overview.weeklyTarget')}</p>
              </div>
            </div>
            <Progress value={progressPercentage} className="h-3 bg-brand-deep-green-600" />

            {/* Quick Stats Row */}
            {/* <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-brand-deep-green-600">
              <div className="text-center">
                <div className="text-lg font-bold">{displayData.currentStreak}</div>
                <div className="text-xs text-brand-warm-beige-100">Hari Beruntun</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{displayData.totalPoints}</div>
                <div className="text-xs text-brand-warm-beige-100">Total Poin</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{Math.round(displayData.totalStudyTime / 60)}h</div>
                <div className="text-xs text-brand-warm-beige-100">Waktu Belajar</div>
              </div>
            </div> */}
          </CardContent>
        </Card>

        {/* Quick Stats Cards */}
        {/* <div className="space-y-4">
          <h3 className="text-xl font-merriweather font-bold text-brand-deep-green-800">Statistik Cepat</h3>
          <div className="grid grid-cols-2 gap-4">
            <Card className="shadow-md border-none">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Book className="w-8 h-8 text-brand-deep-green-700" />
                </div>
                <div className="text-2xl font-bold text-brand-deep-green-800">{displayData.activeSubjects}</div>
                <div className="text-sm text-brand-deep-green-600">Mata Pelajaran Aktif</div>
              </CardContent>
            </Card>

            <Card className="shadow-md border-none">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Target className="w-8 h-8 text-brand-deep-green-700" />
                </div>
                <div className="text-2xl font-bold text-brand-deep-green-800">{displayData.completedTopics}</div>
                <div className="text-sm text-brand-deep-green-600">Topik Selesai</div>
              </CardContent>
            </Card>

            <Card className="shadow-md border-none">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Award className="w-8 h-8 text-brand-deep-green-700" />
                </div>
                <div className="text-2xl font-bold text-brand-deep-green-800">{displayData.totalAchievements}</div>
                <div className="text-sm text-brand-deep-green-600">Pencapaian</div>
              </CardContent>
            </Card>

            <Card className="shadow-md border-none">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="w-8 h-8 text-brand-deep-green-700" />
                </div>
                <div className="text-2xl font-bold text-brand-deep-green-800">{displayData.weeklyGoalProgress}%</div>
                <div className="text-sm text-brand-deep-green-600">Target Mingguan</div>
              </CardContent>
            </Card>
          </div>
        </div> */}

        {/* Continue Learning Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-merriweather font-bold text-brand-deep-green-800">{t('dashboard:continueLearning.title')}</h3>
          <div className="space-y-3">
            {/* Use actual API data with fallback to mock data */}
            {displayLessons.map((lesson) => (
              <Card key={lesson.id} className="shadow-md border-none hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  {/* Header with title and badge */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-1">
                        <h4 className="font-semibold text-brand-deep-green-800 text-base leading-tight">{lesson.title}</h4>
                      </div>
                      <p className="text-sm text-brand-deep-green-600 mb-2">
                        {lesson.subjectName} • {lesson.topicName}
                      </p>
                    </div>
                  </div>

                  {/* Metadata row */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1 text-xs text-brand-deep-green-600">
                        <Clock className="w-3 h-3" />
                        <span>{lesson.estimatedDuration} {t('dashboard:continueLearning.minutes')}</span>
                      </div>
                      {lesson.progress > 0 && (
                        <Badge variant="secondary" className="bg-brand-warm-beige text-brand-deep-green-800 text-xs shrink-0">
                          {t('dashboard:continueLearning.inProgress')}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="flex items-center space-x-3 mb-4">
                    <Progress value={lesson.progress} className="flex-1 h-2" />
                    <span className="text-sm font-medium text-brand-deep-green-600 min-w-[40px] text-right">{lesson.progress}%</span>
                  </div>

                  {/* Action button - full width on mobile */}
                  <div className="flex justify-end">
                    <Button asChild className="bg-brand-deep-green-700 hover:bg-brand-deep-green-800 text-white px-6 w-full sm:w-auto">
                      <Link to={`/learn/lesson/${lesson.id}`}>
                        <Play className="w-4 h-4 mr-2" />
                        {lesson.progress > 0 ? t('dashboard:continueLearning.continue') : t('dashboard:continueLearning.start')}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <Navigation />
    </div>
  );
};

export default Dashboard;
