import React, { useState, useRef, useEffect } from "react";
import { Meal } from "@/entities/Meal";
import { UploadFile, InvokeLLM } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Upload, 
  Loader2, 
  AlertCircle
} from "lucide-react";
import NutritionalOverview from "../components/camera/NutritionalOverview";

export default function CameraPage() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const [isCameraOpen, setIsCameraOpen] = useState(true);
  const [stream, setStream] = useState(null);
  const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/gif'];
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    startCamera();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Camera access denied. Please enable camera permissions in your browser settings.");
      setIsCameraOpen(false);
    }
  };

  const takePicture = () => {
    const canvas = document.createElement('canvas');
    if (videoRef.current) {
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(file => {
        if (file) {
          setSelectedFile(file);
          setPreviewUrl(URL.createObjectURL(file));
          setIsCameraOpen(false);
          stream?.getTracks().forEach(track => track.stop());
          analyzeMeal(file);
        }
      }, 'image/jpeg');
    }
  };
  
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!SUPPORTED_FORMATS.includes(file.type)) {
        setError("Unsupported file format. Please use JPG, PNG, or GIF.");
        setSelectedFile(null);
        setPreviewUrl(null);
        return;
      }
      setError(null);
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setIsCameraOpen(false);
      stream?.getTracks().forEach(track => track.stop());
      analyzeMeal(file);
    }
  };
  
  const analyzeMeal = async (fileToAnalyze) => {
    const file = fileToAnalyze || selectedFile;
    if (!file) return;

    if (!isOnline) {
      setError("You are offline. Please connect to the internet to analyze your meal.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Upload the file first
      const { file_url } = await UploadFile({ file: file });
      
      // Create detailed analysis prompt
      const analysisPrompt = `Analyze this food image in detail. Identify all food items visible, estimate realistic portion sizes, and provide comprehensive nutritional information.

Your analysis should be:
1. Accurate and realistic about portion sizes
2. Comprehensive with all macro and micronutrients
3. Include a health score based on nutritional value
4. Provide a brief coach's summary with insights

Be thorough and precise in your analysis.`;
      
      const nutritionSchema = {
        type: "object",
        properties: {
          name: { 
            type: "string", 
            description: "A descriptive name for the meal (e.g., 'Grilled Chicken Salad with Quinoa')" 
          },
          calories: { type: "number", description: "Total calories" },
          protein: { type: "number", description: "Protein in grams" },
          carbs: { type: "number", description: "Carbohydrates in grams" },
          fats: { type: "number", description: "Fats in grams" },
          fiber: { type: "number", description: "Fiber in grams" },
          sugar: { type: "number", description: "Sugar in grams" },
          sodium: { type: "number", description: "Sodium in milligrams" },
          health_score: { 
            type: "number", 
            minimum: 1, 
            maximum: 10,
            description: "Health score from 1-10 based on nutritional value"
          },
          meal_type: {
            type: "string",
            enum: ["breakfast", "lunch", "dinner", "snack"],
            description: "Type of meal based on typical eating patterns"
          },
          food_items: {
            type: "array",
            description: "Individual food items detected in the image",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                calories: { type: "number" },
                portion_size: { type: "string", description: "Estimated portion size (e.g., '4 oz', '1 cup')" }
              },
              required: ["name", "calories", "portion_size"]
            }
          },
          key_nutrients: {
            type: "array",
            description: "Key vitamins and minerals present",
            items: {
              type: "object",
              properties: {
                name: { type: "string", description: "Nutrient name (e.g., 'Vitamin C', 'Iron')" },
                amount: { type: "string", description: "Amount with unit (e.g., '15mg', '2.5mcg')" },
                percent_dv: { type: "number", description: "Percentage of daily value" }
              },
              required: ["name", "amount", "percent_dv"]
            }
          },
          coach_summary: {
            type: "string",
            description: "A brief, friendly summary from the AI coach highlighting what's good about this meal and one area for improvement"
          },
          analysis_confidence: {
            type: "number",
            minimum: 0,
            maximum: 1,
            description: "Confidence level in the analysis (0-1)"
          }
        },
        required: ["name", "calories", "protein", "carbs", "fats", "health_score", "meal_type", "coach_summary"]
      };

      const result = await InvokeLLM({ 
        prompt: analysisPrompt, 
        file_urls: [file_url], 
        response_json_schema: nutritionSchema 
      });
      
      // Add the photo URL to the result
      setAnalysisResults({ ...result, photo_url: file_url });

    } catch (err) {
      console.error("Analysis failed:", err);
      setError("Failed to analyze image. Please try again with a clearer photo or ensure you have a stable internet connection.");
    }
    setIsAnalyzing(false);
  };

  const saveMeal = async (finalMealData) => {
    try {
      await Meal.create(finalMealData);
      navigate(createPageUrl("Home"));
    } catch (error) {
      console.error("Failed to save meal:", error);
      setError("Could not save your meal. Please try again.");
    }
  };

  const resetCamera = () => {
    setAnalysisResults(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    setIsCameraOpen(true);
    startCamera();
  };

  if (isCameraOpen) {
    return (
      <div className="relative h-screen bg-black">
        <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/20"></div>

        {/* Header handled by global Layout */}

        {/* Scan Frame */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-3/4 max-w-sm aspect-square border-4 border-white/50 border-dashed rounded-3xl"></div>
        </div>
        
        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-6 flex flex-col items-center">
          <Button onClick={takePicture} className="w-20 h-20 rounded-full bg-white p-0 border-4 border-black/20 shadow-lg">
            <div className="w-[60px] h-[60px] bg-white rounded-full"></div>
          </Button>
          <div className="mt-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg, image/png, image/gif"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button variant="ghost" onClick={() => fileInputRef.current?.click()} className="text-white hover:text-white/80">
              <Upload className="w-4 h-4 mr-2" />
              Upload from Library
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Analysis</h1>
        </div>

        {isAnalyzing && !analysisResults && (
            <Card className="border-0 shadow-lg">
                <CardContent className="p-8 text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto"/>
                    <h3 className="text-lg font-semibold">Analyzing your meal...</h3>
                    <p className="text-sm text-gray-600">Our AI is calculating the nutritional information. This might take a moment.</p>
                </CardContent>
            </Card>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {analysisResults && (
          <NutritionalOverview 
            analysisResults={{...analysisResults, previewUrl}} 
            onSave={saveMeal} 
            onRetake={resetCamera}
          />
        )}
      </div>
    </div>
  );
}