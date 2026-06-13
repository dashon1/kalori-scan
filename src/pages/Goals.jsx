
import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  ArrowLeft,
  Target,
  Flame,
  Dumbbell,
  Scale,
  Heart,
  Save,
  Zap,
  Lock
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


export default function Goals() {
  const [currentUser, setCurrentUser] = useState(null);
  const [goals, setGoals] = useState({
    goal_type: "maintenance",
    daily_calorie_goal: 2000,
    protein_goal: 150,
    carb_goal: 200,
    fat_goal: 65,
    water_goal: 8,
    weight_change_rate: 0.5,
    activity_level: "moderately_active"
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
      setGoals({
        goal_type: user.goal_type || "maintenance",
        daily_calorie_goal: user.daily_calorie_goal || 2000,
        protein_goal: user.protein_goal || 150,
        carb_goal: user.carb_goal || 200,
        fat_goal: user.fat_goal || 65,
        water_goal: user.water_goal || 8,
        weight_change_rate: user.weight_change_rate || 0.5,
        activity_level: user.activity_level || "moderately_active"
      });
    } catch (error) {
      console.error("Failed to load user data:", error);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await User.updateMyUserData(goals);
      setCurrentUser({...currentUser, ...goals});
    } catch (error) {
      console.error("Failed to save goals:", error);
    }
    setIsSaving(false);
  };

  const calculateMacroPercentages = () => {
    const totalCals = goals.daily_calorie_goal;
    const proteinCals = goals.protein_goal * 4;
    const carbCals = goals.carb_goal * 4;
    const fatCals = goals.fat_goal * 9;
    
    return {
      protein: Math.round((proteinCals / totalCals) * 100),
      carbs: Math.round((carbCals / totalCals) * 100),
      fats: Math.round((fatCals / totalCals) * 100)
    };
  };

  const getGoalRecommendations = () => {
    const { goal_type } = goals;
    switch (goal_type) {
      case "weight_loss":
        return {
          title: "Weight Loss Focus",
          tips: [
            "Maintain a moderate calorie deficit of 300-500 calories",
            "Prioritize protein to preserve muscle mass",
            "Include strength training 2-3 times per week"
          ],
          color: "from-red-500 to-pink-500"
        };
      case "weight_gain":
        return {
          title: "Healthy Weight Gain",
          tips: [
            "Create a calorie surplus of 300-500 calories",
            "Focus on nutrient-dense, calorie-rich foods",
            "Combine with resistance training for muscle growth"
          ],
          color: "from-blue-500 to-indigo-500"
        };
      case "muscle_gain":
        return {
          title: "Muscle Building",
          tips: [
            "Eat 1.6-2.2g protein per kg body weight",
            "Time protein intake around workouts",
            "Ensure adequate carbs for workout fuel"
          ],
          color: "from-purple-500 to-violet-500"
        };
      default:
        return {
          title: "Maintenance & Health",
          tips: [
            "Focus on balanced nutrition and consistency",
            "Emphasize whole foods and variety",
            "Listen to your body's hunger cues"
          ],
          color: "from-green-500 to-teal-500"
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

  const macroPercentages = calculateMacroPercentages();
  const recommendations = getGoalRecommendations();
  const isPremium = currentUser?.subscription_status === 'premium';

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to={createPageUrl("Profile")}>
            <Button variant="outline" size="icon" className="rounded-full">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Goals & Preferences</h1>
            <p className="text-gray-600 text-sm">Customize your nutrition targets</p>
          </div>
        </div>

        {/* Goal Type Selection */}
        <Card className="glass-effect border-0 shadow-lg">
          <CardHeader className="text-center">
            <div className={`w-16 h-16 bg-gradient-to-r ${recommendations.color} rounded-3xl flex items-center justify-center mx-auto mb-4`}>
              <Target className="w-8 h-8 text-white" />
            </div>
            <CardTitle>Primary Goal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select 
              value={goals.goal_type} 
              onValueChange={(value) => setGoals({...goals, goal_type: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weight_loss">Weight Loss</SelectItem>
                <SelectItem value="weight_gain">Weight Gain</SelectItem>
                <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                <SelectItem value="maintenance">Maintain Weight</SelectItem>
              </SelectContent>
            </Select>
            
            <div className={`bg-gradient-to-r ${recommendations.color} bg-opacity-10 rounded-2xl p-4`}>
              <h3 className="font-semibold text-gray-900 mb-2">{recommendations.title}</h3>
              <ul className="space-y-1">
                {recommendations.tips.map((tip, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-teal-600 rounded-full mt-2 flex-shrink-0"></span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Activity Level */}
        <Card className="glass-effect border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-purple-600" />
              Activity Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select 
              value={goals.activity_level} 
              onValueChange={(value) => setGoals({...goals, activity_level: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sedentary">Sedentary (desk job, no exercise)</SelectItem>
                <SelectItem value="lightly_active">Lightly Active (1-3 workouts/week)</SelectItem>
                <SelectItem value="moderately_active">Moderately Active (3-5 workouts/week)</SelectItem>
                <SelectItem value="very_active">Very Active (6-7 workouts/week)</SelectItem>
                <SelectItem value="extremely_active">Extremely Active (2x/day workouts)</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Calorie Goal */}
        <Card className="glass-effect border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-600" />
              Daily Calorie Goal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="calories">Target Calories</Label>
              <Input
                id="calories"
                type="number"
                value={goals.daily_calorie_goal}
                onChange={(e) => setGoals({...goals, daily_calorie_goal: parseInt(e.target.value)})}
                className="text-center text-lg font-semibold"
              />
            </div>
            
            <div className="bg-orange-50 rounded-2xl p-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600">{goals.daily_calorie_goal}</p>
                <p className="text-sm text-orange-700">calories per day</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Macro Goals */}
        <Card className="glass-effect border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Macronutrient Goals</CardTitle>
            <p className="text-sm text-gray-600">
              Customize your protein, carbs, and fat targets
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="protein" className="text-blue-700">Protein (g)</Label>
                <Input
                  id="protein"
                  type="number"
                  value={goals.protein_goal}
                  onChange={(e) => setGoals({...goals, protein_goal: parseInt(e.target.value)})}
                  className="text-center border-blue-200"
                />
                <p className="text-xs text-blue-600 text-center mt-1">{macroPercentages.protein}%</p>
              </div>
              
              <div>
                <Label htmlFor="carbs" className="text-green-700">Carbs (g)</Label>
                <Input
                  id="carbs"
                  type="number"
                  value={goals.carb_goal}
                  onChange={(e) => setGoals({...goals, carb_goal: parseInt(e.target.value)})}
                  className="text-center border-green-200"
                />
                <p className="text-xs text-green-600 text-center mt-1">{macroPercentages.carbs}%</p>
              </div>
              
              <div>
                <Label htmlFor="fats" className="text-purple-700">Fats (g)</Label>
                <Input
                  id="fats"
                  type="number"
                  value={goals.fat_goal}
                  onChange={(e) => setGoals({...goals, fat_goal: parseInt(e.target.value)})}
                  className="text-center border-purple-200"
                />
                <p className="text-xs text-purple-600 text-center mt-1">{macroPercentages.fats}%</p>
              </div>
            </div>
            
            {/* Macro Visualization */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-blue-700">Protein</span>
                <span className="text-blue-700">{macroPercentages.protein}%</span>
              </div>
              <Progress value={macroPercentages.protein} className="h-2" />
              
              <div className="flex justify-between text-sm">
                <span className="text-green-700">Carbs</span>
                <span className="text-green-700">{macroPercentages.carbs}%</span>
              </div>
              <Progress value={macroPercentages.carbs} className="h-2" />
              
              <div className="flex justify-between text-sm">
                <span className="text-purple-700">Fats</span>
                <span className="text-purple-700">{macroPercentages.fats}%</span>
              </div>
              <Progress value={macroPercentages.fats} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Weight Change Rate */}
        {(goals.goal_type === "weight_loss" || goals.goal_type === "weight_gain") && (
          <Card className="glass-effect border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-teal-600" />
                Weight Change Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="rate">Target per week (kg)</Label>
                <Select 
                  value={goals.weight_change_rate.toString()} 
                  onValueChange={(value) => setGoals({...goals, weight_change_rate: parseFloat(value)})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.25">0.25 kg/week (Conservative)</SelectItem>
                    <SelectItem value="0.5">0.5 kg/week (Moderate)</SelectItem>
                    <SelectItem value="0.75">0.75 kg/week (Aggressive)</SelectItem>
                    <SelectItem value="1.0">1.0 kg/week (Very Aggressive)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Goals */}
        <Card className="glass-effect border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-600" />
              Health Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="water" className="flex items-center gap-2">
                <span>Daily Water Goal</span>
                <span className="text-blue-600">(glasses)</span>
              </Label>
              <Input
                id="water"
                type="number"
                value={goals.water_goal}
                onChange={(e) => setGoals({...goals, water_goal: parseInt(e.target.value)})}
                className="text-center"
              />
            </div>
          </CardContent>
        </Card>

        {/* Smart Recommendations */}
        <Card className="glass-effect border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-800 mb-1">AI-Powered Recommendations</h3>
                <p className="text-sm text-blue-700 mb-3">
                  Our AI analyzes your progress and automatically suggests goal adjustments based on your results and preferences.
                </p>
                <Button variant="outline" size="sm" className="border-blue-300 text-blue-700">
                  Get AI Recommendations
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Card className="glass-effect border-0 shadow-lg">
          <CardContent className="p-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-full">
                    <Button
                      onClick={handleSave}
                      disabled={isSaving || !isPremium}
                      className="w-full bg-gradient-to-r from-teal-600 to-blue-600 text-white py-3 disabled:opacity-50"
                    >
                      {!isPremium && <Lock className="w-4 h-4 mr-2" />}
                      {isSaving ? "Saving..." : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Goals & Preferences
                        </>
                      )}
                    </Button>
                  </div>
                </TooltipTrigger>
                {!isPremium && (
                  <TooltipContent>
                    <p>Upgrade to Premium to set and save custom goals.</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
