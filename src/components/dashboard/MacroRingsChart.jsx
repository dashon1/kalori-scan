import React from "react";
import { Flame } from "lucide-react";

export default function MacroRingsChart({ stats, goals }) {
  const calorieProgress = goals?.daily_calorie_goal ? (stats.calories / goals.daily_calorie_goal) * 100 : 0;
  const proteinProgress = goals?.protein_goal ? (stats.protein / goals.protein_goal) * 100 : 0;
  const carbProgress = goals?.carb_goal ? (stats.carbs / goals.carb_goal) * 100 : 0;
  const fatProgress = goals?.fat_goal ? (stats.fats / goals.fat_goal) * 100 : 0;

  const CircularProgress = ({ percentage, size = 80, strokeWidth = 8, color = "#0d9488" }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

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
          <span className="text-xs font-bold text-gray-700">
            {Math.round(percentage)}%
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
            size={120}
            strokeWidth={12}
            color="#0d9488"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Flame className="w-6 h-6 text-orange-500 mb-1" />
            <span className="text-lg font-bold text-gray-900">{Math.round(stats.calories)}</span>
            <span className="text-xs text-gray-600">cal</span>
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
          <p className="text-xs font-medium text-gray-700 mt-2">Protein</p>
          <p className="text-sm font-bold text-blue-600">{Math.round(stats.protein)}g</p>
        </div>
        
        <div className="text-center">
          <CircularProgress
            percentage={Math.min(carbProgress, 100)}
            size={60}
            strokeWidth={6}
            color="#10b981"
          />
          <p className="text-xs font-medium text-gray-700 mt-2">Carbs</p>
          <p className="text-sm font-bold text-green-600">{Math.round(stats.carbs)}g</p>
        </div>
        
        <div className="text-center">
          <CircularProgress
            percentage={Math.min(fatProgress, 100)}
            size={60}
            strokeWidth={6}
            color="#8b5cf6"
          />
          <p className="text-xs font-medium text-gray-700 mt-2">Fats</p>
          <p className="text-sm font-bold text-purple-600">{Math.round(stats.fats)}g</p>
        </div>
      </div>

      {/* Calorie Summary */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-4">
        <div className="flex justify-between items-center">
          <div className="text-center">
            <p className="text-xs text-gray-600">Goal</p>
            <p className="font-bold text-gray-900">{goals?.daily_calorie_goal || 2000}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600">Consumed</p>
            <p className="font-bold text-teal-600">{Math.round(stats.calories)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600">Remaining</p>
            <p className="font-bold text-orange-600">
              {Math.max(0, (goals?.daily_calorie_goal || 2000) - stats.calories)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}