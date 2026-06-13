import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, Minus, RotateCcw, Check } from "lucide-react";

export default function NutritionalOverview({ analysisResults, onSave, onRetake }) {
  const [quantity, setQuantity] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const finalData = {
      ...analysisResults,
      quantity,
      calories: analysisResults.calories * quantity,
      protein: analysisResults.protein * quantity,
      carbs: analysisResults.carbs * quantity,
      fats: analysisResults.fats * quantity,
      fiber: (analysisResults.fiber || 0) * quantity,
      sugar: (analysisResults.sugar || 0) * quantity,
      sodium: (analysisResults.sodium || 0) * quantity,
    };
    await onSave(finalData);
    setIsSaving(false);
  };

  const getHealthScoreColor = (score) => {
    if (score >= 8) return "bg-green-500";
    if (score >= 5) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  const macros = [
    { name: 'Calories', value: Math.round(analysisResults.calories * quantity), unit: '' },
    { name: 'Carbs', value: Math.round(analysisResults.carbs * quantity), unit: 'g' },
    { name: 'Protein', value: Math.round(analysisResults.protein * quantity), unit: 'g' },
    { name: 'Fats', value: Math.round(analysisResults.fats * quantity), unit: 'g' },
  ];

  return (
    <div className="h-screen bg-black text-white flex flex-col">
      <div className="flex-shrink-0 h-1/2 relative">
        <img src={analysisResults.previewUrl} alt={analysisResults.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-4">
          <h1 className="text-3xl font-bold">{analysisResults.name}</h1>
        </div>
      </div>
      
      <div className="flex-grow p-4 space-y-4 overflow-y-auto">
        {/* Quantity */}
        <div className="flex items-center justify-between bg-gray-800 p-2 rounded-xl">
          <span className="font-semibold ml-2">Servings</span>
          <div className="flex items-center gap-3">
            <Button size="icon" variant="secondary" onClick={() => setQuantity(q => Math.max(0.1, q - 0.5))} className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600">
              <Minus className="w-4 h-4"/>
            </Button>
            <span className="text-lg font-bold w-12 text-center">{quantity.toFixed(1)}</span>
            <Button size="icon" variant="secondary" onClick={() => setQuantity(q => q + 0.5)} className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600">
              <Plus className="w-4 h-4"/>
            </Button>
          </div>
        </div>

        {/* Macros */}
        <div className="grid grid-cols-2 gap-3">
          {macros.map(macro => (
            <div key={macro.name} className="bg-gray-800 p-3 rounded-xl">
              <p className="text-sm text-gray-400">{macro.name}</p>
              <p className="text-xl font-semibold">{macro.value}{macro.unit}</p>
            </div>
          ))}
        </div>

        {/* Health Score */}
        <div className="bg-gray-800 p-3 rounded-xl">
          <div className="flex justify-between items-center mb-1">
            <p className="text-sm text-gray-400">Health Score</p>
            <p className="font-semibold">{analysisResults.health_score}/10</p>
          </div>
          <Progress value={analysisResults.health_score * 10} className="h-2 [&>*]:bg-gradient-to-r from-green-400 to-teal-400" />
        </div>
        
      </div>
      
      <div className="p-4 flex gap-3 flex-shrink-0">
        <Button variant="outline" onClick={onRetake} className="flex-1 h-12 bg-gray-800 hover:bg-gray-700 text-white border-gray-700">
          <RotateCcw className="w-5 h-5 mr-2" /> Retake
        </Button>
        <Button onClick={handleSave} disabled={isSaving} className="flex-1 h-12 bg-white text-black hover:bg-gray-200">
          <Check className="w-5 h-5 mr-2" /> {isSaving ? 'Saving...' : 'Done'}
        </Button>
      </div>
    </div>
  );
}