import React, { useState } from 'react';
import { auth } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { Wallet, LogIn, UserPlus, Mail, Lock, User as UserIcon, AlertCircle, Chrome } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Auth: React.FC<{ onAuthSuccess: (user: any) => void }> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      onAuthSuccess(result.user);
    } catch (err: any) {
      console.error('Google Auth failed:', err);
      setError(err.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        onAuthSuccess(userCredential.user);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        onAuthSuccess(userCredential.user);
      }
    } catch (err: any) {
      console.error('Auth failed:', err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password authentication is currently disabled. Please use Google Sign-In or enable it in the Firebase Console.');
      } else {
        setError(err.message || 'Authentication failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4 font-serif">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-sm w-full bg-[#1a1a1a] rounded-[24px] shadow-xl p-8 text-center border border-white/5"
      >
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg text-[#0a0a0a]">
          <Wallet className="w-6 h-6" />
        </div>
        
        <h1 className="text-lg font-bold text-white mb-6">Finance Track</h1>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-rose-500/10 text-rose-400 text-sm rounded-2xl flex items-center gap-3 border border-rose-500/20"
            >
              <AlertCircle size={16} />
              <p className="text-left text-xs">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          {!isLogin && (
            <div className="relative group">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white transition-colors" size={16} />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-white/5 border-none rounded-xl text-xs font-medium text-white placeholder-white/20 focus:ring-2 focus:ring-white/10 transition-all outline-none"
              />
            </div>
          )}
          
          <div className="relative group">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white transition-colors" size={16} />
            <input
              type="email"
              required
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-white/5 border-none rounded-xl text-xs font-medium text-white placeholder-white/20 focus:ring-2 focus:ring-white/10 transition-all outline-none"
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white transition-colors" size={16} />
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-white/5 border-none rounded-xl text-xs font-medium text-white placeholder-white/20 focus:ring-2 focus:ring-white/10 transition-all outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-white text-[#0a0a0a] font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-white/5 active:scale-95 disabled:opacity-50 text-xs"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-[#0a0a0a] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {isLogin ? <LogIn size={16} /> : <UserPlus size={16} />}
                {isLogin ? 'Sign In' : 'Create Account'}
              </>
            )}
          </button>
        </form>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#1a1a1a] px-4 text-white/20 font-bold">Or continue with</span>
          </div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3 bg-white/5 border border-white/10 hover:border-white/20 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50 mb-6 text-xs"
        >
          <Chrome size={16} className="text-[#4285F4]" />
          Sign in with Google
        </button>

        <p className="text-xs text-white/40">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-white font-bold hover:underline"
          >
            {isLogin ? 'Register Now' : 'Sign In'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};
