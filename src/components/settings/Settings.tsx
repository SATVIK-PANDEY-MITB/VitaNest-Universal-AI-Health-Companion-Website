import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Smartphone, 
  CreditCard, 
  Download, 
  Trash2, 
  Eye, 
  EyeOff, 
  ChevronRight, 
  Check, 
  X, 
  Crown, 
  Zap, 
  Heart, 
  Lock, 
  Key, 
  Database, 
  Cloud, 
  Mic, 
  Camera, 
  Volume2, 
  Monitor,
  Moon,
  Sun,
  Languages,
  HelpCircle,
  LogOut,
  Settings as SettingsIcon,
  Phone,
  Video,
  PhoneCall,
  VideoIcon
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

interface SettingsForm {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface VideoCallState {
  isActive: boolean;
  isVideoOn: boolean;
  isAudioOn: boolean;
  isMuted: boolean;
  isFullscreen: boolean;
  participants: number;
  duration: number;
}

interface VoiceCallState {
  isActive: boolean;
  isAudioOn: boolean;
  isMuted: boolean;
  duration: number;
  quality: 'HD' | 'Standard' | 'Low';
}

const SettingsSection: React.FC<{
  title: string;
  description?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ title, description, icon, children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden ${className}`}
  >
    <div className="p-4 sm:p-6 border-b border-gray-100">
      <div className="flex items-center space-x-3">
        <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-lg p-2">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
      </div>
    </div>
    <div className="p-4 sm:p-6">
      {children}
    </div>
  </motion.div>
);

const ToggleSwitch: React.FC<{
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}> = ({ enabled, onChange, label, description, disabled = false }) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-900">{label}</p>
      {description && (
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      )}
    </div>
    <button
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        enabled ? 'bg-blue-600' : 'bg-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

const VideoCallInterface: React.FC<{
  callState: VideoCallState;
  onUpdateCall: (updates: Partial<VideoCallState>) => void;
  onEndCall: () => void;
}> = ({ callState, onUpdateCall, onEndCall }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (callState.isActive && callState.isVideoOn) {
      startVideo();
    } else {
      stopVideo();
    }
    return () => stopVideo();
  }, [callState.isActive, callState.isVideoOn]);

  const startVideo = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: callState.isAudioOn
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Failed to access camera');
    }
  };

  const stopVideo = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const toggleVideo = () => {
    onUpdateCall({ isVideoOn: !callState.isVideoOn });
  };

  const toggleAudio = () => {
    onUpdateCall({ isAudioOn: !callState.isAudioOn });
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !callState.isAudioOn;
      });
    }
  };

  const toggleMute = () => {
    onUpdateCall({ isMuted: !callState.isMuted });
  };

  if (!callState.isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
    >
      <div className="relative w-full h-full max-w-4xl max-h-3xl bg-black rounded-lg overflow-hidden">
        {/* Video Display */}
        <div className="relative w-full h-full">
          {callState.isVideoOn ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-900 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-white" />
                </div>
                <p className="text-white text-lg">Camera is off</p>
              </div>
            </div>
          )}

          {/* Call Info Overlay */}
          <div className="absolute top-4 left-4 bg-black bg-opacity-50 rounded-lg px-4 py-2">
            <div className="flex items-center space-x-2 text-white">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm">
                {Math.floor(callState.duration / 60)}:{(callState.duration % 60).toString().padStart(2, '0')}
              </span>
              <span className="text-xs opacity-75">• {callState.participants} participants</span>
            </div>
          </div>

          {/* Call Controls */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-4 bg-black bg-opacity-50 rounded-full px-6 py-3">
              <button
                onClick={toggleAudio}
                className={`p-3 rounded-full transition-colors ${
                  callState.isAudioOn ? 'bg-white bg-opacity-20 text-white' : 'bg-red-500 text-white'
                }`}
              >
                {callState.isAudioOn ? <Mic className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                onClick={toggleVideo}
                className={`p-3 rounded-full transition-colors ${
                  callState.isVideoOn ? 'bg-white bg-opacity-20 text-white' : 'bg-red-500 text-white'
                }`}
              >
                {callState.isVideoOn ? <Camera className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
              </button>

              <button
                onClick={toggleMute}
                className={`p-3 rounded-full transition-colors ${
                  !callState.isMuted ? 'bg-white bg-opacity-20 text-white' : 'bg-red-500 text-white'
                }`}
              >
                <Volume2 className="w-5 h-5" />
              </button>

              <button
                onClick={onEndCall}
                className="p-3 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                <Phone className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const VoiceCallInterface: React.FC<{
  callState: VoiceCallState;
  onUpdateCall: (updates: Partial<VoiceCallState>) => void;
  onEndCall: () => void;
}> = ({ callState, onUpdateCall, onEndCall }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (callState.isActive) {
      startAudio();
    } else {
      stopAudio();
    }
    return () => stopAudio();
  }, [callState.isActive]);

  const startAudio = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      });
      setStream(mediaStream);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Failed to access microphone');
    }
  };

  const stopAudio = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const toggleAudio = () => {
    onUpdateCall({ isAudioOn: !callState.isAudioOn });
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !callState.isAudioOn;
      });
    }
  };

  if (!callState.isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-4 right-4 bg-white rounded-xl shadow-2xl border border-gray-200 p-6 z-50 min-w-80"
    >
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Phone className="w-8 h-8 text-white" />
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 mb-2">Voice Call Active</h3>
        
        <div className="flex items-center justify-center space-x-2 text-gray-600 mb-4">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm">
            {Math.floor(callState.duration / 60)}:{(callState.duration % 60).toString().padStart(2, '0')}
          </span>
          <span className="text-xs">• {callState.quality} Quality</span>
        </div>

        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={toggleAudio}
            className={`p-3 rounded-full transition-colors ${
              callState.isAudioOn ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}
          >
            <Mic className="w-5 h-5" />
          </button>

          <button
            onClick={onEndCall}
            className="p-3 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            <Phone className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export const Settings: React.FC = () => {
  const { user, updateUser, signOut } = useAuthStore();
  const [activeTab, setActiveTab] = useState('account');
  const [showPassword, setShowPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    marketing: false,
    security: true,
    appointments: true,
    medications: true
  });

