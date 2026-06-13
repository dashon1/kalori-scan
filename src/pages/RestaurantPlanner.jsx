import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UtensilsCrossed, Plus, Calendar, Check } from "lucide-react";
import { format } from "date-fns";

export default function RestaurantPlanner() {
  const [showForm, setShowForm] = useState(false);
  const [newPlan, setNewPlan] = useState({
    restaurant_name: "",
    dish_name: "",
    estimated_calories: "",
    notes: "",
    planned_date: format(new Date(), 'yyyy-MM-dd')
  });
  const queryClient = useQueryClient();

  const { data: plans = [] } = useQuery({
    queryKey: ['restaurantPlans'],
    queryFn: () => base44.entities.RestaurantMenuPlan.list('-created_date')
  });

  const createPlanMutation = useMutation({
    mutationFn: (data) => base44.entities.RestaurantMenuPlan.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurantPlans'] });
      setShowForm(false);
      setNewPlan({
        restaurant_name: "",
        dish_name: "",
        estimated_calories: "",
        notes: "",
        planned_date: format(new Date(), 'yyyy-MM-dd')
      });
    }
  });

  const markUsedMutation = useMutation({
    mutationFn: (id) => base44.entities.RestaurantMenuPlan.update(id, { is_used: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurantPlans'] });
    }
  });

  const handleSubmit = () => {
    createPlanMutation.mutate({
      ...newPlan,
      estimated_calories: parseFloat(newPlan.estimated_calories)
    });
  };

  const upcomingPlans = plans.filter(p => !p.is_used);
  const usedPlans = plans.filter(p => p.is_used);

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Restaurant Pre-Planner</h1>
            <p className="text-gray-600 dark:text-gray-400">Plan your healthy choices before dining out</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-gradient-to-r from-orange-600 to-red-600">
            <Plus className="w-4 h-4 mr-2" />
            New Plan
          </Button>
        </div>

        {showForm && (
          <Card className="glass-effect border-0">
            <CardHeader>
              <CardTitle>Plan Your Restaurant Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Restaurant Name"
                value={newPlan.restaurant_name}
                onChange={(e) => setNewPlan({ ...newPlan, restaurant_name: e.target.value })}
              />
              <Input
                placeholder="Dish Name"
                value={newPlan.dish_name}
                onChange={(e) => setNewPlan({ ...newPlan, dish_name: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Estimated Calories"
                value={newPlan.estimated_calories}
                onChange={(e) => setNewPlan({ ...newPlan, estimated_calories: e.target.value })}
              />
              <Textarea
                placeholder="Customizations (e.g., dressing on the side, no cheese)"
                value={newPlan.notes}
                onChange={(e) => setNewPlan({ ...newPlan, notes: e.target.value })}
              />
              <Input
                type="date"
                value={newPlan.planned_date}
                onChange={(e) => setNewPlan({ ...newPlan, planned_date: e.target.value })}
              />
              <Button onClick={handleSubmit} disabled={!newPlan.restaurant_name || !newPlan.dish_name} className="w-full">
                Save Plan
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Plans */}
        <Card className="glass-effect border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Upcoming Plans ({upcomingPlans.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingPlans.length === 0 ? (
              <p className="text-center text-gray-600 dark:text-gray-400 py-8">No upcoming plans</p>
            ) : (
              <div className="space-y-3">
                {upcomingPlans.map(plan => (
                  <div key={plan.id} className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{plan.restaurant_name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{plan.dish_name}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => markUsedMutation.mutate(plan.id)}>
                        <Check className="w-4 h-4 mr-1" />
                        Used
                      </Button>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-semibold text-orange-600">{plan.estimated_calories} cal</span>
                      <span className="text-gray-600 dark:text-gray-400">{format(new Date(plan.planned_date), 'MMM d, yyyy')}</span>
                    </div>
                    {plan.notes && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 italic">"{plan.notes}"</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Used Plans History */}
        {usedPlans.length > 0 && (
          <Card className="glass-effect border-0">
            <CardHeader>
              <CardTitle>Past Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {usedPlans.slice(0, 5).map(plan => (
                  <div key={plan.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{plan.restaurant_name} - {plan.dish_name}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{format(new Date(plan.planned_date), 'MMM d')}</p>
                    </div>
                    <span className="text-sm font-semibold text-green-600">{plan.estimated_calories} cal</span>
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