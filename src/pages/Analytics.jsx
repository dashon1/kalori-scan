import React, { useState, useEffect } from "react";
import { Meal } from "@/entities/Meal";
import { User } from "@/entities/User";
import { HealthMetric } from "@/entities/HealthMetric";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts";
import { format, subDays } from "date-fns";
import { TrendingUp, BarChart2, Target } from "lucide-react";
import PremiumGate from "../components/premium/PremiumGate";

export default function Analytics() {
  const [meals, setMeals] = useState([]);
  const [weightData, setWeightData] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [timeRange, setTimeRange] = useState("30days");
  const [nutritionData, setNutritionData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);

      if (user.subscription_status !== "premium") {
        setIsLoading(false);
        return;
      }
      
      const userMeals = await Meal.filter({ created_by: user.email });
      setMeals(userMeals);

      const userWeightMetrics = await HealthMetric.filter({ created_by: user.email, metric_type: "weight" }, '-logged_at');
      const formattedWeightData = userWeightMetrics.map(m => ({
        date: format(new Date(m.logged_at), "MMM d"),
        weight: m.value1
      })).reverse();
      setWeightData(formattedWeightData);

      generateNutritionData(userMeals);

    } catch (error) {
      console.error("Failed to load data:", error);
    }
    setIsLoading(false);
  };

  const generateNutritionData = (allMeals) => {
    const days = timeRange === "7days" ? 7 : timeRange === "30days" ? 30 : 90;
    const endDate = new Date();
    const dailyData = [];

    for (let i = 0; i < days; i++) {
      const currentDate = subDays(endDate, days - 1 - i);
      const dateKey = format(currentDate, "yyyy-MM-dd");

      const dayMeals = allMeals.filter(meal => format(new Date(meal.created_date), "yyyy-MM-dd") === dateKey);
      
      const dayStats = dayMeals.reduce((acc, meal) => {
        const quantity = meal.quantity || 1;
        acc.calories += meal.calories * quantity;
        acc.protein += meal.protein * quantity;
        acc.carbs += meal.carbs * quantity;
        acc.fats += meal.fats * quantity;
        return acc;
      }, { calories: 0, protein: 0, carbs: 0, fats: 0 });

      dailyData.push({
        date: format(currentDate, "M/d"),
        ...dayStats
      });
    }
    setNutritionData(dailyData);
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div></div>;
  }

  if (currentUser && currentUser.subscription_status !== 'premium') {
    return <div className="p-6"><PremiumGate feature="Advanced Analytics" description="Upgrade to Premium to track your weight progress and nutrition trends over time." /></div>;
  }
  
  const weightProgress = currentUser ? ((currentUser.weight - currentUser.goal_weight) / (currentUser.start_weight - currentUser.goal_weight)) * 100 : 0;

  return (
    <div className="min-h-screen p-4 space-y-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">Analytics</h1>
        
        {/* Goal Progress */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5 text-green-500" /> Goal Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <p className="text-3xl font-bold">{currentUser?.weight} kg</p>
              <p className="text-sm text-gray-500">Current Weight</p>
            </div>
            <div className="flex justify-between items-end text-sm">
                <div>
                    <p className="font-bold">{currentUser?.start_weight || 'N/A'}</p>
                    <p className="text-xs text-gray-500">Start</p>
                </div>
                <div>
                    <p className="font-bold text-green-600 text-lg">{currentUser?.goal_weight}</p>
                    <p className="text-xs text-gray-500 text-center">Goal</p>
                </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
              <div className="bg-green-500 h-2.5 rounded-full" style={{width: `${100 - weightProgress}%`}}></div>
            </div>
            <p className="text-xs text-center text-gray-500 mt-2">{Math.abs(currentUser.weight - currentUser.goal_weight).toFixed(1)} kg to go</p>
          </CardContent>
        </Card>

        {/* Weight Progress Chart */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-blue-500" /> Weight Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5}/>
                <XAxis dataKey="date" fontSize={10} />
                <YAxis domain={['dataMin - 2', 'dataMax + 2']} fontSize={10} />
                <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Nutrition */}
        <Card>
          <CardHeader>
             <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2"><BarChart2 className="w-5 h-5 text-teal-500" /> Nutrition</span>
               <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">7 Days</SelectItem>
                  <SelectItem value="30days">30 Days</SelectItem>
                  <SelectItem value="90days">90 Days</SelectItem>
                </SelectContent>
              </Select>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={nutritionData}>
                 <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5}/>
                <XAxis dataKey="date" fontSize={10}/>
                <YAxis fontSize={10}/>
                <Bar dataKey="protein" stackId="a" fill="#3b82f6" />
                <Bar dataKey="carbs" stackId="a" fill="#10b981" />
                <Bar dataKey="fats" stackId="a" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
             <div className="flex justify-center gap-4 mt-4">
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full"></div><span className="text-xs">Protein</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-full"></div><span className="text-xs">Carbs</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-purple-500 rounded-full"></div><span className="text-xs">Fats</span></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}