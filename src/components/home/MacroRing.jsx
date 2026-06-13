import React from "react";

const Flame = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path
      fillRule="evenodd"
      d="M12.97 3.97a.75.75 0 011.06 0l7.5 7.5a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 010-1.06l7.5-7.5zm-1.06 1.06L5.75 11.25l5.166 5.166A6.732 6.732 0 0012 18.75a6.732 6.732 0 006.084-2.334L18.25 11.25l-5.166-5.166a.75.75 0 00-1.06 0z"
      clipRule="evenodd"
    />
  </svg>
);

const Droplets = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path
      fillRule="evenodd"
      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z"
      clipRule="evenodd"
    />
  </svg>
);

export default function MacroRing({ stats, goals, showNetCalories = false, size = 120 }) {
  const safeStats = {
    calories: stats?.calories || 0,
    protein: stats?.protein || 0,
    carbs: stats?.carbs || 0,
    fats: stats?.fats || 0,
    netCalories: stats?.netCalories || 0,
    caloriesBurned: stats?.caloriesBurned || 0,
  };

  const calorieGoal = goals?.daily_calorie_goal || 2000;
  const displayCalories = showNetCalories
    ? Math.max(0, safeStats.netCalories)
    : safeStats.calories;
  const calorieProgress = (displayCalories / calorieGoal) * 100;

  const proteinProgress = goals?.protein_goal
    ? (safeStats.protein / goals.protein_goal) * 100
    : 0;
  const carbProgress = goals?.carb_goal
    ? (safeStats.carbs / goals.carb_goal) * 100
    : 0;
  const fatProgress = goals?.fat_goal
    ? (safeStats.fats / goals.fat_goal) * 100
    : 0;

  const CircularProgress = ({
    percentage,
    size = 80,
    strokeWidth = 8,
    color = "#0d9488",
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset =
      circumference - (Math.min(percentage, 100) / 100) * circumference;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
            {Math.round(Math.min(percentage, 100))}%
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Main Calories Ring */}
      <div className="flex items-center justify-center">
        <div className="relative">
          <CircularProgress
            percentage={Math.min(calorieProgress, 100)}
            size={size}
            strokeWidth={12}
            color="#0d9488"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Flame className="w-6 h-6 text-orange-500 mb-1" />
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {Math.round(displayCalories)}
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {showNetCalories ? "net cal" : "cal"}
            </span>
          </div>
        </div>
      </div>

      {/* Macro Breakdown */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <CircularProgress
            percentage={Math.min(proteinProgress, 100)}
            size={60}
            strokeWidth={6}
            color="#3b82f6"
          />
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-2">
            Protein
          </p>
          <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
            {Math.round(safeStats.protein)}g
          </p>
        </div>

        <div className="text-center">
          <CircularProgress
            percentage={Math.min(carbProgress, 100)}
            size={60}
            strokeWidth={6}
            color="#10b981"
          />
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-2">
            Carbs
          </p>
          <p className="text-sm font-bold text-green-600 dark:text-green-400">
            {Math.round(safeStats.carbs)}g
          </p>
        </div>

        <div className="text-center">
          <CircularProgress
            percentage={Math.min(fatProgress, 100)}
            size={60}
            strokeWidth={6}
            color="#8b5cf6"
          />
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-2">
            Fats
          </p>
          <p className="text-sm font-bold text-purple-600 dark:text-purple-400">
            {Math.round(safeStats.fats)}g
          </p>
        </div>
      </div>

      {/* Calorie Summary */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-2xl p-4">
        <div className="flex justify-between items-center text-sm">
          <div className="text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400">Goal</p>
            <p className="font-bold text-gray-900 dark:text-white">
              {calorieGoal}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {showNetCalories ? "Net" : "Consumed"}
            </p>
            <p className="font-bold text-teal-600 dark:text-teal-400">
              {Math.round(displayCalories)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Remaining
            </p>
            <p className="font-bold text-orange-600 dark:text-orange-400">
              {Math.max(0, calorieGoal - displayCalories)}
            </p>
          </div>
        </div>

        {showNetCalories && safeStats.caloriesBurned > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-xs text-center text-gray-600 dark:text-gray-400">
            You burned {safeStats.caloriesBurned} calories through activities
            today! 🔥
          </div>
        )}
      </div>
    </div>
  );
}