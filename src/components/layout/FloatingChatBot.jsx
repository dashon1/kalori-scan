
import React, { useState, useEffect, useRef } from "react";
import { ChatMessage } from "@/entities/ChatMessage";
import { User } from "@/entities/User";
import { Meal } from "@/entities/Meal";
import { InvokeLLM } from "@/integrations/Core";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format, isToday } from "date-fns";
import { Send, Bot, Zap, Target, Apple, Minimize2, Droplets } from "lucide-react";

export default function FloatingChatBot({ isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingMeal, setIsProcessingMeal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [recentMeals, setRecentMeals] = useState([]);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadInitialData = async () => {
    try {
      setError(null);
      const user = await User.me();
      setCurrentUser(user);
      
      try {
        const userMeals = await Meal.filter({ created_by: user.email });
        const todaysMeals = userMeals.filter(meal => isToday(new Date(meal.created_date)));
        setRecentMeals(todaysMeals);
      } catch (mealError) {
        console.warn("Failed to load meals for chat context:", mealError);
        setRecentMeals([]);
      }
      
      try {
        const chatHistory = await ChatMessage.filter({ created_by: user.email });
        const sortedMessages = chatHistory.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
        setMessages(sortedMessages.slice(-20));
        
        if (chatHistory.length === 0) {
          const welcomeMessage = {
            message: `Hi ${user.full_name?.split(' ')[0] || 'there'}! 👋 I'm your AI nutrition coach. Tell me what you ate or ask me anything about nutrition!`,
            is_user: false,
            message_type: "motivation",
            timestamp: new Date().toISOString()
          };
          
          await ChatMessage.create(welcomeMessage);
          setMessages([welcomeMessage]);
        }
      } catch (chatError) {
        console.warn("Failed to load chat history:", chatError);
        const fallbackMessage = {
          message: "Hi there! I'm your AI nutrition coach. Tell me what you ate or ask me anything!",
          is_user: false,
          message_type: "motivation",
          timestamp: new Date().toISOString()
        };
        setMessages([fallbackMessage]);
      }
    } catch (error) {
      console.error("Failed to load chat data:", error);
      setError("Unable to connect to chat service. Please check your connection.");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleWaterLogging = async (userMessage, waterAmount) => {
    try {
      // Check if we need to reset water intake for new day
      const today = format(new Date(), 'yyyy-MM-dd');
      const lastResetDate = currentUser?.last_water_reset_date;
      
      let currentWaterIntake = currentUser?.daily_water_intake || 0;
      
      // Reset if it's a new day
      if (!lastResetDate || lastResetDate !== today) {
        currentWaterIntake = 0;
      }
      
      const waterGoal = currentUser?.water_goal || 8;
      const newWaterIntake = currentWaterIntake + waterAmount;
      
      // Update user's water intake with today's date
      await User.updateMyUserData({ 
        daily_water_intake: newWaterIntake,
        last_water_reset_date: today
      });
      
      // Update current user state
      setCurrentUser(prev => ({ 
        ...prev, 
        daily_water_intake: newWaterIntake,
        last_water_reset_date: today
      }));
      
      const remaining = Math.max(0, waterGoal - newWaterIntake);
      let responseMessage;
      
      if (newWaterIntake >= waterGoal) {
        responseMessage = `🎉 Fantastic! You've completed your daily water goal of ${waterGoal} glasses! You're perfectly hydrated for today. This achievement will reset tomorrow so you can stay consistent! 💧✨`;
      } else {
        responseMessage = `Great job! I've logged ${waterAmount} glass${waterAmount !== 1 ? 'es' : ''} of water for today. 💧\n\n📊 **Today's Water Progress:**\n• Consumed: ${newWaterIntake} glasses\n• Goal: ${waterGoal} glasses\n• Remaining: ${remaining} glasses\n\nYou're ${Math.round((newWaterIntake/waterGoal) * 100)}% of the way to your daily hydration goal!\n\n💡 Your progress resets daily at midnight to help you stay consistent.`;
      }
      
      const aiMessage = {
        message: responseMessage,
        is_user: false,
        message_type: "water_log",
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      await ChatMessage.create(aiMessage);
      
    } catch (error) {
      console.error("Failed to log water intake:", error);
      const errorMessage = {
        message: "Sorry, I couldn't log your water intake right now. Please try again.",
        is_user: false,
        message_type: "text",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleMealLogFromChat = async (mealDescription) => {
    setIsProcessingMeal(true);
    setIsLoading(true);

    try {
      const prompt = `
        A user has described their meal: "${mealDescription}".
        
        Analyze this meal description and provide detailed nutritional information.
        Be thorough and realistic with portion estimates.
        
        Consider all food items mentioned and provide:
        1. A descriptive meal name
        2. Accurate calorie and macro estimates
        3. Health score (1-10) based on nutritional value
        4. Meal type based on typical eating patterns
        5. Individual food items with their contributions
        
        Return the analysis in the exact JSON format requested.
      `;

      const nutritionSchema = {
        type: "object",
        properties: {
          name: { type: "string", description: "Descriptive name for the meal" },
          calories: { type: "number", description: "Total calories" },
          protein: { type: "number", description: "Protein in grams" },
          carbs: { type: "number", description: "Carbohydrates in grams" },
          fats: { type: "number", description: "Fats in grams" },
          fiber: { type: "number", description: "Fiber in grams" },
          sugar: { type: "number", description: "Sugar in grams" },
          sodium: { type: "number", description: "Sodium in milligrams" },
          health_score: { type: "number", minimum: 1, maximum: 10 },
          meal_type: { type: "string", enum: ["breakfast", "lunch", "dinner", "snack"] },
          food_items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                calories: { type: "number" },
                portion_size: { type: "string" }
              }
            }
          },
          key_nutrients: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                amount: { type: "string" },
                percent_dv: { type: "number" }
              }
            }
          },
          coach_summary: { type: "string", description: "Brief nutritional insight from the coach" }
        },
        required: ["name", "calories", "protein", "carbs", "fats", "health_score", "meal_type"]
      };

      const result = await InvokeLLM({
        prompt,
        response_json_schema: nutritionSchema
      });

      // Create meal object to save
      const mealToSave = {
        ...result,
        quantity: 1,
        photo_url: "https://images.unsplash.com/photo-1546554137-f86b9593a222?w=400&h=300&fit=crop&crop=center",
        voice_logged: false, // This is from chat, not voice logger
        chat_logged: true, // Add flag to indicate it was logged via chat
        created_by: currentUser.email,
        created_date: new Date().toISOString(),
      };

      // ACTUALLY SAVE THE MEAL TO DATABASE
      await Meal.create(mealToSave);
      
      // Update local meals state to reflect the new meal
      setRecentMeals(prev => [...prev, mealToSave]);

      // Confirmation message
      const logConfirmationMessage = {
        message: "✅ Perfect! I've successfully updated your daily log with this meal.",
        is_user: false,
        message_type: "text",
        timestamp: new Date().toISOString(),
      };

      // Detailed analysis message with visual formatting
      const analysisMessage = {
        message: `🍽️ **${result.name}**\n\n📊 **Nutritional Breakdown:**\n• **Calories:** ${result.calories} kcal\n• **Protein:** ${result.protein}g\n• **Carbs:** ${result.carbs}g\n• **Fats:** ${result.fats}g\n• **Fiber:** ${result.fiber || 0}g\n• **Health Score:** ${result.health_score}/10 ⭐\n\n${result.coach_summary ? `💡 **Coach's Insight:** ${result.coach_summary}` : ''}`,
        is_user: false,
        message_type: "meal_analysis",
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, logConfirmationMessage, analysisMessage]);
      
      // Save messages to chat history
      await ChatMessage.create(logConfirmationMessage);
      await ChatMessage.create(analysisMessage);
      
    } catch (err) {
      console.error("Meal logging from chat failed:", err);
      const errorMessage = {
        message: "I had trouble analyzing that meal. Could you try describing it again with more details?",
        is_user: false,
        message_type: "text",
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
      await ChatMessage.create(errorMessage);
    }
    
    setIsProcessingMeal(false);
    setIsLoading(false);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || isProcessingMeal) return;

    // Check if user has premium access for AI coach
    if (!currentUser || currentUser.subscription_status !== "premium") {
      const featureName = "ai_coach";
      const freeUsageLimit = 5; // Allow 5 free AI coach interactions
      
      // Count existing free usage for this feature
      const freeUsageCount = currentUser?.premium_features_accessed?.filter(f => f === featureName).length || 0;
      
      if (freeUsageCount >= freeUsageLimit) {
        const upgradeMessage = {
          message: "🌟 You've reached your free AI Coach limit! Upgrade to Premium for unlimited access to personalized nutrition guidance, meal planning, and advanced insights.\n\n✨ Premium includes:\n• Unlimited AI coaching\n• Personalized meal plans\n• Advanced analytics\n• Share data with nutritionists\n\nTap 'Upgrade' to unlock full potential!",
          is_user: false,
          message_type: "premium_gate",
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, upgradeMessage]);
        setIsLoading(false); // Ensure loading state is false if we return here
        return; // Stop further processing as limit is reached
      }
      
      // If within free usage limit, track this interaction
      const updatedFeatures = [...(currentUser.premium_features_accessed || []), featureName];
      try {
        await User.updateMyUserData({ premium_features_accessed: updatedFeatures });
        setCurrentUser(prev => ({ ...prev, premium_features_accessed: updatedFeatures }));
      } catch (updateError) {
        console.error("Failed to update premium features accessed:", updateError);
        const errorTrackingMessage = {
          message: "There was an issue tracking your free usage. Please try again.",
          is_user: false,
          message_type: "error",
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorTrackingMessage]);
        setIsLoading(false);
        return; // Prevent message from being sent if tracking failed
      }
    }

    const userMessage = {
      message: inputMessage,
      is_user: true,
      message_type: "text",
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage("");
    setIsLoading(true);
    setError(null);

    // Check for meal logging intent (expanded patterns)
    const mealLogRegex = /^(i\s+(ate|had|just\s+ate|just\s+had|consumed)|my\s+(lunch|dinner|breakfast|snack)\s+was|for\s+(lunch|dinner|breakfast)\s+i\s+(had|ate)|just\s+(ate|had|consumed)|i\s+(just\s+)?(finished|completed))/i;
    
    // Check for water logging intent
    const waterLogRegex = /^(i\s+(drank|had|took|consumed)|just\s+(drank|had))\s+(\d+)\s+(glass|glasses|cup|cups)\s+of\s+water/i;
    const waterMatch = currentInput.match(waterLogRegex);

    if (waterMatch) {
      const waterAmount = parseInt(waterMatch[4]);
      setIsLoading(false);
      await handleWaterLogging(userMessage, waterAmount);
      return;
    }

    if (mealLogRegex.test(currentInput)) {
      if (!currentUser || !currentUser.email) {
        const errorMessage = {
          message: "I can't log meals right now because I don't have your user information. Please try reloading.",
          is_user: false,
          message_type: "text",
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, errorMessage]);
        setIsLoading(false);
        await ChatMessage.create(errorMessage);
        return;
      }
      await handleMealLogFromChat(currentInput);
      return;
    }

    try {
      // Save user message
      await ChatMessage.create(userMessage);

      // Generate AI response for general questions
      const contextData = {
        user_goals: {
          goal_type: currentUser?.goal_type,
          daily_calorie_goal: currentUser?.daily_calorie_goal,
          protein_goal: currentUser?.protein_goal,
          water_goal: currentUser?.water_goal,
          daily_water_intake: currentUser?.daily_water_intake || 0
        },
        todays_meals: recentMeals.map(meal => ({
          name: meal.name,
          calories: meal.calories,
          health_score: meal.health_score,
          meal_type: meal.meal_type
        }))
      };

      const prompt = `
        You are a friendly, supportive AI nutrition coach for KaloriScan app. 
        
        User's message: "${currentInput}"
        
        Context:
        - User's goals: ${JSON.stringify(contextData.user_goals)}
        - Today's meals: ${JSON.stringify(contextData.todays_meals)}
        
        Instructions:
        1. If user mentions eating something (like "I ate salmon" or "I had pizza"), tell them you can log it if they describe what they ate in detail
        2. If user mentions drinking water with amounts (like "I drank 2 glasses of water"), help them track their hydration
        3. For other questions, provide helpful nutrition advice
        4. Be encouraging and supportive
        5. Keep responses concise but informative
        6. Use emojis sparingly for warmth
        
        Remember: You can actually log meals and water intake to their daily progress!
      `;

      const aiResponse = await InvokeLLM({ prompt });

      const aiMessage = {
        message: aiResponse,
        is_user: false,
        message_type: "text",
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
      await ChatMessage.create(aiMessage);
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage = {
        message: "Sorry, I'm having trouble responding right now. Please try again in a moment.",
        is_user: false,
        message_type: "text",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
      await ChatMessage.create(errorMessage);
    }

    setIsLoading(false);
  };

  const sendQuickMessage = async (message) => {
    setInputMessage(message);
    setTimeout(sendMessage, 100);
  };

  const quickQuestions = [
    { text: "I ate a salmon steak with rice", icon: Apple },
    { text: "I drank 2 glasses of water", icon: Droplets },
    { text: "What should I eat next?", icon: Target },
    { text: "How am I doing today?", icon: Zap }
  ];

  if (!isOpen) return null;

  const renderMessageContent = (message) => {
    if (message.message_type === 'meal_analysis' || message.message_type === 'water_log') {
      return (
        <div className="p-4 bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/30 dark:to-blue-900/30 rounded-xl border border-teal-200 dark:border-teal-700">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-teal-800 dark:text-teal-200">
            {message.message}
          </pre>
        </div>
      );
    }
    return (
      <p className="leading-relaxed whitespace-pre-wrap">
        {message.message}
      </p>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:p-4 pointer-events-none">
      <Card className="w-full max-w-md h-full sm:h-[85vh] pointer-events-auto glass-effect border-0 shadow-2xl rounded-none sm:rounded-3xl overflow-hidden flex flex-col">
        <CardHeader className="pb-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-gray-200/80 dark:border-slate-700/80 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900 dark:text-white">AI Nutrition Coach</CardTitle>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {error ? "Connection issues" : "Tell me what you ate!"}
                </p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        {/* Messages Area - Takes remaining space and scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-slate-900/50 min-h-0">
          {error && (
            <div className="p-3 bg-orange-100 border border-orange-200 dark:bg-orange-900/30 dark:border-orange-800 rounded-lg">
              <p className="text-orange-700 dark:text-orange-300 text-sm text-center">⚠️ {error}</p>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.is_user ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-md ${
                  message.is_user
                    ? 'bg-gradient-to-br from-teal-500 to-blue-600 text-white rounded-br-lg'
                    : 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-bl-lg'
                }`}
              >
                {renderMessageContent(message)}
                <p className={`text-xs mt-1 px-1 opacity-70 ${
                  message.is_user ? 'text-right' : 'text-left'
                }`}>
                  {format(new Date(message.timestamp), 'HH:mm')}
                </p>
              </div>
            </div>
          ))}
          
          {(isLoading || isProcessingMeal) && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-700 text-gray-900 p-3 rounded-2xl rounded-bl-lg shadow-md">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-300">
                    {isProcessingMeal ? "Logging your meal..." : "Thinking..."}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area - Fixed at bottom */}
        <div className="p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-t border-gray-200/80 dark:border-slate-700/80 flex-shrink-0">
          {messages.length <= 2 && !error && (
            <div className="flex gap-2 flex-wrap mb-3">
              {quickQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => sendQuickMessage(question.text)}
                  className="text-xs flex items-center gap-1 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300"
                >
                  <question.icon className="w-3 h-3" />
                  {question.text}
                </Button>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Tell me what you ate or drank..."
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1 text-sm border-gray-300 dark:border-slate-600 focus:border-purple-400 dark:focus:border-purple-500 dark:bg-slate-700 rounded-full px-4"
            />
            <Button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading || isProcessingMeal}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full w-10 h-10 p-0 flex-shrink-0"
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
