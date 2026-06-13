import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Camera, MessageCircle, BarChart3, History } from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      icon: Camera,
      title: "Scan Meal",
      description: "Take a photo",
      href: createPageUrl("Camera"),
      color: "from-teal-600 to-blue-600"
    },
    {
      icon: MessageCircle,
      title: "AI Coach",
      description: "Get advice",
      href: createPageUrl("Chat"),
      color: "from-purple-600 to-pink-600"
    },
    {
      icon: BarChart3,
      title: "Progress",
      description: "View charts",
      href: createPageUrl("Progress"),
      color: "from-green-600 to-teal-600"
    },
    {
      icon: History,
      title: "History",
      description: "Past meals",
      href: createPageUrl("History"),
      color: "from-orange-600 to-red-600"
    }
  ];

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-4">
          {actions.map((action) => (
            <Link key={action.title} to={action.href}>
              <Button
                variant="outline"
                className="h-auto p-4 border-0 bg-gradient-to-r hover:opacity-90 transition-opacity w-full"
                style={{
                  background: `linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))`,
                  backgroundImage: `linear-gradient(135deg, ${action.color.split(' ')[0].replace('from-', '')}, ${action.color.split(' ')[1].replace('to-', '')})`
                }}
              >
                <div className="flex flex-col items-center gap-2 text-white">
                  <action.icon className="w-6 h-6" />
                  <div className="text-center">
                    <p className="font-semibold text-sm">{action.title}</p>
                    <p className="text-xs opacity-90">{action.description}</p>
                  </div>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}