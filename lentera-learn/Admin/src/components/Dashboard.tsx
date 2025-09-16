import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { BarChart3, BookOpen, Users, Target, TrendingUp, Clock, Award, Activity, Loader2, AlertCircle } from "lucide-react";
import { useDashboardStats } from "../hooks/useApi";
import { useTranslation } from "react-i18next";

interface RecentActivity {
  id: string;
  type: "subject" | "topic" | "lesson" | "example" | "practice";
  title: string;
  action: "created" | "updated" | "deleted";
  timestamp: string;
  user?: string;
}

const Dashboard: React.FC = () => {
  const { data: stats, isLoading, error } = useDashboardStats();
  const { t } = useTranslation('dashboard');

  // Mock recent activity data - bisa diganti dengan API call yang sebenarnya
  const recentActivity: RecentActivity[] = [
    {
      id: "1",
      type: "subject",
      title: "Matematika Dasar",
      action: "created",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      user: "Admin",
    },
    {
      id: "2",
      type: "lesson",
      title: "Pengenalan Aljabar",
      action: "updated",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      user: "Admin",
    },
    {
      id: "3",
      type: "practice",
      title: "Latihan Persamaan Linear",
      action: "created",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      user: "Admin",
    },
    {
      id: "4",
      type: "topic",
      title: "Geometri Dasar",
      action: "updated",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      user: "Admin",
    },
    {
      id: "5",
      type: "lesson",
      title: "Contoh Teorema Pythagoras",
      action: "created",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
      user: "Admin",
    },
  ];

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${t('timeAgo.minutesAgo')}`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} ${t('timeAgo.hoursAgo')}`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} ${t('timeAgo.daysAgo')}`;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "subject":
        return <BookOpen className="h-4 w-4" />;
      case "topic":
        return <Target className="h-4 w-4" />;
      case "lesson":
        return <Activity className="h-4 w-4" />;
      case "example":
        return <Award className="h-4 w-4" />;
      case "practice":
        return <BarChart3 className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "created":
        return "text-green-600";
      case "updated":
        return "text-blue-600";
      case "deleted":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>{t('loading')}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-6 w-6" />
          <span>{t('error')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-600">{t('description')}</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">{t('stats.totalSubjects')}</CardTitle>
            <BookOpen className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats?.totalSubjects || 0}</div>
            <p className="text-xs text-gray-500 mt-1">{t('stats.activeSubjects')}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">{t('stats.totalTopics')}</CardTitle>
            <Target className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats?.totalTopics || 0}</div>
            <p className="text-xs text-gray-500 mt-1">{t('stats.learningTopics')}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">{t('stats.totalLessons')}</CardTitle>
            <Activity className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats?.totalLessons || 0}</div>
            <p className="text-xs text-gray-500 mt-1">{t('stats.availableLessons')}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">{t('stats.practiceQuestions')}</CardTitle>
            <BarChart3 className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats?.totalPracticeQuestions || 0}</div>
            <p className="text-xs text-gray-500 mt-1">{t('stats.availableQuestions')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for detailed view */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            {t('tabs.overview')}
          </TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Clock className="h-4 w-4 mr-2" />
            {t('tabs.recentActivity')}
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <TrendingUp className="h-4 w-4 mr-2" />
            {t('tabs.performance')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  {t('userStats.title')}
                </CardTitle>
                <CardDescription>{t('userStats.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('userStats.activeUsers')}</span>
                  <span className="text-lg font-semibold">{stats?.activeUsers || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('userStats.completionRate')}</span>
                  <span className="text-lg font-semibold text-green-600">{stats?.completionRate || 0}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  {t('contentStats.title')}
                </CardTitle>
                <CardDescription>{t('contentStats.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('contentStats.totalExamples')}</span>
                  <span className="text-lg font-semibold">{stats?.totalExamples || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('contentStats.averageQuestionsPerLesson')}</span>
                  <span className="text-lg font-semibold">
                    {stats?.totalLessons && stats?.totalPracticeQuestions 
                      ? Math.round(stats.totalPracticeQuestions / stats.totalLessons) 
                      : 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('recentActivity.title')}</CardTitle>
              <CardDescription>{t('recentActivity.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex-shrink-0">
                      <div className="p-2 rounded-full bg-white shadow-sm">
                        {getActivityIcon(activity.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs font-medium ${getActionColor(activity.action)}`}>
                          {activity.action === 'created' ? t('recentActivity.actions.created') : 
                           activity.action === 'updated' ? t('recentActivity.actions.updated') : t('recentActivity.actions.deleted')}
                        </span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(activity.timestamp)}
                        </span>
                        {activity.user && (
                          <>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-500">{t('recentActivity.by')} {activity.user}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  {t('performance.contentTrend.title')}
                </CardTitle>
                <CardDescription>{t('performance.contentTrend.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t('performance.contentTrend.chartPlaceholder')}</p>
                  <p className="text-sm">{t('performance.contentTrend.featureInDevelopment')}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  {t('performance.dailyActivity.title')}
                </CardTitle>
                <CardDescription>{t('performance.dailyActivity.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t('performance.dailyActivity.chartPlaceholder')}</p>
                  <p className="text-sm">{t('performance.dailyActivity.featureInDevelopment')}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
