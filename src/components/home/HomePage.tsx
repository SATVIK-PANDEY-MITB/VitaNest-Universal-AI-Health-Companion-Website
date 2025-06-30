import React from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Shield, 
  Zap, 
  Users, 
  Star, 
  ArrowRight, 
  CheckCircle, 
  Play,
  Award,
  TrendingUp,
  Globe,
  Sparkles,
  Brain,
  Video,
  Volume2,
  Crown,
  Quote
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}> = ({ icon, title, description, gradient }) => (
  <motion.div
    whileHover={{ y: -8, scale: 1.02 }}
    className={`bg-gradient-to-br ${gradient} rounded-xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300`}
  >
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-white/90">{description}</p>
  </motion.div>
);

const TestimonialCard: React.FC<{
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
}> = ({ name, role, content, rating, avatar }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
  >
    <div className="flex items-center mb-4">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        />
      ))}
    </div>
    <Quote className="w-6 h-6 text-blue-500 mb-3" />
    <p className="text-gray-700 mb-4 italic">"{content}"</p>
    <div className="flex items-center">
      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
        {avatar}
      </div>
      <div>
        <h4 className="font-semibold text-gray-900">{name}</h4>
        <p className="text-sm text-gray-600">{role}</p>
      </div>
    </div>
  </motion.div>
);

