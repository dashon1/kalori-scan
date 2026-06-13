import React, { useState, useEffect, useRef } from "react";
import { User } from "@/entities/User";
import { UploadFile } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  User as UserIcon, 
  Settings, 
  Target, 
  Bell, 
  Shield, 
  Info,
  LogOut,
  Edit3,
  Save,
  ChevronRight,
  Camera
} from "lucide-react";

export default function Profile() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
      setEditData(user);
    } catch (error) {
      console.error("Failed to load user data:", error);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await User.updateMyUserData(editData);
      setCurrentUser(editData);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save user data:", error);
    }
    setIsSaving(false);
  };

  const handleLogout = async () => {
    try {
      await User.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const { file_url } = await UploadFile({ file });
      const updatedData = { ...editData, profile_picture: file_url };
      setEditData(updatedData);
      
      // Auto-save profile picture
      await User.updateMyUserData(updatedData);
      setCurrentUser(updatedData);
    } catch (error) {
      console.error("Failed to upload profile picture:", error);
    }
    setIsUploadingPhoto(false);
  };

  const menuItems = [
    { icon: Target, title: "Goals & Preferences", description: "Adjust your nutrition targets", href: createPageUrl("Goals") },
    { icon: Bell, title: "Notifications", description: "Manage your reminder settings", href: createPageUrl("Notifications") },
    { icon: Shield, title: "Privacy & Security", description: "Control your data and privacy", href: createPageUrl("Privacy") },
    { icon: Info, title: "About", description: "Learn more about KaloriScan", href: createPageUrl("About") }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your account and preferences</p>
        </div>

        {/* Profile Card */}
        <Card className="glass-effect border-0 shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="relative w-24 h-24 mx-auto mb-4">
              {currentUser?.profile_picture ? (
                <img
                  src={currentUser.profile_picture}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-r from-teal-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <UserIcon className="w-12 h-12 text-white" />
                </div>
              )}
              
              {/* Photo Upload Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
                className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-gray-800 rounded-full border-2 border-gray-200 dark:border-gray-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isUploadingPhoto ? (
                  <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Camera className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                )}
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
            
            <CardTitle className="text-xl dark:text-white">{currentUser?.full_name || "User"}</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">{currentUser?.email}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isEditing ? (
              <>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Age</p>
                    <p className="font-bold text-lg dark:text-white">{currentUser?.age || "N/A"}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Height</p>
                    <p className="font-bold text-lg dark:text-white">{currentUser?.height || "N/A"} cm</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Weight</p>
                    <p className="font-bold text-lg dark:text-white">{currentUser?.weight || "N/A"} kg</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Goal</p>
                    <p className="font-bold text-lg dark:text-white">{currentUser?.goal_weight || "N/A"} kg</p>
                  </div>
                </div>
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="w-full dark:border-gray-600 dark:text-gray-300"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="age" className="dark:text-white">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={editData.age || ""}
                      onChange={(e) => setEditData({...editData, age: parseInt(e.target.value)})}
                      className="dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="height" className="dark:text-white">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={editData.height || ""}
                      onChange={(e) => setEditData({...editData, height: parseInt(e.target.value)})}
                      className="dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight" className="dark:text-white">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={editData.weight || ""}
                      onChange={(e) => setEditData({...editData, weight: parseInt(e.target.value)})}
                      className="dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="goal_weight" className="dark:text-white">Goal Weight (kg)</Label>
                    <Input
                      id="goal_weight"
                      type="number"
                      value={editData.goal_weight || ""}
                      onChange={(e) => setEditData({...editData, goal_weight: parseInt(e.target.value)})}
                      className="dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="goal_type" className="dark:text-white">Primary Goal</Label>
                  <Select value={editData.goal_type || ""} onValueChange={(value) => setEditData({...editData, goal_type: value})}>
                    <SelectTrigger className="dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weight_loss">Weight Loss</SelectItem>
                      <SelectItem value="weight_gain">Weight Gain</SelectItem>
                      <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                      <SelectItem value="maintenance">Maintain Weight</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 dark:border-gray-600 dark:text-gray-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 bg-gradient-to-r from-teal-600 to-blue-600 text-white"
                  >
                    {isSaving ? "Saving..." : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Menu Items */}
        <Card className="glass-effect border-0 shadow-lg">
          <CardContent className="p-0">
            {menuItems.map((item, index) => (
              <Link key={index} to={item.href}>
                <div className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">{item.title}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{item.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Health Integration Card */}
        <Card className="glass-effect border-0 shadow-lg bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center">
                <Settings className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-300 mb-1">Health Integration</h3>
                <p className="text-sm text-green-700 dark:text-green-400 mb-3">
                  Connect with Apple Health, Google Fit, or Fitbit to sync your nutrition data and get more insights.
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="border-green-300 text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900/30">
                    Connect Apple Health
                  </Button>
                  <Button size="sm" variant="outline" className="border-green-300 text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900/30">
                    Connect Google Fit
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Card className="glass-effect border-0 shadow-lg">
          <CardContent className="p-4">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}