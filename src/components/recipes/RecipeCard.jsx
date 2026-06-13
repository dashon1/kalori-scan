import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, FileText, Link as LinkIcon, UtensilsCrossed } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

export default function RecipeCard({ recipe }) {
  const [opening, setOpening] = useState(false);

  const openFile = async () => {
    if (!recipe.file_uri) return;
    setOpening(true);
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: recipe.file_uri });
      window.open(signed_url, "_blank");
    } finally {
      setOpening(false);
    }
  };

  return (
    <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg rounded-2xl">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">{recipe.title}</h4>
            {recipe.preview_text && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{recipe.preview_text}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              {recipe.servings ? <Badge variant="secondary">Servings: {recipe.servings}</Badge> : null}
              {recipe.calories_per_serving ? <Badge variant="secondary">~{Math.round(recipe.calories_per_serving)} cal/serv</Badge> : null}
              {recipe.macros?.protein ? <Badge variant="secondary">P {Math.round(recipe.macros.protein)}g</Badge> : null}
              {recipe.macros?.carbs ? <Badge variant="secondary">C {Math.round(recipe.macros.carbs)}g</Badge> : null}
              {recipe.macros?.fats ? <Badge variant="secondary">F {Math.round(recipe.macros.fats)}g</Badge> : null}
              <Badge variant="outline">{recipe.source_type}</Badge>
              {recipe.meal_id && (
                <Badge variant="outline"><Link to={createPageUrl(`MealDetails?id=${recipe.meal_id}`)} className="underline">Linked meal</Link></Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {recipe.source_url && (
              <Button asChild variant="outline" size="sm">
                <a href={recipe.source_url} target="_blank" rel="noreferrer"><LinkIcon className="w-4 h-4 mr-1" />Open Link</a>
              </Button>
            )}
            {recipe.file_uri && (
              <Button onClick={openFile} variant="outline" size="sm" disabled={opening}>
                <FileText className="w-4 h-4 mr-1" />{opening ? "Opening..." : "View File"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}