import dotenv from 'dotenv';
dotenv.config();
import Stripe from 'stripe';
import  {UserSchema}  from '../../models/userSchema.js';
import mongoose from 'mongoose';

const User = mongoose.model('User', UserSchema);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const DOMAIN = process.env.FRONTEND_DOMAIN ;
console.log(DOMAIN);
const PRICE_IDS = {
  PRO_MONTHLY: process.env.STRIPE_PRICE_ID_PRO_MONTHLY,
  PRO_ANNUAL: process.env.STRIPE_PRICE_ID_PRO_ANNUAL
};

class StripeService {
  async createCheckoutSession(userId, priceId, planFrequency = 'monthly') {
    try {

      const DOMAIN = process.env.FRONTEND_DOMAIN ;
      console.log(DOMAIN);
      // Find the user to get their email
      const user = await User.findOne({ uid: userId });
      if (!user) throw new Error('User not found');

      // Determine the correct Stripe price ID based on frequency
      const selectedPriceId = planFrequency === 'annual' ? PRICE_IDS.PRO_ANNUAL : PRICE_IDS.PRO_MONTHLY;

      // Check if user already has a stripeCustomerId
      let customer = user.stripeCustomerId;
      if (!customer) {
        // Create a new customer in Stripe
        const customerData = await stripe.customers.create({
          email: user.email,
          metadata: { userId: user.uid }
        });
        customer = customerData.id;

        // Save the customer ID to the user
        user.stripeCustomerId = customer;
        await user.save();
      }

      // Create the checkout session
      const session = await stripe.checkout.sessions.create({
        customer,
        payment_method_types: ['card'],
        line_items: [{ price: selectedPriceId, quantity: 1 }],
        mode: 'subscription',
        success_url: `https://neurolingva.vercel.app/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `https://neurolingva.vercel.app/subscription-success/subscribe`,
        metadata: { userId: user.uid, planId: 'pro' },
      });
      console.log('Stripe session URL:', session.url);


      return { sessionId: session.id, url: session.url };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  async createBillingPortalSession(userId) {
    try {
      const user = await User.findOne({ uid: userId });
      if (!user?.stripeCustomerId) throw new Error('User does not have an active subscription');

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${DOMAIN}/dashboard`,
      });

      return { url: portalSession.url };
    } catch (error) {
      console.error('Error creating billing portal session:', error);
      throw error;
    }
  }

  async handleSubscriptionUpdated(subscription) {
    try {
      console.log('Handling subscription update:', subscription.id);
      
      // Find user by customer ID
      const user = await User.findOne({ stripeCustomerId: subscription.customer });
      if (!user) {
        console.error('User not found for customer:', subscription.customer);
        return null;
      }

      // Debug logging before update
      console.log('User before update:', {
        id: user._id,
        currentRole: user.role,
        currentPlan: user.planId,
        currentStatus: user.subscriptionStatus
      });

      // Determine new status and role
      const isActive = ['active', 'trialing'].includes(subscription.status);
      const newRole = isActive ? 'Subscriber' : 'Guest';
      const newPlanId = isActive ? 'pro' : 'free';

      // Update user document
      const updateData = {
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        role: newRole,
        planId: newPlanId
      };

      // Use findOneAndUpdate for atomic operation
      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        throw new Error('Failed to update user document');
      }

      console.log('User successfully updated:', {
        id: updatedUser._id,
        newRole: updatedUser.role,
        newPlan: updatedUser.planId,
        newStatus: updatedUser.subscriptionStatus
      });

      return updatedUser;
    } catch (error) {
      console.error('Error in handleSubscriptionUpdated:', error);
      throw error;
    }
  }

  async handlePaymentSucceeded(paymentIntent) {
    try {
      console.log('Handling payment succeeded:', paymentIntent.id);
      
      const customerId = paymentIntent.customer;
      if (!customerId) {
        console.log('No customer ID in payment intent');
        return null;
      }

      const user = await User.findOne({ stripeCustomerId: customerId });
      if (!user) {
        console.error('User not found for customer:', customerId);
        return null;
      }

      // Check if this is a pro payment
      const isPro = paymentIntent.metadata?.planId === 'pro' || 
                   paymentIntent.amount >= 1000;

      if (isPro) {
        console.log('Upgrading user to Subscriber after payment');
        const updatedUser = await User.findOneAndUpdate(
          { _id: user._id },
          { 
            $set: { 
              role: 'Subscriber',
              planId: 'pro',
              subscriptionStatus: 'active'
            }
          },
          { new: true }
        );

        return updatedUser;
      }

      return user;
    } catch (error) {
      console.error('Error in handlePaymentSucceeded:', error);
      throw error;
    }
  }

  async handleCheckoutSessionCompleted(session) {
    try {
      console.log('Handling checkout session completed:', session.id);
      
      const customerId = session.customer;
      if (!customerId) {
        console.error('No customer ID in session');
        return null;
      }

      const user = await User.findOne({ stripeCustomerId: customerId });
      if (!user) {
        console.error('User not found for customer:', customerId);
        return null;
      }

      // Check if this was for a pro plan
      const isPro = session.metadata?.planId === 'pro';

      if (isPro) {
        console.log('Upgrading user to Subscriber after checkout completion');
        const updatedUser = await User.findOneAndUpdate(
          { _id: user._id },
          { 
            $set: { 
              role: 'Subscriber',
              planId: 'pro',
              subscriptionStatus: 'active'
            }
          },
          { new: true }
        );

        return updatedUser;
      }

      return user;
    } catch (error) {
      console.error('Error in handleCheckoutSessionCompleted:', error);
      throw error;
    }
  }

  async handleSubscriptionDeleted(subscription) {
    try {
      console.log('Handling subscription deleted:', subscription.id);
      
      const user = await User.findOne({ stripeCustomerId: subscription.customer });
      if (!user) {
        console.error('User not found for customer:', subscription.customer);
        return null;
      }

      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        { 
          $set: { 
            subscriptionStatus: 'canceled',
            role: 'Guest',
            planId: 'free',
            cancelAtPeriodEnd: false
          }
        },
        { new: true }
      );

      console.log('User downgraded after subscription cancellation:', updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Error in handleSubscriptionDeleted:', error);
      throw error;
    }
  }
}


export default new StripeService();
