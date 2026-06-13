import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, TrendingDown, Award, TreesIcon } from "lucide-react";
import { startOfWeek, endOfWeek, isWithinInterval, format } from "date-fns";
import { Progress } from "@/components/ui/progress";

export default function EnvironmentalImpact() {
  const [weeklyImpact, setWeeklyImpact] = useState(null);

  const { data: meals = [] } = useQuery({
    queryKey: ['recentMeals'],
    queryFn: () => base44.entities.Meal.list('-created_date', 100)
  });

  useEffect(() => {
    if (meals.length > 0) {
      calculateImpact();
    }
  }, [meals]);

  const getCarbonFootprint = (mealName, calories) => {
    const name = mealName.toLowerCase();
    
    // Rough estimates of CO2 per 100 calories
    if (name.includes('beef') || name.includes('steak')) return calories * 0.08;
    if (name.includes('lamb')) return calories * 0.07;
    if (name.includes('cheese') || name.includes('dairy')) return calories * 0.04;
    if (name.includes('chicken') || name.includes('turkey')) return calories * 0.03;
    if (name.includes('pork')) return calories * 0.03;
    if (name.includes('fish') || name.includes('seafood')) return calories * 0.025;
    if (name.includes('egg')) return calories * 0.02;
    if (name.includes('plant') || name.includes('vegan') || name.includes('vegetable')) return calories * 0.01;
    if (name.includes('fruit')) return calories * 0.008;
    if (name.includes('grain') || name.includes('rice') || name.includes('pasta')) return calories * 0.012;
    
    return calories * 0.025; // default
  };

  const calculateImpact = () => {
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    
    const weekMeals = meals.filter(meal => 
      isWithinInterval(new Date(meal.created_date), { start: weekStart, end: weekEnd })
    );

    const totalCO2 = weekMeals.reduce((sum, meal) => {
      return sum + getCarbonFootprint(meal.name, meal.calories);
    }, 0);

    // Calculate what could have been saved with plant-based
    const potentialCO2 = weekMeals.reduce((sum, meal) => {
      return sum + (meal.calories * 0.01); // Plant-based baseline
    }, 0);

    const co2Saved = totalCO2 - potentialCO2;
    const treesEquivalent = (totalCO2 / 21).toFixed(1); // A tree absorbs ~21kg CO2/year
    const milesDriven = (totalCO2 * 2.4).toFixed(0); // 1kg CO2 ≈ 2.4 miles driven

    setWeeklyImpact({
      totalCO2: totalCO2.toFixed(2),
      treesEquivalent,
      milesDriven,
      weekMeals,
      co2Saved: co2Saved > 0 ? co2Saved.toFixed(2) : 0
    });
  };

  if (!weeklyImpact) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const avgCO2 = 50; // Average person's weekly food CO2
  const percentOfAvg = (parseFloat(weeklyImpact.totalCO2) / avgCO2) * 100;
  const isGood = percentOfAvg < 100;

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <Leaf className="w-8 h-8 text-green-600" />
            Environmental Impact
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Track the carbon footprint of your food choices</p>
        </div>

        {/* Main Impact Card */}
        <Card className="glass-effect border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <CardHeader>
            <CardTitle>This Week's Carbon Footprint</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-baseline gap-2">
                <p className="text-6xl font-bold text-green-600">{weeklyImpact.totalCO2}</p>
                <p className="text-2xl text-gray-600 dark:text-gray-400">kg CO₂</p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">from your food this week</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">vs Average Person</span>
                <span className={`text-sm font-semibold ${isGood ? 'text-green-600' : 'text-orange-600'}`}>
                  {percentOfAvg.toFixed(0)}%
                </span>
              </div>
              <Progress value={Math.min(percentOfAvg, 100)} className="h-3" />
              {isGood && (
                <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  Below average! Great job! 🎉
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center">
                <TreesIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{weeklyImpact.treesEquivalent}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">trees needed to offset</p>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center">
                <span className="text-4xl">🚗</span>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{weeklyImpact.milesDriven}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">miles driven equivalent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meal Breakdown */}
        <Card className="glass-effect border-0">
          <CardHeader>
            <CardTitle>Your Meals' Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weeklyImpact.weekMeals
                .map(meal => ({
                  ...meal,
                  co2: getCarbonFootprint(meal.name, meal.calories)
                }))
                .sort((a, b) => b.co2 - a.co2)
                .slice(0, 10)
                .map(meal => {
                  const impact = meal.co2 < 3 ? 'low' : meal.co2 < 6 ? 'medium' : 'high';
                  const color = impact === 'low' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                               impact === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                               'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
                  
                  return (
                    <div key={meal.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <img src={meal.photo_url} alt={meal.name} className="w-12 h-12 rounded-lg object-cover" />
                        <div>
                          <h4 className="font-semibold text-sm text-gray-900 dark:text-white">{meal.name}</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {format(new Date(meal.created_date), 'MMM d')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-white">{meal.co2.toFixed(1)} kg</p>
                        <span className={`text-xs px-2 py-1 rounded ${color}`}>
                          {impact} impact
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="glass-effect border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5" />
              How to Reduce Your Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {[
                { emoji: '🌱', title: 'Eat more plants', desc: 'Plant-based meals have 10x lower carbon footprint', impact: '-80% CO₂' },
                { emoji: '🐓', title: 'Choose chicken over beef', desc: 'Poultry produces 3x less emissions than red meat', impact: '-60% CO₂' },
                { emoji: '🥗', title: 'Eat local & seasonal', desc: 'Reduces transportation emissions significantly', impact: '-30% CO₂' },
                { emoji: '🍽️', title: 'Reduce food waste', desc: 'Only buy and cook what you need', impact: '-25% CO₂' },
                { emoji: '🌊', title: 'Choose sustainable seafood', desc: 'Look for MSC certified options', impact: '-20% CO₂' }
              ].map((tip, idx) => (
                <li key={idx} className="flex items-start gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                  <span className="text-2xl">{tip.emoji}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">{tip.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{tip.desc}</p>
                  </div>
                  <span className="text-xs font-semibold text-green-600 whitespace-nowrap">{tip.impact}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}