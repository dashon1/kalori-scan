
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Meal } from '@/entities/Meal';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Star, Flame, Clock, Loader2 } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import RecipeUploader from "../components/recipes/RecipeUploader";

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

export default function MealDetailsPage() {
    const [searchParams] = useSearchParams();
    const [meal, setMeal] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const mealId = searchParams.get('id');

    useEffect(() => {
        if (mealId) {
            Meal.get(mealId)
                .then(setMeal)
                .catch(console.error)
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, [mealId]);

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    }

    if (!meal) {
        return <div className="flex items-center justify-center h-screen text-center">Meal not found.</div>;
    }

    const macros = [
        { name: 'Carbs', value: meal.carbs * (meal.quantity || 1), color: 'bg-green-500' },
        { name: 'Protein', value: meal.protein * (meal.quantity || 1), color: 'bg-blue-500' },
        { name: 'Fats', value: meal.fats * (meal.quantity || 1), color: 'bg-purple-500' },
    ];
    const totalMacros = macros.reduce((sum, macro) => sum + (macro.value || 0), 0) || 1;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
            <div className="relative h-64">
                <img src={meal.photo_url} alt={meal.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <Button variant="ghost" size="icon" className="absolute top-4 left-4 rounded-full bg-black/30 hover:bg-black/50" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-5 h-5 text-white" />
                </Button>
                <div className="absolute bottom-0 left-0 p-4">
                    <h2 className="text-3xl font-bold text-white mb-1">{meal.name}</h2>
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-1 text-white">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">{format(new Date(meal.created_date), "MMM d, HH:mm")}</span>
                        </div>
                        <Badge className={getMealTypeColor(meal.meal_type)}>{meal.meal_type}</Badge>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Header Stats */}
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm">
                        <Flame className="w-6 h-6 mx-auto text-orange-500 mb-1" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">Calories</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(meal.calories * (meal.quantity || 1))}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm">
                        <Star className="w-6 h-6 mx-auto text-yellow-500 mb-1" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">Health Score</p>
                        <p className={`text-2xl font-bold ${getHealthScoreColor(meal.health_score)}`}>{meal.health_score}/10</p>
                    </div>
                </div>

                {/* Macros */}
                <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Macronutrient Breakdown</h4>
                    <div className="flex rounded-full overflow-hidden h-3 w-full bg-gray-200 dark:bg-gray-700 mb-3">
                        {macros.map(macro => (
                            <div key={macro.name} className={`${macro.color}`} style={{ width: `${((macro.value || 0) / totalMacros) * 100}%` }} />
                        ))}
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        {macros.map(macro => (
                            <div key={macro.name} className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                                <p className="text-sm text-gray-600 dark:text-gray-400">{macro.name}</p>
                                <p className="font-bold text-lg text-gray-900 dark:text-white">{Math.round(macro.value || 0)}g</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Detailed Nutrition Facts & Key Nutrients */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Detailed Nutrition Facts</h4>
                        <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3 bg-white dark:bg-slate-800 shadow-sm">
                            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700"><span className="font-semibold">Calories</span><span className="font-semibold">{Math.round(meal.calories * (meal.quantity || 1))}</span></div>
                            <div className="grid grid-cols-1 gap-2 text-sm">
                                <div className="flex justify-between"><span>Fiber</span><span className="font-medium">{Math.round((meal.fiber || 0) * (meal.quantity || 1))}g</span></div>
                                <div className="flex justify-between"><span>Sugar</span><span className="font-medium">{Math.round((meal.sugar || 0) * (meal.quantity || 1))}g</span></div>
                                <div className="flex justify-between"><span>Sodium</span><span className="font-medium">{Math.round((meal.sodium || 0) * (meal.quantity || 1))}mg</span></div>
                            </div>
                        </div>
                    </div>
                    {meal.key_nutrients && meal.key_nutrients.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Key Nutrients</h4>
                            <div className="space-y-3">
                                {meal.key_nutrients.map((nutrient, index) => (
                                    <div key={index} className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-medium">{nutrient.name}</span>
                                            <span className="text-sm">{nutrient.amount} ({nutrient.percent_dv}%)</span>
                                        </div>
                                        <Progress value={nutrient.percent_dv} className="h-2" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Coach Summary */}
                {meal.coach_summary && (
                    <div className="bg-teal-50 dark:bg-teal-900/30 p-4 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center"><Star className="w-3 h-3 text-white" /></div>
                            <h4 className="font-semibold text-teal-800 dark:text-teal-300">Coach's Insight</h4>
                        </div>
                        <p className="text-teal-700 dark:text-teal-200 text-sm italic leading-relaxed">"{meal.coach_summary}"</p>
                    </div>
                )}
            </div>

            {/* Attach Recipe */}
            <div className="p-6 pt-0">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Attach a Recipe</h3>
              <div className="max-w-2xl">
                {/* Lightweight uploader scoped to this meal */}
                <React.Suspense fallback={<div className="text-sm text-gray-500">Loading…</div>}>
                  <RecipeUploader mealId={meal.id} />
                </React.Suspense>
              </div>
            </div>
        </div>
    );
}
