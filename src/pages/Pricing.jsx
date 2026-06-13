import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Crown } from "lucide-react";
import { base44 } from "@/api/base44Client";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/mo",
    features: [
      "Log meals & water",
      "Camera analysis (limited)",
      "Basic insights",
    ],
    cta: "Get started",
    tier: "free",
  },
  {
    name: "Pro",
    price: "$9",
    period: "/mo",
    features: [
      "Unlimited camera & voice logs",
      "Advanced analytics",
      "Recipe uploads & parsing",
      "Priority support",
    ],
    highlight: true,
    cta: "Subscribe",
    tier: "pro_monthly",
  },
  {
    name: "Annual",
    price: "$79",
    period: "/yr",
    features: [
      "Everything in Pro",
      "2 months free",
    ],
    cta: "Subscribe",
    tier: "pro_annual",
  },
  {
    name: "Lifetime (Early Adopter)",
    price: "$149",
    period: "one-time",
    features: [
      "Lifetime access to all Pro features",
      "No recurring fees",
      "Limited-time early adopter offer",
    ],
    cta: "Get lifetime",
    tier: "lifetime_early",
    limited: true,
  },
];

export default function Pricing() {
  const [prices, setPrices] = React.useState([]);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await base44.functions.invoke('getStripePrices', {});
        setPrices(res.data?.prices || []);
      } catch (e) {
        console.warn('Failed to load prices');
      }
    })();
  }, []);

  const priceMap = React.useMemo(() => {
    const map = {};
    prices.forEach((p) => {
      const interval = p?.recurring?.interval;
      if (interval === 'month') map['pro_monthly'] = p.id;
      if (interval === 'year') map['pro_annual'] = p.id;
      if (!p.recurring && p.unit_amount === 14900) map['lifetime_early'] = p.id;
    });
    return map;
  }, [prices]);

  // Lifetime offer deadline and countdown (configurable)
  const [lifetimeDeadline, setLifetimeDeadline] = React.useState(() => {
    const override = typeof window !== 'undefined' ? localStorage.getItem('lifetime_deadline_iso') : null;
    if (override) {
      const d = new Date(override);
      if (!isNaN(d.getTime())) return d;
    }
    const now = new Date();
    const endOfThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const d = new Date(endOfThisMonth);
    d.setMonth(d.getMonth() + 6); // Default: 6 months from end of current month
    return d;
  });

  const [timeLeft, setTimeLeft] = React.useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  React.useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, lifetimeDeadline.getTime() - Date.now());
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ days, hours, minutes, seconds });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lifetimeDeadline]);

  const isExpired = React.useMemo(() => Date.now() >= lifetimeDeadline.getTime(), [lifetimeDeadline, timeLeft]);

  const handleSelect = async (tier) => {
    base44.analytics.track({ eventName: 'pricing_select', properties: { tier } });
    if (window.top !== window.self) {
      alert('Checkout is only available in the published app. Please open in a new tab.');
      return;
    }
    if (tier === 'lifetime_early' && isExpired) {
      alert('The lifetime early adopter offer has ended. You can join the waitlist for the next opening.');
      return;
    }
    const priceId = priceMap[tier];
    if (!priceId) { alert('Pricing not ready yet. Try again in a moment.'); return; }
    const mode = tier === 'lifetime_early' ? 'payment' : 'subscription';
    const res = await base44.functions.invoke('createCheckoutSession', { priceId, mode });
    const url = res.data?.url;
    if (url) window.location.href = url;
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-950">
      <div className="max-w-4xl mx-auto text-center mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Choose your plan</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Upgrade to unlock advanced analysis, unlimited uploads, and more.</p>
      </div>

      <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-4">
        {plans.map((p) => (
          <Card key={p.tier} className={`rounded-2xl ${p.highlight ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">{p.name}</h3>
                {p.highlight && <Crown className="w-5 h-5 text-yellow-500" />}
              </div>
              <div className="mt-4">
                <span className="text-4xl font-extrabold">{p.price}</span>
                <span className="text-gray-500">{p.period}</span>
                {p.tier !== 'free' && <div className="text-xs text-blue-600 mt-1">Test mode</div>}
                {p.tier === 'lifetime_early' && (
                  <div className={`mt-2 text-sm font-semibold ${isExpired ? 'text-gray-500' : 'text-red-600'}`}>
                    {isExpired ? 'Offer ended — waitlist only' : `Ends in ${timeLeft.days}d ${String(timeLeft.hours).padStart(2,'0')}h ${String(timeLeft.minutes).padStart(2,'0')}m`}
                  </div>
                )}
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2"><Check className="w-4 h-4 text-green-600 mt-0.5" /> {f}</li>
                ))}
              </ul>
              <Button onClick={() => handleSelect(p.tier)} disabled={p.tier==='lifetime_early' && isExpired} className={`w-full mt-6 ${p.highlight ? 'bg-blue-600 hover:bg-blue-700' : ''}`}>
                {p.tier==='lifetime_early' && isExpired ? 'Join waitlist' : p.cta}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-xs text-center text-gray-500 mt-6">Payments will use secure Stripe checkout. Contact support for teams and enterprise.</p>
    </div>
  );
}