import express from 'express';
import stripeController from '../controllers/stripeController.js';
import { authenticateUser } from '../middleware/auth.js'; // Your auth middleware

const router = express.Router();

// Create a Stripe checkout session (requires authentication)
router.post('/create-checkout-session', authenticateUser, stripeController.createCheckoutSession);

// Create a Stripe billing portal session (requires authentication)
router.post('/create-billing-portal', authenticateUser, stripeController.createBillingPortalSession);

// Webhook endpoint to handle Stripe events
// Note: This endpoint should use a raw body parser
router.post('/webhook', stripeController.handleWebhook);

export default router;
