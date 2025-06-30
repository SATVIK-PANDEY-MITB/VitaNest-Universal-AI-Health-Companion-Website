import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Lock, 
  CheckCircle, 
  AlertCircle, 
  Loader, 
  Shield,
  Crown,
  Zap,
  Star
} from 'lucide-react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getStripe, StripeService } from '../../services/stripeService';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

interface PaymentFormProps {
  amount: number;
  currency?: string;
  description: string;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: string) => void;
  planType?: 'premium_monthly' | 'premium_annual' | 'one_time';
}

const CardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
      fontFamily: 'Inter, system-ui, sans-serif',
    },
    invalid: {
      color: '#9e2146',
    },
  },
  hidePostalCode: false,
};

const PaymentFormContent: React.FC<PaymentFormProps> = ({
  amount,
  currency = 'usd',
  description,
  onSuccess,
  onError,
  planType = 'one_time'
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const [paymentIntent, setPaymentIntent] = useState<any>(null);

  useEffect(() => {
    if (planType === 'one_time') {
      // Create payment intent for one-time payments
      StripeService.createPaymentIntent(amount, currency, {
        userId: user?.id,
        description
      }).then(setPaymentIntent).catch(error => {
        console.error('Payment intent creation failed:', error);
        onError(error.message);
      });
    }
  }, [amount, currency, description, user?.id, planType, onError]);

  const handleCardChange = (event: any) => {
    setCardComplete(event.complete);
    setCardError(event.error ? event.error.message : null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !user) {
      onError('Payment system not ready');
      return;
    }

    setIsProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      if (planType === 'one_time') {
        // Handle one-time payment
        if (!paymentIntent) {
          throw new Error('Payment intent not created');
        }

        const { error, paymentIntent: confirmedPaymentIntent } = await stripe.confirmCardPayment(
          paymentIntent.client_secret,
          {
            payment_method: {
              card: cardElement,
              billing_details: {
                name: user.name,
                email: user.email,
              },
            },
          }
        );

        if (error) {
          throw new Error(error.message || 'Payment failed');
        }

        if (confirmedPaymentIntent?.status === 'succeeded') {
          onSuccess(confirmedPaymentIntent);
          toast.success('Payment successful!');
        }
      } else {
        // Handle subscription
        // First create or get customer
        let customerId = user.stripeCustomerId;
        if (!customerId) {
          const customer = await StripeService.createCustomer(user.email, user.name, user.id);
          customerId = customer.id;
        }

        // Create setup intent for saving payment method
        const setupIntent = await StripeService.createSetupIntent(customerId);

        const { error, setupIntent: confirmedSetupIntent } = await stripe.confirmCardSetup(
          setupIntent.client_secret,
          {
            payment_method: {
              card: cardElement,
              billing_details: {
                name: user.name,
                email: user.email,
              },
            },
          }
        );

        if (error) {
          throw new Error(error.message || 'Payment method setup failed');
        }

        if (confirmedSetupIntent?.status === 'succeeded') {
          // Create subscription with the saved payment method
          const priceId = planType === 'premium_monthly' ? 'price_monthly' : 'price_annual';
          const subscription = await StripeService.createSubscription(customerId, priceId);
          
          onSuccess(subscription);
          toast.success('Subscription created successfully!');
        }
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      onError(error.message || 'Payment failed');
      toast.error(error.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 max-w-md mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-full p-3 w-16 h-16 mx-auto mb-4">
          <CreditCard className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Secure Payment</h2>
        <p className="text-gray-600 text-sm">{description}</p>
        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
          <p className="text-2xl font-bold text-blue-900">{formatAmount(amount)}</p>
          {planType !== 'one_time' && (
            <p className="text-sm text-blue-600">
              {planType === 'premium_monthly' ? 'per month' : 'per year'}
            </p>
          )}
        </div>
      </div>

      {/* Security Badges */}
      <div className="flex items-center justify-center space-x-4 mb-6 text-xs text-gray-500">
        <div className="flex items-center">
          <Shield className="w-3 h-3 mr-1 text-green-500" />
          <span>SSL Secured</span>
        </div>
        <div className="flex items-center">
          <Lock className="w-3 h-3 mr-1 text-blue-500" />
          <span>256-bit Encryption</span>
        </div>
        <div className="flex items-center">
          <CheckCircle className="w-3 h-3 mr-1 text-purple-500" />
          <span>PCI Compliant</span>
        </div>
      </div>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card Element */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Information
          </label>
          <div className={`p-4 border rounded-lg transition-all duration-200 ${
            cardError ? 'border-red-300 bg-red-50' : 
            cardComplete ? 'border-green-300 bg-green-50' : 
            'border-gray-300 bg-white'
          }`}>
            <CardElement
              options={CardElementOptions}
              onChange={handleCardChange}
            />
          </div>
          {cardError && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {cardError}
            </p>
          )}
          {cardComplete && !cardError && (
            <p className="mt-2 text-sm text-green-600 flex items-center">
              <CheckCircle className="w-4 h-4 mr-1" />
              Card information is valid
            </p>
          )}
        </div>

        {/* Plan Features (for subscriptions) */}
        {planType !== 'one_time' && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <Crown className="w-4 h-4 mr-2 text-yellow-500" />
              Premium Features Included
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <Star className="w-3 h-3 mr-2 text-yellow-500" />
                Unlimited AI consultations
              </li>
              <li className="flex items-center">
                <Star className="w-3 h-3 mr-2 text-yellow-500" />
                Advanced health analytics
              </li>
              <li className="flex items-center">
                <Star className="w-3 h-3 mr-2 text-yellow-500" />
                Priority customer support
              </li>
              <li className="flex items-center">
                <Star className="w-3 h-3 mr-2 text-yellow-500" />
                Personalized health videos
              </li>
              <li className="flex items-center">
                <Star className="w-3 h-3 mr-2 text-yellow-500" />
                Advanced voice synthesis
              </li>
            </ul>
          </div>
        )}

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={!stripe || !cardComplete || isProcessing}
          className={`w-full py-4 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
            !stripe || !cardComplete || isProcessing
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-gradient-to-r from-blue-500 to-green-500 text-white hover:from-blue-600 hover:to-green-600 shadow-lg hover:shadow-xl'
          }`}
        >
          {isProcessing ? (
            <>
              <Loader className="animate-spin w-5 h-5" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              <span>
                {planType === 'one_time' 
                  ? `Pay ${formatAmount(amount)}` 
                  : `Subscribe ${formatAmount(amount)}${planType === 'premium_monthly' ? '/mo' : '/yr'}`
                }
              </span>
            </>
          )}
        </motion.button>

        {/* Terms */}
        <p className="text-xs text-gray-500 text-center">
          By completing this payment, you agree to our{' '}
          <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
          {planType !== 'one_time' && ' You can cancel your subscription at any time.'}
        </p>
      </form>

      {/* Powered by Stripe */}
      <div className="mt-6 pt-4 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-400 flex items-center justify-center">
          <Shield className="w-3 h-3 mr-1" />
          Powered by Stripe - Industry-leading security
        </p>
      </div>
    </motion.div>
  );
};

export const PaymentForm: React.FC<PaymentFormProps> = (props) => {
  const stripePromise = getStripe();

  return (
    <Elements stripe={stripePromise}>
      <PaymentFormContent {...props} />
    </Elements>
  );
};