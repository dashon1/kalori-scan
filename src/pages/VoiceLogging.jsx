import React, { useState, useRef, useEffect } from "react";
import { Meal } from "@/entities/Meal";
import { InvokeLLM } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, Volume2, AlertCircle, RefreshCw, Sparkles, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import NutritionalOverview from "../components/camera/NutritionalOverview";

export default function VoiceLogging() {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [mealData, setMealData] = useState(null);
  const [recognition, setRecognition] = useState(null);
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingIntervalRef = useRef(null);

  useEffect(() => {
    initializeSpeechRecognition();
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  const initializeSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      setError("Speech recognition is not supported in this browser. Please use Chrome, Safari, or Edge.");
      return;
    }

    setIsSupported(true);
    const recognition = new SpeechRecognition();
    
    // Enhanced configuration for longer recordings
    recognition.continuous = true; // Allow continuous recording
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('Speech recognition started');
      setIsListening(true);
      setError(null);
      setRecordingTime(0);
      
      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    };

    recognition.onresult = (event) => {
      console.log('Speech recognition result:', event);
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      // Update transcript with both final and interim results
      setTranscript(prevTranscript => {
        const updatedFinal = prevTranscript.replace(/\[interim\].*$/, '') + finalTranscript;
        return updatedFinal + (interimTranscript ? `[interim] ${interimTranscript}` : '');
      });
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error, event);
      
      // Don't stop on no-speech error, just continue
      if (event.error === 'no-speech') {
        console.log('No speech detected, but continuing to listen...');
        return;
      }
      
      setIsListening(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }

      switch (event.error) {
        case 'audio-capture':
          setError("Microphone access denied or not available. Please check your microphone permissions.");
          break;
        case 'not-allowed':
          setError("Microphone permission denied. Please enable microphone access and try again.");
          break;
        case 'network':
          setError("Network error. Please check your internet connection and try again.");
          break;
        case 'aborted':
          setError("Speech recognition was stopped.");
          break;
        default:
          setError(`Speech recognition error: ${event.error}. Please try again.`);
      }
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      setIsListening(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };

    setRecognition(recognition);
  };

  const startListening = async () => {
    if (!recognition || !isSupported) {
      setError("Speech recognition is not available. Please type your meal description instead.");
      return;
    }

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      console.error('Microphone access error:', err);
      setError("Microphone access denied. Please enable microphone permissions in your browser settings.");
      return;
    }

    setTranscript("");
    setMealData(null);
    setError(null);
    
    try {
      recognition.start();
    } catch (err) {
      console.error('Error starting recognition:', err);
      setError("Failed to start voice recognition. Please try again.");
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
    }
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const processMealDescription = async () => {
    const cleanTranscript = transcript.replace(/\[interim\].*$/, '').trim();
    
    if (!cleanTranscript) {
      setError("Please provide a meal description first.");
      return;
    }

    setIsProcessing(true);
    setMealData(null);
    setError(null);
    
    try {
      const prompt = `
        You are an expert nutrition coach. A user has described their meal.
        Description: "${cleanTranscript}"
        
        Your tasks:
        1.  Parse the meal description to identify all food items.
        2.  Create a short, descriptive name for the meal.
        3.  Provide a detailed nutritional analysis (calories, macros, key nutrients).
        4.  Assign a health score from 1-10.
        5.  Write a brief, encouraging "Coach's Summary" that explains the health score, highlights one positive aspect, and suggests one area for improvement. Be friendly and supportive.
        
        Return the response in the exact JSON schema provided.
      `;

      const nutritionSchema = {
        type: "object",
        properties: {
          name: { type: "string" },
          meal_type: { type: "string", enum: ["breakfast", "lunch", "dinner", "snack"] },
          calories: { type: "number" },
          protein: { type: "number" },
          carbs: { type: "number" },
          fats: { type: "number" },
          fiber: { type: "number" },
          sugar: { type: "number" },
          sodium: { type: "number" },
          health_score: { type: "number", minimum: 1, maximum: 10 },
          coach_summary: { type: "string" },
          food_items: {
            type: "array",
            items: {
              type: "object",
              properties: { name: { type: "string" }, calories: { type: "number" }, portion_size: { type: "string" } }
            }
          },
          key_nutrients: {
            type: "array",
            items: {
              type: "object",
              properties: { name: { type: "string" }, amount: { type: "string" }, percent_dv: { type: "number" } }
            }
          },
        },
        required: ["name", "calories", "protein", "carbs", "fats", "health_score", "coach_summary"]
      };

      const result = await InvokeLLM({
        prompt,
        response_json_schema: nutritionSchema
      });

      const mealToSave = {
        ...result,
        quantity: 1, // Default quantity for voice log
        photo_url: "https://images.unsplash.com/photo-1546554137-f86b9593a222?w=400&h=300&fit=crop&crop=center",
        voice_logged: true,
      };

      // Auto-save the meal
      await Meal.create(mealToSave);

      // Set meal data to display the detailed results
      setMealData(mealToSave);

    } catch (error) {
      console.error("Failed to process meal description:", error);
      setError("Failed to analyze your meal description. The AI might be having trouble. Please try rephrasing or be more specific.");
    }
    setIsProcessing(false);
  };

  const resetAll = () => {
    setError(null);
    setTranscript("");
    setMealData(null);
    setRecordingTime(0);
    setIsProcessing(false);
  };

  // If mealData is available, show the results view.
  if (mealData) {
    return (
      <div className="min-h-screen p-4 bg-gray-50">
        <div className="max-w-md mx-auto space-y-4">
          <div className="text-center py-4">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Meal Logged!</h1>
            <p className="text-gray-600">Here's the nutritional breakdown of your meal.</p>
          </div>
          
          <Card className="glass-effect border-0 shadow-lg bg-teal-50">
            <CardHeader>
              <CardTitle>Coach's Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-teal-800 italic">"{mealData.coach_summary}"</p>
            </CardContent>
          </Card>

          <NutritionalOverview 
            analysisResults={mealData} 
            quantity={1}
            isSaving={false}
            onSave={() => navigate(createPageUrl("Home"))}
            onRetake={resetAll}
            saveButtonText="Done"
            retakeButtonText="Log Another"
          />
        </div>
      </div>
    );
  }

  // Otherwise, show the voice logging interface.
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header handled by global Layout */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Voice Logging</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Speak your meal, we'll do the rest</p>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="glass-effect border-0 shadow-lg border-red-200 bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-800 dark:text-red-300 text-sm font-medium mb-2">{error}</p>
                  <Button
                    onClick={resetAll}
                    variant="outline"
                    size="sm"
                    className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300"
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Voice Interface */}
        <Card className="glass-effect border-0 shadow-lg">
          <CardHeader className="text-center">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 ${
              isListening 
                ? 'bg-gradient-to-r from-red-500 to-pink-500 animate-pulse shadow-lg' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600'
            }`}>
              <Mic className="w-12 h-12 text-white" />
            </div>
            <CardTitle className="dark:text-white">
              {isListening ? `Recording... ${formatTime(recordingTime)}` : "Voice Meal Logger"}
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isListening 
                ? "Listening... Describe what you ate in detail"
                : isSupported 
                  ? "Tap the microphone and describe your meal"
                  : "Voice recognition not supported - use text input below"
              }
            </p>
          </CardHeader>
          {isSupported && (
            <CardContent className="space-y-4">
              <div className="text-center">
                {!isListening ? (
                  <Button
                    onClick={startListening}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 text-lg"
                    disabled={!isSupported}
                  >
                    <Mic className="w-6 h-6 mr-2" />
                    Start Recording
                  </Button>
                ) : (
                  <Button
                    onClick={stopListening}
                    className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-4 text-lg"
                  >
                    <MicOff className="w-6 h-6 mr-2" />
                    Stop Recording
                  </Button>
                )}
              </div>
              
              {isListening && (
                <div className="text-center">
                  <div className="flex justify-center items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Recording: {formatTime(recordingTime)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Take your time - speak naturally and describe everything you ate
                  </p>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* Manual Text Input Fallback */}
        {(!isSupported || error) && (
          <Card className="glass-effect border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="dark:text-white">Describe Your Meal</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">Type what you ate if voice recognition isn't working</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                value={transcript.replace(/\[interim\].*$/, '')}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Describe what you ate... (e.g., 'I had grilled chicken with rice and vegetables for lunch')"
                className="w-full h-32 p-3 border border-gray-200 dark:border-gray-700 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              {!mealData && transcript && (
                <Button
                  onClick={processMealDescription}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white"
                >
                  {isProcessing ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Analyze Meal
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Transcript Display & Analyze Button */}
        {transcript && !isProcessing && (
          <Card className="glass-effect border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <Volume2 className="w-5 h-5 text-blue-600" />
                Your Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 mb-4">
                <p className="text-gray-800 dark:text-gray-200 italic">
                  "{transcript.replace(/\[interim\].*$/, '').trim()}"
                </p>
              </div>
              {!mealData && transcript.replace(/\[interim\].*$/, '').trim() && (
                <Button
                  onClick={processMealDescription}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white"
                >
                  {isProcessing ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Analyze Meal
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Processing Indicator */}
        {isProcessing && (
          <div className="text-center py-8">
            <Sparkles className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Analyzing your meal...</h3>
            <p className="text-gray-600">Your AI coach is calculating the nutrition info</p>
          </div>
        )}

        {/* Tips */}
        <Card className="glass-effect border-0 shadow-lg">
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Voice Logging Tips</h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p>Speak clearly and at a normal pace - take your time</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p>Include portion sizes when possible (e.g., "large salad", "small apple")</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p>Mention cooking methods (grilled, baked, fried) for better accuracy</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p>You control the recording - stop only when you're finished describing</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}