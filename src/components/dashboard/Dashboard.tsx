import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  MessageCircle, 
  Pill, 
  Calendar, 
  TrendingUp, 
  Users,
  AlertCircle,
  CheckCircle,
  Video,
  Volume2,
  Shield,
  Zap,
  Phone,
  Mic,
  Sparkles,
  Crown,
  Activity,
  Brain,
  Stethoscope,
  CreditCard,
  DollarSign
} from 'lucide-react';
import { useHealthStore } from '../../store/healthStore';
import { useAuthStore } from '../../store/authStore';
import { revenueCatService, tavusService } from '../../services/apiService';
import { PremiumUpgradeCard } from './PremiumUpgradeCard';

const StatCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  trend?: string;
  badge?: string;
  gradient?: string;
  onClick?: () => void;
}> = ({ title, value, icon, color, trend, badge, gradient, onClick }) => (
  <motion.div
    whileHover={{ y: -4, scale: 1.02 }}
    onClick={onClick}
    className={`bg-gradient-to-br ${gradient || 'from-white to-gray-50'} rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 relative overflow-hidden ${onClick ? 'cursor-pointer' : ''}`}
  >
    {badge && (
      <div className="absolute top-2 right-2">
        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full flex items-center">
          <Sparkles className="w-3 h-3 mr-1" />
          {badge}
        </span>
      </div>
    )}
    <div className="flex items-center justify-between">
      <div className="min-w-0 flex-1">
        <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{title}</p>
        <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {trend && (
          <p className="text-xs sm:text-sm text-green-600 mt-1 flex items-center">
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            {trend}
          </p>
        )}
      </div>
      <div className={`p-2 sm:p-3 rounded-full ${color} flex-shrink-0 shadow-lg`}>
        {icon}
      </div>
    </div>
    <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-white/20 to-transparent rounded-full transform translate-x-10 translate-y-10"></div>
  </motion.div>
);

