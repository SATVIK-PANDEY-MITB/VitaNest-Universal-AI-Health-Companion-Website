import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, Volume2, VolumeX, Bot, User, Video, Zap, Phone, PhoneOff, Camera, CameraOff, Sparkles, MessageSquare, Brain, Heart, Activity, TrendingUp, VideoIcon } from 'lucide-react';
import { useHealthStore } from '../../store/healthStore';
import { useAuthStore } from '../../store/authStore';
import { healthAIService, elevenLabsService, healthVideoService } from '../../services/apiService';
import toast from 'react-hot-toast';

export const ChatBot: React.FC = () => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [isVoiceCallActive, setIsVoiceCallActive] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const { user } = useAuthStore();
  const { chatMessages, addChatMessage, loadChatMessages } = useHealthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  useEffect(() => {
    if (user) {
      loadChatMessages(user.id);
      
      // Send proactive welcome message if no chat history
      if (chatMessages.length === 0) {
        setTimeout(() => {
          sendProactiveMessage();
        }, 2000);
      }
    }
  }, [user, loadChatMessages]);

  // Call timer effect
  useEffect(() => {
    if (isVideoCallActive || isVoiceCallActive) {
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
      }
      setCallDuration(0);
    }

    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [isVideoCallActive, isVoiceCallActive]);

  // Send proactive AI message
  const sendProactiveMessage = async () => {
    if (!user) return;

    const welcomeMessage = `Hello ${user.name}! 👋 I'm your AI Health Assistant, powered by advanced medical knowledge and personalized insights.

I've analyzed your health profile and I'm here to help you with:
🩺 **Symptom analysis** and health concerns
💊 **Medication guidance** and interactions
📊 **Personalized health advice** based on your profile
🎯 **Wellness recommendations** for your lifestyle
📹 **Custom health videos** with AI-generated content
🔊 **Voice responses** for hands-free interaction
📞 **Video and voice calls** for real-time consultations

${user.healthProfile?.conditions?.length > 0 ? 
  `I see you have ${user.healthProfile.conditions.join(', ')}. I'll keep this in mind when providing advice.` : 
  'Feel free to share any health concerns or questions you have.'
}

