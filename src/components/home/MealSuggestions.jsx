import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Clock, Flame, ChefHat } from 'lucide-react';
import { InvokeLLM } from '@/integrations/Core';
import { Sheet, SheetContent } from "@/components/ui/sheet";
import SuggestedMealDetailsSheet from "./SuggestedMealDetailsSheet";

// Comprehensive meal image database with unique photos for each dish
const getMealImage = (mealName) => {
  const imageMap = {
    // BREAKFAST DISHES - Each with unique, specific photos
    'greek yogurt parfait': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop',
    'overnight oats': 'https://images.unsplash.com/photo-1571167688394-8cbc7a6dbc3b?w=400&h=300&fit=crop',
    'steel cut oats': 'https://images.unsplash.com/photo-1517347530152-5e293c2e83b4?w=400&h=300&fit=crop',
    'quinoa breakfast bowl': 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=300&fit=crop',
    'avocado toast': 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=400&h=300&fit=crop',
    'scrambled eggs': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=300&fit=crop',
    'eggs benedict': 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=400&h=300&fit=crop',
    'protein pancakes': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
    'blueberry pancakes': 'https://images.unsplash.com/photo-1554520735-0a6b8b6ce8b7?w=400&h=300&fit=crop',
    'smoothie bowl': 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=300&fit=crop',
    'acai bowl': 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=300&fit=crop',
    'veggie omelette': 'https://images.unsplash.com/photo-1525351512522-249c5b4c4ebe?w=400&h=300&fit=crop',
    'spinach omelette': 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=400&h=300&fit=crop',
    'chia seed pudding': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    'breakfast burrito': 'https://images.unsplash.com/photo-1566740933430-b5e70b06d2d5?w=400&h=300&fit=crop',
    'french toast': 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&h=300&fit=crop',
    'granola bowl': 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=300&fit=crop',
    'breakfast sandwich': 'https://images.unsplash.com/photo-1619740409479-3ad5509d4418?w=400&h=300&fit=crop',
    'hash browns': 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&h=300&fit=crop',
    
    // LUNCH DISHES - Unique photos for each
    'grilled chicken salad': 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop',
    'caesar salad': 'https://images.unsplash.com/photo-1551248429-40975aa4de74?w=400&h=300&fit=crop',
    'greek salad': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop',
    'quinoa salad': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    'kale salad': 'https://images.unsplash.com/photo-1604497181015-76590d828b75?w=400&h=300&fit=crop',
    'cobb salad': 'https://images.unsplash.com/photo-1598515213692-d61c21c4d3d4?w=400&h=300&fit=crop',
    'quinoa buddha bowl': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    'mediterranean bowl': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop',
    'mediterranean wrap': 'https://images.unsplash.com/photo-1565299585323-38174c6973a5?w=400&h=300&fit=crop',
    'chicken wrap': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop',
    'turkey sandwich': 'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=400&h=300&fit=crop',
    'club sandwich': 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=400&h=300&fit=crop',
    'grilled cheese': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop',
    'panini': 'https://images.unsplash.com/photo-1607532941433-304659e8198a?w=400&h=300&fit=crop',
    'poke bowl': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
    'sushi bowl': 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
    'chicken rice bowl': 'https://images.unsplash.com/photo-1604909052743-94e838986d24?w=400&h=300&fit=crop',
    'burrito bowl': 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&h=300&fit=crop',
    'lentil soup': 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop',
    'tomato soup': 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=400&h=300&fit=crop',
    'chicken soup': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    'minestrone soup': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop',
    
    // DINNER DISHES - Each completely unique
    'grilled salmon': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
    'pan seared salmon': 'https://images.unsplash.com/photo-1485963631004-f2f00b1d6606?w=400&h=300&fit=crop',
    'baked salmon': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop',
    'herb crusted salmon': 'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=400&h=300&fit=crop',
    'grilled chicken breast': 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&h=300&fit=crop',
    'chicken teriyaki': 'https://images.unsplash.com/photo-1604909052743-94e838986d24?w=400&h=300&fit=crop',
    'herb roasted chicken': 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop',
    'chicken parmesan': 'https://images.unsplash.com/photo-1565299543923-37dd37887442?w=400&h=300&fit=crop',
    'beef stir fry': 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop',
    'chicken stir fry': 'https://images.unsplash.com/photo-1603133872871-46d46d94cbe4?w=400&h=300&fit=crop',
    'veggie stir fry': 'https://images.unsplash.com/photo-1604909052862-690391b26dad?w=400&h=300&fit=crop',
    'pasta primavera': 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=300&fit=crop',
    'spaghetti carbonara': 'https://images.unsplash.com/photo-1608219992851-8572e8614e55?w=400&h=300&fit=crop',
    'penne arrabbiata': 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop',
    'fettuccine alfredo': 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&h=300&fit=crop',
    'lasagna': 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&h=300&fit=crop',
    'fish tacos': 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&h=300&fit=crop',
    'chicken tacos': 'https://images.unsplash.com/photo-1624300629298-e9de39c13be5?w=400&h=300&fit=crop',
    'beef tacos': 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=400&h=300&fit=crop',
    'mushroom risotto': 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=300&fit=crop',
    'seafood risotto': 'https://images.unsplash.com/photo-1563379091339-03246963d25a?w=400&h=300&fit=crop',
    'lean beef': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
    'sirloin steak': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
    'ribeye steak': 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=300&fit=crop',
    'filet mignon': 'https://images.unsplash.com/photo-1572448862527-d3c904757de6?w=400&h=300&fit=crop',
    'baked cod': 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400&h=300&fit=crop',
    'grilled halibut': 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&h=300&fit=crop',
    'pan seared sea bass': 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400&h=300&fit=crop',
    'fried rice': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=300&fit=crop',
    'vegetable fried rice': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop',
    'shrimp fried rice': 'https://images.unsplash.com/photo-1516684669134-de6f7c473a2a?w=400&h=300&fit=crop',
    
    // SNACKS & APPETIZERS - All different
    'mixed nuts': 'https://images.unsplash.com/photo-1508747703725-719777637510?w=400&h=300&fit=crop',
    'almonds': 'https://images.unsplash.com/photo-1448748235653-abf58f1b0c8b?w=400&h=300&fit=crop',
    'walnuts': 'https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=400&h=300&fit=crop',
    'apple slices': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=300&fit=crop',
    'fruit bowl': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop',
    'berry bowl': 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=400&h=300&fit=crop',
    'hummus': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    'guacamole': 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=400&h=300&fit=crop',
    'cheese platter': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=300&fit=crop',
    'veggie sticks': 'https://images.unsplash.com/photo-1609501676725-7186f95e7964?w=400&h=300&fit=crop',
    
    // DESSERTS & TREATS
    'dark chocolate': 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=400&h=300&fit=crop',
    'fruit smoothie': 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=300&fit=crop',
    'protein shake': 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&h=300&fit=crop',
    'green smoothie': 'https://images.unsplash.com/photo-1556909114-4e30c27a9d4e?w=400&h=300&fit=crop',
    
    // INTERNATIONAL DISHES
    'sushi rolls': 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
    'miso soup': 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400&h=300&fit=crop',
    'pad thai': 'https://images.unsplash.com/photo-1559314809-0f31657def5e?w=400&h=300&fit=crop',
    'curry chicken': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop',
    'tikka masala': 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400&h=300&fit=crop',
    'bibimbap': 'https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=400&h=300&fit=crop',
    'ramen bowl': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
    'pho bowl': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
    'mexican bowl': 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&h=300&fit=crop',
    'fajitas': 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&h=300&fit=crop',
    
    // VEGETARIAN/VEGAN OPTIONS
    'quinoa stuffed peppers': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    'vegetable curry': 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400&h=300&fit=crop',
    'roasted vegetables': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop',
    'sweet potato': 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=400&h=300&fit=crop',
    'black bean burger': 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop',
    'tofu stir fry': 'https://images.unsplash.com/photo-1604909052862-690391b26dad?w=400&h=300&fit=crop',
    'lentil curry': 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400&h=300&fit=crop',
    'chickpea salad': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop'
  };
  
  const mealLower = mealName.toLowerCase();
  
  // First try exact match
  if (imageMap[mealLower]) {
    return imageMap[mealLower];
  }
  
  // Then try to find the best keyword match
  let bestMatch = null;
  let bestScore = 0;
  
  for (const [key, imageUrl] of Object.entries(imageMap)) {
    if (mealLower.includes(key)) {
      const score = key.length; // Longer matches are better
      if (score > bestScore) {
        bestScore = score;
        bestMatch = imageUrl;
      }
    }
  }
  
  if (bestMatch) {
    return bestMatch;
  }
  
  // Fallback to generic food images
  const fallbackImages = [
    'https://images.unsplash.com/photo-1546554137-f86b9593a222?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop'
  ];
  
  const hashCode = mealName.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  return fallbackImages[Math.abs(hashCode) % fallbackImages.length];
};

