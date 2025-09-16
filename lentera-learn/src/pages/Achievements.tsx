import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Target, BookOpen, Volume2, CheckCircle, Lock, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import Navigation from "@/components/Navigation";
import { useUserAchievements, useUserStats } from "@/hooks/useUserData";
import { Achievement } from "@/services/userService";

const Achievements = () => {
  const { t } = useTranslation(['achievements', 'common']);
  // Fetch data from API
  const { data: achievementsData, isLoading: achievementsLoading, error: achievementsError } = useUserAchievements();
  const { data: userStats, isLoading: statsLoading, error: statsError } = useUserStats();

  // Loading state
  if (achievementsLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-warm-beige to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-brand-deep-green-600" />
          <p className="text-brand-deep-green-600">{t('loading.achievements')}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (achievementsError || statsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-warm-beige to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">{t('common:error.title')}</h2>
          <p className="text-gray-600">{t('error.loadAchievements')}</p>
        </div>
      </div>
    );
  }

  const achievements = achievementsData?.achievements || [];

  const stats = {
    // Always prioritize achievements totalPoints over user stats totalPoints
    totalPoints: userStats?.totalPoints ?? 0,
    unlockedAchievements: achievementsData?.unlockedCount || 0,
    totalAchievements: achievements.length,
    currentStreak: userStats?.currentStreak || 0,
    wordsLearned: userStats?.lessonsCompleted || 0,
  };

  // Map icon string to React component
  const getIconComponent = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case "bookopen":
      case "book":
        return BookOpen;
      case "volume2":
      case "volume":
      case "microphone":
        return Volume2;
      case "target":
        return Target;
      case "trophy":
        return Trophy;
      case "star":
        return Star;
      default:
        return BookOpen; // Default icon
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "learning":
        return "bg-brand-deep-green-600";
      case "pronunciation":
        return "bg-brand-cerulean-blue-600";
      case "consistency":
        return "bg-brand-desert-gold-600";
      case "mastery":
        return "bg-purple-600";
      case "points":
        return "bg-orange-600";
      default:
        return "bg-gray-600";
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case "learning":
        return t('categories.learning');
      case "pronunciation":
        return t('categories.pronunciation');
      case "consistency":
        return t('categories.consistency');
      case "mastery":
        return t('categories.mastery');
      case "points":
        return t('categories.points');
      default:
        return t('categories.other');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-warm-beige to-white pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-brand-deep-green-600/50">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-brand-desert-gold-600 rounded-lg flex items-center justify-center">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-merriweather font-bold text-brand-deep-green-800">{t('title')}</h1>
            </div>
          </div>
          {/* Poin dihapus sesuai permintaan */}
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="shadow-lg border-none">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-brand-deep-green-800">{stats.wordsLearned}</div>
              <div className="text-sm text-brand-deep-green-600">{t('stats.lessonsCompleted')}</div>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-none">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-brand-desert-gold-600">{stats.totalPoints}</div>
              <div className="text-sm text-brand-deep-green-600">{t('stats.totalPoints')}</div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Summary */}
        <Card className="shadow-lg border-none bg-gradient-to-r from-brand-deep-green-700 to-brand-deep-green-800 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-merriweather font-bold text-lg">{t('progress.overall')}</h3>
              <Trophy className="h-6 w-6 text-brand-desert-gold-300" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>{t('progress.unlockedAchievements')}</span>
                <span>
                  {stats.unlockedAchievements}/{stats.totalAchievements}
                </span>
              </div>
              <Progress value={(stats.unlockedAchievements / stats.totalAchievements) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Achievements List */}
        <div className="space-y-4">
          <h2 className="font-merriweather font-bold text-lg text-brand-deep-green-800">{t('allAchievements')}</h2>

          {achievements.map((achievement) => {
            const IconComponent = getIconComponent(achievement.icon);
            return (
              <Card key={achievement.id} className={`shadow-lg border-none ${achievement.unlocked ? "bg-white" : "bg-gray-50"}`}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${achievement.unlocked ? getCategoryColor(achievement.category) : "bg-gray-400"}`}>
                      {achievement.unlocked ? <IconComponent className="h-6 w-6 text-white" /> : <Lock className="h-6 w-6 text-white" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`font-medium ${achievement.unlocked ? "text-brand-deep-green-800" : "text-gray-600"}`}>{achievement.title}</h3>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className={`text-xs ${getCategoryColor(achievement.category)} text-white`}>
                            {getCategoryName(achievement.category)}
                          </Badge>
                          {achievement.unlocked && <CheckCircle className="h-5 w-5 text-green-600" />}
                        </div>
                      </div>

                      <p className={`text-sm mb-3 ${achievement.unlocked ? "text-brand-deep-green-600" : "text-gray-500"}`}>{achievement.description}</p>

                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className={achievement.unlocked ? "text-brand-deep-green-700" : "text-gray-500"}>
                            {t('progress.label')}: {achievement.current}/{achievement.target}
                          </span>
                          <span className={`font-medium ${achievement.unlocked ? "text-brand-desert-gold-600" : "text-gray-500"}`}>+{achievement.points} {t('points')}</span>
                        </div>
                        <Progress value={achievement.progress} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Motivational Message */}
        <Card className="shadow-lg border-none bg-gradient-to-r from-brand-cerulean-blue-600 to-brand-cerulean-blue-700 text-white">
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 mx-auto mb-2 text-brand-desert-gold-300" />
            <h3 className="font-merriweather font-bold mb-2">{t('motivation.title')}</h3>
            <p className="text-sm text-brand-cerulean-blue-100">{t('motivation.message')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <Navigation />
    </div>
  );
};

export default Achievements;
