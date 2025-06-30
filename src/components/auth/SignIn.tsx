import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, Heart, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface SignInForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface SignInProps {
  onToggleMode: () => void;
}

export const SignIn: React.FC<SignInProps> = ({ onToggleMode }) => {
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, watch, setError, clearErrors, setValue } = useForm<SignInForm>();

  const email = watch('email');
  const password = watch('password');

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => password && password.length >= 6;

  const onSubmit = async (data: SignInForm) => {
    if (!data.email?.trim() || !data.password?.trim()) {
      toast.error('Please enter both email and password');
      return;
    }

    clearErrors();
    clearError();

    if (!validateEmail(data.email)) {
      setError('email', { message: 'Please enter a valid email address' });
      return;
    }

    if (!validatePassword(data.password)) {
      setError('password', { message: 'Password must be at least 6 characters' });
      return;
    }

    try {
      await signIn(data.email.trim(), data.password);
      toast.success('🎉 Welcome back to VitaNest!');
      navigate('/app/dashboard');
    } catch (error: any) {
      if (error.message?.includes('Invalid login credentials') || error.message?.includes('Invalid email or password')) {
        setError('password', { message: 'Invalid email or password' });
        toast.error('Invalid email or password. Please check your credentials.');
      } else if (error.message?.includes('Email not confirmed')) {
        setError('email', { message: 'Please verify your email address before signing in' });
        toast.error('Please verify your email address before signing in.');
      } else if (error.message?.includes('Too many requests')) {
        setError('email', { message: 'Too many requests. Please try again later.' });
        toast.error('Too many requests. Please try again later.');
      } else {
        toast.error('Sign in failed. Please try again.');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-full p-3 shadow-lg">
              <Heart className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your VitaNest account</p>
          <div className="flex items-center justify-center mt-3 text-sm text-green-600">
            <Shield className="w-4 h-4 mr-1" />
            <span>Enterprise-grade security</span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
                    message: 'Please enter a valid email address'
                  }
                })}
                type="email"
                autoComplete="email"
                className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 ${
                  errors.email 
                    ? 'border-red-300 focus:ring-red-500' 
                    : email && validateEmail(email)
                    ? 'border-green-300 focus:ring-green-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Enter your email"
              />
              {email && validateEmail(email) && !errors.email && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
              )}
            </div>
            {errors.email && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1 text-sm text-red-600 flex items-center"
              >
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.email.message}
              </motion.p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 ${
                  errors.password 
                    ? 'border-red-300 focus:ring-red-500' 
                    : password && validatePassword(password)
                    ? 'border-green-300 focus:ring-green-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1 text-sm text-red-600 flex items-center"
              >
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.password.message}
              </motion.p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                {...register('rememberMe')}
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-600">Remember me for 30 days</span>
            </label>
            <button
              type="button"
              className="text-sm text-blue-600 hover:text-blue-500 transition-colors font-medium"
            >
              Forgot password?
            </button>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={!isLoading ? { scale: 1.02 } : {}}
            whileTap={!isLoading ? { scale: 0.98 } : {}}
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-gradient-to-r from-blue-500 to-green-500 text-white hover:from-blue-600 hover:to-green-600 focus:ring-blue-500'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Signing in...
              </div>
            ) : (
              'Sign In Securely'
            )}
          </motion.button>
        </form>

        {/* Separator */}
        <div className="my-8 flex items-center">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-4 text-sm text-gray-400">
            New to VitaNest?
          </span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        {/* Toggle to Sign Up */}
        <button
          onClick={onToggleMode}
          className="w-full py-3 px-4 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
        >
          Create a New Account
        </button>
      </div>
    </motion.div>
  );
};