const StatCard: React.FC<{
  number: string;
  label: string;
  icon: React.ReactNode;
}> = ({ number, label, icon }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
  >
    <div className="flex justify-center mb-3">{icon}</div>
    <div className="text-3xl font-bold text-white mb-2">{number}</div>
    <div className="text-white/80">{label}</div>
  </motion.div>
);

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
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
              <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-xl p-2 shadow-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">VitaNest</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors">Features</a>
              <a href="#about" className="text-gray-700 hover:text-blue-600 transition-colors">About</a>
              <a href="#testimonials" className="text-gray-700 hover:text-blue-600 transition-colors">Reviews</a>
              <button
                onClick={() => navigate('/community')}
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Community
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGetStarted}
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
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">AI-Powered Healthcare Revolution</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Your AI Health
                <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent"> Companion</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Experience the future of healthcare with VitaNest - where AI meets personalized medicine. 
                Get intelligent health insights, medication management, and 24/7 AI consultations.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGetStarted}
                  className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-green-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Start Your Health Journey
                  <ArrowRight className="w-5 h-5 ml-2 inline" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <Play className="w-5 h-5" />
                  <span className="font-medium">Watch Demo</span>
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Hero Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-2xl p-8 text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full transform translate-x-32 -translate-y-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full transform -translate-x-24 translate-y-24"></div>
            <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8">
              <StatCard number="50K+" label="Active Users" icon={<Users className="w-8 h-8" />} />
              <StatCard number="1M+" label="Health Insights" icon={<Brain className="w-8 h-8" />} />
              <StatCard number="99.9%" label="Uptime" icon={<Shield className="w-8 h-8" />} />
              <StatCard number="24/7" label="AI Support" icon={<Heart className="w-8 h-8" />} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Revolutionary Health Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover how VitaNest transforms healthcare with cutting-edge AI technology and personalized insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Brain className="w-12 h-12" />}
              title="AI Health Assistant"
              description="Get instant, intelligent health advice powered by advanced medical AI and your personal health profile."
              gradient="from-blue-500 to-blue-600"
            />
            <FeatureCard
              icon={<Video className="w-12 h-12" />}
              title="Personalized Videos"
              description="Receive custom health videos generated by Tavus AI, tailored specifically to your health needs and conditions."
              gradient="from-purple-500 to-purple-600"
            />
            <FeatureCard
              icon={<Volume2 className="w-12 h-12" />}
              title="Voice Synthesis"
              description="Experience natural voice responses with ElevenLabs technology for hands-free health consultations."
              gradient="from-green-500 to-green-600"
            />
            <FeatureCard
              icon={<Shield className="w-12 h-12" />}
              title="Blockchain Security"
              description="Your health data is secured on the Algorand blockchain with enterprise-grade encryption and privacy."
              gradient="from-indigo-500 to-indigo-600"
            />
            <FeatureCard
              icon={<Zap className="w-12 h-12" />}
              title="Smart Medication"
              description="Intelligent medication tracking with interaction warnings, reminders, and personalized guidance."
              gradient="from-orange-500 to-orange-600"
            />
            <FeatureCard
              icon={<TrendingUp className="w-12 h-12" />}
              title="Health Analytics"
              description="Advanced health insights and trends powered by AI to help you make informed decisions about your wellbeing."
              gradient="from-pink-500 to-pink-600"
            />
          </div>
        </div>
      </section>

      {/* About Section with CEO */}
      <section id="about" className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Leadership
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Driven by innovation and a passion for transforming healthcare through technology.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full mb-6">
                <Crown className="w-4 h-4" />
                <span className="text-sm font-medium">Co-founder & CEO</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Satvik Pandey</h3>
              <p className="text-lg text-gray-600 mb-6">
                Visionary leader with a passion for revolutionizing healthcare through AI and blockchain technology. 
                Satvik brings years of experience in healthcare innovation and a deep commitment to making quality 
                healthcare accessible to everyone.
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-center lg:justify-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Healthcare Technology Expert</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">AI & Blockchain Innovator</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Patient-Centric Advocate</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex justify-center"
            >
              <div className="relative">
                <div className="w-80 h-80 rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src="/Satvik2.jpg"
                    alt="Satvik Pandey-Founder & CEO"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl p-4 text-white shadow-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold">5+</div>
                    <div className="text-sm">Years Experience</div>
                  </div>
                </div>
                <div className="absolute -top-6 -left-6 bg-white rounded-xl p-4 shadow-lg">
                  <Award className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of satisfied users who have transformed their healthcare experience with VitaNest.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard
              name="Dr. Sarah Johnson"
              role="Cardiologist"
              content="VitaNest has revolutionized how I monitor my patients' health. The AI insights are incredibly accurate and help me provide better care."
              rating={5}
              avatar="SJ"
            />
            <TestimonialCard
              name="Michael Chen"
              role="Diabetes Patient"
              content="The medication tracking and AI health advice have been game-changers for managing my diabetes. I feel more in control of my health than ever."
              rating={5}
              avatar="MC"
            />
            <TestimonialCard
              name="Emily Rodriguez"
              role="Wellness Enthusiast"
              content="The personalized health videos and voice responses make it feel like having a personal health coach available 24/7. Absolutely amazing!"
              rating={5}
              avatar="ER"
            />
            <TestimonialCard
              name="Dr. James Wilson"
              role="Family Physician"
              content="The blockchain security gives me confidence in recommending VitaNest to my patients. Their data is truly protected."
              rating={5}
              avatar="JW"
            />
            <TestimonialCard
              name="Lisa Thompson"
              role="Chronic Pain Patient"
              content="VitaNest helped me track my symptoms and medications effectively. The AI suggestions have improved my quality of life significantly."
              rating={5}
              avatar="LT"
            />
            <TestimonialCard
              name="Robert Kim"
              role="Health Tech Enthusiast"
              content="The integration of AI, blockchain, and healthcare is seamless. VitaNest is truly the future of personalized medicine."
              rating={5}
              avatar="RK"
            />
          </div>
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
              Ready to Transform Your Health?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of users who trust VitaNest for their healthcare needs. 
              Start your journey to better health today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGetStarted}
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-200 shadow-lg"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2 inline" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/community')}
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-200"
              >
                Join Community
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-xl p-2">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">VitaNest</span>
              </div>
              <p className="text-gray-400">
                Transforming healthcare through AI innovation and personalized medicine.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 VitaNest. All rights reserved. Built with ❤️ for better healthcare.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};