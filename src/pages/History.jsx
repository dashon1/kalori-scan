import React, { useState, useEffect } from "react";
import { Meal } from "@/entities/Meal";
import { Activity } from "@/entities/Activity";
import { User } from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { format, isToday, isYesterday, subDays, startOfDay, endOfDay } from "date-fns";
import { Search, Star, Clock, Utensils, ChevronLeft, ChevronRight, Apple, Users, Activity as ActivityIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import MealDetailsSheet from "../components/history/MealDetailsSheet";
import DayMacroSummary from "../components/history/DayMacroSummary";
import PullToRefresh from "../components/common/PullToRefresh";

export default function History() {
  const navigate = useNavigate();
  const [meals, setMeals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [filteredMeals, setFilteredMeals] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [mealTypeFilter, setMealTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [viewMode, setViewMode] = useState("daily");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  // Reset page on tab reselection
  useEffect(() => {
    const onReselect = (e) => {
      if (e.detail === 'Analytics' || e.detail === 'History') { // History is not a tab but just in case
        setSearchTerm("");
        setMealTypeFilter("all");
        setSortBy("newest");
        setViewMode("daily");
        setSelectedDate(new Date());
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('tab:reselect', onReselect);
    return () => window.removeEventListener('tab:reselect', onReselect);
  }, []);

  useEffect(() => {
    filterAndSortData();
  }, [meals, activities, searchTerm, mealTypeFilter, sortBy, selectedDate, viewMode]);

  const loadData = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
      
      const [userMeals, userActivities] = await Promise.allSettled([
        Meal.filter({ created_by: user.email }),
        Activity.filter({ created_by: user.email })
      ]);
      
      if (userMeals.status === 'fulfilled') {
        setMeals(userMeals.value);
      } else {
        console.warn("Failed to load meals:", userMeals.reason);
        setMeals([]);
      }
      
      if (userActivities.status === 'fulfilled') {
        setActivities(userActivities.value);
      } else {
        console.warn("Failed to load activities:", userActivities.reason);
        setActivities([]);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    }
    setIsLoading(false);
  };

  const handleMealClick = (meal) => {
    setSelectedMeal(meal);
  };

  const filterAndSortData = () => {
    let filteredMealData = [...meals];
    let filteredActivityData = [...activities];

    // Filter by date range based on view mode
    if (viewMode === "daily") {
      const startDate = startOfDay(selectedDate);
      const endDate = endOfDay(selectedDate);
      
      filteredMealData = filteredMealData.filter(meal => {
        const mealDate = new Date(meal.created_date);
        return mealDate >= startDate && mealDate <= endDate;
      });
      
      filteredActivityData = filteredActivityData.filter(activity => {
        const activityDate = new Date(activity.created_date);
        return activityDate >= startDate && activityDate <= endDate;
      });
    } else if (viewMode === "weekly") {
      const startDate = startOfDay(subDays(selectedDate, 6));
      const endDate = endOfDay(selectedDate);
      
      filteredMealData = filteredMealData.filter(meal => {
        const mealDate = new Date(meal.created_date);
        return mealDate >= startDate && mealDate <= endDate;
      });
      
      filteredActivityData = filteredActivityData.filter(activity => {
        const activityDate = new Date(activity.created_date);
        return activityDate >= startDate && activityDate <= endDate;
      });
    }

    // Filter meals by search term
    if (searchTerm) {
      filteredMealData = filteredMealData.filter(meal => 
        meal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (meal.food_items && meal.food_items.some(item => 
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
    }

    // Filter meals by meal type
    if (mealTypeFilter !== "all") {
      filteredMealData = filteredMealData.filter(meal => meal.meal_type === mealTypeFilter);
    }

    // Sort meals
    filteredMealData.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_date) - new Date(a.created_date);
        case "oldest":
          return new Date(a.created_date) - new Date(b.created_date);
        case "calories_high":
          return (b.calories * (b.quantity || 1)) - (a.calories * (a.quantity || 1));
        case "calories_low":
          return (a.calories * (a.quantity || 1)) - (b.calories * (b.quantity || 1));
        case "health_score":
          return (b.health_score || 0) - (a.health_score || 0);
        default:
          return 0;
      }
    });

    // Sort activities by newest first
    filteredActivityData.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

    setFilteredMeals(filteredMealData);
    setFilteredActivities(filteredActivityData);
  };

  const getMealTypeColor = (type) => {
    const colors = {
      breakfast: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300",
      lunch: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300",
      dinner: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300",
      snack: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300"
    };
    return colors[type] || "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300";
  };

  const getActivityTypeColor = (type) => {
    const colors = {
      cardio: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      strength: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      walking: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      running: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
      cycling: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      swimming: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
      sports: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
      flexibility: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
      other: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
    };
    return colors[type] || colors.other;
  };

  const getDateLabel = (date) => {
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "EEEE, MMM d");
  };

  const navigateDate = (direction) => {
    const newDate = new Date(selectedDate);
    if (direction === "prev") {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setSelectedDate(newDate);
  };

  const calculateDayStats = (dayMeals, dayActivities) => {
    const mealStats = dayMeals.reduce((acc, meal) => {
      const quantity = meal.quantity || 1;
      return {
        calories: acc.calories + (meal.calories * quantity),
        protein: acc.protein + (meal.protein * quantity),
        carbs: acc.carbs + (meal.carbs * quantity),
        fats: acc.fats + (meal.fats * quantity),
        fiber: acc.fiber + ((meal.fiber || 0) * quantity),
        sugar: acc.sugar + ((meal.sugar || 0) * quantity),
        sodium: acc.sodium + ((meal.sodium || 0) * quantity),
        avgHealthScore: acc.avgHealthScore + (meal.health_score || 0)
      };
    }, { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, sugar: 0, sodium: 0, avgHealthScore: 0 });

    const caloriesBurned = dayActivities.reduce((sum, activity) => sum + activity.calories_burned, 0);
    
    return {
      ...mealStats,
      caloriesBurned,
      netCalories: mealStats.calories - caloriesBurned,
      avgHealthScore: dayMeals.length > 0 ? mealStats.avgHealthScore / dayMeals.length : 0
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your history...</p>
        </div>
      </div>
    );
  }

  const dayStats = calculateDayStats(filteredMeals, filteredActivities);

  return (
    <PullToRefresh onRefresh={loadData}>
    <div className="min-h-screen p-6">
      <div className="max-w-sm mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">History</h1>
          <p className="text-gray-500 dark:text-gray-400">Track your nutrition journey over time</p>
        </div>

        {/* Date Navigation */}
        <Card className="glass-effect card-shadow rounded-3xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateDate("prev")}
                className="rounded-full"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="text-center">
                <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
                  {getDateLabel(selectedDate)}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {format(selectedDate, "MMMM d, yyyy")}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateDate("next")}
                className="rounded-full"
                disabled={isToday(selectedDate)}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Daily Summary */}
            {(filteredMeals.length > 0 || filteredActivities.length > 0) && (
              <DayMacroSummary 
                stats={dayStats} 
                mealCount={filteredMeals.length}
                activityCount={filteredActivities.length}
              />
            )}
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <Card className="glass-effect card-shadow rounded-3xl">
          <CardContent className="p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search meals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-2xl dark:bg-slate-700 dark:border-slate-600"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={mealTypeFilter} onValueChange={setMealTypeFilter}>
                <SelectTrigger className="flex-1 rounded-2xl dark:bg-slate-700 dark:border-slate-600">
                  <SelectValue placeholder="Meal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Meals</SelectItem>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="flex-1 rounded-2xl dark:bg-slate-700 dark:border-slate-600">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="calories_high">Highest Calories</SelectItem>
                  <SelectItem value="calories_low">Lowest Calories</SelectItem>
                  <SelectItem value="health_score">Health Score</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Activities Section */}
        {filteredActivities.length > 0 && (
          <Card className="glass-effect card-shadow rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <ActivityIcon className="w-5 h-5 text-orange-500" />
                Activities ({filteredActivities.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <ActivityIcon className="w-6 h-6 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900 dark:text-white truncate">{activity.name}</h4>
                      <Badge className={getActivityTypeColor(activity.type)}>
                        {activity.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(activity.created_date), "HH:mm")}
                      </div>
                      <span>{activity.duration_minutes} min</span>
                      <span className="text-orange-600 dark:text-orange-400 font-medium">
                        -{activity.calories_burned} cal
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Meals List */}
        {filteredMeals.length === 0 && filteredActivities.length === 0 ? (
          <Card className="glass-effect card-shadow rounded-3xl">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Utensils className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">No data found</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {searchTerm || mealTypeFilter !== "all" 
                  ? "Try adjusting your search or filters"
                  : `No meals or activities logged for ${getDateLabel(selectedDate).toLowerCase()}`
                }
              </p>
              
              {/* Show nutritionist sharing option for premium users */}
              {currentUser?.subscription_status === "premium" && (
                <Button
                  onClick={() => navigate(createPageUrl("NutritionistShare"))}
                  variant="outline"
                  className="mt-4 text-green-600 border-green-600 hover:bg-green-50"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Share with Nutritionist
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Share with Nutritionist CTA for Premium Users */}
            {currentUser?.subscription_status === "premium" && (filteredMeals.length > 0 || filteredActivities.length > 0) && (
              <Card className="glass-effect card-shadow rounded-3xl overflow-hidden bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-green-800 dark:text-green-300 text-sm">Share Your Progress</h4>
                      <p className="text-green-700 dark:text-green-400 text-xs">Share your meal history with certified nutritionists</p>
                    </div>
                    <Button
                      onClick={() => navigate(createPageUrl("NutritionistShare"))}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Meals list */}
            {filteredMeals.map((meal) => (
              <Card 
                key={meal.id} 
                className="glass-effect card-shadow rounded-3xl cursor-pointer hover:ring-2 hover:ring-teal-400 dark:hover:ring-teal-500 transition-all duration-200"
                onClick={() => handleMealClick(meal)}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                      {meal.photo_url ? (
                        <img 
                          src={meal.photo_url} 
                          alt={meal.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Apple className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white truncate pr-2">{meal.name}</h4>
                        <div className="flex items-center gap-1 text-sm flex-shrink-0">
                          <Star className="w-3 h-3 fill-current text-yellow-500" />
                          <span className="font-medium text-gray-700 dark:text-gray-300">{meal.health_score}/10</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <Badge className={getMealTypeColor(meal.meal_type)}>
                          {meal.meal_type}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="w-3 h-3" />
                          {format(new Date(meal.created_date), "HH:mm")}
                        </div>
                        {meal.voice_logged && (
                          <Badge variant="outline" className="text-xs">
                            Voice Logged
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Calories:</span>
                          <span className="font-semibold text-gray-800 dark:text-gray-200">
                            {Math.round(meal.calories * (meal.quantity || 1))}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Protein:</span>
                          <span className="font-semibold text-gray-800 dark:text-gray-200">
                            {Math.round(meal.protein * (meal.quantity || 1))}g
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Carbs:</span>
                          <span className="font-semibold text-gray-800 dark:text-gray-200">
                            {Math.round(meal.carbs * (meal.quantity || 1))}g
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Fats:</span>
                          <span className="font-semibold text-gray-800 dark:text-gray-200">
                            {Math.round(meal.fats * (meal.quantity || 1))}g
                          </span>
                        </div>
                      </div>
                      
                      {meal.quantity && meal.quantity > 1 && (
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs">
                            {meal.quantity} serving{meal.quantity !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <Sheet open={!!selectedMeal} onOpenChange={(isOpen) => !isOpen && setSelectedMeal(null)}>
        <SheetContent className="w-full max-w-md p-0">
          {selectedMeal && <MealDetailsSheet meal={selectedMeal} />}
        </SheetContent>
      </Sheet>
    </div>
    </PullToRefresh>
  );
}