import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { CheckCircle, Mail } from "lucide-react";

export default function Welcome() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({
    age: "",
    height: "",
    weight: "",
    goal_weight: "",
    gender: "",
    activity_level: "moderately_active",
    goal_type: "maintenance"
  });

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
      
      // Check if user has completed onboarding
      if (!user.age || !user.height || !user.weight) {
        setShowOnboarding(true);
      } else {
        navigate(createPageUrl("Dashboard"));
      }
    } catch (error) {
      // User not authenticated, show welcome screen
      console.log("User not authenticated");
    }
    setIsLoading(false);
  };

  const handleLogin = async () => {
    try {
      await User.login();
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateCalorieGoal = () => {
    const { age, height, weight, gender, activity_level, goal_type } = userData;
    
    // Check if essential data is available before calculating
    if (!age || !height || !weight || !gender || !activity_level) {
        return {
            daily_calorie_goal: 0,
            protein_goal: 0,
            carb_goal: 0,
            fat_goal: 0
        };
    }

    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr;
    if (gender === "male") {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    
    // Activity multipliers
    const activityMultipliers = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extremely_active: 1.9
    };
    
    const tdee = bmr * activityMultipliers[activity_level];
    
    // Adjust for goal
    let calorie_goal;
    switch (goal_type) {
      case "weight_loss":
        calorie_goal = tdee - 500; // 500 calorie deficit
        break;
      case "weight_gain":
        calorie_goal = tdee + 500; // 500 calorie surplus
        break;
      case "muscle_gain":
        calorie_goal = tdee + 300; // 300 calorie surplus
        break;
      default:
        calorie_goal = tdee;
    }
    
    return {
      daily_calorie_goal: Math.round(calorie_goal),
      protein_goal: Math.round(weight * 2.2), // 2.2g per kg
      carb_goal: Math.round(calorie_goal * 0.45 / 4), // 45% of calories
      fat_goal: Math.round(calorie_goal * 0.25 / 9) // 25% of calories
    };
  };

  const completeOnboarding = async () => {
    try {
      const goals = calculateCalorieGoal();
      await User.updateMyUserData({
        ...userData,
        age: parseInt(userData.age),
        height: parseInt(userData.height),
        weight: parseInt(userData.weight),
        goal_weight: parseInt(userData.goal_weight),
        ...goals
      });
      navigate(createPageUrl("Dashboard"));
    } catch (error) {
      console.error("Failed to save user data:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-4">
        <div className="max-w-md mx-auto pt-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-teal-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">C</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to CalorieExtractor!</h1>
            <p className="text-gray-600">Let's set up your profile to get personalized nutrition insights</p>
          </div>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Step {step} of 3</CardTitle>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-teal-600 to-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(step / 3) * 100}%` }}
                ></div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {step === 1 && (
                <>
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={userData.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                      placeholder="Enter your age"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={userData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={userData.height}
                      onChange={(e) => handleInputChange("height", e.target.value)}
                      placeholder="Enter your height"
                    />
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div>
                    <Label htmlFor="weight">Current Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={userData.weight}
                      onChange={(e) => handleInputChange("weight", e.target.value)}
                      placeholder="Enter your current weight"
                    />
                  </div>
                  <div>
                    <Label htmlFor="goal_weight">Goal Weight (kg)</Label>
                    <Input
                      id="goal_weight"
                      type="number"
                      value={userData.goal_weight}
                      onChange={(e) => handleInputChange("goal_weight", e.target.value)}
                      placeholder="Enter your goal weight"
                    />
                  </div>
                  <div>
                    <Label htmlFor="activity_level">Activity Level</Label>
                    <Select value={userData.activity_level} onValueChange={(value) => handleInputChange("activity_level", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedentary">Sedentary (desk job)</SelectItem>
                        <SelectItem value="lightly_active">Lightly Active (1-3 workouts/week)</SelectItem>
                        <SelectItem value="moderately_active">Moderately Active (3-5 workouts/week)</SelectItem>
                        <SelectItem value="very_active">Very Active (6-7 workouts/week)</SelectItem>
                        <SelectItem value="extremely_active">Extremely Active (2x/day)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div>
                    <Label htmlFor="goal_type">Primary Goal</Label>
                    <Select value={userData.goal_type} onValueChange={(value) => handleInputChange("goal_type", value)}>
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
                  </div>
                  <div className="bg-teal-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-teal-800 mb-2">Your Personalized Plan</h3>
                    <div className="space-y-1 text-sm text-teal-700">
                      <p>Daily Calories: {calculateCalorieGoal().daily_calorie_goal}</p>
                      <p>Protein: {calculateCalorieGoal().protein_goal}g</p>
                      <p>Carbs: {calculateCalorieGoal().carb_goal}g</p>
                      <p>Fats: {calculateCalorieGoal().fat_goal}g</p>
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                {step > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                )}
                <Button
                  onClick={step === 3 ? completeOnboarding : () => setStep(step + 1)}
                  className="flex-1 bg-gradient-to-r from-teal-600 to-blue-600 text-white"
                  disabled={
                    (step === 1 && (!userData.age || !userData.gender || !userData.height)) ||
                    (step === 2 && (!userData.weight || !userData.goal_weight)) ||
                    (step === 3 && !userData.goal_type)
                  }
                >
                  {step === 3 ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete Setup
                    </>
                  ) : (
                    "Next"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <style>{`
        .bg-welcome {
          background-image: url('https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop');
          background-size: cover;
          background-position: center;
        }
      `}</style>
      <div className="absolute inset-0 bg-welcome z-0"></div>
      <div className="absolute inset-0 bg-black/60 z-10"></div>
      
      <div className="relative z-20 flex flex-col flex-grow p-8 text-center justify-between">
        {/* Top Content */}
        <div>
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-white font-bold text-3xl">C</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Effortless Nutrition Tracking
          </h1>
          <p className="text-lg text-white/80 max-w-md mx-auto">
            Scan your food. See your health. <br/> Simple, smart, and personalized for you.
          </p>
        </div>

        {/* Bottom CTA */}
        <div className="w-full max-w-md mx-auto">
          <Card className="border-0 bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6">
              <Button
                onClick={handleLogin}
                className="w-full bg-white text-gray-900 hover:bg-gray-200 py-3 text-base font-semibold flex items-center gap-2 transition-all duration-300 transform hover:scale-105"
              >
                <Mail className="w-5 h-5" />
                Continue with Google
              </Button>
              <p className="text-center text-xs text-white/60 mt-4">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}