import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Receipt, 
  Settings as SettingsIcon,
  Crown,
  Plus,
  ArrowRight,
  Shield,
  Star,
  CheckCircle,
  Zap,
  Video,
  Volume2,
  Users,
  DollarSign
} from 'lucide-react';
import { SubscriptionManager } from '../payments/SubscriptionManager';
import { PaymentMethods } from '../payments/PaymentMethods';
import { PaymentHistory } from '../payments/PaymentHistory';
import { useAuthStore } from '../../store/authStore';

export const BillingSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'subscription' | 'methods' | 'history'>('subscription');
  const { user } = useAuthStore();

  const tabs = [
    {
      id: 'subscription',
      label: 'Subscription',
      icon: Crown,
      description: 'Manage your subscription plan'
    },
    {
      id: 'methods',
      label: 'Payment Methods',
      icon: CreditCard,
      description: 'Manage saved payment methods'
    },
    {
      id: 'history',
      label: 'Payment History',
      icon: Receipt,
      description: 'View past payments and receipts'
    }
  ];

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 bg-gradient-to-br from-blue-50/50 via-white to-green-50/50 min-h-screen">
      {/* Enhanced Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-full p-3 shadow-lg">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center">
          Billing & Payments
          {user?.subscription === 'premium' && (
            <Crown className="w-6 h-6 ml-2 text-yellow-500" />
          )}
        </h1>
        <p className="text-gray-600">Manage your subscription, payment methods, and billing history</p>
        
        {/* Current Plan Status */}
        <div className="mt-6 inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-gray-200">
          {user?.subscription === 'premium' ? (
            <>
              <Crown className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-medium text-gray-900">Premium Plan Active</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </>
          ) : (
            <>
              <Users className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-900">Free Plan</span>
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            </>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 p-2">
          <nav className="flex space-x-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`group flex-1 inline-flex items-center justify-center py-4 px-6 font-medium text-sm rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <tab.icon className={`mr-2 h-5 w-5 ${
                  activeTab === tab.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'
                }`} />
                <div className="text-left">
                  <div className="font-medium">{tab.label}</div>
                  <div className={`text-xs ${
                    activeTab === tab.id ? 'text-white/80' : 'text-gray-400'
                  }`}>
                    {tab.description}
                  </div>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'subscription' && (
          <div className="space-y-6">
            {/* Premium Features Showcase */}
            <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-16 -translate-y-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full transform -translate-x-12 translate-y-12"></div>
              
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <Crown className="w-6 h-6 mr-2 text-yellow-300" />
                  Premium Features
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { icon: Video, title: 'AI Video Generation', desc: 'Personalized health videos' },
                    { icon: Volume2, title: 'Voice Synthesis', desc: 'Natural voice responses' },
                    { icon: Zap, title: 'Unlimited AI Chats', desc: 'No conversation limits' },
                    { icon: Shield, title: 'Advanced Security', desc: 'Enhanced data protection' }
                  ].map((feature, index) => (
                    <div key={index} className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                      <feature.icon className="w-6 h-6 text-yellow-300 mb-2" />
                      <h3 className="font-medium text-sm">{feature.title}</h3>
                      <p className="text-xs text-white/80">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <SubscriptionManager />
          </div>
        )}
        {activeTab === 'methods' && <PaymentMethods />}
        {activeTab === 'history' && <PaymentHistory />}
      </motion.div>

      {/* Security & Trust Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-green-500" />
          Security & Trust
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span>256-bit SSL encryption</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span>PCI DSS compliant</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span>Cancel anytime</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span>30-day money back</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span>HIPAA compliant</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span>Powered by Stripe</span>
          </div>
        </div>
      </div>

      {/* Support Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Need Help?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <h4 className="font-medium text-gray-900 mb-2">Billing Support</h4>
            <p className="text-sm text-gray-600 mb-3">Get help with payments, subscriptions, and billing questions</p>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Contact Support →
            </button>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <h4 className="font-medium text-gray-900 mb-2">Billing FAQ</h4>
            <p className="text-sm text-gray-600 mb-3">Find answers to common billing and subscription questions</p>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View FAQ →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};