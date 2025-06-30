import { create } from 'zustand';
import { StripeService, Subscription, PaymentIntent } from '../services/stripeService';

interface PaymentState {
  subscriptions: Subscription[];
  paymentMethods: any[];
  paymentHistory: any[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadSubscriptions: (customerId: string) => Promise<void>;
  createSubscription: (customerId: string, priceId: string) => Promise<Subscription>;
  cancelSubscription: (subscriptionId: string) => Promise<void>;
  loadPaymentMethods: (customerId: string) => Promise<void>;
  loadPaymentHistory: (customerId: string) => Promise<void>;
  createPaymentIntent: (amount: number, currency?: string) => Promise<PaymentIntent>;
  clearError: () => void;
}

export const usePaymentStore = create<PaymentState>((set, get) => ({
  subscriptions: [],
  paymentMethods: [],
  paymentHistory: [],
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  loadSubscriptions: async (customerId: string) => {
    set({ isLoading: true, error: null });
    try {
      const subscriptions = await StripeService.getCustomerSubscriptions(customerId);
      set({ subscriptions, isLoading: false });
    } catch (error: any) {
      console.error('Failed to load subscriptions:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  createSubscription: async (customerId: string, priceId: string) => {
    set({ isLoading: true, error: null });
    try {
      const subscription = await StripeService.createSubscription(customerId, priceId);
      set(state => ({
        subscriptions: [...state.subscriptions, subscription],
        isLoading: false
      }));
      return subscription;
    } catch (error: any) {
      console.error('Failed to create subscription:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  cancelSubscription: async (subscriptionId: string) => {
    set({ isLoading: true, error: null });
    try {
      await StripeService.cancelSubscription(subscriptionId);
      set(state => ({
        subscriptions: state.subscriptions.filter(sub => sub.id !== subscriptionId),
        isLoading: false
      }));
    } catch (error: any) {
      console.error('Failed to cancel subscription:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  loadPaymentMethods: async (customerId: string) => {
    set({ isLoading: true, error: null });
    try {
      const paymentMethods = await StripeService.getPaymentMethods(customerId);
      set({ paymentMethods, isLoading: false });
    } catch (error: any) {
      console.error('Failed to load payment methods:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  loadPaymentHistory: async (customerId: string) => {
    set({ isLoading: true, error: null });
    try {
      // In a real implementation, you would fetch payment history from Stripe
      // For now, we'll use mock data
      const paymentHistory = [
        {
          id: 'pi_1234567890',
          amount: 999,
          currency: 'usd',
          status: 'succeeded',
          created: Date.now() / 1000 - 86400 * 30,
          description: 'Premium Monthly Subscription'
        }
      ];
      set({ paymentHistory, isLoading: false });
    } catch (error: any) {
      console.error('Failed to load payment history:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  createPaymentIntent: async (amount: number, currency: string = 'usd') => {
    set({ isLoading: true, error: null });
    try {
      const paymentIntent = await StripeService.createPaymentIntent(amount, currency);
      set({ isLoading: false });
      return paymentIntent;
    } catch (error: any) {
      console.error('Failed to create payment intent:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  }
}));