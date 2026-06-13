import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Clock, Star, ChevronRight, Utensils } from "lucide-react";

export default function TodaysMeals({ meals, onViewAll }) {
  const getMealTypeColor = (type) => {
    const colors = {
      breakfast: "bg-yellow-100 text-yellow-800",
      lunch: "bg-blue-100 text-blue-800", 
      dinner: "bg-purple-100 text-purple-800",
      snack: "bg-green-100 text-green-800"
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  if (meals.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Utensils className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">No meals logged yet</h3>
          <p className="text-gray-600 text-sm">
            Start by scanning your first meal of the day!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Today's Meals</CardTitle>
          {meals.length > 2 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onViewAll}
              className="text-teal-600 hover:text-teal-700"
            >
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {meals.slice(0, 3).map((meal) => (
          <div key={meal.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-200">
              <img 
                src={meal.photo_url} 
                alt={meal.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-gray-900 truncate">{meal.name}</h4>
                <Badge className={getMealTypeColor(meal.meal_type)}>
                  {meal.meal_type}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {format(new Date(meal.created_date), "HH:mm")}
                </div>
                <span>{Math.round(meal.calories * (meal.quantity || 1))} cal</span>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current text-yellow-500" />
                  <span>{meal.health_score}/10</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}