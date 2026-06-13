import React, { useState, useEffect, useCallback } from "react";
import { User } from "@/entities/User";
import { Meal } from "@/entities/Meal";
import { Activity } from "@/entities/Activity";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, isToday, isYesterday } from "date-fns";
import {
  Bell,
  Apple
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FloatingActionButton from "../components/home/FloatingActionButton";
import ActivityTracker from "../components/home/ActivityTracker";
import FuturisticCalorieDisplay from "../components/home/FuturisticCalorieDisplay";
import WaterTracker from "../components/home/WaterTracker";
import MealSuggestions from "../components/home/MealSuggestions";
import IntelligentMotivation from "../components/home/IntelligentMotivation";
import PullToRefresh from "../components/common/PullToRefresh";

export default function Home() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [todaysMeals, setTodaysMeals] = useState([]);
  const [yesterdaysMeals, setYesterdaysMeals] = useState([]);
  const [todaysActivities, setTodaysActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('Today');

  const loadUserData = useCallback(async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      if (!user.age || !user.height || !user.weight) {
        navigate(createPageUrl("Welcome"));
        return;
      }

      const today = format(new Date(), 'yyyy-MM-dd');
      const lastResetDate = user.last_water_reset_date;

      if (!lastResetDate || lastResetDate !== today) {
        try {
          const updatedUser = await User.updateMyUserData({
            daily_water_intake: 0,
            last_water_reset_date: today
          });
          setCurrentUser({ ...user, ...updatedUser });
        } catch (resetError) {
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(user);
      }

      try {
        const [mealsPromise, activitiesPromise] = await Promise.allSettled([
          Meal.filter({ created_by: user.email }),
          Activity.filter({ created_by: user.email })
        ]);

        if (mealsPromise.status === 'fulfilled') {
          const allMeals = mealsPromise.value;
          const todayMeals = allMeals.filter(meal => isToday(new Date(meal.created_date)));
          const yesterdayMeals = allMeals.filter(meal => isYesterday(new Date(meal.created_date)));
          setTodaysMeals(todayMeals);
          setYesterdaysMeals(yesterdayMeals);
        }

        if (activitiesPromise.status === 'fulfilled') {
          const todayActivities = activitiesPromise.value.filter(activity => isToday(new Date(activity.created_date)));
          setTodaysActivities(todayActivities);
        }

      } catch (error) {
        console.warn("Failed to load data:", error);
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
      if (error.message?.includes('not authenticated')) {
        navigate(createPageUrl("Welcome"));
      }
    }
    setIsLoading(false);
  }, [navigate]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Listen for optimistic activity events
  useEffect(() => {
    const onAdd = (e) => setTodaysActivities((prev) => [e.detail, ...prev]);
    const onCommit = (e) => setTodaysActivities((prev) => prev.map(a => a.id === e.detail.tempId ? e.detail.created : a));
    const onRevert = (e) => setTodaysActivities((prev) => prev.filter(a => a.id !== e.detail.tempId));
    window.addEventListener('activity:optimistic-add', onAdd);
    window.addEventListener('activity:optimistic-commit', onCommit);
    window.addEventListener('activity:optimistic-revert', onRevert);
    return () => {
      window.removeEventListener('activity:optimistic-add', onAdd);
      window.removeEventListener('activity:optimistic-commit', onCommit);
      window.removeEventListener('activity:optimistic-revert', onRevert);
    };
  }, []);

  // Reset page on tab reselection
  useEffect(() => {
    const onReselect = (e) => {
      if (e.detail === 'Home') {
        setSelectedDay('Today');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('tab:reselect', onReselect);
    return () => window.removeEventListener('tab:reselect', onReselect);
  }, []);

  const calculateStats = (meals) => {
    return meals.reduce((acc, meal) => {
      const quantity = meal.quantity || 1;
      return {
        calories: acc.calories + (meal.calories * quantity),
        protein: acc.protein + (meal.protein * quantity),
        carbs: acc.carbs + (meal.carbs * quantity),
        fats: acc.fats + (meal.fats * quantity)
      };
    }, { calories: 0, protein: 0, carbs: 0, fats: 0 });
  };

  const calculateCaloriesBurned = (activities) => {
    return activities.reduce((sum, activity) => sum + activity.calories_burned, 0);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const handleWaterUpdate = (newIntake) => {
    setCurrentUser(prev => ({
      ...prev,
      daily_water_intake: newIntake
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const mealStats = selectedDay === 'Today' ? calculateStats(todaysMeals) : calculateStats(yesterdaysMeals);
  const caloriesBurned = selectedDay === 'Today' ? calculateCaloriesBurned(todaysActivities) : 0;
  const calorieGoal = currentUser?.daily_calorie_goal || 2000;
  const netCalories = mealStats.calories - caloriesBurned;
  const remainingCalories = Math.max(0, calorieGoal - netCalories);

  return (
    <PullToRefresh onRefresh={loadUserData}>
    <div className="min-h-screen p-4">
      <div className="max-w-sm mx-auto space-y-4">
        {/* Header with Greeting & Notifications */}
        <div className="flex justify-between items-center text-left mb-2">
          <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300">
            {getGreeting()}
          </h2>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate(createPageUrl("Notifications"))}>
            <Bell className="w-5 h-5 text-gray-500" />
          </Button>
        </div>

        {/* Intelligent Motivation Message */}
        {currentUser && selectedDay === 'Today' && (
          <IntelligentMotivation
            user={currentUser}
            mealStats={mealStats}
            caloriesBurned={caloriesBurned}
            mealsCount={todaysMeals.length}
            activitiesCount={todaysActivities.length}
          />
        )}

        {/* Day Selector */}
        <div className="flex bg-white dark:bg-slate-800 rounded-2xl p-1 shadow-sm w-32">
          <Button
            variant={selectedDay === 'Today' ? 'default' : 'ghost'}
            onClick={() => setSelectedDay('Today')}
            className={`flex-1 rounded-xl text-xs h-6 px-2 ${selectedDay === 'Today' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}>
            Today
          </Button>
          <Button
            variant={selectedDay === 'Yesterday' ? 'default' : 'ghost'}
            onClick={() => setSelectedDay('Yesterday')}
            className={`flex-1 rounded-xl text-xs h-6 px-2 ${selectedDay === 'Yesterday' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}>
            Yesterday
          </Button>
        </div>

        {/* Futuristic Calorie Display */}
        <FuturisticCalorieDisplay
          consumed={mealStats.calories}
          burned={caloriesBurned}
          goal={calorieGoal}
          netCalories={netCalories}
          remainingCalories={remainingCalories}
          protein={mealStats.protein}
          carbs={mealStats.carbs}
          fats={mealStats.fats}
          proteinGoal={currentUser?.protein_goal || 150}
          carbGoal={currentUser?.carb_goal || 200}
          fatGoal={currentUser?.fat_goal || 65}
        />

        {/* Today's Meal Suggestions */}
        {selectedDay === 'Today' && <MealSuggestions calorieGoal={calorieGoal} remainingCalories={remainingCalories} />}

        {/* Recently Uploaded Meals */}
        <Card className="glass-effect border-0 shadow-lg rounded-3xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white">Recently uploaded</h3>
              {(selectedDay === 'Today' ? todaysMeals : yesterdaysMeals).length > 2 && (
                <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400" onClick={() => navigate(createPageUrl("History"))}>
                  See all
                </Button>
              )}
            </div>

            {(selectedDay === 'Today' ? todaysMeals : yesterdaysMeals).length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Apple className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-400">No meals logged yet</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">Start tracking your nutrition!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(selectedDay === 'Today' ? todaysMeals : yesterdaysMeals).slice(0, 3).map((meal) => (
                  <div key={meal.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors" onClick={() => navigate(createPageUrl(`MealDetails?id=${meal.id}`))}>
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-200">
                      <img
                        src={meal.photo_url}
                        alt={meal.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{meal.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>{Math.round(meal.calories * (meal.quantity || 1))} cal</span>
                        <span>{format(new Date(meal.created_date), "HH:mm")}</span>
                        {meal.health_score && <span>{meal.health_score}/10 ⭐</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Activities */}
        {selectedDay === 'Today' && <ActivityTracker activities={todaysActivities} />}

        {/* Water Intake Tracker */}
        <WaterTracker currentUser={currentUser} onWaterUpdate={handleWaterUpdate} />

      </div>

      <FloatingActionButton />
    </div>
    </PullToRefresh>
  );
}