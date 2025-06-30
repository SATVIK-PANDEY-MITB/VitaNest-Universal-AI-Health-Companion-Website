import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Phone, MapPin, Edit3, Save, Camera, Crown, Sparkles, Shield, CheckCircle, AlertCircle, RefreshCw, Loader, Database } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { SupabaseService } from '../../services/supabaseService';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

interface ProfileForm {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  bloodType?: string;
  allergies?: string;
  conditions?: string;
}

export const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [saveProgress, setSaveProgress] = useState<string>('');
  const [dbStatus, setDbStatus] = useState<any[]>([]);
  const [showDbStatus, setShowDbStatus] = useState(false);
  const { user, updateUser, refreshUser, testDatabaseConnection } = useAuthStore();
  
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<ProfileForm>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      age: user?.healthProfile?.age || undefined,
      gender: user?.healthProfile?.gender || '',
      height: user?.healthProfile?.height || undefined,
      weight: user?.healthProfile?.weight || undefined,
      bloodType: user?.healthProfile?.bloodType || '',
      allergies: user?.healthProfile?.allergies?.join(', ') || '',
      conditions: user?.healthProfile?.conditions?.join(', ') || ''
    }
  });

  // Reset form when user data changes
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
        age: user.healthProfile?.age || undefined,
        gender: user.healthProfile?.gender || '',
        height: user.healthProfile?.height || undefined,
        weight: user.healthProfile?.weight || undefined,
        bloodType: user.healthProfile?.bloodType || '',
        allergies: user.healthProfile?.allergies?.join(', ') || '',
        conditions: user.healthProfile?.conditions?.join(', ') || ''
      });
    }
  }, [user, reset]);

  const handleTestDatabase = async () => {
    setIsRefreshing(true);
    try {
      const results = await testDatabaseConnection();
      setDbStatus(results);
      setShowDbStatus(true);
      
      const failedTables = results.filter(r => r.status === 'error');
      if (failedTables.length === 0) {
        toast.success('✅ All database tables are working correctly!');
      } else {
        toast.error(`❌ ${failedTables.length} database table(s) have issues`);
      }
    } catch (error) {
      toast.error('Failed to test database connection');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshUser();
      toast.success('Profile data refreshed!');
    } catch (error) {
      toast.error('Failed to refresh profile data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const onSubmit = async (data: ProfileForm) => {
    if (!user) {
      toast.error('No user found. Please sign in again.');
      return;
    }

    setIsSaving(true);
    setSaveProgress('Preparing data...');
    
    try {
      console.log('🔄 Starting profile update process...');
      
      // Step 1: Validate all data first
      setSaveProgress('Validating data...');
      
      if (!data.name?.trim()) {
        throw new Error('Name is required');
      }
      
      if (!data.email?.trim()) {
        throw new Error('Email is required');
      }
      
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      if (!emailRegex.test(data.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Step 2: Update user basic info if changed
      setSaveProgress('Updating basic information...');
      
      if (data.name.trim() !== user.name || data.email.trim() !== user.email) {
        console.log('👤 Updating user basic info...');
        
        try {
          await SupabaseService.updateUserProfile(user.id, {
            name: data.name.trim(),
            email: data.email.trim()
          });
          console.log('✅ User basic info updated successfully');
        } catch (basicInfoError: any) {
          console.error('❌ Basic info update failed:', basicInfoError);
          throw new Error(`Failed to update basic information: ${basicInfoError.message}`);
        }
      }

      // Step 3: Prepare health profile data
      setSaveProgress('Preparing health data...');
      
      const healthProfileData = {
        age: data.age && !isNaN(Number(data.age)) ? Number(data.age) : null,
        gender: data.gender?.trim() || null,
        height: data.height && !isNaN(Number(data.height)) ? Number(data.height) : null,
        weight: data.weight && !isNaN(Number(data.weight)) ? Number(data.weight) : null,
        blood_type: data.bloodType?.trim() || null,
        allergies: data.allergies 
          ? data.allergies.split(',').map(item => item.trim()).filter(Boolean) 
          : [],
        conditions: data.conditions 
          ? data.conditions.split(',').map(item => item.trim()).filter(Boolean) 
          : []
      };

      console.log('📝 Health profile data prepared:', healthProfileData);

      // Step 4: Update health profile
      setSaveProgress('Updating health profile...');
      
      try {
        await SupabaseService.updateHealthProfile(user.id, healthProfileData);
        console.log('✅ Health profile updated successfully');
      } catch (healthError: any) {
        console.error('❌ Health profile update failed:', healthError);
        throw new Error(`Failed to update health profile: ${healthError.message}`);
      }

      // Step 5: Update local state
      setSaveProgress('Updating local data...');
      
      const updatedUser = {
        ...user,
        name: data.name.trim(),
        email: data.email.trim(),
        healthProfile: {
          ...(user.healthProfile || {}),
          age: healthProfileData.age,
          gender: healthProfileData.gender,
          height: healthProfileData.height,
          weight: healthProfileData.weight,
          bloodType: healthProfileData.blood_type,
          allergies: healthProfileData.allergies,
          conditions: healthProfileData.conditions
        }
      };

      console.log('🔄 Updating local user state...');
      await updateUser(updatedUser);
      console.log('✅ Local user state updated successfully');
      
      // Step 6: Finalize
      setSaveProgress('Finalizing...');
      
      setIsEditing(false);
      setLastSaved(new Date());
      setSaveProgress('');
      
      toast.success('🎉 Profile updated successfully!', {
        duration: 4000,
        icon: '✅'
      });
      
      // Refresh user data to ensure consistency
      setTimeout(() => {
        refreshUser().catch(console.error);
      }, 1000);
      
    } catch (error: any) {
      console.error('❌ Profile update error:', error);
      setSaveProgress('');
      
      let errorMessage = 'An unexpected error occurred';
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Handle specific error types with user-friendly messages
      if (errorMessage.includes('JWT expired') || errorMessage.includes('session')) {
        toast.error('🔐 Your session has expired. Please sign in again.', { duration: 6000 });
      } else if (errorMessage.includes('duplicate key') || errorMessage.includes('already exists') || errorMessage.includes('Email already exists')) {
        toast.error('📧 This email is already in use. Please choose a different email.', { duration: 6000 });
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('timeout')) {
        toast.error('🌐 Network error. Please check your connection and try again.', { duration: 6000 });
      } else if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
        toast.error('🚫 Permission denied. Please try signing in again.', { duration: 6000 });
      } else if (errorMessage.includes('validation') || errorMessage.includes('required')) {
        toast.error(`📝 ${errorMessage}`, { duration: 6000 });
      } else if (errorMessage.includes('relation') && errorMessage.includes('does not exist')) {
        toast.error('🗄️ Database tables are missing. Please run the database setup script.', { duration: 8000 });
      } else {
        toast.error(`❌ Update failed: ${errorMessage}`, { duration: 6000 });
      }
    } finally {
      setIsSaving(false);
      setSaveProgress('');
    }
  };

  const handleCancel = () => {
    reset({
      name: user?.name || '',
      email: user?.email || '',
      age: user?.healthProfile?.age || undefined,
      gender: user?.healthProfile?.gender || '',
      height: user?.healthProfile?.height || undefined,
      weight: user?.healthProfile?.weight || undefined,
      bloodType: user?.healthProfile?.bloodType || '',
      allergies: user?.healthProfile?.allergies?.join(', ') || '',
      conditions: user?.healthProfile?.conditions?.join(', ') || ''
    });
    setIsEditing(false);
    setSaveProgress('');
  };

  const calculateBMI = () => {
    const height = user?.healthProfile?.height;
    const weight = user?.healthProfile?.weight;
    if (height && weight && height > 0) {
      const heightInMeters = height / 100;
      const bmi = weight / (heightInMeters * heightInMeters);
      return bmi.toFixed(1);
    }
    return null;
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-600' };
    if (bmi < 25) return { category: 'Normal', color: 'text-green-600' };
    if (bmi < 30) return { category: 'Overweight', color: 'text-yellow-600' };
    return { category: 'Obese', color: 'text-red-600' };
  };

  const bmi = calculateBMI();
  const bmiInfo = bmi ? getBMICategory(parseFloat(bmi)) : null;

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 bg-gradient-to-br from-blue-50/50 via-white to-green-50/50 min-h-screen">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
            Profile Management
            <Sparkles className="w-6 h-6 ml-2 text-yellow-500 animate-pulse" />
          </h1>
          <p className="text-gray-600 mt-1">Manage your personal information and health profile</p>
          {lastSaved && (
            <p className="text-xs text-green-600 mt-1 flex items-center">
              <CheckCircle className="w-3 h-3 mr-1" />
              Last saved: {lastSaved.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleTestDatabase}
            disabled={isRefreshing || isSaving}
            className="px-3 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50 flex items-center space-x-1"
            title="Test database connection"
          >
            <Database className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Test DB</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={isRefreshing || isSaving}
            className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
            disabled={isSaving}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg ${
              isEditing 
                ? 'bg-gray-600 text-white hover:bg-gray-700' 
                : 'bg-gradient-to-r from-blue-500 to-green-500 text-white hover:from-blue-600 hover:to-green-600'
            } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSaving ? (
              <>
                <Loader className="animate-spin w-4 h-4" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                {isEditing ? <Save className="w-4 h-4 sm:w-5 sm:h-5" /> : <Edit3 className="w-4 h-4 sm:w-5 sm:h-5" />}
                <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Database Status Display */}
      {showDbStatus && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg border border-gray-100 p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <Database className="w-5 h-5 mr-2 text-purple-500" />
              Database Status
            </h3>
            <button
              onClick={() => setShowDbStatus(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {dbStatus.map((status, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  status.status === 'success' 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {status.status === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="font-medium text-sm">{status.table}</span>
                </div>
                {status.error && (
                  <p className="text-xs text-red-600 mt-1">{status.error}</p>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Save Progress Indicator */}
      {isSaving && saveProgress && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center space-x-3"
        >
          <Loader className="animate-spin w-4 h-4 text-blue-600" />
          <span className="text-sm text-blue-800 font-medium">{saveProgress}</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Enhanced Profile Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6"
        >
          <div className="text-center">
            <div className="relative mb-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <span className="text-white font-bold text-xl sm:text-2xl">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <button className="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-1/2 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <Camera className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
              </button>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">{user?.name}</h2>
            <p className="text-gray-600 mb-2 text-sm sm:text-base">{user?.email}</p>
            
            <div className="flex items-center justify-center space-x-2 mb-4">
              {user?.subscription === 'premium' && (
                <Crown className="w-4 h-4 text-yellow-500" />
              )}
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                user?.subscription === 'premium' 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {user?.subscription} Plan
              </span>
              <Shield className="w-4 h-4 text-green-500" />
            </div>

            {/* Health Stats */}
            {bmi && (
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Health Stats</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">BMI</span>
                    <span className={`text-sm font-bold ${bmiInfo?.color}`}>
                      {bmi} ({bmiInfo?.category})
                    </span>
                  </div>
                  {user?.healthProfile?.age && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Age</span>
                      <span className="text-sm font-medium">{user.healthProfile.age} years</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {user?.subscription === 'free' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-2 px-4 rounded-lg font-medium hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 text-sm"
              >
                Upgrade to Premium
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Enhanced Profile Form */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-500" />
                  Personal Information
                  {isDirty && isEditing && (
                    <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      Unsaved changes
                    </span>
                  )}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      {...register('name', { 
                        required: 'Name is required',
                        minLength: { value: 2, message: 'Name must be at least 2 characters' }
                      })}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        !isEditing ? 'bg-gray-50 text-gray-500' : 'bg-white'
                      } ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      {...register('email', { 
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      disabled={!isEditing}
                      type="email"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        !isEditing ? 'bg-gray-50 text-gray-500' : 'bg-white'
                      } ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Health Information */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-green-500" />
                  Health Information
                  <Shield className="w-4 h-4 ml-2 text-green-500" />
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age
                    </label>
                    <input
                      {...register('age', { 
                        min: { value: 0, message: 'Age must be positive' },
                        max: { value: 150, message: 'Age must be realistic' }
                      })}
                      disabled={!isEditing}
                      type="number"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        !isEditing ? 'bg-gray-50 text-gray-500' : 'bg-white'
                      } ${errors.age ? 'border-red-300' : 'border-gray-300'}`}
                    />
                    {errors.age && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.age.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender
                    </label>
                    <select
                      {...register('gender')}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        !isEditing ? 'bg-gray-50 text-gray-500' : 'bg-white'
                      } border-gray-300`}
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blood Type
                    </label>
                    <select
                      {...register('bloodType')}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        !isEditing ? 'bg-gray-50 text-gray-500' : 'bg-white'
                      } border-gray-300`}
                    >
                      <option value="">Select</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Height (cm)
                    </label>
                    <input
                      {...register('height', { 
                        min: { value: 0, message: 'Height must be positive' },
                        max: { value: 300, message: 'Height must be realistic' }
                      })}
                      disabled={!isEditing}
                      type="number"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        !isEditing ? 'bg-gray-50 text-gray-500' : 'bg-white'
                      } ${errors.height ? 'border-red-300' : 'border-gray-300'}`}
                    />
                    {errors.height && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.height.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight (kg)
                    </label>
                    <input
                      {...register('weight', { 
                        min: { value: 0, message: 'Weight must be positive' },
                        max: { value: 500, message: 'Weight must be realistic' }
                      })}
                      disabled={!isEditing}
                      type="number"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        !isEditing ? 'bg-gray-50 text-gray-500' : 'bg-white'
                      } ${errors.weight ? 'border-red-300' : 'border-gray-300'}`}
                    />
                    {errors.weight && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.weight.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Allergies (comma separated)
                    </label>
                    <textarea
                      {...register('allergies')}
                      disabled={!isEditing}
                      rows={3}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        !isEditing ? 'bg-gray-50 text-gray-500' : 'bg-white'
                      } border-gray-300`}
                      placeholder="e.g., Peanuts, Shellfish, Latex"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Medical Conditions (comma separated)
                    </label>
                    <textarea
                      {...register('conditions')}
                      disabled={!isEditing}
                      rows={3}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        !isEditing ? 'bg-gray-50 text-gray-500' : 'bg-white'
                      } border-gray-300`}
                      placeholder="e.g., Diabetes, Hypertension"
                    />
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSaving || !isDirty}
                    className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader className="animate-spin w-4 h-4" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </motion.button>
                </div>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};