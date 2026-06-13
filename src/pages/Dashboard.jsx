
import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Meal } from "@/entities/Meal";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, isToday } from "date-fns";
import { 
  Camera, 
  Zap, 
  TrendingUp,
  Star,
  Award,
  Utensils,
  Mic, // Added for Voice Log
  ChefHat // Added for Pantry Scan
} from "lucide-react";

import TodaysMeals from "../components/dashboard/TodaysMeals";
import MacroRingsChart from "../components/dashboard/MacroRingsChart";

export default function Dashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [todaysMeals, setTodaysMeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await User.me();
      if (!user.age || !user.height || !user.weight) {
        navigate(createPageUrl("Welcome"));
        return;
      }
      setCurrentUser(user);
      
      const meals = await Meal.filter({ created_by: user.email });
      const today = meals.filter(meal => isToday(new Date(meal.created_date)));
      setTodaysMeals(today);
    } catch (error) {
      navigate(createPageUrl("Welcome"));
    }
    setIsLoading(false);
  };

  const calculateTodaysStats = () => {
    return todaysMeals.reduce((acc, meal) => {
      const quantity = meal.quantity || 1;
      return {
        calories: acc.calories + (meal.calories * quantity),
        protein: acc.protein + (meal.protein * quantity),
        carbs: acc.carbs + (meal.carbs * quantity),
        fats: acc.fats + (meal.fats * quantity)
      };
    }, { calories: 0, protein: 0, carbs: 0, fats: 0 });
  };

  const getMotivationalMessage = () => {
    const stats = calculateTodaysStats();
    const calorieGoal = currentUser?.daily_calorie_goal || 2000;
    const progress = (stats.calories / calorieGoal) * 100;
    
    if (progress < 30) {
      return {
        title: "Ready to Fuel Your Day! 🌅",
        message: "Start strong with a nutritious meal. Your body is ready for quality fuel!",
        type: "motivation",
        gradient: "from-blue-500 to-teal-500"
      };
    } else if (progress < 70) {
      return {
        title: "Crushing Your Goals! 💪",
        message: "Amazing progress today! You're building healthy habits that last.",
        type: "encouragement",
        gradient: "from-green-500 to-emerald-500"
      };
    } else if (progress < 100) {
      return {
        title: "Almost There! 🎯",
        message: "You're so close to your daily target. One more balanced meal will do it!",
        type: "achievement",
        gradient: "from-orange-500 to-amber-500"
      };
    } else {
      return {
        title: "Daily Goal Achieved! 🏆",
        message: "Outstanding! You've mastered today's nutrition. Keep this momentum!",
        type: "celebration",
        gradient: "from-purple-500 to-pink-500"
      };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const todaysStats = calculateTodaysStats();
  const motivationData = getMotivationalMessage();

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Welcome Header */}
        <div className="text-center py-2">
          <h1 className="text-2xl font-bold text-gray-900">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}!
          </h1>
          <p className="text-gray-600 text-sm">
            {format(new Date(), "EEEE, MMMM d")}
          </p>
        </div>

        {/* Motivation Card */}
        <div className={`glass-effect rounded-3xl p-4 bg-gradient-to-r ${motivationData.gradient} bg-opacity-10`}>
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-2xl bg-gradient-to-r ${motivationData.gradient} flex items-center justify-center shadow-lg`}>
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-1">{motivationData.title}</h3>
              <p className="text-gray-700 text-sm leading-relaxed">{motivationData.message}</p>
            </div>
          </div>
        </div>

        {/* Today's Progress */}
        <div className="glass-effect rounded-3xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900 text-lg">Today's Progress</h3>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Utensils className="w-4 h-4" />
              <span>{todaysMeals.length} meals</span>
            </div>
          </div>
          
          <MacroRingsChart 
            stats={todaysStats}
            goals={currentUser}
          />
        </div>

        {/* Quick Actions */}
        <div className="glass-effect rounded-3xl p-4">
          <h3 className="font-bold text-gray-900 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate(createPageUrl("Camera"))}
              className="bg-gradient-to-r from-teal-600 to-blue-600 text-white p-3 rounded-2xl flex flex-col items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Camera className="w-5 h-5" />
              <span className="text-sm font-medium">Scan Meal</span>
            </button>
            
            <button
              onClick={() => navigate(createPageUrl("VoiceLogging"))}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 rounded-2xl flex flex-col items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Mic className="w-5 h-5" />
              <span className="text-sm font-medium">Voice Log</span>
            </button>
            
            <button
              onClick={() => navigate(createPageUrl("PantryScanner"))}
              className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-3 rounded-2xl flex flex-col items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <ChefHat className="w-5 h-5" />
              <span className="text-sm font-medium">Pantry Scan</span>
            </button>
            
            <button
              onClick={() => navigate(createPageUrl("BarcodeScanner"))}
              className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-3 rounded-2xl flex flex-col items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="w-5 h-5 border-2 border-white rounded flex items-center justify-center">
                <div className="w-2 h-2 border border-white"></div>
              </div>
              <span className="text-sm font-medium">Barcode</span>
            </button>
          </div>
        </div>

        {/* Today's Meals */}
        <TodaysMeals 
          meals={todaysMeals}
          onViewAll={() => navigate(createPageUrl("History"))}
        />

        {/* Insights */}
        <div className="glass-effect rounded-3xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-600" />
            Smart Insights
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-teal-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">Avg Health Score</span>
              </div>
              <span className="font-bold text-lg">
                {todaysMeals.length > 0 
                  ? (todaysMeals.reduce((acc, meal) => acc + (meal.health_score || 0), 0) / todaysMeals.length).toFixed(1)
                  : "0.0"
                }/10
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-gray-700">Weekly Streak</span>
              </div>
              <span className="font-bold text-lg">5 days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
