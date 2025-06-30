import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { AuthPage } from './components/auth/AuthPage';
import { HomePage } from './components/home/HomePage';
import { CommunityPage } from './components/community/CommunityPage';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './components/dashboard/Dashboard';
import { ChatBot } from './components/chat/ChatBot';
import { Medications } from './components/medications/Medications';
import { Appointments } from './components/appointments/Appointments';
import { Profile } from './components/profile/Profile';
import { Settings } from './components/settings/Settings';
import { BillingSettings } from './components/settings/BillingSettings';
import { Loader } from 'lucide-react';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

// Bolt.new Badge Component
const BoltBadge: React.FC = () => (
  <div className="fixed bottom-4 right-4 z-50">
    <a
      href="https://bolt.new"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 text-sm font-medium"
    >
      <span className="text-lg">⚡</span>
      <span>Built with Bolt.new</span>
    </a>
  </div>
);

function App() {
  const { initializeAuth, isLoading, isAuthenticated } = useAuthStore();

  useEffect(() => {
    console.log('🚀 Initializing VitaNest application...');
    initializeAuth();
  }, [initializeAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-full p-4 w-20 h-20 mx-auto mb-6 shadow-lg">
            <Loader className="w-12 h-12 text-white animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">VitaNest</h2>
          <p className="text-gray-600">Initializing your AI health companion...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/auth" element={isAuthenticated ? <Navigate to="/app/dashboard" /> : <AuthPage />} />

          {/* Protected App Routes */}
          <Route
            path="/app/*"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="chat" element={<ChatBot />} />
            <Route path="medications" element={<Medications />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="billing" element={<BillingSettings />} />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Bolt.new Badge */}
        <BoltBadge />

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;