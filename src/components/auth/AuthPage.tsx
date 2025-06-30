import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SignIn } from './SignIn';
import { SignUp } from './SignUp';

export const AuthPage: React.FC = () => {
  const [isSignIn, setIsSignIn] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg')] bg-cover bg-center opacity-5"></div>
      
      <div className="relative z-10 w-full max-w-md">
        <motion.div
          key={isSignIn ? 'signin' : 'signup'}
          initial={{ opacity: 0, x: isSignIn ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isSignIn ? 20 : -20 }}
          transition={{ duration: 0.3 }}
        >
          {isSignIn ? (
            <SignIn onToggleMode={() => setIsSignIn(false)} />
          ) : (
            <SignUp onToggleMode={() => setIsSignIn(true)} />
          )}
        </motion.div>
      </div>

      {/* Background decorations */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
    </div>
  );
};