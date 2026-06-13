import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import RecipeUploader from "../components/recipes/RecipeUploader";
import RecipeCard from "../components/recipes/RecipeCard";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";

export default function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const list = await base44.entities.Recipe.list('-updated_date', 100);
      setRecipes(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreated = (r) => {
    setRecipes((prev) => [r, ...prev]);
  };

  return (
    <div className="min-h-screen p-4 max-w-3xl mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Recipes</h1>
        <p className="text-sm text-gray-600">Upload files (PDF, JPG, PNG) or paste a link. We store privately and parse key details.</p>
      </div>

      <RecipeUploader onCreated={handleCreated} />

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-3">Your Library</h2>
        {loading ? (
          <div className="flex items-center gap-2 text-gray-600"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
        ) : recipes.length === 0 ? (
          <p className="text-gray-600">No recipes yet.</p>
        ) : (
          <div className="grid gap-3">
            {recipes.map((r) => (
              <RecipeCard key={r.id} recipe={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}