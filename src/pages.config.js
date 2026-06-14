/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *       "Login": Login,
}
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
import Login from './pages/Login';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *       "Login": Login,
}
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import ARPortions from './pages/ARPortions';
import About from './pages/About';
import ActivityDetails from './pages/ActivityDetails';
import Analytics from './pages/Analytics';
import BarcodeScanner from './pages/BarcodeScanner';
import BudgetOptimizer from './pages/BudgetOptimizer';
import Camera from './pages/Camera';
import Chat from './pages/Chat';
import Dashboard from './pages/Dashboard';
import EnvironmentalImpact from './pages/EnvironmentalImpact';
import FoodTimeMachine from './pages/FoodTimeMachine';
import Goals from './pages/Goals';
import GroceryAssistant from './pages/GroceryAssistant';
import HealthMetrics from './pages/HealthMetrics';
import History from './pages/History';
import Home from './pages/Home';
import HydrationSync from './pages/HydrationSync';
import LeftoverOptimizer from './pages/LeftoverOptimizer';
import LogActivity from './pages/LogActivity';
import MealDetails from './pages/MealDetails';
import MealPrepBattles from './pages/MealPrepBattles';
import MicronutrientGaps from './pages/MicronutrientGaps';
import MindfulJournal from './pages/MindfulJournal';
import MoodTracker from './pages/MoodTracker';
import Notifications from './pages/Notifications';
import NutritionistShare from './pages/NutritionistShare';
import PantryScanner from './pages/PantryScanner';
import Premium from './pages/Premium';
import Pricing from './pages/Pricing';
import Privacy from './pages/Privacy';
import Profile from './pages/Profile';
import Progress from './pages/Progress';
import RecipeRemixChallenge from './pages/RecipeRemixChallenge';
import Recipes from './pages/Recipes';
import RestaurantAccuracyChecker from './pages/RestaurantAccuracyChecker';
import RestaurantPlanner from './pages/RestaurantPlanner';
import Settings from './pages/Settings';
import SocialCircles from './pages/SocialCircles';
import VoiceLogging from './pages/VoiceLogging';
import Welcome from './pages/Welcome';
import __Layout from './Layout.jsx';
import Login from './pages/Login';


export const PAGES = {
    "ARPortions": ARPortions,
    "About": About,
    "ActivityDetails": ActivityDetails,
    "Analytics": Analytics,
    "BarcodeScanner": BarcodeScanner,
    "BudgetOptimizer": BudgetOptimizer,
    "Camera": Camera,
    "Chat": Chat,
    "Dashboard": Dashboard,
    "EnvironmentalImpact": EnvironmentalImpact,
    "FoodTimeMachine": FoodTimeMachine,
    "Goals": Goals,
    "GroceryAssistant": GroceryAssistant,
    "HealthMetrics": HealthMetrics,
    "History": History,
    "Home": Home,
    "HydrationSync": HydrationSync,
    "LeftoverOptimizer": LeftoverOptimizer,
    "LogActivity": LogActivity,
    "MealDetails": MealDetails,
    "MealPrepBattles": MealPrepBattles,
    "MicronutrientGaps": MicronutrientGaps,
    "MindfulJournal": MindfulJournal,
    "MoodTracker": MoodTracker,
    "Notifications": Notifications,
    "NutritionistShare": NutritionistShare,
    "PantryScanner": PantryScanner,
    "Premium": Premium,
    "Pricing": Pricing,
    "Privacy": Privacy,
    "Profile": Profile,
    "Progress": Progress,
    "RecipeRemixChallenge": RecipeRemixChallenge,
    "Recipes": Recipes,
    "RestaurantAccuracyChecker": RestaurantAccuracyChecker,
    "RestaurantPlanner": RestaurantPlanner,
    "Settings": Settings,
    "SocialCircles": SocialCircles,
    "VoiceLogging": VoiceLogging,
    "Welcome": Welcome,
    "Login": Login,
}

export const pagesConfig = {
    mainPage: "Welcome",
    Pages: PAGES,
    Layout: __Layout,
};