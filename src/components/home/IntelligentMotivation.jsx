import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, Target, TrendingUp, Award, Flame } from 'lucide-react';

const getIntelligentMotivation = (user, mealStats, caloriesBurned, mealsCount, activitiesCount) => {
  const hour = new Date().getHours();
  const calorieGoal = user?.daily_calorie_goal || 2000;
  const netCalories = mealStats.calories - caloriesBurned;
  const progress = (netCalories / calorieGoal) * 100;
  
  // Early morning motivation
  if (hour < 10 && mealsCount === 0) {
    return {
      icon: Flame,
      color: "from-orange-500 to-yellow-500",
      title: "Rise & Fuel! ☀️",
      message: "Your metabolism is ready. Let's start strong!",
      type: "morning"
    };
  }
  
  // Late morning without breakfast
  if (hour >= 10 && hour < 12 && mealsCount === 0) {
    return {
      icon: Target,
      color: "from-blue-500 to-cyan-500",
      title: "Perfect Timing! 🎯",
      message: "Your body needs fuel for peak performance.",
      type: "reminder"
    };
  }
  
  // Afternoon with good progress
  if (hour >= 12 && hour < 17 && progress >= 40 && progress <= 80) {
    return {
      icon: TrendingUp,
      color: "from-green-500 to-emerald-500",
      title: "Crushing It! 💪",
      message: `${Math.round(progress)}% to goal! Building healthy habits.`,
      type: "encouragement"
    };
  }
  
  // Evening goal achieved
  if (hour >= 17 && progress >= 90) {
    return {
      icon: Award,
      color: "from-purple-500 to-pink-500",
      title: "Mission Complete! 🏆",
      message: "Daily goals achieved! Your dedication shows.",
      type: "celebration"
    };
  }
  
  // Active day recognition
  if (activitiesCount >= 2 || caloriesBurned >= 300) {
    return {
      icon: Zap,
      color: "from-red-500 to-orange-500",
      title: "Active Achiever! 🔥",
      message: `${Math.round(caloriesBurned)} cal burned! Balance with nutrition.`,
      type: "active"
    };
  }
  
  // Low intake concern
  if (hour >= 14 && progress < 30) {
    return {
      icon: Target,
      color: "from-blue-500 to-indigo-500",
      title: "Fuel Check! ⚡",
      message: "Your body needs energy. Consider a nutritious meal.",
      type: "concern"
    };
  }
  
  // Default motivational
  return {
    icon: Zap,
    color: "from-teal-500 to-blue-500",
    title: "Keep Going! 💫",
    message: "Every healthy choice builds a better you.",
    type: "general"
  };
};

export default function IntelligentMotivation({ user, mealStats, caloriesBurned, mealsCount, activitiesCount }) {
  const [motivation, setMotivation] = useState(null);

  useEffect(() => {
    const motivationData = getIntelligentMotivation(user, mealStats, caloriesBurned, mealsCount, activitiesCount);
    setMotivation(motivationData);
  }, [user, mealStats, caloriesBurned, mealsCount, activitiesCount]);

  if (!motivation) return null;

  const IconComponent = motivation.icon;

  return (
    <Card className={`glass-effect border-0 shadow-lg rounded-2xl overflow-hidden bg-gradient-to-r ${motivation.color} bg-opacity-10`}>
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl bg-gradient-to-r ${motivation.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
            <IconComponent className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{motivation.title}</h3>
            <p className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed">{motivation.message}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}