  // Video Call State
  const [videoCall, setVideoCall] = useState<VideoCallState>({
    isActive: false,
    isVideoOn: true,
    isAudioOn: true,
    isMuted: false,
    isFullscreen: false,
    participants: 1,
    duration: 0
  });

  // Voice Call State
  const [voiceCall, setVoiceCall] = useState<VoiceCallState>({
    isActive: false,
    isAudioOn: true,
    isMuted: false,
    duration: 0,
    quality: 'HD'
  });

  // Call duration timers
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (videoCall.isActive) {
      interval = setInterval(() => {
        setVideoCall(prev => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [videoCall.isActive]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (voiceCall.isActive) {
      interval = setInterval(() => {
        setVoiceCall(prev => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [voiceCall.isActive]);

  const { register, handleSubmit, formState: { errors } } = useForm<SettingsForm>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || ''
    }
  });

  const startVideoCall = () => {
    setVideoCall(prev => ({ ...prev, isActive: true, duration: 0 }));
    toast.success('📹 Video call started');
  };

  const endVideoCall = () => {
    setVideoCall(prev => ({ ...prev, isActive: false, duration: 0 }));
    toast.success('📹 Video call ended');
  };

  const startVoiceCall = () => {
    setVoiceCall(prev => ({ ...prev, isActive: true, duration: 0 }));
    toast.success('📞 Voice call started');
  };

  const endVoiceCall = () => {
    setVoiceCall(prev => ({ ...prev, isActive: false, duration: 0 }));
    toast.success('📞 Voice call ended');
  };

  const onSubmit = async (data: SettingsForm) => {
    try {
      await updateUser({
        name: data.name,
        email: data.email
      });
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      toast.error('Account deletion is not implemented yet');
    }
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'calls', label: 'Video & Voice', icon: Video },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'data', label: 'Data & Storage', icon: Database },
    { id: 'help', label: 'Help & Support', icon: HelpCircle }
  ];

  return (
    <div className="p-3 sm:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account, privacy, and app preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                  <div className="flex items-center space-x-1">
                    {user?.subscription === 'premium' && (
                      <Crown className="w-3 h-3 text-yellow-500" />
                    )}
                    <p className="text-xs text-gray-500 capitalize">{user?.subscription} Plan</p>
                  </div>
                </div>
              </div>
            </div>
            
            <nav className="p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{tab.label}</span>
                  <ChevronRight className="w-4 h-4 ml-auto flex-shrink-0" />
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          <AnimatePresence mode="wait">
            {/* Account Settings */}
            {activeTab === 'account' && (
              <motion.div
                key="account"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <SettingsSection
                  title="Account Information"
                  description="Update your personal information and account details"
                  icon={<User className="w-5 h-5 text-white" />}
                >
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          {...register('name', { required: 'Name is required' })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          {...register('email', { 
                            required: 'Email is required',
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: 'Invalid email address'
                            }
                          })}
                          type="email"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-green-600 transition-all duration-200"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </SettingsSection>

                <SettingsSection
                  title="Change Password"
                  description="Update your password to keep your account secure"
                  icon={<Lock className="w-5 h-5 text-white" />}
                >
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          {...register('currentPassword')}
                          type={showPassword ? 'text' : 'password'}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <input
                          {...register('newPassword')}
                          type={showPassword ? 'text' : 'password'}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          {...register('confirmPassword')}
                          type={showPassword ? 'text' : 'password'}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-green-600 transition-all duration-200"
                      >
                        Update Password
                      </button>
                    </div>
                  </div>
                </SettingsSection>
              </motion.div>
            )}

            {/* Video & Voice Calls */}
            {activeTab === 'calls' && (
              <motion.div
                key="calls"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <SettingsSection
                  title="Video Calls"
                  description="Manage video calling features and preferences"
                  icon={<Video className="w-5 h-5 text-white" />}
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Video Call Status</h4>
                        <p className="text-sm text-gray-600">
                          {videoCall.isActive ? 'Call in progress' : 'Ready to start video call'}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        {!videoCall.isActive ? (
                          <button
                            onClick={startVideoCall}
                            className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-green-600 transition-all duration-200 flex items-center space-x-2"
                          >
                            <VideoIcon className="w-4 h-4" />
                            <span>Start Video Call</span>
                          </button>
                        ) : (
                          <button
                            onClick={endVideoCall}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-all duration-200 flex items-center space-x-2"
                          >
                            <X className="w-4 h-4" />
                            <span>End Call</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ToggleSwitch
                        enabled={true}
                        onChange={() => {}}
                        label="HD Video Quality"
                        description="Use high-definition video for better quality"
                      />
                      <ToggleSwitch
                        enabled={true}
                        onChange={() => {}}
                        label="Auto-start Camera"
                        description="Automatically turn on camera when joining calls"
                      />
                      <ToggleSwitch
                        enabled={false}
                        onChange={() => {}}
                        label="Background Blur"
                        description="Blur your background during video calls"
                      />
                      <ToggleSwitch
                        enabled={true}
                        onChange={() => {}}
                        label="Noise Cancellation"
                        description="Reduce background noise during calls"
                      />
                    </div>
                  </div>
                </SettingsSection>

                <SettingsSection
                  title="Voice Calls"
                  description="Configure voice calling settings and audio preferences"
                  icon={<Phone className="w-5 h-5 text-white" />}
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Voice Call Status</h4>
                        <p className="text-sm text-gray-600">
                          {voiceCall.isActive ? 'Call in progress' : 'Ready to start voice call'}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        {!voiceCall.isActive ? (
                          <button
                            onClick={startVoiceCall}
                            className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:from-green-600 hover:to-blue-600 transition-all duration-200 flex items-center space-x-2"
                          >
                            <PhoneCall className="w-4 h-4" />
                            <span>Start Voice Call</span>
                          </button>
                        ) : (
                          <button
                            onClick={endVoiceCall}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-all duration-200 flex items-center space-x-2"
                          >
                            <X className="w-4 h-4" />
                            <span>End Call</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ToggleSwitch
                        enabled={true}
                        onChange={() => {}}
                        label="HD Audio Quality"
                        description="Use high-quality audio for crystal clear calls"
                      />
                      <ToggleSwitch
                        enabled={true}
                        onChange={() => {}}
                        label="Auto-mute on Join"
                        description="Automatically mute microphone when joining calls"
                      />
                      <ToggleSwitch
                        enabled={true}
                        onChange={() => {}}
                        label="Echo Cancellation"
                        description="Reduce echo and feedback during calls"
                      />
                      <ToggleSwitch
                        enabled={false}
                        onChange={() => {}}
                        label="Call Recording"
                        description="Allow recording of voice calls for review"
                      />
                    </div>
                  </div>
                </SettingsSection>
              </motion.div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <SettingsSection
                  title="Notification Preferences"
                  description="Choose how and when you want to be notified"
                  icon={<Bell className="w-5 h-5 text-white" />}
                >
                  <div className="space-y-4">
                    <ToggleSwitch
                      enabled={notifications.email}
                      onChange={(enabled) => setNotifications(prev => ({ ...prev, email: enabled }))}
                      label="Email Notifications"
                      description="Receive notifications via email"
                    />
                    <ToggleSwitch
                      enabled={notifications.push}
                      onChange={(enabled) => setNotifications(prev => ({ ...prev, push: enabled }))}
                      label="Push Notifications"
                      description="Receive push notifications on your device"
                    />
                    <ToggleSwitch
                      enabled={notifications.appointments}
                      onChange={(enabled) => setNotifications(prev => ({ ...prev, appointments: enabled }))}
                      label="Appointment Reminders"
                      description="Get reminded about upcoming appointments"
                    />
                    <ToggleSwitch
                      enabled={notifications.medications}
                      onChange={(enabled) => setNotifications(prev => ({ ...prev, medications: enabled }))}
                      label="Medication Reminders"
                      description="Receive reminders to take your medications"
                    />
                    <ToggleSwitch
                      enabled={notifications.security}
                      onChange={(enabled) => setNotifications(prev => ({ ...prev, security: enabled }))}
                      label="Security Alerts"
                      description="Get notified about security-related activities"
                    />
                    <ToggleSwitch
                      enabled={notifications.marketing}
                      onChange={(enabled) => setNotifications(prev => ({ ...prev, marketing: enabled }))}
                      label="Marketing Communications"
                      description="Receive updates about new features and offers"
                    />
                  </div>
                </SettingsSection>
              </motion.div>
            )}

            {/* Appearance */}
            {activeTab === 'appearance' && (
              <motion.div
                key="appearance"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <SettingsSection
                  title="Appearance & Display"
                  description="Customize how the app looks and feels"
                  icon={<Palette className="w-5 h-5 text-white" />}
                >
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Theme</h4>
                      <div className="grid grid-cols-3 gap-3">
                        <button className="p-4 border-2 border-blue-500 rounded-lg bg-white">
                          <Sun className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                          <span className="text-sm font-medium">Light</span>
                        </button>
                        <button className="p-4 border-2 border-gray-200 rounded-lg bg-gray-900">
                          <Moon className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                          <span className="text-sm font-medium text-white">Dark</span>
                        </button>
                        <button className="p-4 border-2 border-gray-200 rounded-lg bg-gradient-to-br from-white to-gray-900">
                          <Monitor className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                          <span className="text-sm font-medium">Auto</span>
                        </button>
                      </div>
                    </div>

                    <ToggleSwitch
                      enabled={false}
                      onChange={() => {}}
                      label="Compact Mode"
                      description="Use a more compact layout to fit more content"
                    />
                    <ToggleSwitch
                      enabled={true}
                      onChange={() => {}}
                      label="Animations"
                      description="Enable smooth animations and transitions"
                    />
                  </div>
                </SettingsSection>
              </motion.div>
            )}

            {/* Privacy & Security */}
            {activeTab === 'privacy' && (
              <motion.div
                key="privacy"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <SettingsSection
                  title="Privacy & Security"
                  description="Control your privacy settings and security preferences"
                  icon={<Shield className="w-5 h-5 text-white" />}
                >
                  <div className="space-y-4">
                    <ToggleSwitch
                      enabled={true}
                      onChange={() => {}}
                      label="Two-Factor Authentication"
                      description="Add an extra layer of security to your account"
                    />
                    <ToggleSwitch
                      enabled={true}
                      onChange={() => {}}
                      label="Blockchain Data Storage"
                      description="Store your health data securely on the blockchain"
                    />
                    <ToggleSwitch
                      enabled={false}
                      onChange={() => {}}
                      label="Data Analytics"
                      description="Allow anonymous usage data to improve the app"
                    />
                    <ToggleSwitch
                      enabled={true}
                      onChange={() => {}}
                      label="End-to-End Encryption"
                      description="Encrypt all your health data for maximum security"
                    />
                  </div>
                </SettingsSection>
              </motion.div>
            )}

            {/* Billing */}
            {activeTab === 'billing' && (
              <motion.div
                key="billing"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <SettingsSection
                  title="Subscription & Billing"
                  description="Manage your subscription and payment methods"
                  icon={<CreditCard className="w-5 h-5 text-white" />}
                >
                  <div className="space-y-6">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 flex items-center">
                            {user?.subscription === 'premium' && <Crown className="w-4 h-4 text-yellow-500 mr-2" />}
                            {user?.subscription} Plan
                          </h4>
                          <p className="text-sm text-gray-600">
                            {user?.subscription === 'free' 
                              ? 'Upgrade to unlock premium features' 
                              : 'Next billing date: January 15, 2025'
                            }
                          </p>
                        </div>
                        <button className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-green-600 transition-all duration-200">
                          {user?.subscription === 'free' ? 'Upgrade' : 'Manage'}
                        </button>
                      </div>
                    </div>

                    {user?.subscription === 'free' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border border-gray-200 rounded-lg">
                          <h5 className="font-medium text-gray-900 mb-2">Premium Monthly</h5>
                          <p className="text-2xl font-bold text-gray-900 mb-2">$9.99<span className="text-sm font-normal text-gray-600">/month</span></p>
                          <ul className="text-sm text-gray-600 space-y-1 mb-4">
                            <li>• Unlimited AI consultations</li>
                            <li>• Advanced health analytics</li>
                            <li>• Priority support</li>
                          </ul>
                          <button className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white py-2 rounded-lg font-medium">
                            Choose Plan
                          </button>
                        </div>

                        <div className="p-4 border-2 border-blue-500 rounded-lg relative">
                          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                            <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                              Most Popular
                            </span>
                          </div>
                          <h5 className="font-medium text-gray-900 mb-2">Premium Annual</h5>
                          <p className="text-2xl font-bold text-gray-900 mb-2">$99.99<span className="text-sm font-normal text-gray-600">/year</span></p>
                          <ul className="text-sm text-gray-600 space-y-1 mb-4">
                            <li>• Everything in Monthly</li>
                            <li>• 2 months free</li>
                            <li>• Exclusive features</li>
                          </ul>
                          <button className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white py-2 rounded-lg font-medium">
                            Choose Plan
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </SettingsSection>
              </motion.div>
            )}

            {/* Data & Storage */}
            {activeTab === 'data' && (
              <motion.div
                key="data"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <SettingsSection
                  title="Data & Storage"
                  description="Manage your data storage and export options"
                  icon={<Database className="w-5 h-5 text-white" />}
                >
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg text-center">
                        <Cloud className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <h4 className="font-medium text-gray-900">Cloud Storage</h4>
                        <p className="text-sm text-gray-600">2.3 GB used of 5 GB</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg text-center">
                        <Zap className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <h4 className="font-medium text-gray-900">Blockchain</h4>
                        <p className="text-sm text-gray-600">156 records secured</p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg text-center">
                        <Download className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                        <h4 className="font-medium text-gray-900">Backups</h4>
                        <p className="text-sm text-gray-600">Last: 2 hours ago</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <Download className="w-5 h-5 text-gray-400" />
                          <span className="font-medium text-gray-900">Export Health Data</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </button>

                      <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <Cloud className="w-5 h-5 text-gray-400" />
                          <span className="font-medium text-gray-900">Backup to Cloud</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </button>

                      <button 
                        onClick={handleDeleteAccount}
                        className="w-full flex items-center justify-between p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <Trash2 className="w-5 h-5 text-red-500" />
                          <span className="font-medium text-red-900">Delete Account</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-red-400" />
                      </button>
                    </div>
                  </div>
                </SettingsSection>
              </motion.div>
            )}

            {/* Help & Support */}
            {activeTab === 'help' && (
              <motion.div
                key="help"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <SettingsSection
                  title="Help & Support"
                  description="Get help and contact our support team"
                  icon={<HelpCircle className="w-5 h-5 text-white" />}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                      <h4 className="font-medium text-gray-900 mb-2">Help Center</h4>
                      <p className="text-sm text-gray-600">Browse our comprehensive help articles</p>
                    </button>

                    <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                      <h4 className="font-medium text-gray-900 mb-2">Contact Support</h4>
                      <p className="text-sm text-gray-600">Get in touch with our support team</p>
                    </button>

                    <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                      <h4 className="font-medium text-gray-900 mb-2">Feature Requests</h4>
                      <p className="text-sm text-gray-600">Suggest new features for the app</p>
                    </button>

                    <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                      <h4 className="font-medium text-gray-900 mb-2">Report a Bug</h4>
                      <p className="text-sm text-gray-600">Let us know about any issues you encounter</p>
                    </button>
                  </div>
                </SettingsSection>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sign Out Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-6 border-t border-gray-200"
          >
            <button
              onClick={signOut}
              className="w-full flex items-center justify-center space-x-2 p-4 border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </motion.div>
        </div>
      </div>

      {/* Video Call Interface */}
      <AnimatePresence>
        {videoCall.isActive && (
          <VideoCallInterface
            callState={videoCall}
            onUpdateCall={(updates) => setVideoCall(prev => ({ ...prev, ...updates }))}
            onEndCall={endVideoCall}
          />
        )}
      </AnimatePresence>

      {/* Voice Call Interface */}
      <AnimatePresence>
        {voiceCall.isActive && (
          <VoiceCallInterface
            callState={voiceCall}
            onUpdateCall={(updates) => setVoiceCall(prev => ({ ...prev, ...updates }))}
            onEndCall={endVoiceCall}
          />
        )}
      </AnimatePresence>
    </div>
  );
};