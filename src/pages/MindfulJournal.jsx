
import React, { useState, useEffect } from "react";
import { MoodJournal } from "@/entities/MoodJournal";
import { User } from "@/entities/User";
import { InvokeLLM } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Plus, Sparkles, X } from "lucide-react";
import PremiumGate from "../components/premium/PremiumGate";

export default function MindfulJournal() {
  const [entries, setEntries] = useState([]);
  const [formData, setFormData] = useState({ mood: "calm", craving: "", trigger: "", action_taken: "resisted", notes: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [analyzingId, setAnalyzingId] = useState(null);
  const [aiInsights, setAiInsights] = useState({});
  const [currentUser, setCurrentUser] = useState(null); // Add currentUser state

  useEffect(() => {
    loadJournal();
  }, []);

  const loadJournal = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);
      if (user.subscription_status === 'premium') {
        const userEntries = await MoodJournal.filter({ created_by: user.email }, '-logged_at');
        setEntries(userEntries);
      }
    } catch (error) {
      console.error("Failed to load journal:", error);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!formData.mood) return; // Basic validation
    try {
      await MoodJournal.create({ ...formData, logged_at: new Date().toISOString() });
      setFormData({ mood: "calm", craving: "", trigger: "", action_taken: "resisted", notes: "" });
      loadJournal();
    } catch (error) {
      console.error("Failed to save entry:", error);
    }
  };
  
  const getAIInsight = async (entry) => {
    setAnalyzingId(entry.id);
    setAiInsights(prev => ({ ...prev, [entry.id]: "" })); // Clear previous insight for this entry
    try {
      const prompt = `
        Act as a compassionate CBT coach. A user had the following experience:
        - Mood: ${entry.mood}
        - Trigger: "${entry.trigger || 'not specified'}"
        - Craving: "${entry.craving || 'not specified'}"
        - Action Taken: "${entry.action_taken.replace(/_/g, ' ')}"
        
        Based on this specific entry, identify the Trigger-Feeling-Action pattern. Provide a short, supportive, and actionable insight (under 50 words) to help them understand the connection and suggest a simple alternative strategy for next time. Do not sound robotic. Be empathetic and focus on the user's specific input.`;

      const result = await InvokeLLM({ prompt });
      setAiInsights(prev => ({ ...prev, [entry.id]: result }));
    } catch (error) {
      console.error("AI analysis failed:", error);
      setAiInsights(prev => ({ ...prev, [entry.id]: "Could not get an insight at this time. Please try again later." }));
    }
    setAnalyzingId(null);
  };

  const isFormValid = formData.mood && formData.craving && formData.trigger;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (currentUser && currentUser.subscription_status !== 'premium') {
    return (
      <div className="p-6">
        <PremiumGate
          feature="Mindful Eating Journal"
          description="Upgrade to Premium to use the Mindful Journal, a CBT-based tool to understand your cravings and build a healthier relationship with food."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-sm mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Mindful Journal</h1>
          <p className="text-gray-500 dark:text-gray-400">Connect your mood, triggers, and eating habits.</p>
        </div>

        <Card className="glass-effect card-shadow rounded-3xl">
          <CardHeader><CardTitle>New Mindful Entry</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Select value={formData.mood} onValueChange={value => setFormData({...formData, mood: value})}>
              <SelectTrigger><SelectValue placeholder="How are you feeling?" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="happy">Happy</SelectItem>
                <SelectItem value="sad">Sad</SelectItem>
                <SelectItem value="stressed">Stressed</SelectItem>
                <SelectItem value="anxious">Anxious</SelectItem>
                <SelectItem value="calm">Calm</SelectItem>
                <SelectItem value="energetic">Energetic</SelectItem>
                <SelectItem value="tired">Tired</SelectItem>
              </SelectContent>
            </Select>
            <Textarea placeholder="What were you craving? (e.g., chocolate)" value={formData.craving} onChange={e => setFormData({...formData, craving: e.target.value})} />
            <Textarea placeholder="What was the trigger? (e.g., a stressful meeting)" value={formData.trigger} onChange={e => setFormData({...formData, trigger: e.target.value})} />
            <Select value={formData.action_taken} onValueChange={value => setFormData({...formData, action_taken: value})}>
              <SelectTrigger><SelectValue placeholder="What did you do?" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ate_craving">Ate the craving</SelectItem>
                <SelectItem value="chose_alternative">Chose a healthy alternative</SelectItem>
                <SelectItem value="drank_water">Drank a glass of water</SelectItem>
                <SelectItem value="did_activity">Did another activity</SelectItem>
                <SelectItem value="resisted">Resisted the craving</SelectItem>
              </SelectContent>
            </Select>
            <Textarea placeholder="Any other thoughts or feelings?" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
            <Button onClick={handleSave} disabled={!isFormValid} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white"><Plus className="w-4 h-4 mr-2" />Log Entry</Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {entries.map(entry => (
            <Card key={entry.id} className="glass-effect card-shadow rounded-3xl">
              <CardContent className="p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{format(new Date(entry.logged_at), "MMM d, yyyy - h:mm a")}</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge>Mood: {entry.mood}</Badge>
                  {entry.craving && <Badge variant="secondary">Craving: {entry.craving}</Badge>}
                  {entry.trigger && <Badge variant="outline">Trigger: {entry.trigger}</Badge>} {/* Added trigger badge for visibility */}
                  <Badge variant="outline">Action: {entry.action_taken.replace('_', ' ')}</Badge>
                </div>
                {entry.notes && <p className="text-sm text-gray-800 dark:text-gray-200 italic">"{entry.notes}"</p>}
                <Button variant="link" size="sm" onClick={() => getAIInsight(entry)} disabled={analyzingId === entry.id} className="p-0 h-auto mt-2 text-purple-600 dark:text-purple-400">
                  <Sparkles className="w-4 h-4 mr-1"/>{analyzingId === entry.id ? 'Analyzing...' : 'Get AI Insight'}
                </Button>
                {aiInsights[entry.id] && (
                  <div className="text-sm mt-2 p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-purple-800 dark:text-purple-300 relative">
                    <p>{aiInsights[entry.id]}</p>
                    <button 
                      onClick={() => setAiInsights(prev => ({...prev, [entry.id]: null}))} 
                      className="absolute top-1 right-1 p-1 rounded-full hover:bg-purple-100 dark:hover:bg-purple-800/50"
                      aria-label="Clear AI Insight"
                    >
                       <X className="w-3 h-3"/>
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
