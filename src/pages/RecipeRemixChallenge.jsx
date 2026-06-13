import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ChefHat, Heart, TrendingUp, Sparkles } from "lucide-react";

export default function RecipeRemixChallenge() {
  const [unhealthyRecipe, setUnhealthyRecipe] = useState("");
  const [generating, setGenerating] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: remixes = [] } = useQuery({
    queryKey: ['recipeRemixes'],
    queryFn: () => base44.entities.RecipeRemix.list('-created_date', 20)
  });

  const createRemixMutation = useMutation({
    mutationFn: (data) => base44.entities.RecipeRemix.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipeRemixes'] });
      setUnhealthyRecipe("");
    }
  });

  const likeMutation = useMutation({
    mutationFn: ({ id, currentLikes }) => 
      base44.entities.RecipeRemix.update(id, { likes: currentLikes + 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipeRemixes'] });
    }
  });

  const handleGenerateRemix = async () => {
    if (!unhealthyRecipe.trim()) return;

    setGenerating(true);
    
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `I want to make a healthier version of: "${unhealthyRecipe}". 
      Create a healthy remix with lower calories but still delicious. 
      Format as JSON with: original_recipe, remixed_recipe, original_calories, remixed_calories, ingredients (array), instructions (detailed step-by-step)`,
      response_json_schema: {
        type: "object",
        properties: {
          original_recipe: { type: "string" },
          remixed_recipe: { type: "string" },
          original_calories: { type: "number" },
          remixed_calories: { type: "number" },
          ingredients: { type: "array", items: { type: "string" } },
          instructions: { type: "string" }
        }
      }
    });

    await createRemixMutation.mutateAsync(response);
    setGenerating(false);
  };

  const caloriesSaved = (original, remixed) => original - remixed;

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Recipe Remix Challenge</h1>
          <p className="text-gray-600 dark:text-gray-400">Turn unhealthy favorites into healthy masterpieces</p>
        </div>

        <Card className="glass-effect border-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="w-5 h-5" />
              Create a Healthy Remix
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Enter an unhealthy recipe (e.g., Mac and Cheese, Fried Chicken, Chocolate Cake)"
              value={unhealthyRecipe}
              onChange={(e) => setUnhealthyRecipe(e.target.value)}
            />
            <Button 
              onClick={handleGenerateRemix}
              disabled={!unhealthyRecipe.trim() || generating}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Healthy Version...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Healthy Remix
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Community Remixes</h2>
          {remixes.map(remix => {
            const saved = caloriesSaved(remix.original_calories, remix.remixed_calories);
            const percentSaved = ((saved / remix.original_calories) * 100).toFixed(0);
            
            return (
              <Card key={remix.id} className="glass-effect border-0">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded text-xs line-through">
                          {remix.original_recipe}
                        </span>
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded text-xs font-semibold">
                          {remix.remixed_recipe}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">by {remix.created_by}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => likeMutation.mutate({ id: remix.id, currentLikes: remix.likes })}
                      className="flex items-center gap-1"
                    >
                      <Heart className="w-4 h-4 text-red-500" />
                      {remix.likes}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4 p-3 bg-gradient-to-r from-orange-100 to-green-100 dark:from-orange-900/30 dark:to-green-900/30 rounded-lg">
                    <div className="text-center flex-1">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Original</p>
                      <p className="text-2xl font-bold text-red-600">{remix.original_calories}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">calories</p>
                    </div>
                    <div className="text-center flex-1">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Remixed</p>
                      <p className="text-2xl font-bold text-green-600">{remix.remixed_calories}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">calories</p>
                    </div>
                    <div className="text-center flex-1">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Saved</p>
                      <p className="text-2xl font-bold text-purple-600">{percentSaved}%</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">reduction</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Ingredients:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {remix.ingredients?.map((ing, idx) => (
                        <li key={idx} className="text-sm text-gray-700 dark:text-gray-300">{ing}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Instructions:</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{remix.instructions}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}