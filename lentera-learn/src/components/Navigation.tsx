import { Home, BookOpen, Trophy, User, Book } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const location = useLocation();
  const { t } = useTranslation('common');

  const navItems = [
    { icon: Home, label: t('navigation.home'), path: "/dashboard" },
    { icon: BookOpen, label: t('navigation.learn'), path: "/learn" },
    { icon: Trophy, label: t('navigation.achievements'), path: "/achievements" },
    { icon: User, label: t('navigation.profile'), path: "/profile" },
  ];

  return (
    <nav className="fixed z-10 bottom-0 left-0 right-0 bg-white border-t border-brand-deep-green-600/50 shadow-lg">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-4 rounded-lg transition-colors duration-200",
                isActive ? "text-brand-deep-green-700 bg-brand-deep-green-600/50" : "text-gray-500 hover:text-brand-deep-green-600"
              )}
            >
              <item.icon className="h-6 w-6 mb-1" />
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
