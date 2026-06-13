import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { format, subMonths, subDays, isSameDay } from "date-fns";

export default function FoodTimeMachine() {
  const [selectedPeriod, setSelectedPeriod] = useState('1month');

  const { data: meals = [] } = useQuery({
    queryKey: ['allMeals'],
    queryFn: () => base44.entities.Meal.list('-created_date', 1000)
  });

  const getComparisonDate = () => {
    const today = new Date();
    switch (selectedPeriod) {
      case '1week':
        return subDays(today, 7);
      case '1month':
        return subMonths(today, 1);
      case '6months':
        return subMonths(today, 6);
      case '1year':
        return subMonths(today, 12);
      default:
        return subMonths(today, 1);
    }
  };

  const comparisonDate = getComparisonDate();
  const todaysMeals = meals.filter(m => isSameDay(new Date(m.created_date), new Date()));
  const pastMeals = meals.filter(m => isSameDay(new Date(m.created_date), comparisonDate));

  const calculateStats = (mealsList) => {
    if (mealsList.length === 0) return { calories: 0, protein: 0, carbs: 0, fats: 0, avgHealth: 0 };
    
    const totals = mealsList.reduce((acc, meal) => ({
      calories: acc.calories + (meal.calories * (meal.quantity || 1)),
      protein: acc.protein + ((meal.protein || 0) * (meal.quantity || 1)),
      carbs: acc.carbs + ((meal.carbs || 0) * (meal.quantity || 1)),
      fats: acc.fats + ((meal.fats || 0) * (meal.quantity || 1)),
      health: acc.health + (meal.health_score || 5)
    }), { calories: 0, protein: 0, carbs: 0, fats: 0, health: 0 });

    return {
      calories: Math.round(totals.calories),
      protein: Math.round(totals.protein),
      carbs: Math.round(totals.carbs),
      fats: Math.round(totals.fats),
      avgHealth: (totals.health / mealsList.length).toFixed(1)
    };
  };

  const todayStats = calculateStats(todaysMeals);
  const pastStats = calculateStats(pastMeals);

  const getChange = (current, past) => {
    if (past === 0) return { percent: 0, direction: 'same' };
    const percent = ((current - past) / past * 100).toFixed(0);
    return {
      percent: Math.abs(percent),
      direction: current > past ? 'up' : current < past ? 'down' : 'same'
    };
  };

  const getChangeIcon = (direction) => {
    if (direction === 'up') return <TrendingUp className="w-4 h-4 text-red-600" />;
    if (direction === 'down') return <TrendingDown className="w-4 h-4 text-green-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const periods = [
    { value: '1week', label: '1 Week Ago' },
    { value: '1month', label: '1 Month Ago' },
    { value: '6months', label: '6 Months Ago' },
    { value: '1year', label: '1 Year Ago' }
  ];

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <Clock className="w-8 h-8 text-blue-600" />
            Food Time Machine
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Compare your eating habits over time</p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {periods.map(period => (
            <button
              key={period.value}
              onClick={() => setSelectedPeriod(period.value)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                selectedPeriod === period.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Today's Data */}
          <Card className="glass-effect border-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <CardHeader>
              <CardTitle>Today</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">{format(new Date(), 'MMM d, yyyy')}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Calories</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{todayStats.calories}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Protein</p>
                  <p className="text-lg font-semibold">{todayStats.protein}g</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Carbs</p>
                  <p className="text-lg font-semibold">{todayStats.carbs}g</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Fats</p>
                  <p className="text-lg font-semibold">{todayStats.fats}g</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Health Score</p>
                <p className="text-2xl font-bold text-blue-600">{todayStats.avgHealth}/10</p>
              </div>
            </CardContent>
          </Card>

          {/* Past Data */}
          <Card className="glass-effect border-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50">
            <CardHeader>
              <CardTitle>{periods.find(p => p.value === selectedPeriod)?.label}</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">{format(comparisonDate, 'MMM d, yyyy')}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Calories</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{pastStats.calories}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Protein</p>
                  <p className="text-lg font-semibold">{pastStats.protein}g</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Carbs</p>
                  <p className="text-lg font-semibold">{pastStats.carbs}g</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Fats</p>
                  <p className="text-lg font-semibold">{pastStats.fats}g</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Health Score</p>
                <p className="text-2xl font-bold text-gray-600">{pastStats.avgHealth}/10</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Analysis */}
        <Card className="glass-effect border-0">
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'Calories', current: todayStats.calories, past: pastStats.calories, good: 'down' },
                { label: 'Protein', current: todayStats.protein, past: pastStats.protein, good: 'up' },
                { label: 'Carbs', current: todayStats.carbs, past: pastStats.carbs, good: 'down' },
                { label: 'Fats', current: todayStats.fats, past: pastStats.fats, good: 'down' },
                { label: 'Health Score', current: parseFloat(todayStats.avgHealth), past: parseFloat(pastStats.avgHealth), good: 'up' }
              ].map(metric => {
                const change = getChange(metric.current, metric.past);
                const isGoodChange = (change.direction === metric.good) || change.direction === 'same';
                
                return (
                  <div key={metric.label} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="font-semibold text-gray-900 dark:text-white">{metric.label}</span>
                    <div className="flex items-center gap-2">
                      {getChangeIcon(change.direction)}
                      <span className={`font-semibold ${isGoodChange ? 'text-green-600' : 'text-red-600'}`}>
                        {change.direction === 'same' ? 'No change' : `${change.percent}%`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* What You Ate */}
        <Card className="glass-effect border-0">
          <CardHeader>
            <CardTitle>What You Ate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-3">Today</h4>
                {todaysMeals.length === 0 ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400">No meals logged yet</p>
                ) : (
                  <div className="space-y-2">
                    {todaysMeals.map(meal => (
                      <div key={meal.id} className="flex items-center gap-2 text-sm">
                        <img src={meal.photo_url} alt={meal.name} className="w-10 h-10 rounded object-cover" />
                        <div>
                          <p className="font-semibold">{meal.name}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{meal.calories} cal</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-semibold mb-3">{periods.find(p => p.value === selectedPeriod)?.label}</h4>
                {pastMeals.length === 0 ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400">No data available</p>
                ) : (
                  <div className="space-y-2">
                    {pastMeals.map(meal => (
                      <div key={meal.id} className="flex items-center gap-2 text-sm">
                        <img src={meal.photo_url} alt={meal.name} className="w-10 h-10 rounded object-cover" />
                        <div>
                          <p className="font-semibold">{meal.name}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{meal.calories} cal</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}