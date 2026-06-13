import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { InvokeLLM } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingCart, Sparkles, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function GroceryAssistant() {
  const [currentUser, setCurrentUser] = useState(null);
  const [groceryList, setGroceryList] = useState([]);
  const [mealPlan, setMealPlan] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [checkedItems, setCheckedItems] = useState(new Set());

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Failed to load user data:", error);
    }
  };

  const generateGroceryList = async () => {
    setIsGenerating(true);
    
    try {
      const prompt = `
        Create a personalized grocery list and 3-day meal plan for a user with these goals:
        - Goal type: ${currentUser?.goal_type || 'maintenance'}
        - Daily calorie target: ${currentUser?.daily_calorie_goal || 2000}
        - Protein goal: ${currentUser?.protein_goal || 150}g
        - Carb goal: ${currentUser?.carb_goal || 200}g
        - Fat goal: ${currentUser?.fat_goal || 65}g
        
        Please provide:
        1. A 3-day meal plan with breakfast, lunch, and dinner
        2. A comprehensive grocery list organized by category
        3. Consider variety, nutrition balance, and practical cooking
        
        Format the response as JSON with this structure:
        {
          "meal_plan": [
            {
              "day": "Day 1",
              "meals": {
                "breakfast": "meal name and brief description",
                "lunch": "meal name and brief description", 
                "dinner": "meal name and brief description"
              }
            }
          ],
          "grocery_list": {
            "proteins": ["item1", "item2"],
            "vegetables": ["item1", "item2"],
            "fruits": ["item1", "item2"],
            "grains": ["item1", "item2"],
            "dairy": ["item1", "item2"],
            "pantry": ["item1", "item2"]
          }
        }
      `;

      const result = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            meal_plan: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  day: { type: "string" },
                  meals: {
                    type: "object",
                    properties: {
                      breakfast: { type: "string" },
                      lunch: { type: "string" },
                      dinner: { type: "string" }
                    }
                  }
                }
              }
            },
            grocery_list: {
              type: "object",
              properties: {
                proteins: { type: "array", items: { type: "string" } },
                vegetables: { type: "array", items: { type: "string" } },
                fruits: { type: "array", items: { type: "string" } },
                grains: { type: "array", items: { type: "string" } },
                dairy: { type: "array", items: { type: "string" } },
                pantry: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      });

      setMealPlan(result.meal_plan || []);
      setGroceryList(result.grocery_list || {});
    } catch (error) {
      console.error("Failed to generate grocery list:", error);
    }
    
    setIsGenerating(false);
  };

  const toggleItem = (category, item) => {
    const itemKey = `${category}-${item}`;
    const newChecked = new Set(checkedItems);
    
    if (newChecked.has(itemKey)) {
      newChecked.delete(itemKey);
    } else {
      newChecked.add(itemKey);
    }
    
    setCheckedItems(newChecked);
  };

  const categoryColors = {
    proteins: "bg-red-100 text-red-800",
    vegetables: "bg-green-100 text-green-800",
    fruits: "bg-purple-100 text-purple-800",
    grains: "bg-yellow-100 text-yellow-800",
    dairy: "bg-blue-100 text-blue-800",
    pantry: "bg-gray-100 text-gray-800"
  };

  const categoryIcons = {
    proteins: "🥩",
    vegetables: "🥬", 
    fruits: "🍎",
    grains: "🌾",
    dairy: "🥛",
    pantry: "🏪"
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
            <h1 className="text-2xl font-bold text-gray-900">Grocery Assistant</h1>
            <p className="text-gray-600 text-sm">AI-powered meal planning & shopping</p>
          </div>
        </div>

        {/* Generate Button */}
        <Card className="glass-effect border-0 shadow-lg">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            <CardTitle>Smart Grocery Planning</CardTitle>
            <p className="text-sm text-gray-600">
              Get personalized meal plans and shopping lists based on your nutrition goals
            </p>
          </CardHeader>
          <CardContent>
            <Button
              onClick={generateGroceryList}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3"
            >
              {isGenerating ? (
                "Generating Your Plan..."
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Meal Plan & List
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Meal Plan */}
        {mealPlan.length > 0 && (
          <Card className="glass-effect border-0 shadow-lg">
            <CardHeader>
              <CardTitle>3-Day Meal Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mealPlan.map((day, index) => (
                <div key={index} className="space-y-2">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <span className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-xs">
                      {index + 1}
                    </span>
                    {day.day}
                  </h3>
                  <div className="space-y-1 ml-8">
                    <div className="text-sm">
                      <Badge className="bg-yellow-100 text-yellow-800 mr-2">Breakfast</Badge>
                      {day.meals.breakfast}
                    </div>
                    <div className="text-sm">
                      <Badge className="bg-blue-100 text-blue-800 mr-2">Lunch</Badge>
                      {day.meals.lunch}
                    </div>
                    <div className="text-sm">
                      <Badge className="bg-purple-100 text-purple-800 mr-2">Dinner</Badge>
                      {day.meals.dinner}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Grocery List */}
        {Object.keys(groceryList).length > 0 && (
          <Card className="glass-effect border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Shopping List
                <Badge variant="outline">
                  {checkedItems.size} / {Object.values(groceryList).flat().length} items
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(groceryList).map(([category, items]) => (
                <div key={category} className="space-y-2">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <span className="text-lg">{categoryIcons[category]}</span>
                    <span className="capitalize">{category}</span>
                    <Badge className={categoryColors[category]}>{items.length}</Badge>
                  </h4>
                  <div className="space-y-1 ml-6">
                    {items.map((item, itemIndex) => {
                      const itemKey = `${category}-${item}`;
                      const isChecked = checkedItems.has(itemKey);
                      
                      return (
                        <div
                          key={itemIndex}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => toggleItem(category, item)}
                        >
                          <Checkbox 
                            checked={isChecked}
                            onChange={() => toggleItem(category, item)}
                          />
                          <span className={`text-sm flex-1 ${isChecked ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {item}
                          </span>
                          {isChecked && <Check className="w-4 h-4 text-green-600" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card className="glass-effect border-0 shadow-lg">
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Smart Shopping Tips</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                <p>Shop the perimeter of the store first for fresh foods</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                <p>Buy seasonal produce for better prices and nutrition</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                <p>Prep ingredients in batches to save time during the week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}