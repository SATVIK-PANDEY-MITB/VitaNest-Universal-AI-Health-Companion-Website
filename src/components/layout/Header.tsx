import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Search, Menu, Sparkles, Crown } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const Header: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <motion.header
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 right-0 left-0 lg:left-64 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-lg z-30"
    >
      <div className="px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Mobile Menu Button */}
          <button className="lg:hidden p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100">
            <Menu className="w-5 h-5" />
          </button>

          {/* Enhanced Search Bar */}
          <div className="flex-1 max-w-md mx-2 sm:mx-4 lg:mx-0">
            <div className="relative">
              <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search health information..."
                className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base bg-white/90 backdrop-blur-sm shadow-sm"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Enhanced Notification Bell */}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
            >
              <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="absolute top-0 right-0 h-2 w-2 sm:h-2.5 sm:w-2.5 bg-red-500 rounded-full animate-pulse"></span>
            </motion.button>

            {/* Enhanced User Profile */}
            <div className="flex items-center space-x-2 sm:space-x-3 pl-2 sm:pl-4 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <div className="flex items-center space-x-1">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-32">{user?.name}</p>
                  {user?.subscription === 'premium' && (
                    <Crown className="w-3 h-3 text-yellow-500" />
                  )}
                  <Sparkles className="w-3 h-3 text-blue-500 animate-pulse" />
                </div>
                <p className="text-xs text-gray-500 truncate max-w-32 capitalize">{user?.subscription} Plan</p>
              </div>
              <div className="relative">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="text-white font-medium text-xs sm:text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};