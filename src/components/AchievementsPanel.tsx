import React from "react";
import { Award, Lock } from "lucide-react";
import { Achievement } from "../types";

interface AchievementsPanelProps {
  achievements: Achievement[];
}

const AchievementsPanel: React.FC<AchievementsPanelProps> = ({
  achievements,
}) => {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Award className="w-5 h-5 text-yellow-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Achievements
          </h2>
        </div>
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {unlockedCount} / {achievements.length}
        </span>
      </div>

      <div className="space-y-3">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`p-4 rounded-lg border-2 transition-all ${
              achievement.unlocked
                ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 dark:from-yellow-900/20 dark:to-orange-900/20 dark:border-yellow-700"
                : "bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600 opacity-60"
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="text-3xl flex-shrink-0">
                {achievement.unlocked ? (
                  achievement.icon
                ) : (
                  <Lock className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {achievement.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {achievement.description}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {achievement.unlocked
                    ? `Unlocked ${achievement.unlockedDate?.toLocaleDateString()}`
                    : `Requirement: ${achievement.requirement}`}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AchievementsPanel;
