import React from "react";
import { Target, TrendingUp, TrendingDown } from "lucide-react";
import { EnergyGoal, EnergyDataPoint } from "../types";

interface GoalsPanelProps {
  goals: EnergyGoal[];
  energyData: EnergyDataPoint[];
  onAddGoal: (target: number, type: 'daily' | 'weekly' | 'monthly') => void;
}

const GoalsPanel: React.FC<GoalsPanelProps> = ({ goals, onAddGoal }) => {
  const [isAdding, setIsAdding] = React.useState(false);
  const [newTarget, setNewTarget] = React.useState("");
  const [newType, setNewType] = React.useState<'daily' | 'weekly' | 'monthly'>('daily');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTarget && !isNaN(Number(newTarget))) {
      onAddGoal(Number(newTarget), newType);
      setNewTarget("");
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Target className="w-5 h-5 text-energy-500" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Energy Goals
        </h2>
      </div>

      {goals.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400 text-center py-8">
          No goals set yet.
        </p>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            const progress = (goal.current / goal.target) * 100;
            const isAchieved = goal.current <= goal.target;
            const remaining = Math.max(0, goal.target - goal.current);

            return (
              <div
                key={goal.id}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white capitalize">
                      {goal.type} Goal
                    </h3>
                    {isAchieved ? (
                      <TrendingDown className="w-4 h-4 text-eco-500" />
                    ) : (
                      <TrendingUp className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {goal.current.toFixed(1)} / {goal.target} kWh
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-3 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isAchieved
                        ? "bg-gradient-to-r from-eco-400 to-eco-600"
                        : progress > 90
                        ? "bg-gradient-to-r from-red-400 to-red-600"
                        : "bg-gradient-to-r from-yellow-400 to-yellow-600"
                    }`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span
                    className={`font-medium ${
                      isAchieved
                        ? "text-eco-600 dark:text-eco-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {isAchieved
                      ? `✓ Goal achieved! ${remaining.toFixed(1)} kWh remaining`
                      : `${remaining.toFixed(1)} kWh over target`}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {progress.toFixed(0)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Goal Section */}
      {isAdding ? (
        <form onSubmit={handleSubmit} className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3 animate-fade-in">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target (kWh)</label>
            <input
              type="number"
              value={newTarget}
              onChange={(e) => setNewTarget(e.target.value)}
              className="bg-white w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-gray-700 dark:text-white focus:ring-2 focus:ring-energy-500"
              placeholder="e.g. 50"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Period</label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as any)}
              className="bg-white w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-gray-700 dark:text-white focus:ring-2 focus:ring-energy-500"
            >
              <option value="daily">Daily</option>
              {/* Future support for weekly/monthly */}
            </select>
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-energy-600 text-white rounded-lg hover:bg-energy-700 transition-colors"
            >
              Save Goal
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button 
          onClick={() => setIsAdding(true)}
          className="w-full mt-4 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-eco-500 hover:text-eco-500 transition-colors"
        >
          + Add New Goal
        </button>
      )}
    </div>
  );
};

export default GoalsPanel;
