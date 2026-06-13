
import React, { useState, useEffect, useRef } from "react";
import { ChatMessage } from "@/entities/ChatMessage";
import { User } from "@/entities/User";
import { Meal } from "@/entities/Meal";
import { InvokeLLM } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format, isToday } from "date-fns";
import { Send, Zap, Target, Apple, Utensils } from "lucide-react";
import PremiumGate from "../components/premium/PremiumGate";

export default function Chat() {
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
    loadInitialData();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadInitialData = async () => {
    try {
      setError(null);
      const user = await User.me();
      setCurrentUser(user);
      
      if (user.subscription_status !== 'premium') {
        return;
      }
      
      const userMeals = await Meal.filter({ created_by: user.email });
      const todaysMeals = userMeals.filter(meal => isToday(new Date(meal.created_date)));
      setRecentMeals(todaysMeals);
      
      const chatHistory = await ChatMessage.filter({ created_by: user.email });
      const sortedMessages = chatHistory.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
      setMessages(sortedMessages.slice(-20)); // Keep last 20 messages
      
      if (chatHistory.length === 0) {
        const welcomeMessage = {
          message: `Hi ${user.full_name?.split(' ')[0] || 'there'}! 👋 I'm your AI nutrition coach. Ask me anything!`,
          is_user: false,
          message_type: "motivation",
          timestamp: new Date().toISOString()
        };
        await ChatMessage.create(welcomeMessage);
        setMessages([welcomeMessage]);
      }
    } catch (error) {
      console.error("Failed to load chat data:", error);
      setError("Unable to connect to chat service. Please check your connection.");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleMealLogFromChat = async (mealDescription) => {
    setIsProcessingMeal(true);
    setIsLoading(true);
    let logConfirmationMessage, analysisMessage;

    try {
      const prompt = `A user has logged their meal via chat: "${mealDescription}". Parse this to extract nutritional information and return it in the specified JSON format.`;
      const nutritionSchema = {
        type: "object",
        properties: {
          name: { type: "string" }, calories: { type: "number" }, protein: { type: "number" },
          carbs: { type: "number" }, fats: { type: "number" }, health_score: { type: "number" },
          meal_type: { type: "string", enum: ["breakfast", "lunch", "dinner", "snack"] }
        },
        required: ["name", "calories", "protein", "carbs", "fats", "health_score", "meal_type"]
      };

      const result = await InvokeLLM({ prompt, response_json_schema: nutritionSchema });
      const mealToSave = {
        ...result,
        quantity: 1,
        photo_url: "https://images.unsplash.com/photo-1546554137-f86b9593a222?w=400&h=300&fit=crop&crop=center",
        voice_logged: true,
        created_by: currentUser.email,
        created_date: new Date().toISOString(),
      };
      await Meal.create(mealToSave);
      setRecentMeals(prev => [...prev, mealToSave].filter(m => isToday(new Date(m.created_date))));

      logConfirmationMessage = {
        message: "Okay, I've updated your daily log. Here's the breakdown:",
        is_user: false, message_type: "text", timestamp: new Date().toISOString(),
      };
      analysisMessage = {
        message: `**${result.name}**\n- **Calories:** ${result.calories} kcal\n- **Protein:** ${result.protein}g\n- **Carbs:** ${result.carbs}g\n- **Fats:** ${result.fats}g\n- **Health Score:** ${result.health_score}/10`,
        is_user: false, message_type: "meal_suggestion", timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, logConfirmationMessage, analysisMessage]);
      await ChatMessage.create(logConfirmationMessage);
      await ChatMessage.create(analysisMessage);
    } catch (err) {
      const errorMessage = {
        message: "I had trouble analyzing that meal. Could you try describing it again more clearly?",
        is_user: false, message_type: "text", timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    setIsProcessingMeal(false);
    setIsLoading(false);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || isProcessingMeal) return;
    const userMessage = { message: inputMessage, is_user: true, message_type: "text", timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage("");
    setIsLoading(true);

    const mealLogRegex = /^(i\s+(ate|had)|my\s+(lunch|dinner|breakfast|snack)\s+was)/i;
    if (mealLogRegex.test(currentInput)) {
      handleMealLogFromChat(currentInput);
      return;
    }

    try {
      await ChatMessage.create(userMessage);
      const contextData = {
        user_goals: currentUser,
        todays_meals: recentMeals,
        recent_conversation: messages.slice(-15)
      };
      const prompt = `You are a friendly, supportive AI nutrition coach. User message: "${currentInput}". Context: ${JSON.stringify(contextData)}. Provide a helpful, encouraging response.`;
      const aiResponse = await InvokeLLM({ prompt });
      const aiMessage = { message: aiResponse, is_user: false, message_type: "text", timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, aiMessage]);
      await ChatMessage.create(aiMessage);
    } catch (error) {
      const errorMessage = { message: "Sorry, I'm having trouble responding. Please try again.", is_user: false, message_type: "text", timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, errorMessage]);
    }
    setIsLoading(false);
  };

  const quickQuestions = [
    { text: "What should I eat next?", icon: Apple },
    { text: "How am I doing today?", icon: Target },
    { text: "Give me motivation!", icon: Zap }
  ];

  const renderMessageContent = (message) => {
    if (message.message_type === 'meal_suggestion') {
      const parts = message.message.split('\n').filter(p => p.trim());
      const title = parts.shift()?.replace(/\*/g, '');
      const stats = parts.map(part => {
        const [key, value] = part.split(':').map(s => s.replace(/-|\*/g, '').trim());
        return { key, value };
      });
      
      return (
        <div className="p-3 bg-white/20 dark:bg-black/20 rounded-xl space-y-2">
          <div className="flex items-center gap-2">
            <Utensils className="w-4 h-4 text-white" />
            <h4 className="font-bold text-white">{title}</h4>
          </div>
          {stats.map((stat, idx) => (
            <div key={idx} className="flex justify-between text-sm text-white">
              <span className="opacity-90">{stat.key}</span>
              <span className="font-semibold">{stat.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return <p className="leading-relaxed whitespace-pre-wrap">{message.message}</p>;
  };
  
  if (currentUser && currentUser.subscription_status !== 'premium') {
    return (
       <div className="h-screen p-4 bg-gradient-to-br from-blue-50 via-mint-50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-gray-900">
          <PremiumGate
            feature="AI Nutrition Coach"
            description="Upgrade to Premium to get unlimited access to your personal AI coach for meal plans, nutrition advice, and motivation."
          />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col p-4 bg-gradient-to-br from-blue-50 via-mint-50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-gray-900">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Nutrition Coach</h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm">Your personal guide to healthy eating</p>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-lg overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.is_user ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-md ${message.is_user ? 'bg-gradient-to-br from-teal-500 to-blue-600 text-white rounded-br-lg' : 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-bl-lg'}`}>
                {renderMessageContent(message)}
                <p className={`text-xs mt-1 px-1 opacity-70 ${message.is_user ? 'text-right' : 'text-left'}`}>{format(new Date(message.timestamp), 'HH:mm')}</p>
              </div>
            </div>
          ))}
          {(isLoading || isProcessingMeal) && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-700 p-3 rounded-2xl rounded-bl-lg shadow-md">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay:'0.1s'}}></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay:'0.2s'}}></div>
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-300">{isProcessingMeal ? "Logging..." : "Thinking..."}</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200/80 dark:border-slate-700/80">
          {messages.length <= 2 && (
            <div className="flex gap-2 flex-wrap mb-3">
              {quickQuestions.map((q, i) => <Button key={i} variant="outline" size="sm" onClick={() => setInputMessage(q.text)} className="text-xs">{q.text}</Button>)}
            </div>
          )}
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me anything..."
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1 rounded-full px-4 dark:bg-slate-700 dark:border-slate-600"
            />
            <Button onClick={sendMessage} disabled={!inputMessage.trim() || isLoading || isProcessingMeal} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full w-10 h-10 p-0 flex-shrink-0" size="icon">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
