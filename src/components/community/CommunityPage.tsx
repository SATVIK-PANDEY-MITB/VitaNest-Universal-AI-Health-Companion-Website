import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  MessageCircle, 
  Heart, 
  Share2, 
  Plus, 
  Search, 
  Filter,
  TrendingUp,
  Award,
  Calendar,
  MapPin,
  Clock,
  Star,
  ThumbsUp,
  Eye,
  Crown,
  Sparkles,
  Globe,
  Shield,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface CommunityPost {
  id: string;
  author: {
    name: string;
    avatar: string;
    role: string;
    verified: boolean;
  };
  title: string;
  content: string;
  category: string;
  likes: number;
  comments: number;
  views: number;
  timeAgo: string;
  tags: string[];
}

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  category: string;
}

const PostCard: React.FC<{ post: CommunityPost }> = ({ post }) => (
  <motion.div
    whileHover={{ y: -2 }}
    className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300"
  >
    <div className="flex items-start space-x-4">
      <div className="relative">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold">
          {post.author.avatar}
        </div>
        {post.author.verified && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
            <Crown className="w-2 h-2 text-white" />
          </div>
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-2">
          <h4 className="font-semibold text-gray-900">{post.author.name}</h4>
          <span className="text-sm text-gray-500">•</span>
          <span className="text-sm text-gray-500">{post.author.role}</span>
          <span className="text-sm text-gray-500">•</span>
          <span className="text-sm text-gray-500">{post.timeAgo}</span>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">{post.title}</h3>
        <p className="text-gray-700 mb-4">{post.content}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors">
              <Heart className="w-4 h-4" />
              <span className="text-sm">{post.likes}</span>
            </button>
            <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{post.comments}</span>
            </button>
            <div className="flex items-center space-x-1 text-gray-500">
              <Eye className="w-4 h-4" />
              <span className="text-sm">{post.views}</span>
            </div>
          </div>
          <button className="text-gray-500 hover:text-blue-500 transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </motion.div>
);

const EventCard: React.FC<{ event: CommunityEvent }> = ({ event }) => (
  <motion.div
    whileHover={{ y: -2 }}
    className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{event.title}</h3>
        <p className="text-gray-600 mb-4">{event.description}</p>
      </div>
      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
        {event.category}
      </span>
    </div>
    <div className="space-y-2 mb-4">
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Calendar className="w-4 h-4" />
        <span>{event.date}</span>
      </div>
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Clock className="w-4 h-4" />
        <span>{event.time}</span>
      </div>
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <MapPin className="w-4 h-4" />
        <span>{event.location}</span>
      </div>
    </div>
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Users className="w-4 h-4" />
        <span>{event.attendees} attending</span>
      </div>
      <button className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-green-600 transition-all duration-200">
        Join Event
      </button>
    </div>
  </motion.div>
);

export const CommunityPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'posts' | 'events' | 'members'>('posts');
  const [searchQuery, setSearchQuery] = useState('');

  const communityPosts: CommunityPost[] = [
    {
      id: '1',
      author: {
        name: 'Dr. Sarah Johnson',
        avatar: 'SJ',
        role: 'Cardiologist',
        verified: true
      },
      title: 'Managing Hypertension with AI-Powered Insights',
      content: 'Just wanted to share how VitaNest\'s AI recommendations have helped my patients better manage their blood pressure. The personalized insights are incredibly accurate!',
      category: 'Medical Insights',
      likes: 124,
      comments: 23,
      views: 1250,
      timeAgo: '2 hours ago',
      tags: ['hypertension', 'AI', 'cardiology']
    },
    {
      id: '2',
      author: {
        name: 'Michael Chen',
        avatar: 'MC',
        role: 'Diabetes Patient',
        verified: false
      },
      title: 'My 6-Month Journey with VitaNest',
      content: 'Sharing my experience using VitaNest for diabetes management. The medication tracking and AI advice have been game-changers for my health routine.',
      category: 'Patient Stories',
      likes: 89,
      comments: 15,
      views: 890,
      timeAgo: '4 hours ago',
      tags: ['diabetes', 'patient-story', 'medication']
    },
    {
      id: '3',
      author: {
        name: 'Emily Rodriguez',
        avatar: 'ER',
        role: 'Wellness Coach',
        verified: true
      },
      title: 'The Future of Personalized Health Videos',
      content: 'Excited about the new AI-generated health videos feature! The personalization level is amazing - each video feels like it was made specifically for the individual.',
      category: 'Technology',
      likes: 156,
      comments: 31,
      views: 2100,
      timeAgo: '6 hours ago',
      tags: ['AI-videos', 'personalization', 'technology']
    },
    {
      id: '4',
      author: {
        name: 'Dr. James Wilson',
        avatar: 'JW',
        role: 'Family Physician',
        verified: true
      },
      title: 'Blockchain Security in Healthcare: A Game Changer',
      content: 'As a physician, I\'m impressed by VitaNest\'s blockchain implementation. Patient data security has never been more robust. This is the future of healthcare data management.',
      category: 'Security',
      likes: 203,
      comments: 45,
      views: 3200,
      timeAgo: '1 day ago',
      tags: ['blockchain', 'security', 'healthcare-data']
    }
  ];

  const communityEvents: CommunityEvent[] = [
    {
      id: '1',
      title: 'AI in Healthcare: Monthly Webinar',
      description: 'Join our monthly discussion on the latest AI developments in healthcare and how they\'re transforming patient care.',
      date: 'February 15, 2025',
      time: '2:00 PM EST',
      location: 'Virtual Event',
      attendees: 245,
      category: 'Webinar'
    },
    {
      id: '2',
      title: 'VitaNest User Meetup - New York',
      description: 'Connect with fellow VitaNest users in New York City. Share experiences, learn tips, and network with healthcare professionals.',
      date: 'February 22, 2025',
      time: '6:00 PM EST',
      location: 'Manhattan, NY',
      attendees: 67,
      category: 'Meetup'
    },
    {
      id: '3',
      title: 'Blockchain & Healthcare Security Workshop',
      description: 'Deep dive into how blockchain technology is revolutionizing healthcare data security and patient privacy.',
      date: 'March 1, 2025',
      time: '10:00 AM EST',
      location: 'Virtual Event',
      attendees: 189,
      category: 'Workshop'
    }
  ];

  const handleJoinCommunity = () => {
    if (isAuthenticated) {
      // User is already authenticated, show success message
      alert('Welcome to the VitaNest Community! You can now participate in discussions and events.');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg border-b border-gray-200/50 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-3"
              >
                <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-xl p-2 shadow-lg">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">VitaNest</span>
              </button>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => navigate('/')}
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Home
              </button>
              <span className="text-blue-600 font-medium">Community</span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/auth')}
                className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-green-600 transition-all duration-200"
              >
                {isAuthenticated ? 'Dashboard' : 'Get Started'}
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full mb-6">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">50,000+ Active Members</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                VitaNest
                <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent"> Community</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Connect with healthcare professionals, patients, and wellness enthusiasts. 
                Share experiences, learn from experts, and be part of the healthcare revolution.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleJoinCommunity}
                className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-green-600 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Join Our Community
                <Users className="w-5 h-5 ml-2 inline" />
              </motion.button>
            </motion.div>
          </div>

          {/* Community Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
          >
            <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100">
              <Users className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900 mb-1">50K+</div>
              <div className="text-gray-600">Members</div>
            </div>
            <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100">
              <MessageCircle className="w-8 h-8 text-green-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900 mb-1">25K+</div>
              <div className="text-gray-600">Discussions</div>
            </div>
            <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100">
              <Award className="w-8 h-8 text-purple-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900 mb-1">500+</div>
              <div className="text-gray-600">Experts</div>
            </div>
            <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100">
              <Calendar className="w-8 h-8 text-orange-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900 mb-1">100+</div>
              <div className="text-gray-600">Events</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search discussions, events, or members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
              <button className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-green-600 transition-all duration-200 flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>New Post</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'posts', label: 'Discussions', icon: MessageCircle },
                  { id: 'events', label: 'Events', icon: Calendar },
                  { id: 'members', label: 'Members', icon: Users }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'posts' && (
              <motion.div
                key="posts"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {communityPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </motion.div>
            )}

            {activeTab === 'events' && (
              <motion.div
                key="events"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {communityEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </motion.div>
            )}

            {activeTab === 'members' && (
              <motion.div
                key="members"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {[
                  { name: 'Dr. Sarah Johnson', role: 'Cardiologist', avatar: 'SJ', verified: true, posts: 45 },
                  { name: 'Michael Chen', role: 'Diabetes Patient', avatar: 'MC', verified: false, posts: 23 },
                  { name: 'Emily Rodriguez', role: 'Wellness Coach', avatar: 'ER', verified: true, posts: 67 },
                  { name: 'Dr. James Wilson', role: 'Family Physician', avatar: 'JW', verified: true, posts: 89 },
                  { name: 'Lisa Thompson', role: 'Chronic Pain Patient', avatar: 'LT', verified: false, posts: 34 },
                  { name: 'Robert Kim', role: 'Health Tech Enthusiast', avatar: 'RK', verified: false, posts: 56 }
                ].map((member, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ y: -2 }}
                    className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center hover:shadow-xl transition-all duration-300"
                  >
                    <div className="relative mb-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto">
                        {member.avatar}
                      </div>
                      {member.verified && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <Crown className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{member.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{member.role}</p>
                    <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{member.posts} posts</span>
                      </div>
                    </div>
                    <button className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white py-2 rounded-lg font-medium hover:from-blue-600 hover:to-green-600 transition-all duration-200">
                      Connect
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Join the Conversation?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Connect with thousands of healthcare professionals and patients. 
              Share your story, learn from others, and be part of the future of healthcare.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleJoinCommunity}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-200 shadow-lg"
            >
              Join VitaNest Community
              <Users className="w-5 h-5 ml-2 inline" />
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};