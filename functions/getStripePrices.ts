import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@14.25.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), { apiVersion: '2024-06-20' });

    // Find the product and its active prices
    const products = await stripe.products.list({ active: true, limit: 10 });
    const prod = products.data.find(p => /calorieextractor pro/i.test(p.name)) || products.data[0] || null;
    if (!prod) return Response.json({ prices: [] });

    // Ensure we include the two prices we just created if present
    const prices = await stripe.prices.list({ product: prod.id, active: true, limit: 20 });
    const simplified = prices.data.map(p => ({ id: p.id, nickname: p.nickname, unit_amount: p.unit_amount, currency: p.currency, recurring: p.recurring }));

    return Response.json({ product: { id: prod.id, name: prod.name }, prices: simplified });
  } catch (error) {
    console.error('getStripePrices error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});