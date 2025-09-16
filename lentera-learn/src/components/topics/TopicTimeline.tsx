import React from "react";
import { Topic } from "@/types/lentera";
import { Check, Lock, Play, Clock } from "lucide-react";

interface TopicTimelineProps {
  topics: Topic[];
  currentTopic: string;
  completedTopics: string[];
  onTopicSelect: (topicId: string) => void;
}

const TopicTimeline: React.FC<TopicTimelineProps> = ({ topics, currentTopic, completedTopics, onTopicSelect }) => {
  const getTopicStatus = (topicId: number, index: number): string => {
    if (completedTopics.includes(topicId.toString())) {
      return "completed";
    }
    if (topicId.toString() === currentTopic) {
      return "current";
    }
    // Check if previous topic is completed or if it's the first topic
    if (index === 0 || completedTopics.includes(topics[index - 1]?.id.toString())) {
      return "available";
    }
    return "locked";
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "completed":
        return {
          node: "bg-green-500 border-green-500 text-white",
          connector: "bg-green-500",
          card: "bg-green-50 border-green-200 hover:bg-green-100",
        };
      case "current":
        return {
          node: "bg-blue-500 border-blue-500 text-white",
          connector: "bg-gray-300",
          card: "bg-blue-50 border-blue-200 hover:bg-blue-100",
        };
      case "available":
        return {
          node: "bg-white border-blue-500 text-blue-500 hover:bg-blue-50",
          connector: "bg-gray-300",
          card: "bg-white border-gray-200 hover:bg-gray-50",
        };
      case "locked":
      default:
        return {
          node: "bg-gray-200 border-gray-300 text-gray-400",
          connector: "bg-gray-200",
          card: "bg-gray-50 border-gray-200 opacity-60",
        };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <Check className="w-3 h-3" />;
      case "current":
        return <Play className="w-3 h-3" />;
      case "locked":
        return <Lock className="w-3 h-3" />;
      default:
        return <div className="w-2 h-2 bg-current rounded-full" />;
    }
  };

  const getDifficultyColor = (level: string | number) => {
    const levelStr = typeof level === "number" ? (level === 1 ? "beginner" : level === 2 ? "intermediate" : "advanced") : level;

    switch (levelStr) {
      case "beginner":
        return "var(--green-600)";
      case "intermediate":
        return "var(--yellow-600)";
      case "advanced":
        return "var(--red-600)";
      default:
        return "var(--gray-600)";
    }
  };

  const getDifficultyText = (level: string | number) => {
    const levelStr = typeof level === "number" ? (level === 1 ? "beginner" : level === 2 ? "intermediate" : "advanced") : level;

    switch (levelStr) {
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

  return (
    <div className="relative">
      {topics.map((topic, index) => {
        const status = getTopicStatus(topic.id, index);
        const styles = getStatusStyles(status);
        const isClickable = status === "available" || status === "current" || status === "completed";

        return (
          <div key={topic.id} className="relative">
            {/* Timeline Connector */}
            {index > 0 && <div className={`absolute left-3 top-0 w-0.5 h-6 -translate-y-6 ${styles.connector}`} />}

            <div className="flex items-start space-x-4 mb-6">
              {/* Timeline Node */}
              <div
                className={`relative z-10 flex items-center justify-center w-6 h-6 rounded-full border-2 ${styles.node} ${isClickable ? "cursor-pointer" : "cursor-not-allowed"}`}
                onClick={() => isClickable && onTopicSelect(topic.id.toString())}
              >
                {getStatusIcon(status)}
              </div>

              {/* Topic Card */}
              <div className={`flex-1 p-4 rounded-lg border transition-all duration-200 ${styles.card} ${isClickable ? "cursor-pointer" : "cursor-not-allowed"}`} onClick={() => isClickable && onTopicSelect(topic.id.toString())}>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{topic.name}</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{topic.estimatedDuration} menit</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{topic.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`text-xs font-medium ${getDifficultyColor(topic.difficultyLevel)}`}>{getDifficultyText(topic.difficultyLevel)}</span>
                    <span className="text-xs text-gray-500">Topik</span>
                  </div>

                  {status === "completed" && (
                    <div className="flex items-center text-green-600 text-xs">
                      <Check className="w-3 h-3 mr-1" />
                      Selesai
                    </div>
                  )}

                  {status === "current" && (
                    <div className="flex items-center text-blue-600 text-xs">
                      <Play className="w-3 h-3 mr-1" />
                      Sedang Belajar
                    </div>
                  )}

                  {status === "locked" && (
                    <div className="flex items-center text-gray-400 text-xs">
                      <Lock className="w-3 h-3 mr-1" />
                      Terkunci
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TopicTimeline;
