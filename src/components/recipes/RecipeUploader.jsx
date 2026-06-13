import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Link as LinkIcon, Loader2, FileText } from "lucide-react";
import { base44 } from "@/api/base44Client";

const recipeJsonSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    ingredients: { type: "array", items: { type: "string" } },
    instructions: { type: "array", items: { type: "string" } },
    servings: { type: "number" },
    calories_per_serving: { type: "number" },
    macros: {
      type: "object",
      properties: {
        protein: { type: "number" },
        carbs: { type: "number" },
        fats: { type: "number" },
      },
    },
  },
};

export default function RecipeUploader({ mealId = null, onCreated }) {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setFile(null);
    setUrl("");
    setError("");
  };

  const parseViaLLM = async ({ signedUrl }) => {
    const res = await base44.integrations.Core.InvokeLLM({
      prompt:
        "Extract a structured recipe with title, ingredients[], instructions[], servings, calories_per_serving, macros{protein,carbs,fats}. If missing, infer reasonable values.",
      response_json_schema: recipeJsonSchema,
      file_urls: signedUrl ? [signedUrl] : undefined,
    });
    return res;
  };

  const parseUrlViaLLM = async (inputUrl) => {
    const res = await base44.integrations.Core.InvokeLLM({
      prompt:
        `From this page, extract a structured cooking recipe with title, ingredients[], instructions[], servings, calories_per_serving, macros{protein,carbs,fats}. URL: ${inputUrl}`,
      add_context_from_internet: true,
      response_json_schema: recipeJsonSchema,
    });
    return res;
  };

  const handleUpload = async () => {
    try {
      setLoading(true);
      setError("");

      let created;

      if (file) {
        // Private upload -> signed URL -> extract -> LLM fallback
        const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
        const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri });

        // Try structured extraction first (works for pdf/images too)
        let extracted;
        try {
          const ext = await base44.integrations.Core.ExtractDataFromUploadedFile({
            file_url: signed_url,
            json_schema: recipeJsonSchema,
          });
          if (ext.status === "success") {
            extracted = ext.output;
          }
        } catch (_) { /* ignore, fallback below */ }

        if (!extracted) {
          extracted = await parseViaLLM({ signedUrl: signed_url });
        }

        const data = Array.isArray(extracted) ? extracted[0] : extracted;
        const title = data?.title || file.name.replace(/\.[^.]+$/, "");

        created = await base44.entities.Recipe.create({
          title,
          source_type: "file",
          file_uri,
          file_mime_type: file.type,
          meal_id: mealId || undefined,
          preview_text: (data?.ingredients?.slice?.(0, 5) || []).join("; "),
          ingredients: data?.ingredients || [],
          instructions: data?.instructions || [],
          servings: data?.servings || null,
          calories_per_serving: data?.calories_per_serving || null,
          macros: data?.macros || {},
          extraction_status: data ? "parsed" : "failed",
        });
      } else if (url) {
        const data = await parseUrlViaLLM(url);
        const titleGuess = (new URL(url)).hostname.replace("www.", "");
        created = await base44.entities.Recipe.create({
          title: data?.title || titleGuess,
          source_type: "url",
          source_url: url,
          meal_id: mealId || undefined,
          preview_text: (data?.ingredients?.slice?.(0, 5) || []).join("; "),
          ingredients: data?.ingredients || [],
          instructions: data?.instructions || [],
          servings: data?.servings || null,
          calories_per_serving: data?.calories_per_serving || null,
          macros: data?.macros || {},
          extraction_status: data ? "parsed" : "failed",
        });
      } else {
        setError("Please select a file or enter a URL.");
        setLoading(false);
        return;
      }

      if (onCreated) onCreated(created);
      reset();
    } catch (e) {
      console.error(e);
      setError("Failed to upload or parse. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg rounded-2xl">
      <CardContent className="p-4 space-y-3">
        <div className="grid gap-3">
          <label className="text-sm font-medium">Upload file (PDF/JPG/PNG)</label>
          <Input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">Or paste recipe URL</label>
          <Input placeholder="https://example.com/awesome-recipe" value={url} onChange={(e) => setUrl(e.target.value)} />
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <div className="flex gap-2">
          <Button onClick={handleUpload} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>) : (<><Upload className="w-4 h-4 mr-2" />Upload & Parse</>)}
          </Button>
          {url && (
            <Button type="button" variant="outline" onClick={() => setUrl("")}>Clear URL</Button>
          )}
          {file && (
            <Button type="button" variant="outline" onClick={() => setFile(null)}>Clear File</Button>
          )}
        </div>
        <p className="text-xs text-gray-500">Files are stored privately. We generate short-lived signed links only when needed to view.</p>
      </CardContent>
    </Card>
  );
}