import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplet, AlertCircle, TrendingUp } from "lucide-react";
import { format, isToday } from "date-fns";
import { Progress } from "@/components/ui/progress";

export default function HydrationSync() {
  const [recommendations, setRecommendations] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: todaysMeals = [] } = useQuery({
    queryKey: ['todaysMeals'],
    queryFn: async () => {
      const meals = await base44.entities.Meal.list('-created_date', 50);
      return meals.filter(m => isToday(new Date(m.created_date)));
    }
  });

  useEffect(() => {
    if (todaysMeals.length > 0) {
      calculateHydrationNeeds();
    }
  }, [todaysMeals]);

  const calculateHydrationNeeds = () => {
    let baseWater = 2000; // ml
    let extraWater = 0;
    const reasons = [];

    // Check sodium
    const totalSodium = todaysMeals.reduce((sum, meal) => sum + (meal.sodium || 0), 0);
    if (totalSodium > 2000) {
      extraWater += 500;
      reasons.push(`High sodium intake (${totalSodium}mg) - need extra water to flush it out`);
    }

    // Check fiber
    const totalFiber = todaysMeals.reduce((sum, meal) => sum + (meal.fiber || 0), 0);
    if (totalFiber > 25) {
      extraWater += 300;
      reasons.push(`High fiber intake (${totalFiber}g) - water helps fiber work effectively`);
    }

    // Check protein
    const totalProtein = todaysMeals.reduce((sum, meal) => sum + (meal.protein || 0), 0);
    if (totalProtein > 150) {
      extraWater += 400;
      reasons.push(`High protein intake (${totalProtein}g) - kidneys need water to process protein`);
    }

    // Check sugar
    const totalSugar = todaysMeals.reduce((sum, meal) => sum + (meal.sugar || 0), 0);
    if (totalSugar > 50) {
      extraWater += 250;
      reasons.push(`High sugar intake (${totalSugar}g) - helps regulate blood sugar`);
    }

    setRecommendations({
      baseWater,
      extraWater,
      totalRecommended: baseWater + extraWater,
      reasons,
      currentIntake: user?.daily_water_intake || 0
    });
  };

  if (!recommendations) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const percentMet = (recommendations.currentIntake / recommendations.totalRecommended) * 100;

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <Droplet className="w-8 h-8 text-blue-600" />
            Hydration Sync
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Smart water recommendations based on your meals</p>
        </div>

        {/* Main Hydration Card */}
        <Card className="glass-effect border-0 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
          <CardHeader>
            <CardTitle>Today's Hydration Goal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full border-8 border-blue-200 dark:border-blue-800 flex items-center justify-center">
                  <div>
                    <p className="text-3xl font-bold text-blue-600">{recommendations.currentIntake}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">ml</p>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                of {recommendations.totalRecommended}ml recommended
              </p>
              <Progress value={percentMet} className="h-3 mt-4" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Base Need</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{recommendations.baseWater}ml</p>
              </div>
              <div className="p-4 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Extra Needed</p>
                <p className="text-2xl font-bold text-orange-600">+{recommendations.extraWater}ml</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Why Extra Water? */}
        {recommendations.reasons.length > 0 && (
          <Card className="glass-effect border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                Why You Need Extra Water Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendations.reasons.map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <Droplet className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">{reason}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card className="glass-effect border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Hydration Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-2xl">💧</span>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Drink before meals</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Helps with digestion and portion control</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl">⏰</span>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Set reminders</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Every 2 hours during the day</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl">🍋</span>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Add flavor</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Lemon, cucumber, or mint make water more enjoyable</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl">🏃</span>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">After exercise</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Add 500ml for every hour of activity</p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}