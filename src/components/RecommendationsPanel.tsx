import React from "react";
import { Sparkles, CheckCircle } from "lucide-react";
import { Recommendation } from "../types";

interface RecommendationsPanelProps {
  recommendations: Recommendation[];
  onImplement: (recId: string) => void;
  isLoading: boolean;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    case "medium":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
    case "low":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  }
};

const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({
  recommendations,
  onImplement,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="card animate-slide-up p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-xl">
            <Sparkles className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              AI Recommendations
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Generating insights...
            </p>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-5 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className="h-6 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
                <div className="flex gap-2">
                  <div className="h-5 w-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                  <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                </div>
                <div className="h-24 bg-gray-100 dark:bg-gray-700/50 rounded-lg animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card animate-slide-up p-6 h-fit bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-xl">
            <Sparkles className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              AI Recommendations
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {recommendations.length} personalized tips
            </p>
          </div>
        </div>
      </div>

      {recommendations.length === 0 ? (
        <div className="text-center py-12 px-6 rounded-2xl bg-gray-50 dark:bg-gray-700/30 border-2 border-dashed border-gray-200 dark:border-gray-700">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Active Recommendations
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
            Click the "Settings" button in the top right to generate new AI-powered energy saving tips.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations
            .sort((a, b) => {
              const priorityOrder = { high: 0, medium: 1, low: 2 };
              return priorityOrder[a.priority] - priorityOrder[b.priority];
            })
            .map((rec, index) => (
              <div
                key={rec.id}
                className={`group relative p-5 rounded-xl border-2 transition-all duration-300 hover:-translate-y-1 ${
                  rec.implemented
                    ? "bg-gradient-to-br from-primary-50 to-emerald-50 dark:from-primary-900/20 dark:to-emerald-900/20 border-primary-300 dark:border-primary-700 shadow-soft"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-soft-lg"
                }`}
                style={{
                  animation: `slideUp 0.3s ease-out ${index * 50}ms backwards`,
                }}
              >
                {rec.implemented && (
                  <div className="absolute top-3 right-3">
                    <div className="flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 rounded-full">
                      <CheckCircle className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                      <span className="text-2xs font-bold text-primary-700 dark:text-primary-300">
                        DONE
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-2 mb-3">
                      <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight flex-1 pr-12">
                        {rec.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className={`badge text-2xs px-2.5 py-1 font-bold uppercase tracking-wide ${getPriorityColor(
                          rec.priority
                        )}`}
                      >
                        {rec.priority}
                      </span>
                      <span className="badge badge-info text-2xs px-2.5 py-1 font-bold capitalize">
                        {rec.category}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-4 p-4 bg-gradient-to-br from-primary-50 to-emerald-50 dark:from-primary-900/10 dark:to-emerald-900/10 rounded-lg border border-primary-200 dark:border-primary-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Potential Savings
                    </span>
                    <div className="text-right">
                      <p className="text-3xl font-bold number-display bg-gradient-to-r from-primary-600 to-emerald-600 bg-clip-text text-transparent">
                        ${rec.potentialSavings.toFixed(2)}
                      </p>
                      <p className="text-2xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                        per month
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  {rec.description}
                </p>

                {!rec.implemented && (
                  <button
                    onClick={() => onImplement(rec.id)}
                    className="btn btn-primary w-full group-hover:scale-[1.02] transition-transform"
                  >
                    <CheckCircle className="w-4 h-4 inline-block mr-2" />
                    Mark as Implemented
                  </button>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default RecommendationsPanel;
