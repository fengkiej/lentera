import LessonForm from "./components/LessonForm";
import SubjectList from "./components/SubjectList";
import SubjectForm from "./components/SubjectForm";
import TopicList from "./components/TopicList";
import TopicForm from "./components/TopicForm";
import LessonList from "./components/LessonList";
import Dashboard from "./components/Dashboard";
import LanguageSwitcher from "./components/LanguageSwitcher";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { BookOpen, Plus, List, GraduationCap, FileText, BarChart3, Menu, X } from "lucide-react";
import { Button } from "./components/ui/button";

function App() {
  const { t } = useTranslation("common");
  const { t: tForms } = useTranslation("forms");
  const { t: tSubjects } = useTranslation("subjects");
  const { t: tTopics } = useTranslation("topics");
  const [activeView, setActiveView] = useState("dashboard");
  const [subjectView, setSubjectView] = useState<"list" | "create">("list");
  const [topicView, setTopicView] = useState<"list" | "create">("list");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSubjectCreated = () => {
    setSubjectView("list");
  };

  const handleTopicCreated = () => {
    setTopicView("list");
  };

  const menuItems = [
    { id: "dashboard", label: t("navigation.dashboard"), icon: BarChart3 },
    { id: "create-lesson", label: tForms("buttons.createLesson"), icon: FileText },
    { id: "subjects", label: t("navigation.subjects"), icon: BookOpen },
    { id: "topics", label: t("navigation.topics"), icon: List },
    { id: "lessons", label: t("navigation.lessons"), icon: GraduationCap },
  ];

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return <Dashboard />;
      case "create-lesson":
        return <LessonForm />;
      case "subjects":
        return subjectView === "list" ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Subjects</h2>
              <Button onClick={() => setSubjectView("create")} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {tSubjects('actions.create')}
              </Button>
            </div>
            <SubjectList />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">{tSubjects('form.title')}</h2>
              <Button variant="outline" onClick={() => setSubjectView("list")}>
                {tSubjects('actions.back')}
              </Button>
            </div>
            <SubjectForm onSubjectCreated={handleSubjectCreated} />
          </div>
        );
      case "topics":
        return topicView === "list" ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Topics</h2>
              <Button onClick={() => setTopicView("create")} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {tTopics('actions.create')}
              </Button>
            </div>
            <TopicList />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">{tTopics('form.title')}</h2>
              <Button variant="outline" onClick={() => setTopicView("list")}>
                {tTopics('actions.back')}
              </Button>
            </div>
            <TopicForm onTopicCreated={handleTopicCreated} />
          </div>
        );
      case "lessons":
        return <LessonList />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? "w-64" : "w-16"} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h1 className={`font-bold text-gray-900 ${sidebarOpen ? "text-lg" : "hidden"}`}>{t("appName")}</h1>
            <div className="flex items-center gap-2">
              {sidebarOpen && <LanguageSwitcher />}
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)}>
                {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <Button
                    variant={activeView === item.id ? "default" : "ghost"}
                    className={`w-full justify-start ${!sidebarOpen && "px-2"}`}
                    onClick={() => {
                      setActiveView(item.id);
                      if (item.id === "subjects") setSubjectView("list");
                      if (item.id === "topics") setTopicView("list");
                    }}
                  >
                    <Icon className="h-4 w-4" />
                    {sidebarOpen && <span className="ml-2">{item.label}</span>}
                  </Button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{menuItems.find((item) => item.id === activeView)?.label || "Dashboard"}</h1>
            <p className="text-gray-600">{t("appDescription")}</p>
          </div>

          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default App;
