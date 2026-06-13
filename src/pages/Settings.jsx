
import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  User as UserIcon,
  Target,
  Bell,
  Shield,
  Info,
  LogOut,
  ChevronRight,
  Moon,
  Smartphone,
  Globe,
  Users,
  Crown,
  HeartPulse,
  BrainCircuit // Added
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Settings() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: typeof window !== 'undefined' ? localStorage.getItem('theme') === 'dark' : false,
    autoSync: true,
    healthKit: false
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Failed to load user data:", error);
    }
    setIsLoading(false);
  };

  const handleLogout = async () => {
    try {
      await User.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleSetting = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);

    if (key === 'darkMode') {
      const event = new CustomEvent('themechange', {
        detail: { darkMode: newSettings.darkMode }
      });
      window.dispatchEvent(event);
    }
  };

  const isPremium = currentUser?.subscription_status === 'premium';

  const menuSections = [
    {
      title: "Account",
      items: [
        {
          icon: UserIcon,
          title: "Profile",
          description: "Personal information and goals",
          href: createPageUrl("Profile"),
          color: "text-blue-500 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300"
        },
        {
          icon: Target,
          title: "Goals & Preferences",
          description: "Nutrition targets and meal preferences",
          href: createPageUrl("Goals"),
          color: "text-mint-500 bg-mint-100 dark:bg-mint-900/50 dark:text-mint-300"
        }
      ]
    },
    {
      title: "Health Tracking",
      items: [
        {
          icon: HeartPulse,
          title: "Health Metrics",
          description: "Track blood pressure & glucose",
          href: createPageUrl("HealthMetrics"),
          color: "text-red-500 bg-red-100 dark:bg-red-900/50 dark:text-red-300",
          isPremium: true // Marked as premium
        },
        {
          icon: BrainCircuit,
          title: "Mindful Journal",
          description: "Log moods and eating patterns",
          href: createPageUrl("MindfulJournal"),
          color: "text-purple-500 bg-purple-100 dark:bg-purple-900/50 dark:text-purple-300",
          isPremium: true // Marked as premium
        }
      ]
    },
    {
      title: "Premium Features",
      items: [
        {
          icon: Users,
          title: "Share with Nutritionists",
          description: currentUser?.subscription_status === "premium"
            ? "Share your meal logs with certified professionals"
            : "🔒 Premium feature - Share data with nutritionists",
          href: createPageUrl("NutritionistShare"),
          color: "text-green-500 bg-green-100 dark:bg-green-900/50 dark:text-green-300",
          isPremium: true // Flag to indicate premium feature
        },
        {
          icon: Crown,
          title: "Upgrade to Premium",
          description: currentUser?.subscription_status === "premium"
            ? "Manage your premium subscription"
            : "Unlock AI coach, meal plans & more",
          href: createPageUrl("Premium"),
          color: "text-amber-500 bg-amber-100 dark:bg-amber-900/50 dark:text-amber-300"
        }
      ]
    },
    {
      title: "App Settings",
      items: [
        {
          icon: Bell,
          title: "Notifications",
          description: "Meal reminders and motivational messages",
          href: createPageUrl("Notifications"),
          color: "text-purple-500 bg-purple-100 dark:bg-purple-900/50 dark:text-purple-300"
        },
        {
          icon: Shield,
          title: "Privacy & Security",
          description: "Data protection and account security",
          href: createPageUrl("Privacy"),
          color: "text-red-500 bg-red-100 dark:bg-red-900/50 dark:text-red-300"
        }
      ]
    },
    {
      title: "About",
      items: [
        {
          icon: Info,
          title: "About KaloriScan",
          description: "App information and version details",
          href: createPageUrl("About"),
          color: "text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-300"
        }
      ]
    }
  ];

  const quickSettings = [
    {
      id: "notifications",
      icon: Bell,
      title: "Push Notifications",
      description: "Meal and hydration reminders",
      isPremium: false // Not premium
    },
    {
      id: "darkMode",
      icon: Moon,
      title: "Dark Mode",
      description: "Easy on the eyes for evening use",
      isPremium: true // Marked as premium
    },
    {
      id: "autoSync",
      icon: Smartphone,
      title: "Auto Sync",
      description: "Sync with health apps automatically",
      isPremium: true // Marked as premium
    },
    {
      id: "healthKit",
      icon: Globe,
      title: "Health Integration",
      description: "Connect with Apple Health or Google Fit",
      isPremium: true // Marked as premium
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-sm mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Customize your experience</p>
        </div>

        {/* User Profile Card */}
        <Card className="glass-effect card-shadow rounded-3xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 gradient-mixed rounded-2xl flex items-center justify-center">
                <UserIcon className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-neutral-900 dark:text-white">{currentUser?.full_name || "User"}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{currentUser?.email}</p>
                <div className="flex gap-4 mt-2 text-xs">
                  <span className={currentUser?.subscription_status === "premium"
                    ? "text-amber-600 dark:text-amber-400 font-semibold"
                    : "text-gray-500 dark:text-gray-400"}>
                    {currentUser?.subscription_status === "premium" ? "Premium User" : "Free Plan"}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">•</span>
                  <span className="text-gray-500 dark:text-gray-400">{currentUser?.daily_calorie_goal || 0} cal/day</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Settings */}
        <Card className="glass-effect card-shadow rounded-3xl overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg dark:text-white">Quick Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {quickSettings.map((setting) => (
              <div key={setting.id} className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  setting.id === 'notifications' ? 'text-purple-500 bg-purple-100 dark:bg-purple-900/50 dark:text-purple-300' :
                  setting.id === 'darkMode' ? 'text-indigo-500 bg-indigo-100 dark:bg-indigo-900/50 dark:text-indigo-300' :
                  setting.id === 'autoSync' ? 'text-blue-500 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300' :
                  'text-mint-500 bg-mint-100 dark:bg-mint-900/50 dark:text-mint-300'
                }`}>
                  <setting.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-neutral-900 dark:text-white text-sm flex items-center gap-2">
                      {setting.title}
                      {setting.isPremium && !isPremium && (
                        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 text-xs">
                          Premium
                        </Badge>
                      )}
                    </h4>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className={!isPremium && setting.isPremium ? 'cursor-not-allowed' : ''}>
                             <Switch
                              checked={settings[setting.id]}
                              onCheckedChange={() => toggleSetting(setting.id)}
                              disabled={setting.isPremium && !isPremium}
                            />
                          </div>
                        </TooltipTrigger>
                        {setting.isPremium && !isPremium && (
                           <TooltipContent>
                            <p>Upgrade to Premium to use this feature.</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{setting.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <Card key={sectionIndex} className="glass-effect card-shadow rounded-3xl overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg dark:text-white">{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {section.items.map((item, itemIndex) => (
                <Button
                  key={itemIndex}
                  variant="ghost"
                  onClick={() => navigate(item.href)}
                  className="w-full h-auto p-4 justify-start hover:bg-gray-50 dark:hover:bg-slate-700 rounded-2xl"
                >
                  <div className="flex items-center gap-4 w-full">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-neutral-900 dark:text-white text-sm">{item.title}</h4>
                        {item.isPremium && currentUser?.subscription_status !== "premium" && (
                          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 text-xs">
                            Premium
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{item.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>
        ))}

        {/* Logout */}
        <Card className="glass-effect card-shadow rounded-3xl overflow-hidden">
          <CardContent className="p-4">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full h-auto p-4 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 dark:text-red-400 rounded-2xl"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sign Out</span>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* App Version */}
        <div className="text-center text-xs text-gray-400 pb-4">
          KaloriScan v2.1.0 • Made with ❤️ for healthier living
        </div>
      </div>
    </div>
  );
}
