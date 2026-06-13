import React, { useState, useEffect } from "react";
import { Activity } from "@/entities/Activity";
import { InvokeLLM } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Sparkles, Flame, Activity as ActivityIcon, Dumbbell, Bike, PersonStanding, Brain } from "lucide-react";
import { User } from "@/entities/User";

const commonActivities = [
  { name: 'Running', type: 'running', icon: PersonStanding },
  { name: 'Walking', type: 'walking', icon: PersonStanding },
  { name: 'Cycling', type: 'cycling', icon: Bike },
  { name: 'Weightlifting', type: 'strength', icon: Dumbbell },
  { name: 'Yoga', type: 'flexibility', icon: Brain },
  { name: 'Swimming', type: 'swimming', icon: PersonStanding },
  { name: 'Sports', type: 'sports', icon: Dumbbell },
];

export default function LogActivityPage() {
  const navigate = useNavigate();
  const [activityName, setActivityName] = useState("");
  const [activityType, setActivityType] = useState("other");
  const [duration, setDuration] = useState("");
  const [caloriesBurned, setCaloriesBurned] = useState("");
  const [intensity, setIntensity] = useState("moderate");
  const [isEstimating, setIsEstimating] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    User.me().then(setCurrentUser);
  }, []);

  const estimateCalories = async () => {
    if (!activityName || !duration || !currentUser) return;
    setIsEstimating(true);
    try {
      const prompt = `Estimate the calories burned for the following activity. User's weight is approximately ${currentUser.weight || 70} kg.
      - Activity: ${activityName}
      - Duration: ${duration} minutes
      - Intensity: ${intensity}
      
      Return only the estimated number of calories as an integer.`;
      
      const result = await InvokeLLM({ 
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            calories: { type: "number" }
          }
        }
      });
      setCaloriesBurned(result.calories.toString());
    } catch (error) {
      console.error("Failed to estimate calories", error);
      // Optionally set a default or show an error
    }
    setIsEstimating(false);
  };
  
  const handleSave = async () => {
    if (!activityName || !duration || !caloriesBurned) return;

    // Optimistic add event for Home page
    const temp = {
      id: `temp-${Date.now()}`,
      name: activityName,
      type: activityType,
      duration_minutes: parseInt(duration),
      calories_burned: parseInt(caloriesBurned),
      intensity,
      created_date: new Date().toISOString(),
    };
    window.dispatchEvent(new CustomEvent('activity:optimistic-add', { detail: temp }));

    // Navigate immediately so user sees instant update
    navigate(createPageUrl("Home"));

    // Persist on server then commit or rollback
    Activity.create({
      name: activityName,
      type: activityType,
      duration_minutes: parseInt(duration),
      calories_burned: parseInt(caloriesBurned),
      intensity,
      date: new Date().toISOString().split('T')[0]
    })
      .then((created) => {
        window.dispatchEvent(new CustomEvent('activity:optimistic-commit', { detail: { tempId: temp.id, created } }));
      })
      .catch((error) => {
        console.error("Failed to save activity", error);
        window.dispatchEvent(new CustomEvent('activity:optimistic-revert', { detail: { tempId: temp.id } }));
      });
  };

  const handleActivitySelect = (activity) => {
    setActivityName(activity.name);
    setActivityType(activity.type);
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">Log Activity</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Add</CardTitle>
            <p className="text-sm text-gray-500">Select a common activity or add your own below.</p>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-2">
            {commonActivities.map((activity) => (
              <Button
                key={activity.name}
                variant="outline"
                className="flex flex-col h-20 gap-1"
                onClick={() => handleActivitySelect(activity)}
              >
                <activity.icon className="w-6 h-6" />
                <span className="text-xs">{activity.name}</span>
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ActivityIcon/> Manual Entry</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="activityName">Activity Name</Label>
              <Input id="activityName" placeholder="e.g., Running, Weightlifting" value={activityName} onChange={e => setActivityName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input id="duration" type="number" placeholder="e.g., 30" value={duration} onChange={e => setDuration(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="intensity">Intensity</Label>
              <Select value={intensity} onValueChange={setIntensity}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="relative">
              <Label htmlFor="calories">Calories Burned</Label>
              <Input id="calories" type="number" placeholder="e.g., 350" value={caloriesBurned} onChange={e => setCaloriesBurned(e.target.value)} />
              <Button variant="ghost" size="sm" onClick={estimateCalories} disabled={isEstimating || !activityName || !duration} className="absolute right-1 bottom-1 text-teal-600">
                <Sparkles className="w-4 h-4 mr-1"/> {isEstimating ? 'Estimating...' : 'AI Estimate'}
              </Button>
            </div>

            <Button onClick={handleSave} className="w-full" disabled={!activityName || !duration || !caloriesBurned}>
              <Flame className="w-4 h-4 mr-2"/> Log Workout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}