import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DollarSign, TrendingDown, Sparkles, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";

export default function BudgetOptimizer() {
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const queryClient = useQueryClient();

  const currentMonthYear = format(new Date(), 'yyyy-MM');

  const { data: budget } = useQuery({
    queryKey: ['foodBudget', currentMonthYear],
    queryFn: async () => {
      const budgets = await base44.entities.FoodBudget.list('-created_date');
      return budgets.find(b => b.month_year === currentMonthYear);
    }
  });

  const createBudgetMutation = useMutation({
    mutationFn: (data) => base44.entities.FoodBudget.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foodBudget'] });
      setMonthlyBudget("");
    }
  });

  const updateSpentMutation = useMutation({
    mutationFn: ({ id, amount }) => 
      base44.entities.FoodBudget.update(id, { current_spent: amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foodBudget'] });
    }
  });

  const handleSetBudget = () => {
    if (!monthlyBudget) return;
    createBudgetMutation.mutate({
      monthly_budget: parseFloat(monthlyBudget),
      current_spent: 0,
      month_year: currentMonthYear,
      meal_plans: []
    });
  };

  const handleGenerateMealPlan = async () => {
    if (!budget) return;

    setGeneratingPlan(true);
    const remainingBudget = budget.monthly_budget - budget.current_spent;
    const daysLeft = 30 - new Date().getDate();
    const budgetPerDay = remainingBudget / daysLeft;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Create 7 budget-friendly healthy meal plans with a daily budget of $${budgetPerDay.toFixed(2)}. 
      Each meal should be nutritious, filling, and realistic. 
      Format as JSON array with: meal_name, cost, calories, cost_per_calorie, ingredients (array), prep_notes`,
      response_json_schema: {
        type: "object",
        properties: {
          meal_plans: {
            type: "array",
            items: {
              type: "object",
              properties: {
                meal_name: { type: "string" },
                cost: { type: "number" },
                calories: { type: "number" },
                cost_per_calorie: { type: "number" },
                ingredients: { type: "array", items: { type: "string" } },
                prep_notes: { type: "string" }
              }
            }
          }
        }
      }
    });

    await base44.entities.FoodBudget.update(budget.id, {
      meal_plans: response.meal_plans
    });
    
    queryClient.invalidateQueries({ queryKey: ['foodBudget'] });
    setGeneratingPlan(false);
  };

  const percentSpent = budget ? (budget.current_spent / budget.monthly_budget) * 100 : 0;
  const remaining = budget ? budget.monthly_budget - budget.current_spent : 0;

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <DollarSign className="w-8 h-8 text-green-600" />
            Budget + Nutrition Optimizer
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Balance healthy eating with your grocery budget</p>
        </div>

        {!budget ? (
          <Card className="glass-effect border-0">
            <CardHeader>
              <CardTitle>Set Your Monthly Budget</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="number"
                placeholder="Monthly food budget ($)"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
              />
              <Button onClick={handleSetBudget} disabled={!monthlyBudget} className="w-full">
                Set Budget
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Budget Overview */}
            <Card className="glass-effect border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <CardHeader>
                <CardTitle>Budget Overview - {format(new Date(), 'MMMM yyyy')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Budget</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">${budget.monthly_budget}</p>
                  </div>
                  <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Spent</p>
                    <p className="text-3xl font-bold text-red-600">${budget.current_spent}</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Budget Used</span>
                    <span className="text-sm font-semibold">{percentSpent.toFixed(0)}%</span>
                  </div>
                  <Progress value={percentSpent} className="h-3" />
                </div>

                <div className="p-4 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Remaining</p>
                  <p className="text-4xl font-bold text-green-600">${remaining.toFixed(2)}</p>
                </div>

                <div className="pt-4">
                  <Input
                    type="number"
                    placeholder="Add expense amount"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.target.value) {
                        const newTotal = budget.current_spent + parseFloat(e.target.value);
                        updateSpentMutation.mutate({ id: budget.id, amount: newTotal });
                        e.target.value = '';
                      }
                    }}
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Press Enter to add</p>
                </div>
              </CardContent>
            </Card>

            {/* Generate Meal Plans */}
            <Card className="glass-effect border-0">
              <CardHeader>
                <CardTitle>Budget-Friendly Meal Plans</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!budget.meal_plans || budget.meal_plans.length === 0 ? (
                  <div className="text-center py-8">
                    <Button 
                      onClick={handleGenerateMealPlan}
                      disabled={generatingPlan}
                      className="bg-gradient-to-r from-green-600 to-emerald-600"
                    >
                      {generatingPlan ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>
                      ) : (
                        <><Sparkles className="w-4 h-4 mr-2" />Generate Meal Plans</>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {budget.meal_plans.map((plan, idx) => (
                      <div key={idx} className="p-4 bg-gradient-to-r from-gray-50 to-green-50 dark:from-gray-800 dark:to-green-900/20 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">{plan.meal_name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{plan.calories} calories</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600">${plan.cost.toFixed(2)}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              ${plan.cost_per_calorie?.toFixed(4)}/cal
                            </p>
                          </div>
                        </div>

                        <div className="mb-3">
                          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Ingredients:</p>
                          <div className="flex flex-wrap gap-1">
                            {plan.ingredients?.map((ing, i) => (
                              <span key={i} className="px-2 py-1 bg-white dark:bg-gray-700 rounded text-xs">
                                {ing}
                              </span>
                            ))}
                          </div>
                        </div>

                        {plan.prep_notes && (
                          <p className="text-xs text-gray-700 dark:text-gray-300 italic">{plan.prep_notes}</p>
                        )}
                      </div>
                    ))}

                    <Button 
                      onClick={handleGenerateMealPlan}
                      disabled={generatingPlan}
                      variant="outline"
                      className="w-full"
                    >
                      Generate New Plans
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="glass-effect border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5" />
                  Money-Saving Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    { emoji: '🛒', title: 'Buy in bulk', desc: 'Grains, beans, and frozen veggies are budget-friendly' },
                    { emoji: '🍳', title: 'Meal prep', desc: 'Cook once, eat multiple times - saves time and money' },
                    { emoji: '🌱', title: 'Plant-based protein', desc: 'Lentils and beans are cheaper than meat' },
                    { emoji: '🏪', title: 'Generic brands', desc: 'Often same quality as name brands at lower cost' }
                  ].map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-2xl">{tip.emoji}</span>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{tip.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{tip.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}