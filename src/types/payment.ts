export interface StripeCustomer {
  id: string;
  email: string;
  name: string;
  created: number;
  metadata: Record<string, string>;
}

export interface StripeSubscription {
  id: string;
  status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  customer: string;
  items: {
    data: Array<{
      id: string;
      price: {
        id: string;
        nickname: string;
        unit_amount: number;
        currency: string;
        recurring: {
          interval: 'month' | 'year';
          interval_count: number;
        };
      };
    }>;
  };
}

export interface StripePaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'requires_capture' | 'canceled' | 'succeeded';
  client_secret: string;
  metadata: Record<string, string>;
}

export interface StripePaymentMethod {
  id: string;
  type: 'card';
  card: {
    brand: 'visa' | 'mastercard' | 'amex' | 'discover' | 'diners' | 'jcb' | 'unionpay' | 'unknown';
    last4: string;
    exp_month: number;
    exp_year: number;
    funding: 'credit' | 'debit' | 'prepaid' | 'unknown';
  };
  billing_details: {
    name: string | null;
    email: string | null;
    phone: string | null;
    address: {
      city: string | null;
      country: string | null;
      line1: string | null;
      line2: string | null;
      postal_code: string | null;
      state: string | null;
    };
  };
}

export interface PaymentPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
  stripePriceId: string;
}

export interface PaymentTransaction {
  id: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed';
  created: number;
  description: string;
  payment_method_details?: {
    card?: {
      brand: string;
      last4: string;
    };
  };
  receipt_url?: string;
  invoice?: string;
}