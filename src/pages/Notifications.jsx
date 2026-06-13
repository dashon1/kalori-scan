import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  ArrowLeft,
  Bell,
  Target,
  Utensils,
  Award,
  MessageCircle,
  Droplet,
  Moon,
  Zap
} from "lucide-react";

export default function Notifications() {
  const [currentUser, setCurrentUser] = useState(null);
  const [notificationSettings, setNotificationSettings] = useState({
    push_notifications_enabled: true,
    meal_reminders: true,
    hydration_reminders: true,
    goal_achievements: true,
    daily_motivation: true,
    ai_insights: true,
    progress_updates: false,
    quiet_hours_enabled: true,
    quiet_hours_start: "22:00",
    quiet_hours_end: "07:00",
  });

  useEffect(() => {
    User.me().then(user => {
      setCurrentUser(user);
      if (user.notification_settings) {
        setNotificationSettings(prev => ({...prev, ...user.notification_settings}));
      }
    }).catch(console.error);
  }, []);

  const handleSettingChange = async (key, value) => {
    if (!currentUser) return;

    const newSettings = { ...notificationSettings, [key]: value };
    setNotificationSettings(newSettings);

    try {
      await User.updateMyUserData({ notification_settings: newSettings });
    } catch (error) {
      console.error("Failed to update notification settings:", error);
    }
  };

  const notificationTypes = [
    {
      id: "meal_reminders",
      icon: Utensils,
      title: "Meal Reminders",
      description: "Get reminded to log your meals and stay on track",
      color: "text-orange-600 bg-orange-100",
    },
    {
      id: "hydration_reminders",
      icon: Droplet,
      title: "Hydration Alerts",
      description: "Stay hydrated with regular water intake reminders",
      color: "text-blue-600 bg-blue-100",
    },
    {
      id: "goal_achievements",
      icon: Award,
      title: "Goal Achievements",
      description: "Celebrate when you hit your nutrition targets",
      color: "text-green-600 bg-green-100",
    },
    {
      id: "daily_motivation",
      icon: Zap,
      title: "Daily Motivation",
      description: "Inspirational messages to keep you motivated",
      color: "text-purple-600 bg-purple-100",
    },
    {
      id: "ai_insights",
      icon: MessageCircle,
      title: "AI Insights",
      description: "Personalized nutrition tips from your AI coach",
      color: "text-pink-600 bg-pink-100",
    },
    {
      id: "progress_updates",
      icon: Target,
      title: "Progress Updates",
      description: "Weekly reports on your nutrition journey",
      color: "text-teal-600 bg-teal-100",
    }
  ];

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
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 text-sm">Manage your reminders and alerts</p>
          </div>
        </div>

        {/* Notification Status */}
        <Card className="glass-effect border-0 shadow-lg">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-white" />
            </div>
            <CardTitle>Stay On Track</CardTitle>
            <p className="text-sm text-gray-600">
              Smart notifications help you maintain healthy habits without being intrusive
            </p>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-blue-800">Push Notifications</h3>
                  <p className="text-sm text-blue-600">Enable to receive reminders</p>
                </div>
                <Switch 
                  checked={notificationSettings.push_notifications_enabled}
                  onCheckedChange={(checked) => handleSettingChange('push_notifications_enabled', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Categories */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Notification Types</h2>
          {notificationTypes.map((type) => (
            <Card key={type.id} className="glass-effect border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${type.color}`}>
                    <type.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{type.title}</h3>
                      <Switch 
                        checked={notificationSettings[type.id]}
                        onCheckedChange={(checked) => handleSettingChange(type.id, checked)}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{type.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quiet Hours */}
        <Card className="glass-effect border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-indigo-600" />
              Quiet Hours
            </CardTitle>
            <p className="text-sm text-gray-600">
              Pause non-urgent notifications during these times
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-2xl">
              <div>
                <h3 className="font-semibold text-indigo-800">Bedtime Mode</h3>
                <p className="text-sm text-indigo-600">{notificationSettings.quiet_hours_start} - {notificationSettings.quiet_hours_end}</p>
              </div>
              <Switch 
                checked={notificationSettings.quiet_hours_enabled}
                onCheckedChange={(checked) => handleSettingChange('quiet_hours_enabled', checked)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Select 
                value={notificationSettings.quiet_hours_start} 
                onValueChange={(value) => handleSettingChange('quiet_hours_start', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Start time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="21:00">9:00 PM</SelectItem>
                  <SelectItem value="22:00">10:00 PM</SelectItem>
                  <SelectItem value="23:00">11:00 PM</SelectItem>
                </SelectContent>
              </Select>
              
              <Select 
                value={notificationSettings.quiet_hours_end} 
                onValueChange={(value) => handleSettingChange('quiet_hours_end', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="End time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="06:00">6:00 AM</SelectItem>
                  <SelectItem value="07:00">7:00 AM</SelectItem>
                  <SelectItem value="08:00">8:00 AM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}