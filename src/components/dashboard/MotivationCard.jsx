import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Target, Trophy, Zap } from "lucide-react";

export default function MotivationCard({ title, message, type }) {
  const getCardStyle = (type) => {
    const styles = {
      motivation: {
        bg: "bg-gradient-to-r from-blue-50 to-teal-50",
        border: "border-blue-200",
        icon: Sparkles,
        iconColor: "text-blue-600"
      },
      encouragement: {
        bg: "bg-gradient-to-r from-green-50 to-emerald-50", 
        border: "border-green-200",
        icon: Zap,
        iconColor: "text-green-600"
      },
      achievement: {
        bg: "bg-gradient-to-r from-yellow-50 to-orange-50",
        border: "border-yellow-200", 
        icon: Target,
        iconColor: "text-yellow-600"
      },
      celebration: {
        bg: "bg-gradient-to-r from-purple-50 to-pink-50",
        border: "border-purple-200",
        icon: Trophy,
        iconColor: "text-purple-600"
      }
    };
    return styles[type] || styles.motivation;
  };

  const style = getCardStyle(type);
  const IconComponent = style.icon;

  return (
    <Card className={`border-0 shadow-lg ${style.bg} ${style.border}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-full bg-white/80 flex items-center justify-center ${style.iconColor}`}>
            <IconComponent className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-700 text-sm leading-relaxed">{message}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}