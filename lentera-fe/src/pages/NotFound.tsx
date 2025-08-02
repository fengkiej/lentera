import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, Search, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageLayout } from "@/components/page-layout";
import { useTranslation } from "react-i18next";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <PageLayout
      headerVariant="default"
      logoTo="/"
      // navItems={[
      //   { label: 'nav.home', to: '/' },
      //   { label: 'nav.about', to: '/about-lentera' },
      //   { label: 'nav.explore', to: '/explore' }
      // ]}
      // showFooter={false}
    >
      <div className="flex items-center justify-center px-4 py-24">
        <div className="max-w-sm sm:max-w-md w-full">
          <Card className="p-8 sm:p-12 text-center shadow-xl border-2">
            <CardContent className="p-0 space-y-6 sm:space-y-8">
              {/* Error Icon */}
              <div className="space-y-4">
                <div className="h-16 w-16 sm:h-20 sm:w-20 mx-auto rounded-3xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-5xl sm:text-6xl font-bold text-foreground">404</h1>
                  <h2 className="text-lg sm:text-xl font-semibold text-foreground">{t('notFound.title')}</h2>
                  <p className="text-sm sm:text-base text-muted-foreground px-4 sm:px-0">
                    {t('notFound.description')}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 sm:space-y-4">
                <Link to="/" className="block">
                  <Button className="w-full gap-2 h-11 sm:h-12">
                    <Home className="h-4 w-4 sm:h-5 sm:w-5" />
                    {t('notFound.backToHome')}
                  </Button>
                </Link>
                
                <Link to="/explore" className="block">
                  <Button variant="outline" className="w-full gap-2 h-11 sm:h-12">
                    <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                    {t('notFound.exploreContent')}
                  </Button>
                </Link>
                
                <Button 
                  variant="ghost" 
                  onClick={() => window.history.back()}
                  className="w-full gap-2 h-11 sm:h-12"
                >
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                  {t('notFound.backToPrevious')}
                </Button>
              </div>

              {/* Additional Info */}
              <div className="pt-4 border-t border-border/50">
                <p className="text-xs sm:text-sm text-muted-foreground px-4 sm:px-0">
                  {t('notFound.helpText')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default NotFound;
