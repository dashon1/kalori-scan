import React from 'react';
import { Flame, Target, TrendingDown } from 'lucide-react';

export default function CalorieRing({ consumed, burned, goal, netCalories, remainingCalories }) {
  const progress = Math.min((netCalories / goal) * 100, 100);
  const circumference = 2 * Math.PI * 45; // radius of 45
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      {/* Main Calorie Ring */}
      <div className="relative w-32 h-32 mb-4">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            className="text-gray-200 dark:text-gray-700"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="url(#gradient)"
            strokeWidth="6"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {Math.max(0, remainingCalories)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            calories left
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex justify-between w-full max-w-xs">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 mb-1">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Eaten</span>
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white">{Math.round(consumed)}</span>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 mb-1">
            <TrendingDown className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Burned</span>
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white">{Math.round(burned)}</span>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 mb-1">
            <Target className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Goal</span>
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white">{Math.round(goal)}</span>
        </div>
      </div>
    </div>
  );
}