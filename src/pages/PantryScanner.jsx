import React, { useState, useRef } from "react";
import { UploadFile, InvokeLLM } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Camera, Upload, Sparkles, ChefHat, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function PantryScanner() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [pantryItems, setPantryItems] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingRecipes, setIsGeneratingRecipes] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setPantryItems([]);
      setRecipes([]);
    }
  };

  const analyzePantry = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    try {
      const { file_url } = await UploadFile({ file: selectedFile });
      
      const prompt = `
        Analyze this pantry/fridge photo and identify all visible food items and ingredients.
        Look for:
        - Fresh produce (fruits, vegetables)
        - Pantry staples (rice, pasta, canned goods)
        - Proteins (meat, eggs, dairy)
        - Condiments and spices
        - Any other ingredients
        
        Return a JSON list of items with categories and freshness estimates.
      `;

      const result = await InvokeLLM({
        prompt,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  category: { type: "string" },
                  freshness: { type: "string" },
                  quantity_estimate: { type: "string" }
                }
              }
            }
          }
        }
      });

      setPantryItems(result.items || []);
    } catch (error) {
      console.error("Failed to analyze pantry:", error);
    }
    setIsAnalyzing(false);
  };

  const generateRecipes = async () => {
    if (pantryItems.length === 0) return;

    setIsGeneratingRecipes(true);
    try {
      const itemsList = pantryItems.map(item => item.name).join(", ");
      
      const prompt = `
        Based on these available ingredients: ${itemsList}
        
        Generate 3-4 healthy recipe suggestions that can be made with these items.
        Include recipes for different meal types (breakfast, lunch, dinner, snack).
        Consider dietary balance and nutrition.
        
        For each recipe, provide:
        - Recipe name
        - Cooking time
        - Difficulty level
        - Key ingredients used
        - Brief cooking instructions
        - Estimated calories and macros
        - Health benefits
      `;

      const result = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            recipes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  cooking_time: { type: "string" },
                  difficulty: { type: "string" },
                  meal_type: { type: "string" },
                  ingredients_used: { type: "array", items: { type: "string" } },
                  instructions: { type: "string" },
                  estimated_calories: { type: "number" },
                  protein: { type: "number" },
                  carbs: { type: "number" },
                  fats: { type: "number" },
                  health_benefits: { type: "string" }
                }
              }
            }
          }
        }
      });

      setRecipes(result.recipes || []);
    } catch (error) {
      console.error("Failed to generate recipes:", error);
    }
    setIsGeneratingRecipes(false);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMealTypeColor = (mealType) => {
    switch (mealType?.toLowerCase()) {
      case 'breakfast': return 'bg-yellow-100 text-yellow-800';
      case 'lunch': return 'bg-blue-100 text-blue-800';
      case 'dinner': return 'bg-purple-100 text-purple-800';
      case 'snack': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="outline" size="icon" className="rounded-full">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pantry Scanner</h1>
            <p className="text-gray-600 text-sm">Turn ingredients into delicious recipes</p>
          </div>
        </div>

        {/* Scanner Interface */}
        <Card className="glass-effect border-0 shadow-lg">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <ChefHat className="w-8 h-8 text-white" />
            </div>
            <CardTitle>Scan Your Pantry</CardTitle>
            <p className="text-sm text-gray-600">
              Take a photo of your pantry, fridge, or ingredients to get recipe suggestions
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {!previewUrl ? (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Take Pantry Photo
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = handleFileSelect;
                    input.click();
                  }}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose from Gallery
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="aspect-video rounded-2xl overflow-hidden">
                  <img
                    src={previewUrl}
                    alt="Pantry preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {pantryItems.length === 0 ? (
                  <Button
                    onClick={analyzePantry}
                    disabled={isAnalyzing}
                    className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white"
                  >
                    {isAnalyzing ? "Analyzing Ingredients..." : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Analyze Pantry
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={generateRecipes}
                    disabled={isGeneratingRecipes}
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white"
                  >
                    {isGeneratingRecipes ? "Creating Recipes..." : (
                      <>
                        <ChefHat className="w-4 h-4 mr-2" />
                        Generate Recipes
                      </>
                    )}
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  onClick={() => {
                    setPreviewUrl(null);
                    setSelectedFile(null);
                    setPantryItems([]);
                    setRecipes([]);
                  }}
                  className="w-full"
                >
                  Scan Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detected Items */}
        {pantryItems.length > 0 && (
          <Card className="glass-effect border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Detected Ingredients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {pantryItems.map((item, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {item.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generated Recipes */}
        {recipes.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Recipe Suggestions</h2>
            {recipes.map((recipe, index) => (
              <Card key={index} className="glass-effect border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{recipe.name}</CardTitle>
                      <div className="flex gap-2 mt-2">
                        <Badge className={getMealTypeColor(recipe.meal_type)}>
                          {recipe.meal_type}
                        </Badge>
                        <Badge className={getDifficultyColor(recipe.difficulty)}>
                          {recipe.difficulty}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {recipe.cooking_time}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-teal-600">{recipe.estimated_calories} cal</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div>
                      <p className="text-gray-600">Protein</p>
                      <p className="font-semibold text-blue-600">{recipe.protein}g</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Carbs</p>
                      <p className="font-semibold text-green-600">{recipe.carbs}g</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Fats</p>
                      <p className="font-semibold text-purple-600">{recipe.fats}g</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Instructions</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{recipe.instructions}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Health Benefits</h4>
                    <p className="text-sm text-gray-600">{recipe.health_benefits}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Tips */}
        <Card className="glass-effect border-0 shadow-lg">
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Pantry Scanning Tips</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                <p>Take photos with good lighting for better ingredient recognition</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                <p>Include both fresh and packaged ingredients in the same photo</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                <p>Spread items out so labels and ingredients are clearly visible</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}