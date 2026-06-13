
import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Meal } from "@/entities/Meal";
import { Activity } from "@/entities/Activity";
import { NutritionistShare as NutritionistShareEntity } from "@/entities/NutritionistShare";
import { SendEmail } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { format, subDays } from "date-fns";
import {
  Users,
  Calendar,
  FileText,
  CheckCircle,
  Shield,
  Camera,
  BarChart3,
  Apple,
  Activity as ActivityIcon,
  Mail
} from "lucide-react";
import PremiumGate from "../components/premium/PremiumGate";

export default function NutritionistShare() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [shares, setShares] = useState([]);
  const [meals, setMeals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [selectedMeals, setSelectedMeals] = useState([]);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [formData, setFormData] = useState({
    nutritionist_email: "",
    start_date: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    end_date: format(new Date(), 'yyyy-MM-dd'),
    message_to_nutritionist: "",
    session_type: "consultation",
    include_photos: true,
    include_macros: true,
    include_health_score: true,
    include_activities: true
  });

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadDataForSharing();
    }
  }, [currentUser, formData.start_date, formData.end_date]);

  const loadUserData = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);

      if (user.subscription_status === "premium") {
        const userShares = await NutritionistShareEntity.filter({ user_email: user.email });
        setShares(userShares);
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
    }
    setIsLoading(false);
  };

  const loadDataForSharing = async () => {
    try {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);

      const [userMeals, userActivities] = await Promise.allSettled([
        Meal.filter({ created_by: currentUser.email }),
        Activity.filter({ created_by: currentUser.email })
      ]);

      if (userMeals.status === 'fulfilled') {
        const filteredMeals = userMeals.value.filter(meal => {
          const mealDate = new Date(meal.created_date);
          // Ensure mealDate is within or equal to the selected range. Set endDate to end of day for inclusive range.
          const mealDateOnly = new Date(mealDate.getFullYear(), mealDate.getMonth(), mealDate.getDate());
          const endDateAdjusted = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59); // End of day
          return mealDateOnly >= startDate && mealDateOnly <= endDateAdjusted;
        });
        setMeals(filteredMeals);
        setSelectedMeals(filteredMeals.map(m => m.id)); // Select all by default
      }

      if (userActivities.status === 'fulfilled') {
        const filteredActivities = userActivities.value.filter(activity => {
          const activityDate = new Date(activity.created_date);
          const activityDateOnly = new Date(activityDate.getFullYear(), activityDate.getMonth(), activityDate.getDate());
          const endDateAdjusted = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59); // End of day
          return activityDateOnly >= startDate && activityDateOnly <= endDateAdjusted;
        });
        setActivities(filteredActivities);
        setSelectedActivities(filteredActivities.map(a => a.id)); // Select all by default
      }
    } catch (error) {
      console.error("Failed to load data for sharing:", error);
    }
  };

  const generateVisualEmailContent = () => {
    const selectedMealData = meals.filter(meal => selectedMeals.includes(meal.id));
    const selectedActivityData = activities.filter(activity => selectedActivities.includes(activity.id));

    const totalCalories = selectedMealData.reduce((sum, meal) => sum + (meal.calories * (meal.quantity || 1)), 0);
    const totalCaloriesBurned = selectedActivityData.reduce((sum, activity) => sum + activity.calories_burned, 0);
    const netCalories = totalCalories - totalCaloriesBurned;

    const totalProtein = selectedMealData.reduce((sum, meal) => sum + (meal.protein * (meal.quantity || 1)), 0);
    const totalCarbs = selectedMealData.reduce((sum, meal) => sum + (meal.carbs * (meal.quantity || 1)), 0);
    const totalFats = selectedMealData.reduce((sum, meal) => sum + (meal.fats * (meal.quantity || 1)), 0);

    const avgHealthScore = selectedMealData.length > 0
      ? (selectedMealData.reduce((sum, meal) => sum + (meal.health_score || 0), 0) / selectedMealData.length)
      : 0;

    // Generate macro distribution percentages
    const totalMacrosInCalories = (totalProtein * 4) + (totalCarbs * 4) + (totalFats * 9);
    const proteinPercent = totalMacrosInCalories > 0 ? (totalProtein * 4 / totalMacrosInCalories * 100) : 0;
    const carbsPercent = totalMacrosInCalories > 0 ? (totalCarbs * 4 / totalMacrosInCalories * 100) : 0;
    const fatsPercent = totalMacrosInCalories > 0 ? (totalFats * 9 / totalMacrosInCalories * 100) : 0;

    // Create visual HTML email
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KaloriScan Nutrition Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: linear-gradient(135deg, #f0fdf4 0%, #ecfeff 100%);
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 24px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #059669 0%, #0891b2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 { font-size: 28px; margin-bottom: 10px; }
        .header p { font-size: 16px; opacity: 0.9; }
        .content { padding: 30px; }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .stat-card {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            padding: 20px;
            border-radius: 16px;
            text-align: center;
            border-left: 4px solid;
        }
        .stat-card.calories { border-left-color: #f59e0b; }
        .stat-card.burned { border-left-color: #ef4444; }
        .stat-card.net { border-left-color: #3b82f6; }
        .stat-card.health { border-left-color: #10b981; }
        .stat-number { font-size: 32px; font-weight: bold; margin-bottom: 5px; }
        .stat-label { font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
        .macro-section {
            background: #f8fafc;
            padding: 25px;
            border-radius: 16px;
            margin: 30px 0;
        }
        .macro-bar {
            height: 20px;
            border-radius: 10px;
            display: flex;
            overflow: hidden;
            margin: 15px 0;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
        }
        .macro-segment { height: 100%; }
        .protein { background: #3b82f6; }
        .carbs { background: #10b981; }
        .fats { background: #8b5cf6; }
        .macro-legend {
            display: flex;
            justify-content: space-around;
            margin-top: 15px;
        }
        .legend-item {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .legend-color {
            width: 16px;
            height: 16px;
            border-radius: 50%;
        }
        .meal-section {
            margin: 40px 0;
        }
        .meal-card {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 20px;
            margin: 15px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .meal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        .meal-title { font-size: 18px; font-weight: 600; }
        .meal-time { font-size: 14px; color: #6b7280; }
        .meal-image {
            width: 100%;
            max-width: 300px;
            height: 200px;
            object-fit: cover;
            border-radius: 8px;
            margin: 15px auto; /* Centering the image */
            display: block; /* To apply margin:auto */
        }
        .meal-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 15px;
            background: #f9fafb;
            padding: 15px;
            border-radius: 8px;
        }
        .meal-stat {
            text-align: center;
        }
        .meal-stat-value { font-weight: 600; font-size: 16px; }
        .meal-stat-label { font-size: 12px; color: #6b7280; }
        .health-score {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            background: #dcfce7;
            color: #166534;
            padding: 4px 8px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
        }
        .activity-section {
            background: #fef3c7;
            padding: 25px;
            border-radius: 16px;
            margin: 30px 0;
        }
        .activity-card {
            background: white;
            border-radius: 8px;
            padding: 15px;
            margin: 10px 0;
            border-left: 4px solid #f59e0b;
        }
        .footer {
            background: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .footer p { color: #6b7280; margin: 5px 0; }
        .brand { color: #059669; font-weight: 600; }
        h2 {
            color: #1f2937;
            margin: 30px 0 20px 0;
            font-size: 24px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
        }
        .message-box {
            background: #eff6ff;
            border-left: 4px solid #3b82f6;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            font-style: italic;
        }
        .ai-insight {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 8px;
            padding: 15px;
            margin: 10px 0;
            font-size: 14px;
        }
        .ai-insight::before {
            content: "🤖 AI Analysis: ";
            font-weight: 600;
            color: #059669;
        }
        @media (max-width: 600px) {
            .summary-grid { grid-template-columns: 1fr 1fr; }
            .macro-legend { flex-direction: column; gap: 10px; }
            .meal-stats { grid-template-columns: 1fr 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 KaloriScan Nutrition Report</h1>
            <p>Comprehensive nutrition analysis for ${currentUser.full_name}</p>
            <p>${format(new Date(formData.start_date), 'MMMM d, yyyy')} - ${format(new Date(formData.end_date), 'MMMM d, yyyy')}</p>
        </div>

        <div class="content">
            ${formData.message_to_nutritionist ? `
            <div class="message-box">
                <strong>Message from ${currentUser.full_name}:</strong><br>
                "${formData.message_to_nutritionist}"
            </div>
            ` : ''}

            <h2>📈 Executive Summary</h2>
            <div class="summary-grid">
                <div class="stat-card calories">
                    <div class="stat-number" style="color: #f59e0b;">${Math.round(totalCalories)}</div>
                    <div class="stat-label">Calories Consumed</div>
                </div>
                <div class="stat-card burned">
                    <div class="stat-number" style="color: #ef4444;">${Math.round(totalCaloriesBurned)}</div>
                    <div class="stat-label">Calories Burned</div>
                </div>
                <div class="stat-card net">
                    <div class="stat-number" style="color: #3b82f6;">${Math.round(netCalories)}</div>
                    <div class="stat-label">Net Calories</div>
                </div>
                <div class="stat-card health">
                    <div class="stat-number" style="color: #10b981;">${avgHealthScore.toFixed(1)}/10</div>
                    <div class="stat-label">Avg Health Score</div>
                </div>
            </div>

            ${formData.include_macros ? `
            <div class="macro-section">
                <h2>🥗 Macronutrient Breakdown</h2>
                <div class="macro-bar">
                    <div class="macro-segment protein" style="width: ${proteinPercent}%;"></div>
                    <div class="macro-segment carbs" style="width: ${carbsPercent}%;"></div>
                    <div class="macro-segment fats" style="width: ${fatsPercent}%;"></div>
                </div>
                <div class="macro-legend">
                    <div class="legend-item">
                        <div class="legend-color protein"></div>
                        <span>Protein: ${Math.round(totalProtein)}g (${proteinPercent.toFixed(1)}%)</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color carbs"></div>
                        <span>Carbs: ${Math.round(totalCarbs)}g (${carbsPercent.toFixed(1)}%)</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color fats"></div>
                        <span>Fats: ${Math.round(totalFats)}g (${fatsPercent.toFixed(1)}%)</span>
                    </div>
                </div>
            </div>
            ` : ''}

            <h2>🍽️ Detailed Meal Log (${selectedMealData.length} meals)</h2>
            <div class="meal-section">
                ${selectedMealData.map(meal => `
                <div class="meal-card">
                    <div class="meal-header">
                        <div>
                            <div class="meal-title">${meal.name}</div>
                            <div class="meal-time">📅 ${format(new Date(meal.created_date), 'EEEE, MMMM d - h:mm a')} • ${meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1)}</div>
                        </div>
                        <div class="health-score">⭐ ${meal.health_score}/10</div>
                    </div>

                    ${meal.photo_url && formData.include_photos ? `
                    <img src="${meal.photo_url}" alt="${meal.name}" class="meal-image">
                    ` : ''}

                    <div class="meal-stats">
                        <div class="meal-stat">
                            <div class="meal-stat-value" style="color: #f59e0b;">${Math.round(meal.calories * (meal.quantity || 1))}</div>
                            <div class="meal-stat-label">Calories</div>
                        </div>
                        <div class="meal-stat">
                            <div class="meal-stat-value" style="color: #3b82f6;">${Math.round(meal.protein * (meal.quantity || 1))}g</div>
                            <div class="meal-stat-label">Protein</div>
                        </div>
                        <div class="meal-stat">
                            <div class="meal-stat-value" style="color: #10b981;">${Math.round(meal.carbs * (meal.quantity || 1))}g</div>
                            <div class="meal-stat-label">Carbs</div>
                        </div>
                        <div class="meal-stat">
                            <div class="meal-stat-value" style="color: #8b5cf6;">${Math.round(totalFats)}g</div>
                            <div class="meal-stat-label">Fats</div>
                        </div>
                        ${meal.fiber ? `
                        <div class="meal-stat">
                            <div class="meal-stat-value">${Math.round(meal.fiber * (meal.quantity || 1))}g</div>
                            <div class="meal-stat-label">Fiber</div>
                        </div>
                        ` : ''}
                        ${meal.sodium ? `
                        <div class="meal-stat">
                            <div class="meal-stat-value">${Math.round(meal.sodium * (meal.quantity || 1))}mg</div>
                            <div class="meal-stat-label">Sodium</div>
                        </div>
                        ` : ''}
                    </div>

                    ${meal.food_items && meal.food_items.length > 0 ? `
                    <div style="margin-top: 15px; font-size: 14px; color: #4b5563;">
                        <strong>🏷️ Detected Items:</strong> ${meal.food_items.map(item => item.name).join(', ')}
                    </div>
                    ` : ''}

                    ${meal.coach_summary && formData.include_health_score ? `
                    <div class="ai-insight">
                        ${meal.coach_summary}
                    </div>
                    ` : ''}
                </div>
                `).join('')}
            </div>

            ${formData.include_activities && selectedActivityData.length > 0 ? `
            <div class="activity-section">
                <h2>🏃‍♂️ Activity Log (${selectedActivityData.length} activities)</h2>
                ${selectedActivityData.map(activity => `
                <div class="activity-card">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong>${activity.name}</strong> (${activity.type})
                            <div style="color: #6b7280; font-size: 14px;">
                                📅 ${format(new Date(activity.created_date), 'EEEE, MMMM d - h:mm a')}
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 18px; font-weight: 600; color: #f59e0b;">🔥 ${activity.calories_burned} cal</div>
                            <div style="font-size: 14px; color: #6b7280;">⏱️ ${activity.duration_minutes} min • 💪 ${activity.intensity}</div>
                        </div>
                    </div>
                    ${activity.notes ? `<div style="margin-top: 10px; font-size: 14px; font-style: italic; color: #4b5563;">📝 ${activity.notes}</div>` : ''}
                </div>
                `).join('')}
            </div>
            ` : ''}
        </div>

        <div class="footer">
            <p>This comprehensive report was generated by <span class="brand">KaloriScan</span></p>
            <p>For consultation inquiries, please contact: ${currentUser.email}</p>
            <p style="font-size: 12px; margin-top: 15px;">All nutritional data is AI-analyzed and should be used as guidance alongside professional judgment.</p>
        </div>
    </div>
</body>
</html>`;

    return htmlContent;
  };

  const handleShare = async () => {
    if (!formData.nutritionist_email) {
      alert("Please enter nutritionist's email");
      return;
    }

    if (selectedMeals.length === 0 && selectedActivities.length === 0) {
      alert("Please select at least one meal or activity to share");
      return;
    }

    setIsSharing(true);
    try {
      // Create share record
      const shareData = {
        user_email: currentUser.email,
        nutritionist_email: formData.nutritionist_email,
        shared_date_range: {
          start_date: formData.start_date,
          end_date: formData.end_date
        },
        message_to_nutritionist: formData.message_to_nutritionist,
        session_type: formData.session_type,
        shared_meals_count: selectedMeals.length,
        shared_activities_count: selectedActivities.length,
        include_photos: formData.include_photos,
        include_macros: formData.include_macros,
        email_sent: true
      };

      await NutritionistShareEntity.create(shareData);

      // Send visual HTML email to nutritionist
      const htmlEmailContent = generateVisualEmailContent();
      await SendEmail({
        to: formData.nutritionist_email,
        subject: `📊 KaloriScan Report: ${currentUser.full_name} - ${format(new Date(formData.start_date), 'MMM d')} to ${format(new Date(formData.end_date), 'MMM d')}`,
        body: htmlEmailContent,
        from_name: "KaloriScan Professional Reports"
      });

      // Reset form and reload shares
      setFormData({
        nutritionist_email: "",
        start_date: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
        end_date: format(new Date(), 'yyyy-MM-dd'),
        message_to_nutritionist: "",
        session_type: "consultation",
        include_photos: true,
        include_macros: true,
        include_health_score: true,
        include_activities: true
      });

      loadUserData();
      alert("✅ Professional nutrition report sent successfully! Your nutritionist will receive a comprehensive visual report with all selected data, photos, and analysis.");
    } catch (error) {
      console.error("Failed to share data:", error);
      alert("❌ Failed to send report. Please check the email address and try again.");
    }
    setIsSharing(false);
  };

  const isPremium = currentUser?.subscription_status === "premium";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-sm mx-auto">
          <PremiumGate
            feature="Share with Nutritionists"
            description="Connect with certified nutritionists by sharing your meal logs, progress data, and health insights securely."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-sm mx-auto space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
            Share with Nutritionists
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Send comprehensive nutrition data via email
          </p>
        </div>

        {/* Share Form */}
        <Card className="glass-effect card-shadow rounded-3xl overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <Mail className="w-5 h-5 text-green-600" />
              Share Your Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nutritionist_email" className="dark:text-white">
                Nutritionist's Email
              </Label>
              <Input
                id="nutritionist_email"
                type="email"
                placeholder="nutritionist@example.com"
                value={formData.nutritionist_email}
                onChange={(e) => setFormData({...formData, nutritionist_email: e.target.value})}
                className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date" className="dark:text-white">From Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                  className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                />
              </div>
              <div>
                <Label htmlFor="end_date" className="dark:text-white">To Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                  className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="session_type" className="dark:text-white">Session Type</Label>
              <Select value={formData.session_type} onValueChange={(value) => setFormData({...formData, session_type: value})}>
                <SelectTrigger className="dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">Initial Consultation</SelectItem>
                  <SelectItem value="review">Progress Review</SelectItem>
                  <SelectItem value="followup">Follow-up Session</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="dark:text-white mb-3 block">What to Include</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include_photos"
                    checked={formData.include_photos}
                    onCheckedChange={(checked) => setFormData({...formData, include_photos: checked})}
                  />
                  <Label htmlFor="include_photos" className="text-sm flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Meal Photos & Visual Analysis
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include_macros"
                    checked={formData.include_macros}
                    onCheckedChange={(checked) => setFormData({...formData, include_macros: checked})}
                  />
                  <Label htmlFor="include_macros" className="text-sm flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Detailed Macro Breakdown
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include_health_score"
                    checked={formData.include_health_score}
                    onCheckedChange={(checked) => setFormData({...formData, include_health_score: checked})}
                  />
                  <Label htmlFor="include_health_score" className="text-sm flex items-center gap-2">
                    <Apple className="w-4 h-4" />
                    Health Scores & AI Analysis
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include_activities"
                    checked={formData.include_activities}
                    onCheckedChange={(checked) => setFormData({...formData, include_activities: checked})}
                  />
                  <Label htmlFor="include_activities" className="text-sm flex items-center gap-2">
                    <ActivityIcon className="w-4 h-4" />
                    Activity & Exercise Log
                  </Label>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="message" className="dark:text-white">Message to Nutritionist (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Any specific concerns, questions, or context you'd like to share..."
                value={formData.message_to_nutritionist}
                onChange={(e) => setFormData({...formData, message_to_nutritionist: e.target.value})}
                className="h-20 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              />
            </div>

            {/* Data Preview */}
            {meals.length > 0 || activities.length > 0 ? (
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Data to Share</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Meals:</span>
                    <span className="font-medium">{selectedMeals.length} of {meals.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Activities:</span>
                    <span className="font-medium">{selectedActivities.length} of {activities.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Photos included:</span>
                    <span className="font-medium">{formData.include_photos ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-xl">
                <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                  No data found for the selected date range. Please adjust your dates or log some meals first.
                </p>
              </div>
            )}

            <Button
              onClick={handleShare}
              disabled={isSharing || selectedMeals.length === 0}
              className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white"
            >
              {isSharing ? "Sending Email..." : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Comprehensive Report
                </>
              )}
            </Button>

            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">Email Privacy</p>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-200">
                A detailed email will be sent directly to the nutritionist's inbox with your selected data, photos, and analysis. Your information is encrypted and secure.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Previous Shares */}
        {shares.length > 0 && (
          <Card className="glass-effect card-shadow rounded-3xl overflow-hidden">
            <CardHeader>
              <CardTitle className="dark:text-white">Previous Shares</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {shares.map((share, index) => (
                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {share.nutritionist_email}
                    </p>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      Email Sent
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {format(new Date(share.shared_date_range.start_date), 'MMM d')} - {format(new Date(share.shared_date_range.end_date), 'MMM d')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      <span className="capitalize">{share.session_type}</span>
                    </div>
                    {share.shared_meals_count && (
                      <span>{share.shared_meals_count} meals</span>
                    )}
                    {share.shared_activities_count && (
                      <span>{share.shared_activities_count} activities</span>
                    )}
                  </div>
                  {share.nutritionist_notes && (
                    <div className="mt-2 p-2 bg-white dark:bg-gray-700 rounded-lg">
                      <p className="text-xs text-gray-700 dark:text-gray-300 italic">
                        "{share.nutritionist_notes}"
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Benefits */}
        <Card className="glass-effect card-shadow rounded-3xl overflow-hidden">
          <CardHeader>
            <CardTitle className="dark:text-white">What Your Nutritionist Will Receive</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Detailed meal log with photos and nutritional breakdown</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-sm text-gray-700 dark:text-gray-300">AI-generated health scores and food quality analysis</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Complete activity and exercise log with calories burned</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Macro and micronutrient summaries for the selected period</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
