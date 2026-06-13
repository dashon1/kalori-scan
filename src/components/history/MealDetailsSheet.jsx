import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { 
  Star,
  Flame,
  Utensils,
  Clock,
  Tag,
  Apple,
  Mic
} from "lucide-react";

export default function MealDetailsSheet({ meal, onClose }) {
  const getHealthScoreColor = (score) => {
    if (score >= 8) return "text-green-600 dark:text-green-400";
    if (score >= 5) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };
  
  const getMealTypeColor = (type) => {
    const colors = {
      breakfast: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      lunch: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      dinner: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      snack: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
    };
    return colors[type] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
  };

  const macros = [
    { name: 'Carbs', value: meal.carbs * (meal.quantity || 1), color: 'bg-green-500' },
    { name: 'Protein', value: meal.protein * (meal.quantity || 1), color: 'bg-blue-500' },
    { name: 'Fats', value: meal.fats * (meal.quantity || 1), color: 'bg-purple-500' },
  ];
  const totalMacros = macros.reduce((sum, macro) => sum + (macro.value || 0), 0) || 1;

  return (
    <div className="h-full overflow-y-auto bg-white dark:bg-slate-800">
      <div className="relative h-48">
        {meal.photo_url ? (
          <img
            src={meal.photo_url}
            alt={meal.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
            <Apple className="w-16 h-16 text-gray-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4">
          <h2 className="text-2xl font-bold text-white mb-1">{meal.name}</h2>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1 text-white">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{format(new Date(meal.created_date), "MMM d, HH:mm")}</span>
            </div>
            <Badge className={getMealTypeColor(meal.meal_type)}>{meal.meal_type}</Badge>
            {meal.voice_logged && (
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                <Mic className="w-3 h-3 mr-1" />
                Voice Logged
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-orange-50 dark:bg-orange-900/30 p-4 rounded-xl">
            <Flame className="w-6 h-6 mx-auto text-orange-500 mb-1" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Calories</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {Math.round(meal.calories * (meal.quantity || 1))}
            </p>
            {meal.quantity && meal.quantity > 1 && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                ({Math.round(meal.calories)} per serving)
              </p>
            )}
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-xl">
            <Star className="w-6 h-6 mx-auto text-yellow-500 mb-1" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Health Score</p>
            <p className={`text-2xl font-bold ${getHealthScoreColor(meal.health_score)}`}>
              {meal.health_score}/10
            </p>
          </div>
        </div>

        {/* Servings Info */}
        {meal.quantity && meal.quantity > 1 && (
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Utensils className="w-5 h-5 text-blue-500" />
              <h4 className="font-semibold text-gray-900 dark:text-white">Serving Information</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              You consumed <span className="font-semibold">{meal.quantity} servings</span> of this meal.
              All nutritional values shown are for the total amount consumed.
            </p>
          </div>
        )}

        {/* Macros */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Macronutrient Breakdown</h4>
          <div className="flex rounded-full overflow-hidden h-3 w-full bg-gray-200 dark:bg-gray-700 mb-3">
            {macros.map(macro => (
              <div
                key={macro.name}
                className={`${macro.color}`}
                style={{ width: `${((macro.value || 0) / totalMacros) * 100}%` }}
              />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            {macros.map(macro => (
              <div key={macro.name} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">{macro.name}</p>
                <p className="font-bold text-lg text-gray-900 dark:text-white">{Math.round(macro.value || 0)}g</p>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Nutrition Facts */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Detailed Nutrition Facts</h4>
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="font-semibold text-gray-900 dark:text-white">Calories</span>
              <span className="font-semibold text-gray-900 dark:text-white">{Math.round(meal.calories * (meal.quantity || 1))}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Protein</span>
                <span className="font-medium text-gray-900 dark:text-white">{Math.round(meal.protein * (meal.quantity || 1))}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Carbs</span>
                <span className="font-medium text-gray-900 dark:text-white">{Math.round(meal.carbs * (meal.quantity || 1))}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Fats</span>
                <span className="font-medium text-gray-900 dark:text-white">{Math.round(meal.fats * (meal.quantity || 1))}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Fiber</span>
                <span className="font-medium text-gray-900 dark:text-white">{Math.round((meal.fiber || 0) * (meal.quantity || 1))}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Sugar</span>
                <span className="font-medium text-gray-900 dark:text-white">{Math.round((meal.sugar || 0) * (meal.quantity || 1))}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Sodium</span>
                <span className="font-medium text-gray-900 dark:text-white">{Math.round((meal.sodium || 0) * (meal.quantity || 1))}mg</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Key Nutrients */}
        {meal.key_nutrients && meal.key_nutrients.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Key Nutrients</h4>
            <div className="space-y-3">
              {meal.key_nutrients.map((nutrient, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">{nutrient.name}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{nutrient.amount}</span>
                  </div>
                  <Progress value={nutrient.percent_dv} className="h-2" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{nutrient.percent_dv}% Daily Value</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detected Items */}
        {meal.food_items && meal.food_items.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Detected Food Items
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {meal.food_items.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">{item.name}</span>
                    {item.portion_size && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{item.portion_size}</p>
                    )}
                  </div>
                  {item.calories && (
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {Math.round(item.calories * (meal.quantity || 1))} cal
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Coach Summary */}
        {meal.coach_summary && (
          <div className="bg-teal-50 dark:bg-teal-900/30 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
                <Star className="w-3 h-3 text-white" />
              </div>
              <h4 className="font-semibold text-teal-800 dark:text-teal-300">Coach's Insight</h4>
            </div>
            <p className="text-teal-700 dark:text-teal-200 text-sm italic leading-relaxed">
              "{meal.coach_summary}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}