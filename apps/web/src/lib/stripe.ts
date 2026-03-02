import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-02-25.clover" as any,
    });
  }
  return _stripe;
}

export const PLANS = {
  free: {
    name: "Free",
    priceId: null,
    testimonialLimit: 10,
    widgetLimit: 1,
  },
  indie: {
    name: "Indie",
    priceId: process.env.STRIPE_INDIE_PRICE_ID,
    testimonialLimit: Infinity,
    widgetLimit: 5,
  },
  pro: {
    name: "Pro",
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    testimonialLimit: Infinity,
    widgetLimit: Infinity,
  },
} as const;
