import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Smile, Frown, Meh, Zap, Moon, Heart, TrendingUp } from "lucide-react";
import { format, subDays } from "date-fns";

export default function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [notes, setNotes] = useState("");
  const queryClient = useQueryClient();

  const { data: recentMeals = [] } = useQuery({
    queryKey: ['recentMeals'],
    queryFn: async () => {
      const meals = await base44.entities.Meal.list('-created_date', 10);
      return meals;
    }
  });

  const { data: moodEntries = [] } = useQuery({
    queryKey: ['moodEntries'],
    queryFn: async () => {
      return await base44.entities.MoodEntry.list('-created_date', 50);
    }
  });

  const createMoodMutation = useMutation({
    mutationFn: (data) => base44.entities.MoodEntry.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moodEntries'] });
      setSelectedMood(null);
      setEnergyLevel(5);
      setNotes("");
    }
  });

  const moods = [
    { value: "energetic", label: "Energetic", icon: Zap, color: "bg-yellow-100 text-yellow-600" },
    { value: "happy", label: "Happy", icon: Smile, color: "bg-green-100 text-green-600" },
    { value: "calm", label: "Calm", icon: Heart, color: "bg-blue-100 text-blue-600" },
    { value: "tired", label: "Tired", icon: Moon, color: "bg-purple-100 text-purple-600" },
    { value: "stressed", label: "Stressed", icon: Frown, color: "bg-red-100 text-red-600" },
    { value: "bloated", label: "Bloated", icon: Meh, color: "bg-orange-100 text-orange-600" }
  ];

  const handleSubmit = async (mealId) => {
    if (!selectedMood) return;
    
    await createMoodMutation.mutateAsync({
      meal_id: mealId,
      mood_after: selectedMood,
      energy_level: energyLevel,
      notes: notes
    });
  };

  // Analyze mood patterns
  const analyzeMoodPatterns = () => {
    const mealMoodMap = {};
    
    moodEntries.forEach(entry => {
      const meal = recentMeals.find(m => m.id === entry.meal_id);
      if (meal) {
        const key = meal.name;
        if (!mealMoodMap[key]) {
          mealMoodMap[key] = { moods: [], energyLevels: [] };
        }
        mealMoodMap[key].moods.push(entry.mood_after);
        mealMoodMap[key].energyLevels.push(entry.energy_level);
      }
    });

    return Object.entries(mealMoodMap).map(([mealName, data]) => ({
      mealName,
      avgEnergy: (data.energyLevels.reduce((a, b) => a + b, 0) / data.energyLevels.length).toFixed(1),
      commonMood: data.moods.sort((a,b) =>
        data.moods.filter(v => v === a).length - data.moods.filter(v => v === b).length
      ).pop()
    })).sort((a, b) => b.avgEnergy - a.avgEnergy);
  };

  const patterns = analyzeMoodPatterns();

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Mood-Based Insights</h1>
          <p className="text-gray-600 dark:text-gray-400">Track how foods make you feel and get personalized recommendations</p>
        </div>

        {/* Log Mood for Recent Meals */}
        <Card className="glass-effect border-0">
          <CardHeader>
            <CardTitle>Log Your Feeling</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentMeals.slice(0, 3).map(meal => {
              const hasEntry = moodEntries.some(e => e.meal_id === meal.id);
              if (hasEntry) return null;

              return (
                <div key={meal.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl space-y-4">
                  <div className="flex items-center gap-3">
                    <img src={meal.photo_url} alt={meal.name} className="w-16 h-16 rounded-lg object-cover" />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{meal.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{format(new Date(meal.created_date), 'MMM d, h:mm a')}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">How do you feel after eating this?</p>
                    <div className="grid grid-cols-3 gap-2">
                      {moods.map(mood => {
                        const Icon = mood.icon;
                        return (
                          <Button
                            key={mood.value}
                            variant={selectedMood === mood.value ? "default" : "outline"}
                            className={`${selectedMood === mood.value ? mood.color : ''}`}
                            onClick={() => setSelectedMood(mood.value)}
                          >
                            <Icon className="w-4 h-4 mr-2" />
                            {mood.label}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Energy Level: {energyLevel}/10</p>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={energyLevel}
                      onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <Textarea
                    placeholder="Any additional notes?"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="h-20"
                  />

                  <Button 
                    onClick={() => handleSubmit(meal.id)}
                    disabled={!selectedMood || createMoodMutation.isPending}
                    className="w-full"
                  >
                    Save Feeling
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Mood Patterns & Recommendations */}
        {patterns.length > 0 && (
          <Card className="glass-effect border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Your Food-Mood Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {patterns.slice(0, 5).map((pattern, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{pattern.mealName}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">Usually makes you feel: {pattern.commonMood}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">{pattern.avgEnergy}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Avg Energy</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}