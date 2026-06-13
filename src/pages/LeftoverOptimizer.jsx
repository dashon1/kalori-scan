import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, RefrigeratorIcon, Sparkles, AlertCircle } from "lucide-react";
import { format, differenceInDays } from "date-fns";

export default function LeftoverOptimizer() {
  const [showForm, setShowForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: "",
    category: "other",
    expiry_date: ""
  });
  const [generatingRecipe, setGeneratingRecipe] = useState(false);
  const [suggestedRecipe, setSuggestedRecipe] = useState(null);
  const queryClient = useQueryClient();

  const { data: leftovers = [] } = useQuery({
    queryKey: ['leftovers'],
    queryFn: async () => {
      const items = await base44.entities.LeftoverItem.list('-created_date');
      return items.filter(i => !i.is_used);
    }
  });

  const createItemMutation = useMutation({
    mutationFn: (data) => base44.entities.LeftoverItem.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leftovers'] });
      setShowForm(false);
      setNewItem({ name: "", quantity: "", category: "other", expiry_date: "" });
    }
  });

  const markUsedMutation = useMutation({
    mutationFn: (id) => base44.entities.LeftoverItem.update(id, { is_used: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leftovers'] });
    }
  });

  const handleGenerateRecipe = async () => {
    if (leftovers.length === 0) return;

    setGeneratingRecipe(true);
    const ingredients = leftovers.map(item => `${item.quantity} ${item.name}`).join(', ');
    
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Create a healthy recipe using these ingredients: ${ingredients}. 
      Format the response as a JSON object with: recipe_name, ingredients (array), instructions (step by step), estimated_calories, prep_time`,
      response_json_schema: {
        type: "object",
        properties: {
          recipe_name: { type: "string" },
          ingredients: { type: "array", items: { type: "string" } },
          instructions: { type: "string" },
          estimated_calories: { type: "number" },
          prep_time: { type: "string" }
        }
      }
    });

    setSuggestedRecipe(response);
    setGeneratingRecipe(false);
  };

  const getExpiryStatus = (expiryDate) => {
    const days = differenceInDays(new Date(expiryDate), new Date());
    if (days < 0) return { color: "text-red-600", label: "Expired" };
    if (days === 0) return { color: "text-orange-600", label: "Today" };
    if (days <= 2) return { color: "text-yellow-600", label: `${days}d left` };
    return { color: "text-green-600", label: `${days}d left` };
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Leftover Optimizer</h1>
          <p className="text-gray-600 dark:text-gray-400">Track ingredients and get recipe suggestions</p>
        </div>

        <div className="flex gap-3">
          <Button onClick={() => setShowForm(!showForm)} className="flex-1">
            <RefrigeratorIcon className="w-4 h-4 mr-2" />
            Add Item
          </Button>
          <Button 
            onClick={handleGenerateRecipe} 
            disabled={leftovers.length === 0 || generatingRecipe}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
          >
            {generatingRecipe ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            Get Recipe
          </Button>
        </div>

        {showForm && (
          <Card className="glass-effect border-0">
            <CardHeader>
              <CardTitle>Add Leftover Item</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Item name (e.g., Chicken breast)"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              />
              <Input
                placeholder="Quantity (e.g., 2 cups, 1 lb)"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
              />
              <Select value={newItem.category} onValueChange={(val) => setNewItem({ ...newItem, category: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="protein">Protein</SelectItem>
                  <SelectItem value="vegetable">Vegetable</SelectItem>
                  <SelectItem value="fruit">Fruit</SelectItem>
                  <SelectItem value="grain">Grain</SelectItem>
                  <SelectItem value="dairy">Dairy</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={newItem.expiry_date}
                onChange={(e) => setNewItem({ ...newItem, expiry_date: e.target.value })}
              />
              <Button onClick={() => createItemMutation.mutate(newItem)} disabled={!newItem.name || !newItem.expiry_date} className="w-full">
                Add to Fridge
              </Button>
            </CardContent>
          </Card>
        )}

        {suggestedRecipe && (
          <Card className="glass-effect border-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Suggested Recipe
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{suggestedRecipe.recipe_name}</h3>
                <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>{suggestedRecipe.estimated_calories} cal</span>
                  <span>{suggestedRecipe.prep_time}</span>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Ingredients:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {suggestedRecipe.ingredients.map((ing, idx) => (
                    <li key={idx} className="text-sm text-gray-700 dark:text-gray-300">{ing}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Instructions:</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{suggestedRecipe.instructions}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="glass-effect border-0">
          <CardHeader>
            <CardTitle>Your Fridge ({leftovers.length} items)</CardTitle>
          </CardHeader>
          <CardContent>
            {leftovers.length === 0 ? (
              <div className="text-center py-8">
                <RefrigeratorIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No items yet. Start adding your leftovers!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leftovers.sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date)).map(item => {
                  const status = getExpiryStatus(item.expiry_date);
                  return (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{item.name}</h4>
                          <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">{item.category}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.quantity}</p>
                        <p className={`text-xs font-semibold ${status.color}`}>{status.label}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => markUsedMutation.mutate(item.id)}>
                        Used
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}