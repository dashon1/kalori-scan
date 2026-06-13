import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/entities/User";
import { 
  Home,
  BarChart3, 
  Settings,
  WifiOff,
  Moon,
  Sun,
  Menu,
  ArrowLeft
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import FloatingChatBot from "./components/layout/FloatingChatBot";
import FloatingChatButton from "./components/layout/FloatingChatButton";
import HomePage from "./pages/Home";
import AnalyticsPage from "./pages/Analytics";
import SettingsPage from "./pages/Settings";
import LeftSidebar from "./components/layout/LeftSidebar";
import RightSidebar from "./components/layout/RightSidebar";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
             (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? navigator.onLine : true);

  // Persistent tab state + scroll positions
  const toTab = (path) => {
    if (path === '/') return 'Home';
    if (path === createPageUrl('Home')) return 'Home';
    if (path === createPageUrl('Analytics')) return 'Analytics';
    if (path === createPageUrl('Settings')) return 'Settings';
    return null;
  };
  const [activeTab, setActiveTab] = useState(() => toTab(location.pathname) || 'Home');
  const scrollPositions = React.useRef({ Home: 0, Analytics: 0, Settings: 0 });
  const isMainTabRoute = !!toTab(location.pathname);

  React.useEffect(() => {
    const tab = toTab(location.pathname);
    if (tab && tab !== activeTab) setActiveTab(tab);
  }, [location.pathname]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleDarkMode = async () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    try {
      await User.updateMyUserData({ 
        theme_preference: newDarkMode ? 'dark' : 'light' 
      });
    } catch (error) {
      console.warn("Failed to save theme preference:", error);
    }
  };

  const isActivePage = (pageName) => {
    return activeTab === pageName;
  };

  const handleTabClick = (pageName, e) => {
    e.preventDefault();
    if (pageName === activeTab) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.dispatchEvent(new CustomEvent('tab:reselect', { detail: pageName }));
      return;
    }
    // Save current scroll
    scrollPositions.current[activeTab] = window.scrollY;
    // Switch tab but keep components mounted
    setActiveTab(pageName);
    // Update URL for deep-linking
    navigate(createPageUrl(pageName), { replace: false });
    // Restore target tab scroll
    requestAnimationFrame(() => {
      window.scrollTo({ top: scrollPositions.current[pageName] || 0, behavior: 'instant' });
    });
  };

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate(createPageUrl('Home'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-gray-900 relative transition-colors duration-300">
      <style>
        {`
          * { -webkit-touch-callout: none; }
          
          body, html { overscroll-behavior: none; overscroll-behavior-y: none; }

          /* Prevent accidental selection while tapping navigation/buttons */
          button, a, svg, .nav-glass, .nav-glass * {
            user-select: none; -webkit-user-select: none; -ms-user-select: none; -webkit-tap-highlight-color: transparent;
          }
          
          :root {
            --primary-blue: #3B82F6;
            --primary-teal: #0D9488;
            --accent-purple: #8B5CF6;
            --accent-pink: #EC4899;
            --neutral-50: #F8FAFC;
            --neutral-100: #F1F5F9;
            --neutral-900: #0F172A;
            --safe-area-inset-top: max(12px, env(safe-area-inset-top));
            --safe-area-inset-bottom: max(12px, env(safe-area-inset-bottom));
            --safe-area-inset-left: max(12px, env(safe-area-inset-left));
            --safe-area-inset-right: max(12px, env(safe-area-inset-right));
          }
          
          .glass-effect {
            background: rgba(255, 255, 255, 0.90);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
          }

          .dark .glass-effect { background: rgba(30, 41, 59, 0.85); border: 1px solid rgba(51, 65, 85, 0.3); }
          
          .brand-gradient {
            background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 25%, #EC4899 50%, #F59E0B 75%, #10B981 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-weight: 800;
            font-size: 1.5rem;
            animation: shimmer 3s ease-in-out infinite;
          }
          
          @keyframes shimmer { 0%, 100% { background-position: 0% 50%; filter: brightness(1);} 50% { background-position: 100% 50%; filter: brightness(1.2);} }
          
          .nav-glass {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(24px);
            border-top: 1px solid rgba(255, 255, 255, 0.2);
            padding-bottom: var(--safe-area-inset-bottom);
          }
          
          .dark .nav-glass { background: rgba(15, 23, 42, 0.95); border-top: 1px solid rgba(51, 65, 85, 0.3); }

          .calorie-ring {
            background: conic-gradient(from 0deg,#3B82F6 0deg,#8B5CF6 120deg,#EC4899 240deg,#3B82F6 360deg);
            border-radius: 50%; padding: 4px; }
          
          .calorie-ring-inner { background: white; border-radius: 50%; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; flex-direction: column; }
          
          .dark .calorie-ring-inner { background: #1e293b; }

                /* Safe-area padding for full-screen overlays (dialogs, drawers, sheets) */
                [data-radix-portal] .fixed.inset-0 {
                  padding-top: var(--safe-area-inset-top);
                  padding-bottom: var(--safe-area-inset-bottom);
                  padding-left: var(--safe-area-inset-left);
                  padding-right: var(--safe-area-inset-right);
                  box-sizing: border-box;
                }
        `}
      </style>

      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-400 text-black text-center p-2 z-50 text-sm font-semibold flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4" />
          <span>You are offline. Please check your connection.</span>
        </div>
      )}
      
      {/* Header with Back button on child pages */}
      <header className={`sticky z-40 glass-effect border-b border-white/20 dark:border-slate-700/30 transition-all duration-300 ${isOnline ? 'top-0' : 'top-9'}`} style={{ paddingTop: 'var(--safe-area-inset-top)' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
          <div className="flex items-center justify-between">
            {isMainTabRoute ? (
              <h1 className="brand-gradient tracking-wide select-none">CalorieExtractor</h1>
            ) : (
              <Button variant="ghost" size="icon" onClick={handleBack} className="rounded-full">
                <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </Button>
            )}
            <div className="flex items-center gap-2">
              {!isMainTabRoute && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(createPageUrl('Home'))}
                  className="rounded-full"
                  aria-label="Go to Home"
                >
                  <Home className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="rounded-full"
              >
                <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="rounded-full"
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-600" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Features Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}>
          <div className="fixed right-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Features</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
                  ✕
                </Button>
              </div>

              <div className="space-y-2">
                {[
                  { name: 'MoodTracker', label: '😊 Mood Tracker', desc: 'Track how foods make you feel' },
                  { name: 'SocialCircles', label: '👥 Social Circles', desc: 'Share meals with friends' },
                  { name: 'RestaurantPlanner', label: '🍽️ Restaurant Planner', desc: 'Plan healthy restaurant orders' },
                  { name: 'LeftoverOptimizer', label: '🍱 Leftover Optimizer', desc: 'Get recipe suggestions' },
                  { name: 'MicronutrientGaps', label: '💊 Micronutrient Gaps', desc: 'Vitamin & mineral analysis' },
                  { name: 'RecipeRemixChallenge', label: '👨‍🍳 Recipe Remix', desc: 'Healthy recipe transformations' },
                  { name: 'MealPrepBattles', label: '🏆 Meal Prep Battles', desc: 'Weekly competition' },
                  { name: 'FoodTimeMachine', label: '⏰ Food Time Machine', desc: 'Compare eating over time' },
                  { name: 'HydrationSync', label: '💧 Hydration Sync', desc: 'Smart water recommendations' },
                  { name: 'RestaurantAccuracyChecker', label: '🔍 Restaurant Accuracy', desc: 'Verify calorie claims' },
                  { name: 'BudgetOptimizer', label: '💰 Budget Optimizer', desc: 'Balance health & budget' },
                  { name: 'Recipes', label: '📖 Recipes', desc: 'Upload and parse recipes' },
                  { name: 'EnvironmentalImpact', label: '🌱 Environmental Impact', desc: 'Track carbon footprint' },
                  { name: 'Pricing', label: '💳 Pricing', desc: 'Choose your plan (Test)' }
                  ].map(feature => (
                  <Link
                    key={feature.name}
                    to={createPageUrl(feature.name)}
                    onClick={() => setIsMenuOpen(false)}
                    className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="font-semibold text-gray-900 dark:text-white mb-1">{feature.label}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{feature.desc}</div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content with preserved tabs */}
      <main className="pb-24 md:pb-20" style={{ overscrollBehavior: 'none' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 grid md:grid-cols-[220px_minmax(0,1fr)_320px] gap-6">
          {/* Left Sidebar (desktop/tablet) */}
          <aside className="hidden md:block">
            <LeftSidebar activeTab={activeTab} onTabClick={handleTabClick} />
          </aside>

          {/* Main Column */}
          <section>
            {isMainTabRoute ? (
              <div>
                <div hidden={activeTab !== 'Home'}><HomePage /></div>
                <div hidden={activeTab !== 'Analytics'}><AnalyticsPage /></div>
                <div hidden={activeTab !== 'Settings'}><SettingsPage /></div>
              </div>
            ) : (
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={location.pathname}
                  initial={{ x: 40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -40, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            )}
          </section>

          {/* Right Sidebar (desktop/tablet) */}
          <aside className="hidden md:block">
            <RightSidebar />
          </aside>
        </div>
      </main>

      {/* Floating Components */}
      <FloatingChatButton isOpen={isChatOpen} onClick={() => setIsChatOpen(!isChatOpen)} />
      <FloatingChatBot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Bottom Navigation (mobile only) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 nav-glass md:hidden" style={{ paddingLeft: 'var(--safe-area-inset-left)', paddingRight: 'var(--safe-area-inset-right)' }}>
        <div className="max-w-sm mx-auto px-4 py-2">
          <div className="flex justify-around items-center">
            <Link
              to={createPageUrl("Home")}
              onClick={(e) => handleTabClick('Home', e)}
              className={`flex flex-col items-center gap-1 py-3 px-6 rounded-2xl transition-all duration-300 ${
                isActivePage("Home")
                  ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 scale-105"
                  : "text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
              }`}
            >
              <Home className="w-6 h-6" />
              <span className="text-xs font-semibold">Home</span>
            </Link>
            
            <Link
              to={createPageUrl("Analytics")}
              onClick={(e) => handleTabClick('Analytics', e)}
              className={`flex flex-col items-center gap-1 py-3 px-6 rounded-2xl transition-all duration-300 ${
                isActivePage("Analytics")
                  ? "bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400 scale-105"
                  : "text-gray-500 dark:text-gray-400 hover:text-teal-500 dark:hover:text-teal-400"
              }`}
            >
              <BarChart3 className="w-6 h-6" />
              <span className="text-xs font-semibold">Analytics</span>
            </Link>
            
            <Link
              to={createPageUrl("Settings")}
              onClick={(e) => handleTabClick('Settings', e)}
              className={`flex flex-col items-center gap-1 py-3 px-6 rounded-2xl transition-all duration-300 ${
                isActivePage("Settings")
                  ? "bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 scale-105"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
            >
              <Settings className="w-6 h-6" />
              <span className="text-xs font-semibold">Settings</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}