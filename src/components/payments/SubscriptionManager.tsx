import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Crown, 
  CreditCard, 
  Calendar, 
  DollarSign, 
  Settings, 
  AlertCircle, 
  CheckCircle,
  Loader,
  Star,
  Zap,
  Shield,
  X,
  Plus,
  Video,
  Volume2,
  Users,
  Sparkles
} from 'lucide-react';
import { StripeService, Subscription } from '../../services/stripeService';
import { PaymentForm } from './PaymentForm';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

interface SubscriptionManagerProps {
  onClose?: () => void;
}

export const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ onClose }) => {
  const { user, updateUser } = useAuthStore();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'premium_monthly' | 'premium_annual' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const plans = [
    {
      id: 'premium_monthly',
      name: 'Premium Monthly',
      price: 9.99,
      interval: 'month',
      description: 'Perfect for trying out premium features',
      features: [
        'Unlimited AI consultations',
        'Advanced health analytics',
        'Priority support',
        'Personalized health videos',
        'Advanced voice synthesis',
        'Blockchain data security',
        'Video call consultations',
        'Custom health reports'
      ],
      popular: false,
      savings: null
    },
    {
      id: 'premium_annual',
      name: 'Premium Annual',
      price: 99.99,
      interval: 'year',
      description: 'Best value - 2 months free!',
      features: [
        'Everything in Monthly',
        '2 months free (16% savings)',
        'Exclusive annual features',
        'Priority feature requests',
        'Advanced health insights',
        'Dedicated account manager',
        'Early access to new features',
        'Premium customer support'
      ],
      popular: true,
      savings: '16% off'
    }
  ];

  useEffect(() => {
    loadSubscriptions();
  }, [user]);

  const loadSubscriptions = async () => {
    if (!user?.stripeCustomerId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const subs = await StripeService.getCustomerSubscriptions(user.stripeCustomerId);
      setSubscriptions(subs);
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
      toast.error('Failed to load subscription information');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlanSelect = (planId: 'premium_monthly' | 'premium_annual') => {
    setSelectedPlan(planId);
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = async (paymentResult: any) => {
    try {
      setIsProcessing(true);
      
      // Update user subscription status
      await updateUser({
        subscription: 'premium'
      });

      // Reload subscriptions
      await loadSubscriptions();

      setShowPaymentForm(false);
      setSelectedPlan(null);
      toast.success('🎉 Welcome to Premium! Your subscription is now active.');
    } catch (error) {
      console.error('Failed to update subscription status:', error);
      toast.error('Subscription created but failed to update account. Please contact support.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentError = (error: string) => {
    toast.error(error);
    setShowPaymentForm(false);
    setSelectedPlan(null);
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
      return;
    }

    try {
      setIsProcessing(true);
      await StripeService.cancelSubscription(subscriptionId);
      
      // Update user subscription status
      await updateUser({
        subscription: 'free'
      });

      await loadSubscriptions();
      toast.success('Subscription cancelled successfully');
    } catch (error: any) {
      console.error('Failed to cancel subscription:', error);
      toast.error(error.message || 'Failed to cancel subscription');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const activeSubscription = subscriptions.find(sub => sub.status === 'active');

  if (showPaymentForm && selectedPlan) {
    const plan = plans.find(p => p.id === selectedPlan);
    if (!plan) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <div className="relative">
          <button
            onClick={() => setShowPaymentForm(false)}
            className="absolute -top-4 -right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors z-10"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
          
          <PaymentForm
            amount={plan.price}
            currency="usd"
            description={`${plan.name} Subscription`}
            planType={selectedPlan}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Current Subscription Status */}
      {activeSubscription ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-full p-3">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  Premium Active
                  <CheckCircle className="w-5 h-5 text-green-500 ml-2" />
                  <Sparkles className="w-4 h-4 text-yellow-500 ml-1 animate-pulse" />
                </h3>
                <p className="text-gray-600">
                  Next billing: {formatDate(activeSubscription.current_period_end)}
                </p>
                <p className="text-sm text-gray-500">
                  {formatPrice(activeSubscription.plan.amount / 100)} / {activeSubscription.plan.interval}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleCancelSubscription(activeSubscription.id)}
                disabled={isProcessing}
                className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Cancel Subscription'}
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 rounded-xl p-6 border border-yellow-200"
        >
          <div className="flex items-center">
            <AlertCircle className="w-6 h-6 text-yellow-500 mr-3" />
            <div>
              <h3 className="text-lg font-bold text-gray-900">Free Plan Active</h3>
              <p className="text-gray-600">Upgrade to Premium to unlock advanced AI features and unlimited access</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Available Plans */}
      {!activeSubscription && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Choose Your Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <motion.div
                key={plan.id}
                whileHover={{ y: -4, scale: 1.02 }}
                className={`relative bg-white rounded-xl shadow-lg border p-6 ${
                  plan.popular ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-20' : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </span>
                  </div>
                )}

                {plan.savings && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                      {plan.savings}
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-2">
                    <span className="text-3xl font-bold text-gray-900">{formatPrice(plan.price)}</span>
                    <span className="text-gray-600">/{plan.interval}</span>
                  </div>
                  <p className="text-gray-600 text-sm">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePlanSelect(plan.id as 'premium_monthly' | 'premium_annual')}
                  disabled={isProcessing}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white hover:from-blue-600 hover:to-green-600 shadow-lg'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  } disabled:opacity-50`}
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center">
                      <Loader className="animate-spin w-4 h-4 mr-2" />
                      Processing...
                    </div>
                  ) : (
                    `Choose ${plan.name}`
                  )}
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Feature Comparison */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">What's Included</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Video, title: 'AI Video Generation', desc: 'Personalized health videos with Tavus AI' },
            { icon: Volume2, title: 'Voice Synthesis', desc: 'Natural voice responses with ElevenLabs' },
            { icon: Zap, title: 'Unlimited AI Chats', desc: 'No limits on health consultations' },
            { icon: Shield, title: 'Advanced Security', desc: 'Enhanced blockchain data protection' }
          ].map((feature, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
              <feature.icon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900 mb-1">{feature.title}</h4>
              <p className="text-xs text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Security & Trust */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-green-500" />
          Secure & Trusted
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
            <span>256-bit SSL encryption</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
            <span>PCI DSS compliant</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
            <span>Cancel anytime</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
            <span>30-day money back</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
            <span>HIPAA compliant</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
            <span>Powered by Stripe</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};