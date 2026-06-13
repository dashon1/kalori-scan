import React from "react";
import { Flame, Utensils, Star, Activity } from "lucide-react";

export default function DayMacroSummary({ stats, mealCount, activityCount = 0 }) {
  const macros = [
    { name: 'Protein', value: Math.round(stats.protein), color: 'bg-blue-500', textColor: 'text-blue-600 dark:text-blue-400' },
    { name: 'Carbs', value: Math.round(stats.carbs), color: 'bg-green-500', textColor: 'text-green-600 dark:text-green-400' },
    { name: 'Fats', value: Math.round(stats.fats), color: 'bg-purple-500', textColor: 'text-purple-600 dark:text-purple-400' },
  ];
  
  const totalMacros = macros.reduce((sum, macro) => sum + macro.value, 0) || 1;

  return (
    <div className="space-y-4">
      {/* Daily Overview */}
      <div className="grid grid-cols-4 gap-3 text-center">
        <div className="p-3 bg-orange-50 dark:bg-orange-900/30 rounded-2xl">
          <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-gray-900 dark:text-white">{Math.round(stats.calories)}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Consumed</p>
        </div>
        <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-2xl">
          <Activity className="w-5 h-5 text-red-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-gray-900 dark:text-white">{Math.round(stats.caloriesBurned || 0)}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Burned</p>
        </div>
        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl">
          <Utensils className="w-5 h-5 text-blue-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-gray-900 dark:text-white">{mealCount}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Meals</p>
        </div>
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-2xl">
          <Star className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.avgHealthScore.toFixed(1)}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Avg Score</p>
        </div>
      </div>

      {/* Net Calories Display */}
      {stats.caloriesBurned > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-2xl p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Net Calories:</span>
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {Math.round(stats.netCalories || (stats.calories - stats.caloriesBurned))}
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Calories consumed minus calories burned through activities
          </p>
        </div>
      )}

      {/* Macro Breakdown */}
      <div>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">Macro Distribution</h4>
        <div className="flex rounded-full overflow-hidden h-2 w-full bg-gray-200 dark:bg-gray-700 mb-2">
          {macros.map(macro => (
            <div
              key={macro.name}
              className={`${macro.color}`}
              style={{ width: `${(macro.value / totalMacros) * 100}%` }}
            />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {macros.map(macro => (
            <div key={macro.name}>
              <p className={`font-semibold ${macro.textColor}`}>{macro.value}g</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{macro.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Nutrients */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <p className="font-semibold text-gray-900 dark:text-white">{Math.round(stats.fiber)}g</p>
          <p className="text-gray-600 dark:text-gray-400">Fiber</p>
        </div>
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <p className="font-semibold text-gray-900 dark:text-white">{Math.round(stats.sugar)}g</p>
          <p className="text-gray-600 dark:text-gray-400">Sugar</p>
        </div>
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <p className="font-semibold text-gray-900 dark:text-white">{Math.round(stats.sodium)}mg</p>
          <p className="text-gray-600 dark:text-gray-400">Sodium</p>
        </div>
      </div>
    </div>
  );
}