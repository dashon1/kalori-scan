import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Flame, Clock, Star, BrainCircuit, BarChart, Leaf, Utensils, Zap, Heart, Shield, ChefHat } from "lucide-react";

export default function SuggestedMealDetailsSheet({ suggestion }) {
  if (!suggestion) return null;

  const getHealthScoreColor = (score) => {
    if (score >= 8) return "text-green-500";
    if (score >= 5) return "text-yellow-500";
    return "text-red-500";
  };
  
  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
      medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
      hard: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
    };
    return colors[difficulty?.toLowerCase()] || "bg-gray-100 dark:bg-gray-700/30 dark:text-gray-300";
  };

  return (
    <div className="h-full overflow-y-auto bg-white dark:bg-slate-900">
      {/* Meal Image */}
      <div className="relative h-56">
        <img
          src={suggestion.image_url}
          alt={suggestion.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1546554137-f86b9593a222?w=400&h=300&fit=crop';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4">
          <h2 className="text-2xl font-bold text-white mb-2">{suggestion.name}</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="flex items-center gap-1 bg-black/30 text-white border-0">
              <Clock className="w-3 h-3" />
              {suggestion.prep_time}
            </Badge>
            <Badge className={`${getDifficultyColor(suggestion.difficulty)} border-0`}>
              {suggestion.difficulty}
            </Badge>
            {suggestion.cooking_method && (
              <Badge variant="secondary" className="bg-black/30 text-white border-0">
                <ChefHat className="w-3 h-3 mr-1" />
                {suggestion.cooking_method}
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Main Stats */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-orange-50 dark:bg-orange-900/30 p-4 rounded-xl">
            <Flame className="w-6 h-6 mx-auto text-orange-500 mb-1" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Calories</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {suggestion.estimated_calories}
            </p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-xl">
            <Star className="w-6 h-6 mx-auto text-yellow-500 mb-1" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Health Score</p>
            <p className={`text-2xl font-bold ${getHealthScoreColor(suggestion.health_score)}`}>
              {suggestion.health_score}/10
            </p>
          </div>
        </div>

        {/* Why This Meal Now */}
        {suggestion.why_now && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-teal-500" />
              Perfect Timing
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {suggestion.why_now}
            </p>
          </div>
        )}

        {/* Flavor Profile */}
        {suggestion.flavor_profile && (
          <div className="text-center">
            <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 dark:from-purple-900/30 dark:to-pink-900/30 dark:text-purple-300 px-4 py-2">
              {suggestion.flavor_profile} Cuisine
            </Badge>
          </div>
        )}

        {/* Macronutrients */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <BarChart className="w-5 h-5 text-blue-500" />
            Macronutrients
          </h4>
          <div className="grid grid-cols-3 gap-2 text-center mb-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Protein</p>
              <p className="font-bold text-lg text-blue-600 dark:text-blue-400">{Math.round(suggestion.protein)}g</p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Carbs</p>
              <p className="font-bold text-lg text-green-600 dark:text-green-400">{Math.round(suggestion.carbs)}g</p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Fats</p>
              <p className="font-bold text-lg text-purple-600 dark:text-purple-400">{Math.round(suggestion.fats)}g</p>
            </div>
          </div>
          
          {/* Additional Macros */}
          {(suggestion.fiber || suggestion.sugar || suggestion.sodium) && (
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              {suggestion.fiber && (
                <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Fiber</p>
                  <p className="font-semibold text-amber-600 dark:text-amber-400">{Math.round(suggestion.fiber)}g</p>
                </div>
              )}
              {suggestion.sugar && (
                <div className="p-2 bg-pink-50 dark:bg-pink-900/30 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Sugar</p>
                  <p className="font-semibold text-pink-600 dark:text-pink-400">{Math.round(suggestion.sugar)}g</p>
                </div>
              )}
              {suggestion.sodium && (
                <div className="p-2 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Sodium</p>
                  <p className="font-semibold text-gray-600 dark:text-gray-400">{Math.round(suggestion.sodium)}mg</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Vitamins */}
        {suggestion.vitamins && Object.keys(suggestion.vitamins).filter(k => suggestion.vitamins[k]).length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-green-500" />
              Key Vitamins
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {suggestion.vitamins.vitamin_a && (
                <div className="flex justify-between p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">Vitamin A</span>
                  <span className="font-semibold text-orange-600 dark:text-orange-400">{suggestion.vitamins.vitamin_a} IU</span>
                </div>
              )}
              {suggestion.vitamins.vitamin_c && (
                <div className="flex justify-between p-2 bg-red-50 dark:bg-red-900/30 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">Vitamin C</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">{suggestion.vitamins.vitamin_c} mg</span>
                </div>
              )}
              {suggestion.vitamins.vitamin_d && (
                <div className="flex justify-between p-2 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">Vitamin D</span>
                  <span className="font-semibold text-yellow-600 dark:text-yellow-400">{suggestion.vitamins.vitamin_d} IU</span>
                </div>
              )}
              {suggestion.vitamins.vitamin_k && (
                <div className="flex justify-between p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">Vitamin K</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">{suggestion.vitamins.vitamin_k} mcg</span>
                </div>
              )}
              {suggestion.vitamins.folate && (
                <div className="flex justify-between p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">Folate</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{suggestion.vitamins.folate} mcg</span>
                </div>
              )}
              {suggestion.vitamins.vitamin_b12 && (
                <div className="flex justify-between p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">B12</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">{suggestion.vitamins.vitamin_b12} mcg</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Minerals */}
        {suggestion.minerals && Object.keys(suggestion.minerals).filter(k => suggestion.minerals[k]).length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-500" />
              Essential Minerals
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {suggestion.minerals.calcium && (
                <div className="flex justify-between p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">Calcium</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{suggestion.minerals.calcium} mg</span>
                </div>
              )}
              {suggestion.minerals.iron && (
                <div className="flex justify-between p-2 bg-red-50 dark:bg-red-900/30 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">Iron</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">{suggestion.minerals.iron} mg</span>
                </div>
              )}
              {suggestion.minerals.potassium && (
                <div className="flex justify-between p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">Potassium</span>
                  <span className="font-semibold text-orange-600 dark:text-orange-400">{suggestion.minerals.potassium} mg</span>
                </div>
              )}
              {suggestion.minerals.magnesium && (
                <div className="flex justify-between p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">Magnesium</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">{suggestion.minerals.magnesium} mg</span>
                </div>
              )}
              {suggestion.minerals.zinc && (
                <div className="flex justify-between p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">Zinc</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">{suggestion.minerals.zinc} mg</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Description */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
             <Heart className="w-5 h-5 text-red-500" />
            Chef's Notes
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {suggestion.description}
          </p>
        </div>

        {/* Key Ingredients */}
        {suggestion.key_ingredients && suggestion.key_ingredients.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-orange-500" />
              Key Ingredients
            </h4>
            <div className="flex flex-wrap gap-2">
              {suggestion.key_ingredients.map((item, index) => (
                <Badge key={index} variant="secondary" className="text-sm bg-gray-100 dark:bg-gray-700">
                  <Leaf className="w-3 h-3 mr-1.5 text-green-500" />
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}