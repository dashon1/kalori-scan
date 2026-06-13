import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Pill, TrendingUp, ShoppingCart, AlertCircle } from "lucide-react";
import { format, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";

export default function MicronutrientGaps() {
  const [weeklyAnalysis, setWeeklyAnalysis] = useState(null);

  const { data: meals = [] } = useQuery({
    queryKey: ['recentMeals'],
    queryFn: () => base44.entities.Meal.list('-created_date', 100)
  });

  const dailyGoals = {
    vitamin_a: 900, // mcg
    vitamin_c: 90, // mg
    vitamin_d: 20, // mcg
    calcium: 1000, // mg
    iron: 18, // mg
    magnesium: 400, // mg
    potassium: 3400, // mg
    zinc: 11 // mg
  };

  useEffect(() => {
    if (meals.length > 0) {
      analyzeWeeklyIntake();
    }
  }, [meals]);

  const analyzeWeeklyIntake = () => {
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    
    const weekMeals = meals.filter(meal => 
      isWithinInterval(new Date(meal.created_date), { start: weekStart, end: weekEnd })
    );

    // Simulate micronutrient extraction (in real app, would come from meal data)
    const estimatedIntake = {
      vitamin_a: weekMeals.length * 150,
      vitamin_c: weekMeals.length * 15,
      vitamin_d: weekMeals.length * 2,
      calcium: weekMeals.length * 120,
      iron: weekMeals.length * 2.5,
      magnesium: weekMeals.length * 50,
      potassium: weekMeals.length * 450,
      zinc: weekMeals.length * 1.5
    };

    const gaps = {};
    Object.keys(dailyGoals).forEach(nutrient => {
      const weeklyGoal = dailyGoals[nutrient] * 7;
      const percentMet = (estimatedIntake[nutrient] / weeklyGoal) * 100;
      gaps[nutrient] = {
        current: estimatedIntake[nutrient],
        goal: weeklyGoal,
        percentMet: Math.min(percentMet, 100),
        isDeficient: percentMet < 70
      };
    });

    setWeeklyAnalysis(gaps);
  };

  const getFoodSuggestions = (nutrient) => {
    const suggestions = {
      vitamin_a: ["Carrots", "Sweet potatoes", "Spinach", "Kale"],
      vitamin_c: ["Oranges", "Strawberries", "Bell peppers", "Broccoli"],
      vitamin_d: ["Salmon", "Fortified milk", "Egg yolks", "Mushrooms"],
      calcium: ["Milk", "Yogurt", "Cheese", "Tofu", "Sardines"],
      iron: ["Red meat", "Lentils", "Spinach", "Quinoa"],
      magnesium: ["Almonds", "Spinach", "Black beans", "Avocado"],
      potassium: ["Bananas", "Potatoes", "Beans", "Yogurt"],
      zinc: ["Oysters", "Beef", "Pumpkin seeds", "Chickpeas"]
    };
    return suggestions[nutrient] || [];
  };

  const nutrientLabels = {
    vitamin_a: "Vitamin A",
    vitamin_c: "Vitamin C",
    vitamin_d: "Vitamin D",
    calcium: "Calcium",
    iron: "Iron",
    magnesium: "Magnesium",
    potassium: "Potassium",
    zinc: "Zinc"
  };

  if (!weeklyAnalysis) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const deficientNutrients = Object.entries(weeklyAnalysis).filter(([_, data]) => data.isDeficient);

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Micronutrient Gaps</h1>
          <p className="text-gray-600 dark:text-gray-400">Weekly analysis of vitamins & minerals</p>
        </div>

        {deficientNutrients.length > 0 && (
          <Card className="glass-effect border-0 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                <AlertCircle className="w-5 h-5" />
                Nutrient Gaps Detected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                You're low on {deficientNutrients.length} nutrient{deficientNutrients.length > 1 ? 's' : ''} this week
              </p>
              <div className="flex flex-wrap gap-2">
                {deficientNutrients.map(([nutrient]) => (
                  <span key={nutrient} className="px-3 py-1 bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200 rounded-full text-sm font-semibold">
                    {nutrientLabels[nutrient]}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="glass-effect border-0">
          <CardHeader>
            <CardTitle>Weekly Micronutrient Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(weeklyAnalysis).map(([nutrient, data]) => (
              <div key={nutrient}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900 dark:text-white">{nutrientLabels[nutrient]}</span>
                  <span className={`text-sm font-semibold ${data.isDeficient ? 'text-orange-600' : 'text-green-600'}`}>
                    {data.percentMet.toFixed(0)}%
                  </span>
                </div>
                <Progress value={data.percentMet} className="h-2 mb-2" />
                
                {data.isDeficient && (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <ShoppingCart className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-semibold">Add to your diet:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {getFoodSuggestions(nutrient).map(food => (
                        <span key={food} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs">
                          {food}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass-effect border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Shopping List Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {deficientNutrients.map(([nutrient]) => (
                <div key={nutrient}>
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                    For {nutrientLabels[nutrient]}:
                  </h4>
                  <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 ml-2">
                    {getFoodSuggestions(nutrient).slice(0, 3).map(food => (
                      <li key={food}>{food}</li>
                    ))}
                  </ul>
                </div>
              ))}
              {deficientNutrients.length === 0 && (
                <p className="text-center text-green-600 dark:text-green-400 py-4">
                  Great job! You're meeting all your micronutrient goals this week! 🎉
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}