
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { InvokeLLM } from "@/integrations/Core";
import { 
  Lightbulb, 
  Droplets,
  TrendingUp,
  Heart,
  Users,
  Activity,
  Trophy,
  ChefHat // Added ChefHat icon
} from "lucide-react";

export default function PersonalizedSuggestions({ user, todaysStats, todaysMeals, todaysActivities = [] }) {
  const navigate = useNavigate();
  const [mealSuggestion, setMealSuggestion] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const getNextMealType = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Breakfast';
    if (hour < 16) return 'Lunch';
    if (hour < 21) return 'Dinner';
    return 'Snack';
  };

  const generateMealSuggestion = async () => {
    if (!user || isGenerating) return;
    
    setIsGenerating(true);
    setMealSuggestion(null);

    const nextMeal = getNextMealType();
    const remainingCalories = (user.daily_calorie_goal || 2000) - (todaysStats.netCalories || 0);

    try {
      const prompt = `
        You are an AI nutrition coach. A user needs a meal suggestion.
        - Their goal is: ${user.goal_type || 'maintenance'}.
        - Their remaining net calories for the day are: ${Math.round(remainingCalories)}.
        - They've already eaten: ${todaysMeals.map(m => m.name).join(', ') || 'nothing'}.
        - The next meal is: ${nextMeal}.

        Suggest one specific, healthy, and appealing meal idea for them.
        Provide a very brief (10-15 words) and encouraging reason why it's a good choice for them right now.
        Example format:
        Meal: Grilled Chicken Salad with Avocado
        Reason: A light yet satisfying option, packed with protein to keep you full and on track with your goals.
      `;
      
      const schema = {
        type: "object",
        properties: {
          meal: { type: "string", description: "The name of the suggested meal." },
          reason: { type: "string", description: "A short, encouraging reason for the suggestion." }
        },
        required: ["meal", "reason"]
      };

      const result = await InvokeLLM({
        prompt: prompt,
        response_json_schema: schema
      });
      
      setMealSuggestion(result);
    } catch (error) {
      console.error("Failed to generate meal suggestion:", error);
      setMealSuggestion({ meal: "Try a balanced meal", reason: "Couldn't generate a specific idea, but focus on lean protein and veggies!" });
    }
    setIsGenerating(false);
  };

  useEffect(() => {
    // Generate a suggestion when the component mounts if conditions are right
    const remainingCalories = (user?.daily_calorie_goal || 2000) - (todaysStats?.netCalories || 0);
    if (user && remainingCalories > 200) {
      generateMealSuggestion();
    }
  }, [user, todaysStats]); // Re-run if user or stats change

  const otherSuggestions = () => {
    const suggestions = [];
    const calorieGoal = user?.daily_calorie_goal || 2000;
    const proteinGoal = user?.protein_goal || 150;
    const netCalories = todaysStats.netCalories || todaysStats.calories;
    const remainingCalories = calorieGoal - netCalories;
    const proteinProgress = (todaysStats.protein / proteinGoal) * 100;
    const totalActivities = todaysActivities.length;
    const totalActivityMinutes = todaysActivities.reduce((sum, activity) => sum + activity.duration_minutes, 0);
    
    // Activity-based suggestions
    if (totalActivities === 0) {
      suggestions.push({
        icon: Activity,
        title: "Get Moving! 🏃‍♀️",
        description: "Log some physical activity to balance your calorie intake and boost your health.",
        action: "Log Activity",
        color: "bg-orange-50 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
        priority: 1,
        onClick: () => navigate(createPageUrl("Home")) // Will scroll to activity tracker
      });
    } else if (totalActivityMinutes < 30) {
      suggestions.push({
        icon: TrendingUp,
        title: "Almost There! 💪",
        description: `Great start with ${totalActivityMinutes} minutes! Try to reach 30+ minutes daily for optimal health.`,
        action: "Add More",
        color: "bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
        priority: 2
      });
    }

    // Premium feature suggestion for nutritionist sharing
    if (user?.subscription_status === "premium" && todaysMeals.length >= 2) {
      suggestions.push({
        icon: Users,
        title: "Share Your Progress",
        description: "Consider sharing your meal logs with a nutritionist for personalized advice.",
        action: "Share Now",
        color: "bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        priority: 1,
        href: createPageUrl("NutritionistShare")
      });
    }

    // Calorie-based suggestions (adjusted for net calories)
    if (remainingCalories < 100 && remainingCalories > 0) {
      suggestions.push({
        icon: Heart,
        title: "Perfect Balance! ⚖️",
        description: "You're very close to your calorie goal. Great job maintaining balance!",
        action: "View Progress",
        color: "bg-mint-50 text-mint-800 dark:bg-mint-900/30 dark:text-mint-300",
        priority: 2
      });
    }

    // Protein suggestions
    if (proteinProgress < 50) {
      suggestions.push({
        icon: TrendingUp,
        title: "Protein Boost",
        description: `You're at ${Math.round(proteinProgress)}% of your protein goal. Add some lean protein!`,
        action: "Protein Foods",
        color: "bg-purple-50 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
        priority: 3
      });
    }

    // Hydration reminder
    suggestions.push({
      icon: Droplets,
      title: "Stay Hydrated",
      description: "Remember to drink water throughout the day for optimal health.",
      action: "Track Water",
      color: "bg-cyan-50 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
      priority: 4
    });

    // Goal-specific suggestions with activity consideration
    if (user?.goal_type === 'weight_loss' && netCalories < calorieGoal * 0.7 && totalActivities > 0) {
      suggestions.push({
        icon: Trophy,
        title: "Excellent Balance! 🏆",
        description: "Great job combining smart eating with physical activity for weight loss!",
        action: "Keep Going",
        color: "bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        priority: 1
      });
    }

    return suggestions.sort((a, b) => a.priority - b.priority).slice(0, 2);
  };

  const suggestions = otherSuggestions();

  if (!mealSuggestion && suggestions.length === 0) return null;

  return (
    <Card className="glass-effect card-shadow rounded-3xl overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          <h3 className="font-semibold text-neutral-900 dark:text-white">Just for You</h3>
        </div>
        <div className="space-y-3">
          {/* AI Meal Suggestion */}
          {mealSuggestion && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/30 dark:to-blue-900/30">
              <div className="flex items-start gap-3">
                <ChefHat className="w-5 h-5 flex-shrink-0 mt-0.5 text-teal-600 dark:text-teal-300" />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1 text-teal-800 dark:text-teal-200">{getNextMealType()} Idea: {mealSuggestion.meal}</h4>
                  <p className="text-xs opacity-90 mb-3 text-teal-700 dark:text-teal-300">{mealSuggestion.reason}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-3 text-xs font-medium text-teal-700 hover:bg-white/50 dark:text-teal-200 dark:hover:bg-white/10"
                    onClick={() => navigate(createPageUrl("Camera"))}
                  >
                    Log This Meal
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Other suggestions */}
          {suggestions.map((suggestion, index) => (
            <div key={index} className={`p-4 rounded-2xl ${suggestion.color}`}>
              <div className="flex items-start gap-3">
                <suggestion.icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">{suggestion.title}</h4>
                  <p className="text-xs opacity-90 mb-3">{suggestion.description}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-3 text-xs font-medium hover:bg-white/50 dark:hover:bg-white/10"
                    onClick={suggestion.onClick || (() => suggestion.href ? navigate(suggestion.href) : navigate(createPageUrl("Camera")))}
                  >
                    {suggestion.action}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
