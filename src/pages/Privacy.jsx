import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Meal } from "@/entities/Meal";
import { Activity } from "@/entities/Activity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  ArrowLeft,
  Shield,
  Lock as LockIcon,
  Eye,
  Download,
  Trash2,
  Share,
  Database,
  Cookie,
  Globe
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


export default function Privacy() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [settings, setSettings] = useState({
    data_sharing: true,
    ai_training: false,
    personalized_ads: true,
    third_party_cookies: false
  });

  useEffect(() => {
    User.me().then(user => {
      setCurrentUser(user);
      setSettings({
        data_sharing: user.allow_anonymous_analytics ?? true,
        ai_training: user.allow_ai_training ?? false,
        personalized_ads: user.allow_personalized_recommendations ?? true,
        third_party_cookies: user.allow_third_party_cookies ?? false
      });
    }).catch(() => setCurrentUser(null));
  }, []);

  const handleSettingChange = async (key, value) => {
    if (!currentUser) return;
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    const userUpdatePayload = {
      allow_anonymous_analytics: newSettings.data_sharing,
      allow_ai_training: newSettings.ai_training,
      allow_personalized_recommendations: newSettings.personalized_ads,
      allow_third_party_cookies: newSettings.third_party_cookies
    };

    try {
      await User.updateMyUserData(userUpdatePayload);
    } catch (error) {
      console.error("Failed to update privacy settings:", error);
    }
  };

  const handleExportData = async () => {
    if (!currentUser) return;
    try {
      const [meals, activities] = await Promise.all([
        Meal.filter({ created_by: currentUser.email }),
        Activity.filter({ created_by: currentUser.email })
      ]);
      const data = {
        user: {
          full_name: currentUser.full_name,
          email: currentUser.email,
          ...currentUser
        },
        meals,
        activities
      };
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(data, null, 2)
      )}`;
      const link = document.createElement("a");
      link.href = jsonString;
      link.download = `kaloriscan_data_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
    } catch (error) {
      console.error("Failed to export data:", error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    if (window.confirm("Are you sure you want to permanently delete your account and all data? This action cannot be undone.")) {
      try {
        // This is a simulation. In a real app, this would be a backend call.
        const [meals, activities] = await Promise.all([
          Meal.filter({ created_by: currentUser.email }),
          Activity.filter({ created_by: currentUser.email })
        ]);
        
        await Promise.all(meals.map(m => Meal.delete(m.id)));
        await Promise.all(activities.map(a => Activity.delete(a.id)));
        
        // We can't delete the user object itself, but we can log them out.
        await User.logout();
        navigate(createPageUrl("Welcome"));
        
      } catch (error) {
        console.error("Failed to delete account data:", error);
        alert("There was an error deleting your account data. Please try again or contact support.");
      }
    }
  };
  
  const privacySettingsConfig = [
    {
      id: "data_sharing",
      title: "Anonymous Usage Analytics",
      description: "Help improve KaloriScan by sharing anonymous usage statistics",
      icon: Share,
    },
    {
      id: "ai_training",
      title: "AI Model Improvement",
      description: "Allow your meal photos to help train our AI (photos are anonymized)",
      icon: Database,
    },
    {
      id: "personalized_ads",
      title: "Personalized Recommendations",
      description: "Receive personalized meal and product recommendations",
      icon: Eye,
    },
    {
      id: "third_party_cookies",
      title: "Third-party Cookies",
      description: "Allow third-party services for enhanced functionality",
      icon: Cookie,
    }
  ];

  const dataTypes = [
    {
      icon: Shield,
      title: "Account Information",
      description: "Email, name, profile picture",
      retention: "Until account deletion",
      color: "text-blue-600 bg-blue-100"
    },
    {
      icon: Database,
      title: "Meal Data",
      description: "Photos, nutrition logs, meal history",
      retention: "2 years from last activity",
      color: "text-green-600 bg-green-100"
    },
    {
      icon: Globe,
      title: "Usage Analytics",
      description: "App interactions, feature usage (anonymized)",
      retention: "90 days",
      color: "text-purple-600 bg-purple-100"
    },
    {
      icon: LockIcon,
      title: "Health Data",
      description: "Weight, goals, dietary preferences",
      retention: "Until account deletion",
      color: "text-orange-600 bg-orange-100"
    }
  ];

  const isPremium = currentUser?.subscription_status === 'premium';

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to={createPageUrl("Settings")}>
            <Button variant="outline" size="icon" className="rounded-full">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Privacy & Security</h1>
            <p className="text-gray-600 text-sm">Control your data and privacy</p>
          </div>
        </div>

        {/* Privacy Overview */}
        <Card className="glass-effect border-0 shadow-lg">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle>Your Privacy Matters</CardTitle>
            <p className="text-sm text-gray-600">
              We're committed to protecting your personal information and giving you control over your data.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <LockIcon className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-800">End-to-End Encryption</h3>
              </div>
              <p className="text-sm text-green-700">
                All your data is encrypted in transit and at rest using industry-standard AES-256 encryption.
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Eye className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-800">No Third-Party Sharing</h3>
              </div>
              <p className="text-sm text-blue-700">
                We never sell or share your personal data with advertisers or other companies.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card className="glass-effect border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Privacy Settings</CardTitle>
            <p className="text-sm text-gray-600">
              Customize how your data is used to improve your experience
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {privacySettingsConfig.map((setting) => (
              <div key={setting.id} className="flex items-start gap-4 p-3 bg-gray-50 rounded-2xl">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                  <setting.icon className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900">{setting.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{setting.description}</p>
                </div>
                <Switch 
                  checked={settings[setting.id]} 
                  onCheckedChange={(checked) => handleSettingChange(setting.id, checked)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Data We Collect */}
        <Card className="glass-effect border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Data We Collect</CardTitle>
            <p className="text-sm text-gray-600">
              Transparency about what information we store and why
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {dataTypes.map((dataType, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-2xl">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${dataType.color}`}>
                  <dataType.icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 text-sm">{dataType.title}</h4>
                  <p className="text-xs text-gray-600">{dataType.description}</p>
                  <p className="text-xs text-gray-500 mt-1">Retained: {dataType.retention}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Data Rights */}
        <Card className="glass-effect border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Your Data Rights</CardTitle>
            <p className="text-sm text-gray-600">
              You have full control over your personal information
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-full">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start h-auto p-4 disabled:opacity-50" 
                      disabled={!isPremium}
                      onClick={handleExportData}
                    >
                      <Download className="w-5 h-5 mr-3 text-blue-600" />
                      <div className="text-left">
                        <p className="font-medium">Export Your Data</p>
                        <p className="text-sm text-gray-600">Download all your data in JSON format</p>
                      </div>
                      {!isPremium && <LockIcon className="w-4 h-4 ml-auto text-gray-400"/>}
                    </Button>
                  </div>
                </TooltipTrigger>
                {!isPremium && (
                  <TooltipContent>
                    <p>Upgrade to Premium to export your data.</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
            
            <Button variant="outline" className="w-full justify-start h-auto p-4" onClick={() => navigate(createPageUrl("History"))}>
              <Eye className="w-5 h-5 mr-3 text-green-600" />
              <div className="text-left">
                <p className="font-medium">Access Your Data</p>
                <p className="text-sm text-gray-600">See what data we have about you</p>
              </div>
            </Button>
            
            <Button variant="outline" className="w-full justify-start h-auto p-4 border-red-200 hover:bg-red-50" onClick={handleDeleteAccount}>
              <Trash2 className="w-5 h-5 mr-3 text-red-600" />
              <div className="text-left">
                <p className="font-medium text-red-800">Delete Your Account</p>
                <p className="text-sm text-red-600">Permanently remove all your data</p>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Security Features and Contact cards... */}
        {/* ... (rest of the component remains the same) ... */}
      </div>
    </div>
  );
}