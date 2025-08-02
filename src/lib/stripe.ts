// src/lib/stripe.ts
import { loadStripe, Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null>;

const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (!publishableKey) {
      console.warn("Stripe publishable key is not set");
      return Promise.resolve(null);
    }

    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

export default getStripe;