What would you like to discuss today? I'm here to provide intelligent, personalized health guidance! 🌟`;

    try {
      await addChatMessage(user.id, {
        content: welcomeMessage,
        role: 'assistant',
        timestamp: new Date().toISOString(),
        type: 'text'
      });
    } catch (error) {
      console.error('Failed to send proactive message:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading || !user) return;

    const userMessage = message.trim();
    setMessage('');
    
    // Add user message
    try {
      await addChatMessage(user.id, {
        content: userMessage,
        role: 'user',
        timestamp: new Date().toISOString(),
        type: 'text'
      });

      setIsLoading(true);
      setIsThinking(true);

      // Show thinking animation
      setTimeout(() => setIsThinking(false), 2000);

      // Get AI response with user context and health profile
      console.log('🤖 Generating AI response with context:', user.healthProfile);
      const aiResponse = await healthAIService.getChatResponse(userMessage, {
        healthProfile: user.healthProfile,
        name: user.name,
        subscription: user.subscription
      });
      
      // Add AI response
      await addChatMessage(user.id, {
        content: aiResponse,
        role: 'assistant',
        timestamp: new Date().toISOString(),
        type: 'text'
      });

      // Generate speech response using Web Speech API
      try {
        await generateSpeechResponse(aiResponse);
      } catch (error) {
        console.error('Speech generation failed:', error);
      }

      // Generate audio response for premium users with ElevenLabs
      if (user.subscription === 'premium') {
        try {
          const audioUrl = await elevenLabsService.textToSpeech(aiResponse);
          if (audioUrl && audioRef.current) {
            audioRef.current.src = audioUrl;
            toast.success('🔊 Premium audio response generated!');
          }
        } catch (error) {
          console.error('ElevenLabs audio generation failed:', error);
        }
      }

      // Send follow-up proactive advice after a delay
      setTimeout(() => {
        sendFollowUpAdvice(userMessage, aiResponse);
      }, 5000);

    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to send message. Please try again.');
      
      // Add fallback AI response
      try {
        await addChatMessage(user.id, {
          content: 'I apologize, but I\'m having trouble processing your request right now. Please try again later, or feel free to ask me about any health concerns you have.',
          role: 'assistant',
          timestamp: new Date().toISOString(),
          type: 'text'
        });
      } catch (fallbackError) {
        console.error('Fallback message failed:', fallbackError);
      }
    } finally {
      setIsLoading(false);
      setIsThinking(false);
    }
  };

  // Generate speech response using Web Speech API
  const generateSpeechResponse = async (text: string) => {
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      // Try to use a more natural voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Google') || 
        voice.name.includes('Microsoft') ||
        voice.name.includes('Alex') ||
        voice.name.includes('Samantha')
      ) || voices[0];
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        setIsPlaying(true);
        toast.success('🔊 AI speaking...');
      };

      utterance.onend = () => {
        setIsPlaying(false);
      };

      utterance.onerror = (error) => {
        console.error('Speech synthesis error:', error);
        setIsPlaying(false);
      };

      speechSynthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Send intelligent follow-up advice
  const sendFollowUpAdvice = async (userMessage: string, aiResponse: string) => {
    if (!user) return;

    const lowerMessage = userMessage.toLowerCase();
    let followUpMessage = '';

    // Analyze the conversation and provide relevant follow-up
    if (lowerMessage.includes('pain') || lowerMessage.includes('hurt')) {
      followUpMessage = `💡 **Follow-up tip**: For pain management, consider keeping a pain diary to track triggers, intensity, and what helps. This information can be valuable for your healthcare provider.

Would you like me to help you create a personalized pain management plan?`;
    } else if (lowerMessage.includes('sleep') || lowerMessage.includes('tired')) {
      followUpMessage = `😴 **Sleep optimization tip**: Your sleep environment matters! Keep your bedroom cool (60-67°F), dark, and quiet. Consider a consistent bedtime routine starting 1 hour before sleep.

I can help you create a personalized sleep improvement plan if you're interested!`;
    } else if (lowerMessage.includes('stress') || lowerMessage.includes('anxiety')) {
      followUpMessage = `🧘 **Stress management insight**: Did you know that just 5 minutes of deep breathing can activate your parasympathetic nervous system and reduce stress hormones?

Try the 4-7-8 technique: Inhale for 4, hold for 7, exhale for 8. Would you like more personalized stress management strategies?`;
    } else if (lowerMessage.includes('medication') || lowerMessage.includes('medicine')) {
      followUpMessage = `💊 **Medication safety reminder**: Always keep an updated list of your medications, including dosages and timing. This is crucial for emergency situations and when seeing new healthcare providers.

I can help you organize your medication schedule if needed!`;
    } else if (lowerMessage.includes('exercise') || lowerMessage.includes('workout')) {
      followUpMessage = `💪 **Exercise motivation**: Even 10 minutes of movement can boost your mood and energy! The key is consistency over intensity.

${user.healthProfile?.age && user.healthProfile.age > 50 ? 
  'At your age, balance and strength exercises are especially beneficial. ' : 
  ''
}Would you like a personalized exercise plan based on your health profile?`;
    } else {
      // General health tip based on time of day
      const hour = new Date().getHours();
      if (hour < 12) {
        followUpMessage = `🌅 **Morning health tip**: Starting your day with a glass of water and some light stretching can boost your energy and set a positive tone for the day!`;
      } else if (hour < 17) {
        followUpMessage = `☀️ **Afternoon wellness check**: How's your posture right now? Take a moment to sit up straight, roll your shoulders back, and take a deep breath!`;
      } else {
        followUpMessage = `🌙 **Evening wind-down tip**: Consider dimming your lights and avoiding screens 1-2 hours before bedtime for better sleep quality.`;
      }
    }

    // Add personalized element based on user's health profile
    if (user.healthProfile?.conditions?.length > 0) {
      followUpMessage += `\n\n🩺 **Personalized note**: Given your ${user.healthProfile.conditions.join(' and ')}, I'm always here to provide condition-specific guidance and support.`;
    }

    // Send the follow-up message after a delay
    setTimeout(async () => {
      try {
        await addChatMessage(user.id, {
          content: followUpMessage,
          role: 'assistant',
          timestamp: new Date().toISOString(),
          type: 'text'
        });
      } catch (error) {
        console.error('Failed to send follow-up message:', error);
      }
    }, 3000);
  };

  const handleGenerateHealthVideo = async () => {
    if (!user || chatMessages.length === 0) {
      toast.error('Please have a conversation first');
      return;
    }

    if (user.subscription !== 'premium') {
      toast.error('Video generation is a premium feature. Please upgrade to access this functionality.');
      return;
    }

    setIsGeneratingVideo(true);
    try {
      const lastMessage = chatMessages[chatMessages.length - 1];
      const videoResult = await healthVideoService.generatePersonalizedHealthVideo(
        user.healthProfile,
        lastMessage.content
      );

      if (videoResult.error) {
        toast.error('Failed to generate health video');
      } else {
        toast.success('🎥 Health video generation started! Check your dashboard for updates.');
        
        // Add video message to chat
        await addChatMessage(user.id, {
          content: `🎥 **Personalized health video generated!** 

Based on our conversation, I've created a custom video with AI-generated content tailored to your health profile. 

Video ID: ${videoResult.video?.video_id || 'pending'}

This video includes:
• Personalized health guidance
• Visual explanations of key concepts
• Action steps specific to your situation
• Professional AI-generated narration

The video will be available in your dashboard once processing is complete (usually 2-3 minutes).`,
          role: 'assistant',
          timestamp: new Date().toISOString(),
          type: 'video'
        });
      }
    } catch (error) {
      toast.error('Video generation failed');
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const startVideoCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      localStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setIsVideoCallActive(true);
      setIsCameraOn(true);
      setIsMicOn(true);
      setCallDuration(0);
      toast.success('📹 Video call started!');
      
      // Add video call message
      if (user) {
        await addChatMessage(user.id, {
          content: '📹 **Video call session started** with AI Health Assistant\n\nI can now see and hear you for a more interactive consultation. Feel free to show me any health concerns or ask questions while we\'re connected!\n\n*Note: This is a simulated video call for demonstration purposes.*',
          role: 'assistant',
          timestamp: new Date().toISOString(),
          type: 'video'
        });
      }
    } catch (error) {
      toast.error('Failed to start video call. Please check camera permissions.');
      console.error('Video call error:', error);
    }
  };

  const startVoiceCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: false, 
        audio: true 
      });
      
      localStreamRef.current = stream;
      
      setIsVoiceCallActive(true);
      setIsMicOn(true);
      setCallDuration(0);
      toast.success('📞 Voice call started!');
      
      // Add voice call message
      if (user) {
        await addChatMessage(user.id, {
          content: '📞 **Voice call session started** with AI Health Assistant\n\nI can now hear you for a hands-free consultation. Feel free to speak your questions and I\'ll respond with voice!\n\n*Note: This is a simulated voice call for demonstration purposes.*',
          role: 'assistant',
          timestamp: new Date().toISOString(),
          type: 'audio'
        });
      }
    } catch (error) {
      toast.error('Failed to start voice call. Please check microphone permissions.');
      console.error('Voice call error:', error);
    }
  };

  const endVideoCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsVideoCallActive(false);
    setIsCameraOn(false);
    setIsMicOn(false);
    setCallDuration(0);
    toast.success('📹 Video call ended');
  };

  const endVoiceCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    
    setIsVoiceCallActive(false);
    setIsMicOn(false);
    setCallDuration(0);
    toast.success('📞 Voice call ended');
  };

  const toggleCamera = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
      }
    }
  };

  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast.success('🎤 Voice recording started');
    } else {
      toast.success('🎤 Voice recording stopped');
    }
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else if (speechSynthesisRef.current) {
      if (isPlaying) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
      } else {
        window.speechSynthesis.speak(speechSynthesisRef.current);
      }
    }
  };

  const formatCallDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Enhanced Chat Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 px-3 sm:px-6 py-3 sm:py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <div className="relative">
              <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-full p-1.5 sm:p-2 flex-shrink-0 shadow-lg">
                <Brain className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate flex items-center">
                AI Health Assistant
                <Sparkles className="w-4 h-4 ml-2 text-yellow-500 animate-pulse" />
                {isThinking && <span className="ml-2 text-sm text-blue-600">Thinking...</span>}
                {(isVideoCallActive || isVoiceCallActive) && (
                  <span className="ml-2 text-sm text-green-600">
                    {isVideoCallActive ? '📹' : '📞'} {formatCallDuration(callDuration)}
                  </span>
                )}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 truncate">
                Intelligent • Personalized • Always Learning
              </p>
            </div>
          </div>
          
          {/* Enhanced Control Buttons */}
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {/* Video Call Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={isVideoCallActive ? endVideoCall : startVideoCall}
              className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 shadow-md ${
                isVideoCallActive 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                  : 'bg-green-100 text-green-600 hover:bg-green-200'
              }`}
              title={isVideoCallActive ? 'End video call' : 'Start video call'}
            >
              {isVideoCallActive ? (
                <PhoneOff className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <VideoIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </motion.button>

            {/* Voice Call Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={isVoiceCallActive ? endVoiceCall : startVoiceCall}
              className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 shadow-md ${
                isVoiceCallActive 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                  : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
              }`}
              title={isVoiceCallActive ? 'End voice call' : 'Start voice call'}
            >
              {isVoiceCallActive ? (
                <PhoneOff className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </motion.button>

            {/* Generate Video Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGenerateHealthVideo}
              disabled={isGeneratingVideo || user?.subscription !== 'premium'}
              className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 shadow-md ${
                isGeneratingVideo 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : user?.subscription === 'premium'
                  ? 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              title={user?.subscription === 'premium' ? 'Generate personalized health video' : 'Premium feature - upgrade to access'}
            >
              {isGeneratingVideo ? (
                <div className="animate-spin w-4 h-4 sm:w-5 sm:h-5 border-2 border-purple-600 border-t-transparent rounded-full"></div>
              ) : (
                <Video className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </motion.button>

            {/* Audio Toggle Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleAudio}
              className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 shadow-md ${
                isPlaying ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={isPlaying ? 'Stop audio' : 'Play audio'}
            >
              {isPlaying ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Video Call Interface */}
      {isVideoCallActive && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-black relative shadow-2xl"
        >
          <div className="aspect-video w-full max-h-48 sm:max-h-64 md:max-h-80 relative">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            
            {/* Call Info Overlay */}
            <div className="absolute top-4 left-4 bg-black bg-opacity-50 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2 text-white">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Video Call - {formatCallDuration(callDuration)}</span>
              </div>
            </div>
            
            {/* Video Call Controls */}
            <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 sm:space-x-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleCamera}
                className={`p-2 sm:p-3 rounded-full transition-all duration-200 shadow-lg ${
                  isCameraOn 
                    ? 'bg-white/20 text-white hover:bg-white/30' 
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                {isCameraOn ? (
                  <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <CameraOff className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleMic}
                className={`p-2 sm:p-3 rounded-full transition-all duration-200 shadow-lg ${
                  isMicOn 
                    ? 'bg-white/20 text-white hover:bg-white/30' 
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                {isMicOn ? (
                  <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={endVideoCall}
                className="p-2 sm:p-3 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all duration-200 shadow-lg"
              >
                <PhoneOff className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Voice Call Interface */}
      {isVoiceCallActive && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="bg-gradient-to-r from-blue-500 to-green-500 p-4 text-white relative"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Voice Call Active</h3>
                <p className="text-sm text-white/80">{formatCallDuration(callDuration)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleMic}
                className={`p-2 rounded-full transition-all duration-200 ${
                  isMicOn 
                    ? 'bg-white/20 hover:bg-white/30' 
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {isMicOn ? (
                  <Mic className="w-4 h-4" />
                ) : (
                  <MicOff className="w-4 h-4" />
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={endVoiceCall}
                className="p-2 rounded-full bg-red-500 hover:bg-red-600 transition-all duration-200"
              >
                <PhoneOff className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Enhanced Chat Messages */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4">
        <AnimatePresence>
          {chatMessages.length === 0 && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8 sm:py-12"
            >
              <div className="relative mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-full p-4 sm:p-6 w-16 h-16 sm:w-20 sm:h-20 mx-auto shadow-2xl">
                  <Brain className="w-8 h-8 sm:w-8 sm:h-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 flex items-center justify-center">
                Intelligent AI Health Assistant
                <Sparkles className="w-5 h-5 ml-2 text-yellow-500 animate-pulse" />
              </h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6 text-sm sm:text-base px-4">
                I'm powered by advanced medical AI and personalized to your health profile. 
                Ask me anything about symptoms, medications, wellness, or start a video/voice call!
              </p>
              
              {/* Enhanced Suggestion Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-6 sm:mt-8 max-w-2xl mx-auto px-4">
                {[
                  { text: 'Analyze my symptoms and provide guidance', icon: '🩺', color: 'from-red-50 to-red-100 border-red-200' },
                  { text: 'Check my medication interactions', icon: '💊', color: 'from-blue-50 to-blue-100 border-blue-200' },
                  { text: 'Start a video call consultation', icon: '📹', color: 'from-green-50 to-green-100 border-green-200' },
                  { text: 'Begin a voice call session', icon: '📞', color: 'from-purple-50 to-purple-100 border-purple-200' }
                ].map((suggestion, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (suggestion.text.includes('video call')) {
                        startVideoCall();
                      } else if (suggestion.text.includes('voice call')) {
                        startVoiceCall();
                      } else {
                        setMessage(suggestion.text);
                      }
                    }}
                    className={`text-left p-4 bg-gradient-to-br ${suggestion.color} rounded-xl border hover:shadow-lg transition-all duration-200 text-sm sm:text-base`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{suggestion.icon}</span>
                      <span className="text-gray-700 font-medium">{suggestion.text}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {chatMessages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[85%] sm:max-w-xs lg:max-w-md xl:max-w-lg ${
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              } space-x-2 sm:space-x-3`}>
                <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-lg ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 ml-2 sm:ml-3' 
                    : 'bg-gradient-to-r from-blue-500 to-green-500 mr-2 sm:mr-3'
                }`}>
                  {msg.role === 'user' ? (
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  ) : (
                    <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  )}
                </div>
                <div className={`px-4 sm:px-5 py-3 sm:py-4 rounded-2xl shadow-lg ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-sm'
                    : 'bg-white/90 backdrop-blur-sm text-gray-900 border border-gray-200/50 rounded-bl-sm'
                }`}>
                  <div className="flex items-start space-x-2">
                    {msg.type === 'video' && (
                      <Video className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 mt-1 flex-shrink-0" />
                    )}
                    {msg.type === 'audio' && (
                      <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-1 flex-shrink-0" />
                    )}
                    <div className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
                      {msg.content.split('\n').map((line, index) => {
                        // Handle bold text
                        if (line.includes('**')) {
                          const parts = line.split('**');
                          return (
                            <p key={index} className={index > 0 ? 'mt-2' : ''}>
                              {parts.map((part, partIndex) => 
                                partIndex % 2 === 1 ? 
                                  <strong key={partIndex}>{part}</strong> : 
                                  part
                              )}
                            </p>
                          );
                        }
                        // Handle bullet points
                        if (line.startsWith('•') || line.startsWith('-')) {
                          return (
                            <p key={index} className={`${index > 0 ? 'mt-1' : ''} ml-2`}>
                              {line}
                            </p>
                          );
                        }
                        return line ? <p key={index} className={index > 0 ? 'mt-2' : ''}>{line}</p> : <br key={index} />;
                      })}
                    </div>
                  </div>
                  <p className={`text-xs mt-2 sm:mt-3 ${
                    msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Enhanced Loading Animation */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-full p-2 sm:p-2.5 shadow-lg">
                <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl rounded-bl-sm px-4 sm:px-5 py-3 sm:py-4 shadow-lg">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-600 ml-2">
                    {isThinking ? 'Analyzing your health data...' : 'Generating response...'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Chat Input */}
      <div className="bg-white/80 backdrop-blur-lg border-t border-gray-200/50 px-3 sm:px-6 py-3 sm:py-4 shadow-lg">
        <div className="flex items-end space-x-2 sm:space-x-3">
          <div className="flex-1">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about your health, symptoms, medications, or start a call..."
              rows={1}
              className="w-full resize-none border border-gray-300/50 rounded-xl px-4 sm:px-5 py-3 sm:py-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base bg-white/90 backdrop-blur-sm shadow-lg"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleRecording}
              className={`p-3 sm:p-3.5 rounded-xl transition-all duration-200 shadow-lg ${
                isRecording 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isRecording ? <MicOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Mic className="w-5 h-5 sm:w-6 sm:h-6" />}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendMessage}
              disabled={!message.trim() || isLoading}
              className="bg-gradient-to-r from-blue-500 to-green-500 text-white p-3 sm:p-3.5 rounded-xl hover:from-blue-600 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              <Send className="w-5 h-5 sm:w-6 sm:h-6" />
            </motion.button>
          </div>
        </div>
        
        {/* Features Notice */}
        <div className="mt-2 text-center">
          <p className="text-xs text-gray-500">
            🎯 Try voice commands, video calls, or ask for personalized health advice
          </p>
        </div>
      </div>

      {/* Hidden audio element for playing responses */}
      <audio
        ref={audioRef}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        style={{ display: 'none' }}
      />
    </div>
  );
};