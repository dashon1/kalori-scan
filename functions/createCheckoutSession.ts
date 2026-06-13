import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@14.25.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json().catch(() => ({}));
    const { priceId, mode = 'subscription' } = payload;
    if (!priceId) {
      return Response.json({ error: 'Missing priceId' }, { status: 400 });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), { apiVersion: '2024-06-20' });

    const originHeader = req.headers.get('origin') || '';
    const urlObj = new URL(req.url);
    const origin = originHeader || `${urlObj.protocol}//${urlObj.host}`;

    const session = await stripe.checkout.sessions.create({
      mode,
      allow_promotion_codes: true,
      line_items: [ { price: priceId, quantity: 1 } ],
      customer_email: user.email,
      client_reference_id: user.id,
      success_url: `${origin}/?checkout=success`,
      cancel_url: `${origin}/?checkout=cancelled`,
      metadata: { base44_app_id: Deno.env.get('BASE44_APP_ID') || 'unknown' },
    });

    return Response.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('createCheckoutSession error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});