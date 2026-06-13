
import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Subscription } from "@/entities/Subscription";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Crown,
  Check,
  Zap,
  Users,
  Gift,
  Star
} from "lucide-react";

export default function Premium() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState("annual");

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

  const isPremium = currentUser?.subscription_status === "premium";
  const isTrialActive = currentUser?.trial_expires && new Date(currentUser.trial_expires) > new Date();

  const plans = [
    {
      id: "monthly",
      name: "Monthly",
      price: "$4.99",
      period: "/month",
      description: "Perfect for getting started",
      popular: false,
      savings: null
    },
    {
      id: "quarterly",
      name: "Quarterly",
      price: "$12.99",
      period: "/3 months",
      description: "Great for building habits",
      popular: false,
      savings: "Save 13%"
    },
    {
      id: "annual",
      name: "Annual",
      price: "$39.99",
      period: "/year",
      description: "Best value for committed users",
      popular: true,
      savings: "Save 33%"
    },
    {
      id: "lifetime",
      name: "Lifetime",
      price: "$99.00",
      period: "one-time",
      description: "Pay once, access forever",
      popular: false,
      savings: "Best Deal"
    }
  ];

  const freeFeatures = [
    "Daily calorie and macro tracking",
    "Barcode & meal scanner",
    "Voice logging",
    "Basic food database",
    "Weight and water tracking",
    "Basic progress charts"
  ];

  const premiumFeatures = [
    "AI Nutrition Coach (unlimited)",
    "Personalized meal plans",
    "Advanced nutrient insights",
    "Wearable device integration",
    "Share data with nutritionists",
    "Ad-free experience",
    "Priority customer support",
    "Advanced analytics & trends",
    "Custom goal setting",
    "Export data reports"
  ];

  const handleSubscribe = async (planId) => {
    // Show an alert explaining the payment system limitation
    alert(
      "Payment Gateway Simulation\n\n" +
      "This is a demo environment. Integrating real payment systems like credit cards or Mobile Money (MoMo) requires backend functionality which is not currently enabled.\n\n" +
      "For now, we will activate a 7-day free trial for you to experience all the premium features!"
    );

    // Proceed with activating a free trial
    try {
      if (currentUser?.trial_used) {
        alert("You have already used your free trial. In a real app, you would now proceed to payment.");
        return;
      }

      const trialEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const subscriptionData = {
        user_email: currentUser.email,
        plan_type: planId,
        status: "trial",
        start_date: new Date().toISOString(),
        end_date: trialEndDate.toISOString(),
        auto_renew: true // In a real app, this would be set based on user choice
      };

      await Subscription.create(subscriptionData);

      await User.updateMyUserData({
        subscription_status: "premium",
        trial_expires: trialEndDate.toISOString(),
        trial_used: true
      });

      alert("🎉 Welcome to Premium! Your 7-day free trial has started.");
      navigate(createPageUrl("Home"));
    } catch (error) {
      console.error("Subscription trial activation failed:", error);
      alert("Something went wrong while activating your trial. Please try again.");
    }
  };

  const testimonials = [
    {
      text: "I hit my weight goal 2x faster with Premium!",
      author: "Sarah M.",
      rating: 5
    },
    {
      text: "The AI coach feels like having a personal nutritionist.",
      author: "Mike R.",
      rating: 5
    },
    {
      text: "Sharing data with my dietitian was a game-changer.",
      author: "Emma L.",
      rating: 5
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
          <div className="w-16 h-16 gradient-mixed rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
            {isPremium ? "You're Premium!" : "Upgrade to Premium"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {isPremium
              ? "Enjoy all premium features"
              : "Unlock advanced features to accelerate your fitness journey"
            }
          </p>
          {isTrialActive && (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 mt-2">
              Free Trial Active
            </Badge>
          )}
        </div>

        {!isPremium && (
          <>
            {/* Free Trial Offer */}
            <Card className="glass-effect card-shadow rounded-3xl overflow-hidden border-2 border-teal-200 dark:border-teal-700">
              <CardContent className="p-6 text-center bg-gradient-to-br from-teal-50 to-blue-50 dark:from-teal-900/30 dark:to-blue-900/30">
                <Gift className="w-12 h-12 text-teal-600 dark:text-teal-400 mx-auto mb-3" />
                <h3 className="font-bold text-lg text-teal-800 dark:text-teal-300 mb-2">
                  7-Day Free Trial
                </h3>
                <p className="text-teal-700 dark:text-teal-200 text-sm mb-4">
                  Try all premium features risk-free. No commitment required.
                </p>
                {!currentUser?.trial_used && (
                  <Button
                    onClick={() => handleSubscribe(selectedPlan)}
                    className="gradient-mixed text-white"
                  >
                    Start Free Trial
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Pricing Plans */}
            <Card className="glass-effect card-shadow rounded-3xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-center dark:text-white">Choose Your Plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedPlan === plan.id
                        ? "border-teal-400 bg-teal-50 dark:bg-teal-900/30 dark:border-teal-500"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                    } ${plan.popular ? "ring-2 ring-teal-200 dark:ring-teal-700" : ""}`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{plan.name}</h4>
                          {plan.popular && (
                            <Badge className="bg-teal-500 text-white text-xs">Most Popular</Badge>
                          )}
                          {plan.savings && (
                            <Badge variant="outline" className="text-xs">{plan.savings}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{plan.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{plan.price}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{plan.period}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
        )}

        {/* Features Comparison */}
        <Card className="glass-effect card-shadow rounded-3xl overflow-hidden">
          <CardHeader>
            <CardTitle className="dark:text-white">Features Comparison</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-500" />
                Free Features
              </h4>
              <div className="space-y-2">
                {freeFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-500" />
                Premium Features
              </h4>
              <div className="space-y-2">
                {premiumFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Testimonials */}
        <Card className="glass-effect card-shadow rounded-3xl overflow-hidden">
          <CardHeader>
            <CardTitle className="dark:text-white">What Premium Users Say</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <div className="flex gap-1 mb-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current text-yellow-500" />
                  ))}
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 italic mb-2">
                  "{testimonial.text}"
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">- {testimonial.author}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Referral Program */}
        <Card className="glass-effect card-shadow rounded-3xl overflow-hidden bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30">
          <CardContent className="p-6 text-center">
            <Users className="w-12 h-12 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
            <h3 className="font-bold text-lg text-purple-800 dark:text-purple-300 mb-2">
              Referral Rewards
            </h3>
            <p className="text-purple-700 dark:text-purple-200 text-sm mb-4">
              Invite 3 friends and get 1 month of Premium FREE!
            </p>
            <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-100 dark:border-purple-700 dark:text-purple-300">
              Share With Friends
            </Button>
          </CardContent>
        </Card>

        {!isPremium && (
          <div className="sticky bottom-6 bg-white dark:bg-gray-900 p-4 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700">
            <Button
              onClick={() => handleSubscribe(selectedPlan)}
              className="w-full gradient-mixed text-white py-3 text-lg font-semibold"
            >
              {currentUser?.trial_used ? "Upgrade Now" : "Start 7-Day Free Trial"}
            </Button>
            <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
              Cancel anytime • No hidden fees • 7-day money-back guarantee
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
