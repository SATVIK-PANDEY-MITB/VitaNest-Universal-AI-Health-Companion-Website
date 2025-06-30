import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  MessageCircle, 
  Pill, 
  Calendar, 
  User, 
  Settings, 
  Heart,
  LogOut,
  Crown,
  Menu,
  X,
  Sparkles,
  Shield,
  Zap,
  CreditCard
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const navigation = [
  { name: 'Dashboard', href: '/app/dashboard', icon: Home, color: 'from-blue-500 to-blue-600' },
  { name: 'AI Chatbot', href: '/app/chat', icon: MessageCircle, color: 'from-green-500 to-green-600' },
  { name: 'Medications', href: '/app/medications', icon: Pill, color: 'from-purple-500 to-purple-600' },
  { name: 'Appointments', href: '/app/appointments', icon: Calendar, color: 'from-orange-500 to-orange-600' },
  { name: 'Billing & Payments', href: '/app/billing', icon: CreditCard, color: 'from-pink-500 to-pink-600' },
  { name: 'Profile', href: '/app/profile', icon: User, color: 'from-indigo-500 to-indigo-600' },
  { name: 'Settings', href: '/app/settings', icon: Settings, color: 'from-gray-500 to-gray-600' },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, signOut } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white/95 backdrop-blur-lg">
      {/* Enhanced Logo */}
      <div className="flex items-center px-4 sm:px-6 py-6 sm:py-8 border-b border-gray-100">
        <div className="relative">
          <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-xl p-2 mr-3 flex-shrink-0 shadow-lg">
            <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-2">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">VitaNest</h1>
            <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
          </div>
          <p className="text-xs text-gray-500 truncate">AI Health Companion</p>
        </div>
        {/* Mobile Close Button */}
        <button
          onClick={closeMobileMenu}
          className="lg:hidden p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Enhanced User Info */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-white font-medium text-xs sm:text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name}
            </p>
            <div className="flex items-center space-x-1">
              {user?.subscription === 'premium' && (
                <Crown className="w-3 h-3 text-yellow-500 flex-shrink-0" />
              )}
              <Shield className="w-3 h-3 text-green-500 flex-shrink-0" />
              <p className="text-xs text-gray-500 capitalize truncate">
                {user?.subscription} Plan
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation */}
      <nav className="flex-1 px-3 sm:px-4 py-3 sm:py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg transform scale-105`
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:scale-102'
                }`
              }
            >
              <item.icon
                className={`mr-3 flex-shrink-0 h-4 w-4 sm:h-5 sm:w-5 transition-colors ${
                  isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'
                }`}
              />
              <span className="truncate">{item.name}</span>
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto w-2 h-2 bg-white rounded-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Enhanced Sign Out */}
      <div className="px-3 sm:px-4 py-3 sm:py-4 border-t border-gray-100">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            signOut();
            closeMobileMenu();
          }}
          className="group flex w-full items-center px-3 py-2.5 text-sm font-medium text-gray-700 rounded-xl hover:bg-red-50 hover:text-red-700 transition-all duration-200"
        >
          <LogOut className="mr-3 flex-shrink-0 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-red-500" />
          <span className="truncate">Sign Out</span>
        </motion.button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200"
      >
        <Menu className="w-5 h-5 text-gray-600" />
      </motion.button>

      {/* Desktop Sidebar */}
      <motion.div
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
        className="hidden lg:block fixed left-0 top-0 h-full w-64 bg-white/95 backdrop-blur-lg border-r border-gray-200/50 shadow-xl z-40"
      >
        <SidebarContent />
      </motion.div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileMenu}
              className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            
            {/* Mobile Sidebar */}
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden fixed left-0 top-0 h-full w-64 bg-white/95 backdrop-blur-lg border-r border-gray-200/50 shadow-xl z-50"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};