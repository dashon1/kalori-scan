import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Users, Plus, Share2, Heart } from "lucide-react";
import { format } from "date-fns";

export default function SocialCircles() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCircle, setNewCircle] = useState({ name: "", description: "", members: "" });
  const [selectedCircle, setSelectedCircle] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: circles = [] } = useQuery({
    queryKey: ['socialCircles'],
    queryFn: async () => {
      const allCircles = await base44.entities.SocialCircle.list('-created_date');
      return allCircles.filter(c => c.members?.includes(user?.email));
    },
    enabled: !!user
  });

  const { data: meals = [] } = useQuery({
    queryKey: ['allMeals'],
    queryFn: () => base44.entities.Meal.list('-created_date', 50)
  });

  const createCircleMutation = useMutation({
    mutationFn: (data) => base44.entities.SocialCircle.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialCircles'] });
      setShowCreateForm(false);
      setNewCircle({ name: "", description: "", members: "" });
    }
  });

  const handleCreateCircle = () => {
    const memberEmails = newCircle.members.split(',').map(e => e.trim()).filter(e => e);
    memberEmails.push(user.email);
    
    createCircleMutation.mutate({
      name: newCircle.name,
      description: newCircle.description,
      members: [...new Set(memberEmails)],
      shared_meals: []
    });
  };

  const shareMealMutation = useMutation({
    mutationFn: async ({ circleId, mealId }) => {
      const circle = circles.find(c => c.id === circleId);
      const updatedSharedMeals = [...(circle.shared_meals || []), mealId];
      return base44.entities.SocialCircle.update(circleId, {
        shared_meals: updatedSharedMeals
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialCircles'] });
    }
  });

  const getSharedMeals = (circle) => {
    if (!circle.shared_meals) return [];
    return meals.filter(m => circle.shared_meals.includes(m.id));
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Social Eating Circles</h1>
            <p className="text-gray-600 dark:text-gray-400">Share meals and stay accountable together</p>
          </div>
          <Button onClick={() => setShowCreateForm(!showCreateForm)} className="bg-gradient-to-r from-purple-600 to-pink-600">
            <Plus className="w-4 h-4 mr-2" />
            New Circle
          </Button>
        </div>

        {showCreateForm && (
          <Card className="glass-effect border-0">
            <CardHeader>
              <CardTitle>Create New Circle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Circle Name (e.g., Gym Buddies)"
                value={newCircle.name}
                onChange={(e) => setNewCircle({ ...newCircle, name: e.target.value })}
              />
              <Textarea
                placeholder="Description"
                value={newCircle.description}
                onChange={(e) => setNewCircle({ ...newCircle, description: e.target.value })}
              />
              <Input
                placeholder="Member emails (comma separated)"
                value={newCircle.members}
                onChange={(e) => setNewCircle({ ...newCircle, members: e.target.value })}
              />
              <Button onClick={handleCreateCircle} disabled={!newCircle.name} className="w-full">
                Create Circle
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Circles List */}
        <div className="grid gap-4">
          {circles.map(circle => {
            const sharedMeals = getSharedMeals(circle);
            
            return (
              <Card key={circle.id} className="glass-effect border-0 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedCircle(circle.id === selectedCircle ? null : circle.id)}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    {circle.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{circle.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <span>{circle.members?.length || 0} members</span>
                    <span>{sharedMeals.length} shared meals</span>
                  </div>

                  {selectedCircle === circle.id && (
                    <div className="space-y-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="font-semibold">Shared Meals Feed</h4>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {sharedMeals.map(meal => (
                          <div key={meal.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <img src={meal.photo_url} alt={meal.name} className="w-12 h-12 rounded-lg object-cover" />
                            <div className="flex-1">
                              <h5 className="font-semibold text-sm">{meal.name}</h5>
                              <p className="text-xs text-gray-600 dark:text-gray-400">{meal.created_by}</p>
                              <p className="text-xs text-gray-500">{format(new Date(meal.created_date), 'MMM d, h:mm a')}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold">{meal.calories} cal</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-3">
                        <h5 className="text-sm font-semibold mb-2">Share a recent meal:</h5>
                        <div className="space-y-2">
                          {meals.filter(m => m.created_by === user?.email).slice(0, 3).map(meal => (
                            <Button
                              key={meal.id}
                              variant="outline"
                              size="sm"
                              className="w-full justify-start"
                              onClick={(e) => {
                                e.stopPropagation();
                                shareMealMutation.mutate({ circleId: circle.id, mealId: meal.id });
                              }}
                              disabled={circle.shared_meals?.includes(meal.id)}
                            >
                              <Share2 className="w-4 h-4 mr-2" />
                              {meal.name} - {meal.calories} cal
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {circles.length === 0 && !showCreateForm && (
          <Card className="glass-effect border-0">
            <CardContent className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No circles yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Create your first circle to start sharing meals with friends!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}