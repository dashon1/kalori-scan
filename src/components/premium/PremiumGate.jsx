import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function PremiumGate({ feature, description, children }) {
  const navigate = useNavigate();

  return (
    <Card className="glass-effect card-shadow rounded-3xl overflow-hidden border-2 border-amber-200 dark:border-amber-700">
      <CardContent className="p-6 text-center bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30">
        <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Crown className="w-8 h-8 text-white" />
        </div>
        <h3 className="font-bold text-lg text-amber-800 dark:text-amber-300 mb-2">
          Premium Feature
        </h3>
        <h4 className="font-semibold text-amber-900 dark:text-amber-200 mb-3">
          {feature}
        </h4>
        <p className="text-amber-700 dark:text-amber-200 text-sm mb-6">
          {description}
        </p>
        <div className="space-y-3">
          <Button
            onClick={() => navigate(createPageUrl("Premium"))}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white"
          >
            <Zap className="w-4 h-4 mr-2" />
            Upgrade to Premium
          </Button>
          <Button
            onClick={() => navigate(createPageUrl("Premium"))}
            variant="ghost"
            className="w-full text-amber-700 dark:text-amber-300"
          >
            Start 7-Day Free Trial
          </Button>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}