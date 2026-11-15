import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, UserCheck, ArrowRight, AlertCircle, Shield } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    authModalMode,
    closeAuthModal,
    openAuthModal,
    signIn,
    signUp,
    loginAsGuest,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (authModalMode === 'signup') {
        const res = await signUp(email, password);
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          setSuccessMsg('Account created successfully! You are now signed in.');
        }
      } else {
        const res = await signIn(email, password);
        if (res.error) {
          setErrorMsg(res.error);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestLogin = async () => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const res = await loginAsGuest();
      if (res.error) {
        setErrorMsg(res.error);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Guest sign-in failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white border border-[#E5E5DC] rounded-2xl shadow-xl overflow-hidden font-sans text-[#202522]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#E5E5DC]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#EBF1ED] text-[#385E48] rounded-lg">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display text-sm font-bold text-[#202522] uppercase tracking-wider">
                {authModalMode === 'signup' ? 'Create an Account' : 'Welcome to CoolCorridor'}
              </h3>
              <p className="text-[11px] text-[#5A6860]">
                Access route history, save itineraries & submit feedback
              </p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1 text-[#5A6860] hover:text-[#202522] rounded-md transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Mode Switch Tabs (Sign Up vs Log In) */}
          <div className="grid grid-cols-2 p-1 bg-[#F7F7F3] rounded-lg border border-[#E5E5DC] text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setErrorMsg(null);
                setSuccessMsg(null);
                openAuthModal('login');
              }}
              className={`py-1.5 rounded-md transition-all cursor-pointer ${
                authModalMode === 'login'
                  ? 'bg-white text-[#202522] shadow-xs font-semibold'
                  : 'text-[#5A6860] hover:text-[#202522]'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => {
                setErrorMsg(null);
                setSuccessMsg(null);
                openAuthModal('signup');
              }}
              className={`py-1.5 rounded-md transition-all cursor-pointer ${
                authModalMode === 'signup'
                  ? 'bg-white text-[#202522] shadow-xs font-semibold'
                  : 'text-[#5A6860] hover:text-[#202522]'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#5A6860] mb-1">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 w-4 h-4 text-[#5A6860]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#E5E5DC] rounded-lg focus:outline-none focus:border-[#385E48] focus:ring-1 focus:ring-[#385E48]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#5A6860] mb-1">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 w-4 h-4 text-[#5A6860]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#E5E5DC] rounded-lg focus:outline-none focus:border-[#385E48] focus:ring-1 focus:ring-[#385E48]"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-2.5 bg-[#EBF1ED] border border-[#385E48]/30 rounded-lg text-[#274333] text-xs">
                {successMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-[#385E48] hover:bg-[#274333] disabled:bg-[#B8C7BE] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isSubmitting ? (
                <span>Processing...</span>
              ) : (
                <>
                  <span>{authModalMode === 'signup' ? 'Create Account' : 'Log In'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center pt-1 pb-1">
            <div className="border-t border-[#E5E5DC] w-full" />
            <span className="bg-white px-2 text-[10px] font-mono text-[#5A6860] uppercase absolute">
              or
            </span>
          </div>

          {/* Option 3: Continue as Guest */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={handleGuestLogin}
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-[#F7F7F3] hover:bg-[#EAEAE4] text-[#202522] border border-[#E5E5DC] text-xs font-medium rounded-lg shadow-2xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-[#385E48]" />
              <span>Continue as Guest</span>
            </button>
            <p className="text-[10px] text-center text-[#5A6860]">
              Instant access without entering email, password, name, or phone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