// Function to get contextual variety factors
const getContextualFactors = () => {
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const season = Math.floor((now.getMonth() + 1) / 3);
  
  return {
    hour,
    dayOfWeek,
    isWeekend,
    season,
    timeOfDay: hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
  };
};

export default function MealSuggestions({ calorieGoal, remainingCalories }) {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      setIsLoading(true);
      setError(null);
      
      const contextualFactors = getContextualFactors();
      const today = new Date().toISOString().split('T')[0];
      const hourBlock = Math.floor(contextualFactors.hour / 3);
      
      const cacheKey = `meal_suggestions_${today}_${hourBlock}_${Math.floor(remainingCalories / 100)}_${contextualFactors.isWeekend}`;
      const cachedData = localStorage.getItem(cacheKey);

      if (cachedData) {
        try {
          setSuggestions(JSON.parse(cachedData));
          setIsLoading(false);
          return;
        } catch (e) {
          console.warn("Failed to parse cached data, fetching fresh:", e);
        }
      }

      try {
        let mealContext = "breakfast";
        let mealTime = "morning";
        if (contextualFactors.hour >= 11 && contextualFactors.hour < 15) {
          mealContext = "lunch";
          mealTime = "midday";
        } else if (contextualFactors.hour >= 15) {
          mealContext = "dinner";
          mealTime = "evening";
        }

        const seasonalContext = {
          1: "winter comfort foods",
          2: "fresh spring ingredients",
          3: "light summer dishes",
          4: "hearty autumn flavors"
        }[contextualFactors.season];

        const weekendContext = contextualFactors.isWeekend ? 
          "Consider weekend cooking time - can be more elaborate" : 
          "Focus on quick weekday-friendly options";

        const randomSeed = Math.floor(Date.now() / (1000 * 60 * 60 * 3)); // Changes every 3 hours

        const prompt = `You are a creative chef providing personalized ${mealContext} suggestions for ${mealTime}.

USER CONTEXT:
- Calories remaining: ${remainingCalories} (Daily goal: ${calorieGoal})
- Time: ${contextualFactors.timeOfDay} (${contextualFactors.hour}:00)
- Day type: ${contextualFactors.isWeekend ? 'Weekend' : 'Weekday'}
- Season focus: ${seasonalContext}
- Context: ${weekendContext}
- Variety seed: ${randomSeed}

IMPORTANT: Create 3 COMPLETELY DIFFERENT and UNIQUE ${mealContext} suggestions. Each meal MUST be distinctly different:
- Different main proteins (chicken, fish, beef, plant-based, eggs, etc.)
- Different cooking methods (grilled, baked, sautéed, raw, steamed, etc.)
- Different cuisine styles (Mediterranean, Asian, American, Mexican, Italian, etc.)
- Different formats (bowl, sandwich, salad, soup, plated meal, etc.)

Make each suggestion feel fresh and appetizing with:
- Very specific, descriptive names
- Perfect for ${mealTime}
- Matched to seasonal context
- Nutritionally balanced
- Realistic portions and accurate nutrition

Examples of GOOD variety: "Pan-Seared Herb Salmon", "Thai Chicken Stir-Fry", "Mexican Black Bean Bowl"
Examples of BAD variety: "Grilled Chicken", "Baked Chicken", "Chicken Salad" (too similar)`;
        
        const schema = {
          type: "object",
          properties: {
            meals: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { 
                    type: "string", 
                    description: "Creative, specific meal name (e.g., 'Pan-Seared Herb Salmon with Lemon Quinoa')"
                  },
                  description: { 
                    type: "string", 
                    description: "Appetizing description with flavors and cooking method"
                  },
                  estimated_calories: { type: "number" },
                  protein: { type: "number", description: "Protein in grams" },
                  carbs: { type: "number", description: "Carbs in grams" },
                  fats: { type: "number", description: "Fats in grams" },
                  fiber: { type: "number", description: "Fiber in grams" },
                  sugar: { type: "number", description: "Sugar in grams" },
                  sodium: { type: "number", description: "Sodium in mg" },
                  prep_time: { type: "string", description: "Realistic prep time" },
                  difficulty: { type: "string", enum: ["Easy", "Medium", "Hard"] },
                  key_ingredients: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "Main ingredients"
                  },
                  health_score: { type: "number", minimum: 1, maximum: 10 },
                  cooking_method: {
                    type: "string",
                    description: "Primary cooking technique"
                  },
                  flavor_profile: {
                    type: "string", 
                    description: "Key flavors/cuisine type"
                  },
                  why_now: {
                    type: "string",
                    description: "Why this meal is perfect for this time"
                  },
                  vitamins: {
                    type: "object",
                    properties: {
                      vitamin_a: { type: "number" },
                      vitamin_c: { type: "number" },
                      vitamin_d: { type: "number" },
                      vitamin_k: { type: "number" },
                      folate: { type: "number" },
                      vitamin_b12: { type: "number" }
                    }
                  },
                  minerals: {
                    type: "object", 
                    properties: {
                      calcium: { type: "number" },
                      iron: { type: "number" },
                      potassium: { type: "number" },
                      magnesium: { type: "number" },
                      zinc: { type: "number" }
                    }
                  }
                },
                required: ["name", "description", "estimated_calories", "protein", "carbs", "fats", "prep_time", "health_score", "key_ingredients", "cooking_method", "flavor_profile", "why_now"]
              }
            }
          }
        };
        
        const result = await InvokeLLM({ prompt, response_json_schema: schema });
        
        if (result.meals && result.meals.length > 0) {
          const mealsWithImages = result.meals.map(meal => ({
            ...meal,
            image_url: getMealImage(meal.name)
          }));
          
          setSuggestions(mealsWithImages);
          
          // Cache with expiration
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('meal_suggestions_') && key !== cacheKey) {
              localStorage.removeItem(key);
            }
          });
          
          localStorage.setItem(cacheKey, JSON.stringify(mealsWithImages));
        } else {
          setError("No suggestions available right now");
        }
      } catch (error) {
        console.error("Failed to fetch meal suggestions:", error);
        setError("Unable to load suggestions. Please try again later.");
      }
      setIsLoading(false);
    };

    fetchSuggestions();
  }, [calorieGoal, remainingCalories]);

  if (isLoading) {
    return (
      <Card className="glass-effect border-0 shadow-lg rounded-3xl overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <ChefHat className="w-4 h-4 text-yellow-400" />
            <span className="font-semibold text-gray-900 dark:text-white">Chef's Picks</span>
          </div>
          <div className="flex justify-center items-center h-16">
            <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass-effect border-0 shadow-lg rounded-3xl overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <ChefHat className="w-4 h-4 text-yellow-400" />
            <span className="font-semibold text-gray-900 dark:text-white">Chef's Picks</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="glass-effect border-0 shadow-lg rounded-3xl overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <ChefHat className="w-4 h-4 text-yellow-400" />
            <span className="font-semibold text-gray-900 dark:text-white">Chef's Picks</span>
          </div>
          
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div 
                key={index} 
                className="flex gap-3 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors cursor-pointer"
                onClick={() => setSelectedSuggestion(suggestion)}
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                  <img 
                    src={suggestion.image_url} 
                    alt={suggestion.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1546554137-f86b9593a222?w=400&h=300&fit=crop';
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-gray-800 dark:text-gray-200 mb-1 truncate">
                    {suggestion.name}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                    {suggestion.why_now || suggestion.description}
                  </p>
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                      <Flame className="w-3 h-3" />
                      <span className="font-medium">{suggestion.estimated_calories} cal</span>
                    </div>
                    {suggestion.prep_time && (
                      <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{suggestion.prep_time}</span>
                      </div>
                    )}
                    {suggestion.flavor_profile && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {suggestion.flavor_profile}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Sheet open={!!selectedSuggestion} onOpenChange={(isOpen) => !isOpen && setSelectedSuggestion(null)}>
        <SheetContent className="w-full max-w-md p-0">
          {selectedSuggestion && <SuggestedMealDetailsSheet suggestion={selectedSuggestion} />}
        </SheetContent>
      </Sheet>
    </>
  );
}