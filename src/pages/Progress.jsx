import React, { useState, useEffect } from "react";
import { Meal } from "@/entities/Meal";
import { User } from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts";
import { format, subDays } from "date-fns";
import { TrendingUp, Target, Award } from "lucide-react";

export default function Progress() {
  const [meals, setMeals] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [timeRange, setTimeRange] = useState("7days");
  const [chartData, setChartData] = useState([]);
  const [macroData, setMacroData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (meals.length > 0) {
      generateChartData();
    }
  }, [meals, timeRange]);

  const loadData = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
      
      const userMeals = await Meal.filter({ created_by: user.email });
      setMeals(userMeals);
    } catch (error) {
      console.error("Failed to load data:", error);
    }
    setIsLoading(false);
  };

  const generateChartData = () => {
    const days = timeRange === "7days" ? 7 : timeRange === "30days" ? 30 : 90;
    const endDate = new Date();
    const startDate = subDays(endDate, days - 1);
    
    const dailyData = [];
    const macroStats = [];
    
    for (let i = 0; i < days; i++) {
      const currentDate = subDays(endDate, days - 1 - i);
      const dateKey = format(currentDate, "yyyy-MM-dd");
      
      const dayMeals = meals.filter(meal => {
        const mealDate = new Date(meal.created_date);
        return format(mealDate, "yyyy-MM-dd") === dateKey;
      });
      
      const dayStats = dayMeals.reduce((acc, meal) => {
        const quantity = meal.quantity || 1;
        return {
          calories: acc.calories + (meal.calories * quantity),
          protein: acc.protein + (meal.protein * quantity),
          carbs: acc.carbs + (meal.carbs * quantity),
          fats: acc.fats + (meal.fats * quantity),
          meals: acc.meals + 1,
          healthScore: acc.healthScore + (meal.health_score || 0)
        };
      }, { calories: 0, protein: 0, carbs: 0, fats: 0, meals: 0, healthScore: 0 });
      
      dailyData.push({
        date: format(currentDate, "MMM d"),
        calories: Math.round(dayStats.calories),
        protein: Math.round(dayStats.protein),
        carbs: Math.round(dayStats.carbs),
        fats: Math.round(dayStats.fats),
        meals: dayStats.meals,
        healthScore: dayStats.meals > 0 ? Math.round(dayStats.healthScore / dayStats.meals) : 0
      });
      
      if (dayStats.meals > 0) {
        macroStats.push({
          date: format(currentDate, "MMM d"),
          protein: Math.round(dayStats.protein),
          carbs: Math.round(dayStats.carbs),
          fats: Math.round(dayStats.fats)
        });
      }
    }
    
    setChartData(dailyData);
    setMacroData(macroStats);
  };

  const getAverageStats = () => {
    if (chartData.length === 0) return { calories: 0, protein: 0, carbs: 0, fats: 0, healthScore: 0 };
    
    const totals = chartData.reduce((acc, day) => ({
      calories: acc.calories + day.calories,
      protein: acc.protein + day.protein,
      carbs: acc.carbs + day.carbs,
      fats: acc.fats + day.fats,
      healthScore: acc.healthScore + day.healthScore
    }), { calories: 0, protein: 0, carbs: 0, fats: 0, healthScore: 0 });
    
    const daysWithMeals = chartData.filter(day => day.meals > 0).length;
    
    return {
      calories: Math.round(totals.calories / (daysWithMeals || 1)),
      protein: Math.round(totals.protein / (daysWithMeals || 1)),
      carbs: Math.round(totals.carbs / (daysWithMeals || 1)),
      fats: Math.round(totals.fats / (daysWithMeals || 1)),
      healthScore: Math.round(totals.healthScore / (daysWithMeals || 1))
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  const averageStats = getAverageStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Progress Tracking</h1>
          <p className="text-gray-600">Monitor your nutrition trends over time</p>
        </div>

        {/* Time Range Selector */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Average Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Target className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Avg Calories</p>
              <p className="text-2xl font-bold text-gray-900">{averageStats.calories}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Award className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Avg Health Score</p>
              <p className="text-2xl font-bold text-gray-900">{averageStats.healthScore}/10</p>
            </CardContent>
          </Card>
        </div>

        {/* Calorie Trend Chart */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-600" />
              Calorie Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="calories" 
                    stroke="#0d9488" 
                    strokeWidth={2}
                    dot={{ fill: '#0d9488', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {currentUser?.daily_calorie_goal && (
              <p className="text-sm text-gray-600 mt-2">
                Daily Goal: {currentUser.daily_calorie_goal} calories
              </p>
            )}
          </CardContent>
        </Card>

        {/* Macro Distribution */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Macro Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={macroData.slice(-7)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <Bar dataKey="protein" fill="#3b82f6" />
                  <Bar dataKey="carbs" fill="#10b981" />
                  <Bar dataKey="fats" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Protein</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Carbs</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Fats</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health Score Trend */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Health Score Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis 
                    domain={[0, 10]}
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="healthScore" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}