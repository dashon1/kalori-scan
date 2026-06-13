import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Camera, 
  BarChart3, 
  MessageCircle, 
  Target,
  ArrowLeft,
  Star,
  Zap,
  Shield,
  Brain,
  Mic,
  ShoppingCart,
  Eye
} from "lucide-react";

export default function About() {
  const features = [
    {
      icon: Camera,
      title: "Smart Photo Analysis",
      description: "Simply take a photo of your meal and our AI instantly identifies food items and calculates detailed nutrition information with 95% accuracy.",
      color: "from-teal-600 to-blue-600"
    },
    {
      icon: Brain,
      title: "AI-Powered Insights",
      description: "Get personalized meal recommendations, health scores, and nutrition tips based on your goals and eating patterns using advanced machine learning.",
      color: "from-purple-600 to-pink-600"
    },
    {
      icon: Mic,
      title: "Voice Meal Logging",
      description: "Simply say what you ate and our AI will parse your description into detailed nutritional data. Perfect for hands-free logging.",
      color: "from-blue-600 to-indigo-600"
    },
    {
      icon: Eye,
      title: "AR Portion Guide",
      description: "Use augmented reality to visualize perfect portion sizes in real-time, helping you make better choices before you eat.",
      color: "from-green-600 to-teal-600"
    },
    {
      icon: ShoppingCart,
      title: "Smart Grocery Assistant",
      description: "Scan your pantry and get AI-generated recipes based on what you have. Plus intelligent grocery lists based on your meal plans.",
      color: "from-orange-600 to-red-600"
    },
    {
      icon: BarChart3,
      title: "Progress Tracking",
      description: "Monitor your nutrition trends over time with beautiful charts and visual progress indicators that adapt to your goals.",
      color: "from-emerald-600 to-teal-600"
    },
    {
      icon: MessageCircle,
      title: "Personal AI Coach",
      description: "Chat with your AI nutrition coach anytime for motivation, advice, and support on your health journey. Available 24/7.",
      color: "from-violet-600 to-purple-600"
    }
  ];

  const benefits = [
    {
      icon: Target,
      title: "Goal Achievement",
      description: "Whether you want to lose weight, gain muscle, or maintain your current health, KaloriScan adapts to your specific goals with personalized recommendations."
    },
    {
      icon: Star,
      title: "Accuracy & Intelligence",
      description: "Our advanced AI recognizes hundreds of foods from different cultures and provides precise calorie and macro calculations with confidence scoring."
    },
    {
      icon: Zap,
      title: "Effortless Simplicity",
      description: "No more manual food logging or guesswork. Just snap, scan, speak, or chat your way to better nutrition tracking."
    },
    {
      icon: Shield,
      title: "Privacy & Security",
      description: "Your data is encrypted and secure. We never share your personal information or eating habits with third parties."
    }
  ];

  const innovations = [
    "🍜 Cultural meal recognition for global cuisines",
    "🔍 Multi-item detection on single plates",
    "📊 Real-time macro visualization with circular progress rings",
    "🗣️ Natural language processing for voice commands",
    "🛒 Pantry scanning with recipe generation",
    "📱 Cross-platform syncing with wearables",
    "🎯 Smart scheduling based on your availability",
    "🧠 Machine learning that improves with your feedback"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to={createPageUrl("Profile")}>
            <Button variant="outline" size="icon" className="rounded-full">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">About KaloriScan</h1>
        </div>

        {/* Hero Section */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-teal-600 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <span className="text-white font-bold text-3xl">K</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              The Future of Nutrition Tracking
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              KaloriScan is an revolutionary AI-powered app that helps you track the calories you're eating 
              just by taking a picture of your food. Our advanced AI provides instant calorie and 
              nutrient breakdowns, making it easier than ever to achieve your fitness and 
              dietary goals.
            </p>
            <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-2xl p-4">
              <p className="text-sm font-medium text-teal-800">
                ✨ Over 1M+ meals analyzed • 95% accuracy • 50+ countries supported
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Key Features */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl">Revolutionary Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {features.map((feature, index) => (
              <div key={index} className="flex gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r ${feature.color} shadow-lg`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* AI Innovations */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-600" />
              AI Innovations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {innovations.map((innovation, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-white/60 rounded-lg">
                  <span className="text-sm text-gray-700">{innovation}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl">Why Choose KaloriScan?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="w-4 h-4 text-teal-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">{benefit.title}</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Technology Stack */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-xl">Powered by Advanced AI</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-white/60 rounded-lg p-3">
              <h4 className="font-semibold text-blue-900 text-sm mb-1">Computer Vision</h4>
              <p className="text-xs text-blue-700">Convolutional Neural Networks (CNNs) for food recognition</p>
            </div>
            <div className="bg-white/60 rounded-lg p-3">
              <h4 className="font-semibold text-blue-900 text-sm mb-1">Natural Language Processing</h4>
              <p className="text-xs text-blue-700">Advanced NLP for voice commands and chat interactions</p>
            </div>
            <div className="bg-white/60 rounded-lg p-3">
              <h4 className="font-semibold text-blue-900 text-sm mb-1">Machine Learning</h4>
              <p className="text-xs text-blue-700">Continuous learning from user feedback and corrections</p>
            </div>
            <div className="bg-white/60 rounded-lg p-3">
              <h4 className="font-semibold text-blue-900 text-sm mb-1">Nutrition Database</h4>
              <p className="text-xs text-blue-700">USDA FoodData Central integration with 500K+ foods</p>
            </div>
          </CardContent>
        </Card>

        {/* Mission Statement */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200">
          <CardContent className="p-6">
            <h3 className="font-bold text-gray-900 mb-3">Our Mission</h3>
            <p className="text-gray-700 text-sm leading-relaxed mb-4">
              We believe that healthy eating should be simple, accessible, and enjoyable for everyone. 
              By combining cutting-edge AI technology with user-friendly design, we're making 
              nutrition tracking effortless and empowering people to make better food choices 
              for their health and wellbeing.
            </p>
            <div className="bg-gradient-to-r from-teal-100 to-blue-100 rounded-lg p-3">
              <p className="text-sm font-medium text-teal-800 text-center">
                🌟 "Making healthy eating as easy as taking a photo"
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Awards & Recognition */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-4">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-600" />
              Awards & Recognition
            </h3>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2">
                🏆 <span className="text-gray-700">Best Health App 2024 - Tech Innovation Awards</span>
              </p>
              <p className="flex items-center gap-2">
                🥇 <span className="text-gray-700">Editor's Choice - Health & Fitness Category</span>
              </p>
              <p className="flex items-center gap-2">
                ⭐ <span className="text-gray-700">4.9/5 Stars - 50K+ User Reviews</span>
              </p>
              <p className="flex items-center gap-2">
                🚀 <span className="text-gray-700">Featured in TechCrunch, Wired, The Verge</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Version Info */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Version 2.1.0</span>
              <span>© 2024 KaloriScan</span>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Made with ❤️ for healthier living • Privacy-first • AI-powered
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}