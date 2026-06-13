import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Camera, Eye, Ruler, Apple } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ARPortions() {
  const [arMode, setArMode] = useState(false);
  const [selectedPortion, setSelectedPortion] = useState(null);

  const portionGuides = [
    {
      food: "Rice/Pasta",
      portion: "1 cup cooked",
      visual: "Size of your fist",
      calories: "200-250 cal",
      color: "bg-yellow-100 text-yellow-800"
    },
    {
      food: "Meat/Fish",
      portion: "3-4 oz",
      visual: "Size of your palm",
      calories: "150-200 cal",
      color: "bg-red-100 text-red-800"
    },
    {
      food: "Vegetables",
      portion: "1 cup",
      visual: "Size of your fist",
      calories: "25-50 cal",
      color: "bg-green-100 text-green-800"
    },
    {
      food: "Cheese",
      portion: "1 oz",
      visual: "Size of your thumb",
      calories: "100-120 cal",
      color: "bg-orange-100 text-orange-800"
    },
    {
      food: "Nuts",
      portion: "1 oz (24 almonds)",
      visual: "Cupped palm",
      calories: "160-180 cal",
      color: "bg-brown-100 text-brown-800"
    },
    {
      food: "Fruit",
      portion: "1 medium piece",
      visual: "Size of tennis ball",
      calories: "60-100 cal",
      color: "bg-purple-100 text-purple-800"
    }
  ];

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="outline" size="icon" className="rounded-full">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AR Portion Guide</h1>
            <p className="text-gray-600 text-sm">Visualize perfect portion sizes</p>
          </div>
        </div>

        {/* AR Camera Interface */}
        <Card className="glass-effect border-0 shadow-lg">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 text-white" />
            </div>
            <CardTitle>AR Portion Visualizer</CardTitle>
            <p className="text-sm text-gray-600">
              Use augmented reality to see portion sizes in real-time
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {!arMode ? (
              <Button
                onClick={() => setArMode(true)}
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3"
              >
                <Camera className="w-5 h-5 mr-2" />
                Start AR Portion Guide
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="aspect-video bg-gray-900 rounded-2xl flex items-center justify-center relative overflow-hidden">
                  <div className="text-white text-center">
                    <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm opacity-75">AR Camera Feed</p>
                    <div className="absolute inset-4 border-2 border-green-400 rounded-lg flex items-center justify-center">
                      <div className="w-20 h-20 bg-green-400/20 rounded-full flex items-center justify-center">
                        <Apple className="w-8 h-8 text-green-400" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {portionGuides.slice(0, 3).map((guide, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPortion(guide)}
                      className="text-xs"
                    >
                      {guide.food}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setArMode(false)}
                  className="w-full"
                >
                  Exit AR Mode
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Portion Guide Reference */}
        <Card className="glass-effect border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ruler className="w-5 h-5 text-teal-600" />
              Quick Portion Reference
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {portionGuides.map((guide, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => setSelectedPortion(guide)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">{guide.food}</h4>
                    <Badge className={guide.color}>{guide.calories}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{guide.visual}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{guide.portion}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Educational Tips */}
        <Card className="glass-effect border-0 shadow-lg">
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Portion Control Tips</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-teal-600 rounded-full mt-2 flex-shrink-0"></div>
                <p>Use smaller plates to make portions appear larger</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-teal-600 rounded-full mt-2 flex-shrink-0"></div>
                <p>Fill half your plate with vegetables</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-teal-600 rounded-full mt-2 flex-shrink-0"></div>
                <p>Eat slowly and listen to hunger cues</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-teal-600 rounded-full mt-2 flex-shrink-0"></div>
                <p>Use your hands as measuring tools when dining out</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}