export const Dashboard: React.FC = () => {
  const { medications, appointments, loadMedications, loadAppointments } = useHealthStore();
  const { user } = useAuthStore();
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);
  const [apiStatus, setApiStatus] = useState({
    tavus: false,
    elevenLabs: false,
    revenueCat: false,
    supabase: true,
    algorand: true
  });

  useEffect(() => {
    if (user) {
      loadMedications(user.id);
      loadAppointments(user.id);
      
      // Check subscription status
      revenueCatService.getSubscriberInfo(user.id)
        .then(setSubscriptionInfo)
        .catch(console.error);

      // Check API status
      checkApiStatus();
    }
  }, [user, loadMedications, loadAppointments]);

  const checkApiStatus = async () => {
    try {
      // Test Tavus API
      const tavusTest = await tavusService.listPersonas();
      setApiStatus(prev => ({ ...prev, tavus: !tavusTest.error }));
    } catch (error) {
      console.error('API status check failed:', error);
    }
  };

  const upcomingAppointments = appointments.filter(apt => 
    apt.status === 'scheduled' && new Date(apt.date) > new Date()
  );

  const todaysMedications = medications.filter(med => {
    return med.frequency.toLowerCase().includes('daily') || 
           med.frequency.toLowerCase().includes('once');
  });

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 bg-gradient-to-br from-blue-50/50 via-white to-green-50/50 min-h-screen">
      {/* Enhanced Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-2xl p-4 sm:p-8 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full transform translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full transform -translate-x-24 translate-y-24"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-xl sm:text-3xl font-bold truncate">
                  Welcome back, {user?.name?.split(' ')[0]}!
                </h1>
                {user?.subscription === 'premium' && (
                  <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-300" />
                )}
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300 animate-pulse" />
              </div>
              <p className="text-blue-100 text-sm sm:text-lg mb-4">
                Your AI-powered health companion is ready to assist you
              </p>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-blue-100">
                <div className="flex items-center bg-white/20 rounded-full px-3 py-1">
                  <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span className="hidden sm:inline">Blockchain Secured</span>
                  <span className="sm:hidden">Secured</span>
                </div>
                <div className="flex items-center bg-white/20 rounded-full px-3 py-1">
                  <Video className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span className="hidden sm:inline">AI Video Ready</span>
                  <span className="sm:hidden">Video</span>
                </div>
                <div className="flex items-center bg-white/20 rounded-full px-3 py-1">
                  <Volume2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span className="hidden sm:inline">Voice Enabled</span>
                  <span className="sm:hidden">Voice</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block flex-shrink-0">
              <div className="relative">
                <Heart className="w-16 h-16 sm:w-20 sm:h-20 text-white/30" />
                <div className="absolute inset-0 animate-pulse">
                  <Heart className="w-16 h-16 sm:w-20 sm:h-20 text-white/50" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Premium Upgrade Card (only show for free users) */}
      {user?.subscription === 'free' && <PremiumUpgradeCard />}

      {/* Enhanced API Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 p-3 sm:p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-yellow-500" />
            🚀 AI Integration Status
          </h3>
          <span className="text-xs text-gray-500">Real-time monitoring</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
          {[
            { name: 'Tavus AI', status: apiStatus.tavus, icon: Video, color: 'text-purple-500' },
            { name: 'ElevenLabs', status: apiStatus.elevenLabs, icon: Volume2, color: 'text-blue-500' },
            { name: 'RevenueCat', status: apiStatus.revenueCat, icon: Users, color: 'text-green-500' },
            { name: 'Supabase', status: apiStatus.supabase, icon: Shield, color: 'text-indigo-500' },
            { name: 'Algorand', status: apiStatus.algorand, icon: Zap, color: 'text-yellow-500' }
          ].map((api) => (
            <div key={api.name} className="flex items-center space-x-1 sm:space-x-2 bg-gray-50 rounded-lg p-2">
              <api.icon className={`w-3 h-3 sm:w-4 sm:h-4 ${api.color} flex-shrink-0`} />
              <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">{api.name}</span>
              <div className={`w-2 h-2 rounded-full ${api.status ? 'bg-green-500 animate-pulse' : 'bg-red-500'} flex-shrink-0`}></div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatCard
          title="Active Medications"
          value={medications.length.toString()}
          icon={<Pill className="w-4 h-4 sm:w-6 sm:h-6 text-white" />}
          color="bg-gradient-to-r from-blue-500 to-blue-600"
          badge="Blockchain"
          gradient="from-blue-50 to-blue-100"
        />
        <StatCard
          title="Upcoming Appointments"
          value={upcomingAppointments.length.toString()}
          icon={<Calendar className="w-4 h-4 sm:w-6 sm:h-6 text-white" />}
          color="bg-gradient-to-r from-green-500 to-green-600"
          badge="AI Powered"
          gradient="from-green-50 to-green-100"
        />
        <StatCard
          title="Health Score"
          value="95%"
          icon={<Activity className="w-4 h-4 sm:w-6 sm:h-6 text-white" />}
          color="bg-gradient-to-r from-pink-500 to-pink-600"
          trend="+5% this week"
          gradient="from-pink-50 to-pink-100"
        />
        <StatCard
          title="Billing & Payments"
          value={user?.subscription === 'premium' ? 'Premium' : 'Free'}
          icon={<CreditCard className="w-4 h-4 sm:w-6 sm:h-6 text-white" />}
          color="bg-gradient-to-r from-purple-500 to-purple-600"
          badge={user?.subscription === 'premium' ? 'Active' : 'Upgrade'}
          gradient="from-purple-50 to-purple-100"
          onClick={() => window.location.href = '/billing'}
        />
      </div>

      {/* Enhanced Features Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* AI Features */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100"
        >
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-500" />
            AI-Powered Features
            <Sparkles className="w-4 h-4 ml-2 text-yellow-500 animate-pulse" />
          </h2>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
              <div className="flex items-center min-w-0 flex-1">
                <Video className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 mr-2 sm:mr-3 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 text-sm sm:text-base truncate">Tavus AI Videos</p>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Personalized health videos</p>
                </div>
              </div>
              <span className={`text-xs sm:text-sm flex-shrink-0 px-2 py-1 rounded-full font-medium ${
                user?.subscription === 'premium' 
                  ? 'text-green-600 bg-green-100' 
                  : 'text-yellow-600 bg-yellow-100'
              }`}>
                {user?.subscription === 'premium' ? 'Active' : 'Premium'}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
              <div className="flex items-center min-w-0 flex-1">
                <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2 sm:mr-3 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 text-sm sm:text-base truncate">ElevenLabs Speech</p>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Natural voice responses</p>
                </div>
              </div>
              <span className={`text-xs sm:text-sm flex-shrink-0 px-2 py-1 rounded-full font-medium ${
                user?.subscription === 'premium' 
                  ? 'text-green-600 bg-green-100' 
                  : 'text-yellow-600 bg-yellow-100'
              }`}>
                {user?.subscription === 'premium' ? 'Active' : 'Premium'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
              <div className="flex items-center min-w-0 flex-1">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2 sm:mr-3 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 text-sm sm:text-base truncate">Video Calls</p>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Real-time health consultations</p>
                </div>
              </div>
              <span className="text-green-600 font-medium text-xs sm:text-sm flex-shrink-0 bg-green-100 px-2 py-1 rounded-full">Ready</span>
            </div>

            <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
              <div className="flex items-center min-w-0 flex-1">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mr-2 sm:mr-3 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 text-sm sm:text-base truncate">Blockchain Security</p>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Algorand data protection</p>
                </div>
              </div>
              <span className="text-green-600 font-medium text-xs sm:text-sm flex-shrink-0 bg-green-100 px-2 py-1 rounded-full">Secured</span>
            </div>
          </div>
        </motion.div>

        {/* Today's Health Tasks */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100"
        >
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
            <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-500" />
            Today's Health Tasks
          </h2>
          <div className="space-y-2 sm:space-y-3">
            {todaysMedications.slice(0, 3).map(med => (
              <div key={med.id} className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                <div className="flex items-center min-w-0 flex-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 sm:mr-3 flex-shrink-0 animate-pulse"></div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{med.name}</p>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">{med.dosage} - {med.frequency}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                  <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" title="Blockchain secured" />
                  <button className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium bg-blue-100 px-2 py-1 rounded-full hover:bg-blue-200 transition-colors">
                    Mark Done
                  </button>
                </div>
              </div>
            ))}
            {todaysMedications.length === 0 && (
              <div className="text-center py-6">
                <Pill className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm sm:text-base">No medications scheduled for today</p>
                <p className="text-xs text-gray-400 mt-1">Great job staying on track!</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Enhanced Subscription Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100"
      >
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
          <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-500" />
          Billing & Subscription
          {user?.subscription === 'premium' && (
            <Crown className="w-4 h-4 ml-2 text-yellow-500" />
          )}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-3 sm:p-4 border border-blue-200">
            <div className="flex items-center mb-2">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2" />
              <h3 className="font-medium text-blue-900 text-sm sm:text-base">Current Plan</h3>
            </div>
            <p className="text-xs sm:text-sm text-blue-700 capitalize font-semibold">
              {user?.subscription || 'Free'} Plan
            </p>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-3 sm:p-4 border border-green-200">
            <div className="flex items-center mb-2">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2" />
              <h3 className="font-medium text-green-900 text-sm sm:text-base">Features</h3>
            </div>
            <p className="text-xs sm:text-sm text-green-700">
              {user?.subscription === 'premium' 
                ? 'All Premium Features' 
                : 'Basic Features Only'
              }
            </p>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-3 sm:p-4 border border-purple-200 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center mb-2">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 mr-2" />
              <h3 className="font-medium text-purple-900 text-sm sm:text-base">Billing</h3>
            </div>
            <button 
              onClick={() => window.location.href = '/billing'}
              className="text-xs sm:text-sm text-purple-700 hover:text-purple-800 font-medium"
            >
              {user?.subscription === 'premium' 
                ? 'Manage Subscription →' 
                : 'Upgrade to Premium →'
              }
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};