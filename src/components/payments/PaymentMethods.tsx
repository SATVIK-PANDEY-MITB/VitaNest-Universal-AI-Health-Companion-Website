import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  Loader,
  Shield,
  Star,
  Edit3
} from 'lucide-react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getStripe, StripeService } from '../../services/stripeService';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

interface PaymentMethod {
  id: string;
  type: string;
  card: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  is_default?: boolean;
}

const AddPaymentMethodForm: React.FC<{
  onSuccess: () => void;
  onCancel: () => void;
}> = ({ onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  const handleCardChange = (event: any) => {
    setCardComplete(event.complete);
    setCardError(event.error ? event.error.message : null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !user) {
      return;
    }

    setIsProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Create or get customer
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await StripeService.createCustomer(user.email, user.name, user.id);
        customerId = customer.id;
      }

      // Create setup intent
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
        throw new Error(error.message || 'Failed to add payment method');
      }

      if (confirmedSetupIntent?.status === 'succeeded') {
        toast.success('Payment method added successfully!');
        onSuccess();
      }
    } catch (error: any) {
      console.error('Add payment method error:', error);
      toast.error(error.message || 'Failed to add payment method');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
    >
      <h3 className="text-lg font-bold text-gray-900 mb-4">Add Payment Method</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
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
              options={{
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
              }}
              onChange={handleCardChange}
            />
          </div>
          {cardError && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {cardError}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!stripe || !cardComplete || isProcessing}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
              !stripe || !cardComplete || isProcessing
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-gradient-to-r from-blue-500 to-green-500 text-white hover:from-blue-600 hover:to-green-600'
            }`}
          >
            {isProcessing ? (
              <>
                <Loader className="animate-spin w-4 h-4" />
                <span>Adding...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Add Card</span>
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export const PaymentMethods: React.FC = () => {
  const { user } = useAuthStore();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadPaymentMethods();
  }, [user]);

  const loadPaymentMethods = async () => {
    if (!user?.stripeCustomerId) {
      setIsLoading(false);
      return;
    }

    try {
      const methods = await StripeService.getPaymentMethods(user.stripeCustomerId);
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Failed to load payment methods:', error);
      toast.error('Failed to load payment methods');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSuccess = () => {
    setShowAddForm(false);
    loadPaymentMethods();
  };

  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    if (!confirm('Are you sure you want to remove this payment method?')) {
      return;
    }

    try {
      setIsProcessing(true);
      // In a real implementation, you would call Stripe API to detach the payment method
      toast.success('Payment method removed successfully');
      loadPaymentMethods();
    } catch (error: any) {
      console.error('Failed to remove payment method:', error);
      toast.error('Failed to remove payment method');
    } finally {
      setIsProcessing(false);
    }
  };

  const getCardBrandIcon = (brand: string) => {
    // In a real implementation, you would return appropriate card brand icons
    return <CreditCard className="w-6 h-6 text-gray-600" />;
  };

  const formatCardBrand = (brand: string) => {
    return brand.charAt(0).toUpperCase() + brand.slice(1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="animate-spin w-8 h-8 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-lg p-2">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Payment Methods</h2>
            <p className="text-gray-600 text-sm">Manage your saved payment methods</p>
          </div>
        </div>

        {!showAddForm && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-green-600 transition-all duration-200 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Card</span>
          </motion.button>
        )}
      </div>

      {/* Add Payment Method Form */}
      <AnimatePresence>
        {showAddForm && (
          <Elements stripe={getStripe()}>
            <AddPaymentMethodForm
              onSuccess={handleAddSuccess}
              onCancel={() => setShowAddForm(false)}
            />
          </Elements>
        )}
      </AnimatePresence>

      {/* Payment Methods List */}
      {paymentMethods.length === 0 && !showAddForm ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-white rounded-xl shadow-lg border border-gray-100"
        >
          <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Payment Methods</h3>
          <p className="text-gray-600 mb-4">Add a payment method to make purchases and manage subscriptions.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-green-600 transition-all duration-200"
          >
            Add Your First Card
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentMethods.map((method) => (
            <motion.div
              key={method.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 relative"
            >
              {method.is_default && (
                <div className="absolute top-3 right-3">
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full flex items-center">
                    <Star className="w-3 h-3 mr-1" />
                    Default
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getCardBrandIcon(method.card.brand)}
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {formatCardBrand(method.card.brand)} •••• {method.card.last4}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Expires {method.card.exp_month.toString().padStart(2, '0')}/{method.card.exp_year}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center text-sm text-gray-500">
                  <Shield className="w-4 h-4 mr-1 text-green-500" />
                  <span>Securely stored</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      // In a real implementation, you would allow editing
                      toast.info('Edit functionality coming soon');
                    }}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit payment method"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePaymentMethod(method.id)}
                    disabled={isProcessing}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Remove payment method"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Security Notice */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Your payment information is secure</h4>
            <p className="text-sm text-blue-700">
              We use industry-standard encryption and never store your full card details. 
              All payments are processed securely through Stripe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};