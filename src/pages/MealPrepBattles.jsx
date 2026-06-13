import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trophy, Upload, ThumbsUp, Crown } from "lucide-react";
import { getWeek } from "date-fns";

export default function MealPrepBattles() {
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [newBattle, setNewBattle] = useState({
    title: "",
    description: "",
    photo_url: "",
    calories_per_serving: "",
    servings: ""
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const queryClient = useQueryClient();
  const currentWeek = getWeek(new Date());

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: battles = [] } = useQuery({
    queryKey: ['mealPrepBattles', currentWeek],
    queryFn: async () => {
      const allBattles = await base44.entities.MealPrepBattle.list('-votes');
      return allBattles.filter(b => b.week_number === currentWeek);
    }
  });

  const createBattleMutation = useMutation({
    mutationFn: (data) => base44.entities.MealPrepBattle.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealPrepBattles'] });
      setShowSubmitForm(false);
      setNewBattle({ title: "", description: "", photo_url: "", calories_per_serving: "", servings: "" });
    }
  });

  const voteMutation = useMutation({
    mutationFn: async ({ id, currentVotes, voters }) => {
      const newVoters = [...(voters || []), user.email];
      return base44.entities.MealPrepBattle.update(id, {
        votes: currentVotes + 1,
        voters: newVoters
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealPrepBattles'] });
    }
  });

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPhoto(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setNewBattle({ ...newBattle, photo_url: file_url });
    setUploadingPhoto(false);
  };

  const handleSubmit = () => {
    createBattleMutation.mutate({
      ...newBattle,
      calories_per_serving: parseFloat(newBattle.calories_per_serving),
      servings: parseInt(newBattle.servings),
      week_number: currentWeek,
      votes: 0,
      voters: []
    });
  };

  const hasVoted = (voters) => voters?.includes(user?.email);

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Trophy className="w-8 h-8 text-yellow-500" />
              Meal Prep Battles
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Week {currentWeek} Challenge</p>
          </div>
          <Button onClick={() => setShowSubmitForm(!showSubmitForm)} className="bg-gradient-to-r from-yellow-600 to-orange-600">
            <Upload className="w-4 h-4 mr-2" />
            Submit
          </Button>
        </div>

        {showSubmitForm && (
          <Card className="glass-effect border-0">
            <CardHeader>
              <CardTitle>Submit Your Meal Prep</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Title (e.g., 5 Healthy Lunches)"
                value={newBattle.title}
                onChange={(e) => setNewBattle({ ...newBattle, title: e.target.value })}
              />
              <Textarea
                placeholder="Description of your meal prep"
                value={newBattle.description}
                onChange={(e) => setNewBattle({ ...newBattle, description: e.target.value })}
              />
              <div className="flex gap-4">
                <Input
                  type="number"
                  placeholder="Calories/serving"
                  value={newBattle.calories_per_serving}
                  onChange={(e) => setNewBattle({ ...newBattle, calories_per_serving: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Servings"
                  value={newBattle.servings}
                  onChange={(e) => setNewBattle({ ...newBattle, servings: e.target.value })}
                />
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload">
                  <Button type="button" variant="outline" className="w-full" disabled={uploadingPhoto} onClick={() => document.getElementById('photo-upload').click()}>
                    {uploadingPhoto ? "Uploading..." : newBattle.photo_url ? "Photo Uploaded ✓" : "Upload Photo"}
                  </Button>
                </label>
              </div>
              <Button onClick={handleSubmit} disabled={!newBattle.title || !newBattle.photo_url} className="w-full">
                Submit to Battle
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard */}
        <Card className="glass-effect border-0 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-600" />
              This Week's Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            {battles.length === 0 ? (
              <p className="text-center text-gray-600 dark:text-gray-400 py-8">No submissions yet. Be the first!</p>
            ) : (
              <div className="space-y-4">
                {battles.map((battle, idx) => (
                  <div 
                    key={battle.id} 
                    className={`relative p-4 rounded-xl ${
                      idx === 0 ? 'bg-gradient-to-r from-yellow-200 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800' :
                      idx === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-200 dark:from-gray-700 dark:to-gray-600' :
                      idx === 2 ? 'bg-gradient-to-r from-orange-200 to-orange-100 dark:from-orange-900 dark:to-orange-800' :
                      'bg-white dark:bg-gray-800'
                    }`}
                  >
                    {idx < 3 && (
                      <div className="absolute top-2 left-2 w-8 h-8 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center font-bold text-lg">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                      </div>
                    )}
                    
                    <div className="flex gap-4">
                      <img src={battle.photo_url} alt={battle.title} className="w-24 h-24 rounded-lg object-cover" />
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-1">{battle.title}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{battle.description}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                          <span>{battle.calories_per_serving} cal/serving</span>
                          <span>{battle.servings} servings</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => !hasVoted(battle.voters) && voteMutation.mutate({
                            id: battle.id,
                            currentVotes: battle.votes,
                            voters: battle.voters
                          })}
                          disabled={hasVoted(battle.voters)}
                          className="flex flex-col items-center"
                        >
                          <ThumbsUp className={`w-6 h-6 ${hasVoted(battle.voters) ? 'text-blue-600 fill-blue-600' : ''}`} />
                          <span className="font-bold text-lg">{battle.votes}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}