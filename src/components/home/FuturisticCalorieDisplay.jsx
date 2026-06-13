import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Flame, TrendingDown, Target, Zap } from 'lucide-react';

export default function FuturisticCalorieDisplay({ 
  consumed, 
  burned, 
  goal, 
  netCalories, 
  remainingCalories,
  protein,
  carbs,
  fats,
  proteinGoal,
  carbGoal,
  fatGoal
}) {
  const netPercentage = Math.min((netCalories / goal) * 100, 100);
  
  return (
    <Card className="glass-effect border-0 shadow-lg rounded-3xl overflow-hidden">
      <CardContent className="p-4">
        {/* Compact Main Display */}
        <div className="flex items-center gap-4 mb-4">
          {/* Central Ring - Smaller */}
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                className="text-gray-200 dark:text-gray-700"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="url(#compactGradient)"
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${netPercentage * 2.513}, 251.3`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="compactGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {Math.max(0, remainingCalories)}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">left</span>
            </div>
          </div>
          
          {/* Compact Stats - Horizontal Layout */}
          <div className="flex-1 grid grid-cols-2 gap-2">
            <div className="bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-xl p-2 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Flame className="w-3 h-3 text-orange-500" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Eaten</span>
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">{Math.round(consumed)}</div>
            </div>
            
            <div className="bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 rounded-xl p-2 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingDown className="w-3 h-3 text-red-500" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Burned</span>
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">{Math.round(burned)}</div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-xl p-2 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Target className="w-3 h-3 text-blue-500" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Goal</span>
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">{Math.round(goal)}</div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-xl p-2 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Zap className="w-3 h-3 text-purple-500" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Net</span>
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">{Math.round(netCalories)}</div>
            </div>
          </div>
        </div>

        {/* Compact Macro Progress - Single Row */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
          {/* Protein */}
          <div className="flex flex-col items-center">
            <div className="relative w-8 h-8 mb-1">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9155" className="stroke-current text-gray-200 dark:text-gray-700" strokeWidth="2" fill="none" />
                <circle 
                  cx="18" cy="18" r="15.9155" 
                  className="stroke-current text-blue-500" 
                  strokeWidth="2" fill="none" 
                  strokeDasharray={`${Math.min((protein / proteinGoal) * 100, 100)}, 100`} 
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-gray-900 dark:text-white">{Math.round(protein)}</span>
              </div>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Protein</span>
          </div>

          {/* Carbs */}
          <div className="flex flex-col items-center">
            <div className="relative w-8 h-8 mb-1">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9155" className="stroke-current text-gray-200 dark:text-gray-700" strokeWidth="2" fill="none" />
                <circle 
                  cx="18" cy="18" r="15.9155" 
                  className="stroke-current text-green-500" 
                  strokeWidth="2" fill="none" 
                  strokeDasharray={`${Math.min((carbs / carbGoal) * 100, 100)}, 100`} 
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-gray-900 dark:text-white">{Math.round(carbs)}</span>
              </div>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Carbs</span>
          </div>

          {/* Fats */}
          <div className="flex flex-col items-center">
            <div className="relative w-8 h-8 mb-1">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9155" className="stroke-current text-gray-200 dark:text-gray-700" strokeWidth="2" fill="none" />
                <circle 
                  cx="18" cy="18" r="15.9155" 
                  className="stroke-current text-purple-500" 
                  strokeWidth="2" fill="none" 
                  strokeDasharray={`${Math.min((fats / fatGoal) * 100, 100)}, 100`} 
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-gray-900 dark:text-white">{Math.round(fats)}</span>
              </div>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Fats</span>
          </div>
        </div>

        {/* Net Calories Insight - Compact */}
        {burned > 0 && (
          <div className="mt-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Net: {Math.round(consumed)} - {Math.round(burned)}
              </span>
              <span className={`font-bold ${netCalories > goal ? 'text-orange-600' : 'text-green-600'} dark:text-white`}>
                {Math.round(netCalories)} cal
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}