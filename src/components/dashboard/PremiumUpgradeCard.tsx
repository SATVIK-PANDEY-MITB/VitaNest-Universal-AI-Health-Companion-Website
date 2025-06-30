import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Crown, 
  Star, 
  Zap, 
  ArrowRight, 
  X,
  Video,
  Volume2,
  Shield,
  Sparkles
} from 'lucide-react';
import { SubscriptionManager } from '../payments/SubscriptionManager';
import { useAuthStore } from '../../store/authStore';

export const PremiumUpgradeCard: React.FC = () => {
  const { user } = useAuthStore();
  const [showSubscriptionManager, setShowSubscriptionManager] = useState(false);

  // Don't show if user is already premium
  if (user?.subscription === 'premium') {
    return null;
  }

  const premiumFeatures = [
    {
      icon: Video,
      title: 'AI Video Generation',
      description: 'Personalized health videos with Tavus AI'
    },
    {
      icon: Volume2,
      title: 'Voice Synthesis',
      description: 'Natural voice responses with ElevenLabs'
    },
    {
      icon: Zap,
      title: 'Unlimited AI Chats',
      description: 'No limits on health consultations'
    },
    {
      icon: Shield,
      title: 'Advanced Security',
      description: 'Enhanced blockchain data protection'
    }
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        className="bg-gradient-to-br from-blue-500 via-purple-500 to-green-500 rounded-xl p-6 text-white relative overflow-hidden"
      >
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full transform -translate-x-12 translate-y-12"></div>
        
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Crown className="w-6 h-6 text-yellow-300" />
              <h3 className="text-xl font-bold">Upgrade to Premium</h3>
              <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {premiumFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-2"
              >
                <feature.icon className="w-4 h-4 text-yellow-300 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">{feature.title}</p>
                  <p className="text-xs text-white/80">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pricing */}
          <div className="mb-6">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold">$9.99</span>
              <span className="text-white/80">/month</span>
            </div>
            <p className="text-sm text-white/80">or $99.99/year (save 16%)</p>
          </div>

          {/* CTA Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowSubscriptionManager(true)}
            className="w-full bg-white text-purple-600 py-3 px-4 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
          >
            <span>Upgrade Now</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>

          {/* Trust indicators */}
          <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-white/70">
            <div className="flex items-center">
              <Shield className="w-3 h-3 mr-1" />
              <span>Secure</span>
            </div>
            <div className="flex items-center">
              <Star className="w-3 h-3 mr-1" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Subscription Manager Modal */}
      {showSubscriptionManager && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowSubscriptionManager(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <SubscriptionManager onClose={() => setShowSubscriptionManager(false)} />
          </div>
        </motion.div>
      )}
    </>
  );
};