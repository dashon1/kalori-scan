import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Camera, 
  Mic, 
  Scan,
  ChefHat
} from "lucide-react";

export default function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      icon: Camera,
      title: "Scan Meal",
      description: "Photo analysis",
      href: createPageUrl("Camera"),
      gradient: "gradient-blue"
    },
    {
      icon: Mic,
      title: "Voice Log",
      description: "Say what you ate",
      href: createPageUrl("VoiceLogging"),
      gradient: "gradient-mint"
    },
    {
      icon: Scan,
      title: "Barcode",
      description: "Scan packages",
      href: createPageUrl("BarcodeScanner"),
      gradient: "gradient-mixed"
    },
    {
      icon: ChefHat,
      title: "Pantry Scan",
      description: "Smart recipes",
      href: createPageUrl("PantryScanner"),
      gradient: "gradient-blue"
    }
  ];

  return (
    <Card className="glass-effect card-shadow rounded-3xl overflow-hidden">
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <Button
              key={action.title}
              onClick={() => navigate(action.href)}
              className={`${action.gradient} text-white h-auto p-4 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 border-0`}
              variant="ghost"
            >
              <div className="flex flex-col items-center gap-2">
                <action.icon className="w-6 h-6" />
                <div className="text-center">
                  <p className="font-semibold text-sm">{action.title}</p>
                  <p className="text-xs opacity-90">{action.description}</p>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}