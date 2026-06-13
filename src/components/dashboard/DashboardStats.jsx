import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame, Utensils } from "lucide-react";

export default function DashboardStats({ stats, goals, mealsCount }) {
  const getProgressColor = (current, target) => {
    const percentage = (current / target) * 100;
    if (percentage >= 100) return "bg-green-500";
    if (percentage >= 75) return "bg-yellow-500";
    return "bg-teal-500";
  };

  const macroStats = [
    {
      name: "Protein",
      current: Math.round(stats.protein),
      target: goals?.protein_goal || 150,
      unit: "g",
      color: "text-blue-600"
    },
    {
      name: "Carbs", 
      current: Math.round(stats.carbs),
      target: goals?.carb_goal || 200,
      unit: "g",
      color: "text-green-600"
    },
    {
      name: "Fats",
      current: Math.round(stats.fats),
      target: goals?.fat_goal || 65,
      unit: "g", 
      color: "text-purple-600"
    }
  ];

  return (
    <div className="space-y-4">
      {/* Main Calorie Card */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Daily Calories</h3>
                <p className="text-sm text-gray-600">
                  {Math.round(stats.calories)} / {goals?.daily_calorie_goal || 2000} cal
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{Math.round(stats.calories)}</p>
              <p className="text-sm text-gray-600">
                {Math.round(((goals?.daily_calorie_goal || 2000) - stats.calories))} left
              </p>
            </div>
          </div>
          <Progress 
            value={(stats.calories / (goals?.daily_calorie_goal || 2000)) * 100} 
            className="h-2"
          />
        </CardContent>
      </Card>

      {/* Macro Cards */}
      <div className="grid grid-cols-3 gap-3">
        {macroStats.map((macro) => (
          <Card key={macro.name} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">{macro.name}</p>
                <p className={`text-lg font-bold ${macro.color}`}>
                  {macro.current}{macro.unit}
                </p>
                <p className="text-xs text-gray-500">
                  of {macro.target}{macro.unit}
                </p>
                <div className="mt-2">
                  <Progress 
                    value={(macro.current / macro.target) * 100} 
                    className="h-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-teal-600" />
              <span className="text-sm font-medium text-gray-900">Meals Today</span>
            </div>
            <span className="text-lg font-bold text-teal-600">{mealsCount}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}