import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY is not set in the environment variables');
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-05-28.basil',
});

export default stripe;
