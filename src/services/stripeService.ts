import { loadStripe, Stripe } from '@stripe/stripe-js';

// Stripe configuration
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_stripe_publishable_key_here';
const STRIPE_SECRET_KEY = import.meta.env.VITE_STRIPE_SECRET_KEY || 'sk_test_your_stripe_secret_key_here';

// Initialize Stripe
let stripePromise: Promise<Stripe | null>;

const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret: string;
}

export interface Subscription {
  id: string;
  status: string;
  current_period_start: number;
  current_period_end: number;
  plan: {
    id: string;
    nickname: string;
    amount: number;
    currency: string;
    interval: string;
  };
}

export interface Customer {
  id: string;
  email: string;
  name: string;
  subscriptions: Subscription[];
}

export class StripeService {
  private static baseURL = 'https://api.stripe.com/v1';
  
  // Create a payment intent for one-time payments
  static async createPaymentIntent(amount: number, currency: string = 'usd', metadata?: any): Promise<PaymentIntent> {
    try {
      if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY === 'sk_test_your_stripe_secret_key_here') {
        throw new Error('Stripe secret key not configured');
      }

      const response = await fetch(`${this.baseURL}/payment_intents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          amount: (amount * 100).toString(), // Convert to cents
          currency,
          automatic_payment_methods: JSON.stringify({ enabled: true }),
          ...(metadata && { metadata: JSON.stringify(metadata) })
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to create payment intent');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Stripe payment intent error:', error);
      throw new Error(`Payment setup failed: ${error.message}`);
    }
  }

  // Create a customer
  static async createCustomer(email: string, name: string, userId: string): Promise<Customer> {
    try {
      if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY === 'sk_test_your_stripe_secret_key_here') {
        throw new Error('Stripe secret key not configured');
      }

      const response = await fetch(`${this.baseURL}/customers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          email,
          name,
          metadata: JSON.stringify({ userId })
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to create customer');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Stripe customer creation error:', error);
      throw new Error(`Customer creation failed: ${error.message}`);
    }
  }

  // Create a subscription
  static async createSubscription(customerId: string, priceId: string): Promise<Subscription> {
    try {
      if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY === 'sk_test_your_stripe_secret_key_here') {
        throw new Error('Stripe secret key not configured');
      }

      const response = await fetch(`${this.baseURL}/subscriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          customer: customerId,
          'items[0][price]': priceId,
          'payment_behavior': 'default_incomplete',
          'payment_settings[save_default_payment_method]': 'on_subscription',
          'expand[]': 'latest_invoice.payment_intent'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to create subscription');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Stripe subscription creation error:', error);
      throw new Error(`Subscription creation failed: ${error.message}`);
    }
  }

  // Get customer subscriptions
  static async getCustomerSubscriptions(customerId: string): Promise<Subscription[]> {
    try {
      if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY === 'sk_test_your_stripe_secret_key_here') {
        return [];
      }

      const response = await fetch(`${this.baseURL}/subscriptions?customer=${customerId}`, {
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to fetch subscriptions');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error: any) {
      console.error('Stripe subscriptions fetch error:', error);
      return [];
    }
  }

  // Cancel a subscription
  static async cancelSubscription(subscriptionId: string): Promise<Subscription> {
    try {
      if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY === 'sk_test_your_stripe_secret_key_here') {
        throw new Error('Stripe secret key not configured');
      }

      const response = await fetch(`${this.baseURL}/subscriptions/${subscriptionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to cancel subscription');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Stripe subscription cancellation error:', error);
      throw new Error(`Subscription cancellation failed: ${error.message}`);
    }
  }

  // Update subscription
  static async updateSubscription(subscriptionId: string, priceId: string): Promise<Subscription> {
    try {
      if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY === 'sk_test_your_stripe_secret_key_here') {
        throw new Error('Stripe secret key not configured');
      }

      // First get the subscription to get the subscription item ID
      const subResponse = await fetch(`${this.baseURL}/subscriptions/${subscriptionId}`, {
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        }
      });

      if (!subResponse.ok) {
        throw new Error('Failed to fetch subscription');
      }

      const subscription = await subResponse.json();
      const subscriptionItemId = subscription.items.data[0].id;

      // Update the subscription
      const response = await fetch(`${this.baseURL}/subscriptions/${subscriptionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'items[0][id]': subscriptionItemId,
          'items[0][price]': priceId,
          'proration_behavior': 'create_prorations'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to update subscription');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Stripe subscription update error:', error);
      throw new Error(`Subscription update failed: ${error.message}`);
    }
  }

  // Get payment methods for a customer
  static async getPaymentMethods(customerId: string): Promise<any[]> {
    try {
      if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY === 'sk_test_your_stripe_secret_key_here') {
        return [];
      }

      const response = await fetch(`${this.baseURL}/payment_methods?customer=${customerId}&type=card`, {
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to fetch payment methods');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error: any) {
      console.error('Stripe payment methods fetch error:', error);
      return [];
    }
  }

  // Create a setup intent for saving payment methods
  static async createSetupIntent(customerId: string): Promise<any> {
    try {
      if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY === 'sk_test_your_stripe_secret_key_here') {
        throw new Error('Stripe secret key not configured');
      }

      const response = await fetch(`${this.baseURL}/setup_intents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          customer: customerId,
          'payment_method_types[]': 'card',
          usage: 'off_session'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to create setup intent');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Stripe setup intent error:', error);
      throw new Error(`Setup intent creation failed: ${error.message}`);
    }
  }
}

export { getStripe };
export default StripeService;