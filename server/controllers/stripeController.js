import dotenv from 'dotenv';

dotenv.config();

import stripeService from '../services/stripeService/index.js';

import Stripe from 'stripe';


class StripeController {
  async createCheckoutSession(req, res) {
    try {
      const { userId } = req.user; // Assuming you have auth middleware that adds user info
      const { priceId, planFrequency } = req.body;
      
      const session = await stripeService.createCheckoutSession(userId, priceId, planFrequency);
      
      res.status(200).json(session);
    } catch (error) {
      console.error('Checkout session error:', error);
      res.status(500).json({ error: 'Failed to create checkout session' });
    }
  }

  async createBillingPortalSession(req, res) {
    try {
      const { userId } = req.user; // From auth middleware
      
      const session = await stripeService.createBillingPortalSession(userId);
      
      res.status(200).json(session);
    } catch (error) {
      console.error('Billing portal error:', error);
      res.status(500).json({ error: 'Failed to create billing portal session' });
    }
  }

  async handleWebhook(req, res) {
    const sig = req.headers['stripe-signature'];

    console.log('Stripe signature:', sig);
    console.log('Request body type:', typeof req.body);
    console.log('Request body is Buffer?', Buffer.isBuffer(req.body));

    
const DOMAIN = process.env.FRONTEND_DOMAIN ;
console.log(DOMAIN);

      // Add this to check if environment variables are properly loaded
  console.log('STRIPE_WEBHOOK_SECRET exists:', !!process.env.STRIPE_WEBHOOK_SECRET);
  console.log('STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
  
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;

    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      // Handle the event
      switch (event.type) {
        case 'checkout.session.completed':
          await stripeService.handleCheckoutSessionCompleted(event.data.object);
        case 'customer.subscription.updated':
          await stripeService.handleSubscriptionUpdated(event.data.object);
          break;
        case 'payment_intent.succeeded':
            await stripeService.handlePaymentSucceeded(event.data.object);
            break;
        case 'customer.subscription.deleted':
          await stripeService.handleSubscriptionDeleted(event.data.object);
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      res.status(200).json({ received: true });
    } catch (error) {
      console.error('Webhook handling error:', error);
      res.status(500).json({ error: 'Webhook handling failed' });
    }
  }
}

export default new StripeController();
