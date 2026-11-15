import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, X, ArrowUpRight, User, LogOut, UserCheck, Shield } from 'lucide-react';

interface NavbarProps {
  onPlanRouteClick: () => void;
  isBackendHealthy?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onPlanRouteClick,
  isBackendHealthy = true,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isGuest, signOut, openAuthModal } = useAuth();

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F7F7F3]/90 backdrop-blur-md border-b border-[#E5E5DC]/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-3 group whitespace-nowrap shrink-0 text-[#202522]"
        >
          <div className="relative w-7 h-7 rounded-lg bg-[#202522] text-[#F7F7F3] flex items-center justify-center transition-all duration-300 group-hover:bg-[#385E48]">
            <svg
              className="w-4 h-4"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 14c2.5-2 5.5-2.5 8-1s4.5 1.5 6-1" opacity="0.4" />
              <path d="M3 10c2.5-2 5.5-2.5 8-1s4.5 1.5 6-1" />
              <path d="M3 6c2.5-2 5.5-2.5 8-1s4.5 1.5 6-1" opacity="0.4" />
              <circle cx="11" cy="9" r="1.5" fill="currentColor" />
            </svg>
          </div>

          <div className="flex flex-col">
            <span className="font-semibold text-base tracking-tight text-[#202522] font-display">
              CoolCorridor
            </span>
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#5A6860] -mt-0.5">
              Phoenix Urban Heat Lab
            </span>
          </div>
        </a>

        {/* Navigation Links */}
        <nav className="hidden xl:flex items-center gap-6 text-[13px] text-[#5A6860]">
          {[
            { id: 'planner', label: 'Route Planner' },
            { id: 'history', label: 'Route History' },
            { id: 'feedback', label: 'Feedback' },
            { id: 'key-findings', label: 'Key Findings' },
            { id: 'how-it-works', label: 'How It Works' },
            { id: 'research', label: 'Routing Model' },
            { id: 'methodology', label: 'Data & Boundaries' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="relative py-1 font-medium transition-colors hover:text-[#202522] cursor-pointer whitespace-nowrap after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-[#385E48] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-200"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right Section: Auth Indicator & Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Authentication Badge / Options */}
          {user ? (
            <div className="flex items-center gap-2 bg-white border border-[#E5E5DC] rounded-full px-2.5 py-1 text-xs">
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#202522]">
                {isGuest ? (
                  <>
                    <UserCheck className="w-3.5 h-3.5 text-[#385E48]" />
                    <span className="font-semibold text-[#385E48]">Guest Access</span>
                  </>
                ) : (
                  <>
                    <User className="w-3.5 h-3.5 text-[#385E48]" />
                    <span className="font-semibold truncate max-w-[120px] sm:max-w-[150px]">
                      {user.email?.split('@')[0]}
                    </span>
                  </>
                )}
              </div>

              {isGuest && (
                <button
                  type="button"
                  onClick={() => openAuthModal('signup')}
                  className="hidden sm:inline-block text-[10px] font-semibold text-[#385E48] hover:underline cursor-pointer pl-1 border-l border-[#E5E5DC]"
                  title="Create registered account to keep routes across devices"
                >
                  Sign Up
                </button>
              )}

              <button
                type="button"
                onClick={() => signOut()}
                className="p-1 text-[#5A6860] hover:text-rose-600 rounded transition-colors cursor-pointer border-l border-[#E5E5DC] ml-1 pl-1.5"
                title="Log Out"
                aria-label="Log Out"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-white hover:bg-[#F1F1EB] text-[#202522] border border-[#E5E5DC] rounded-full text-xs font-medium shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5 text-[#385E48]" />
                <span>Sign In / Guest</span>
              </button>
            </div>
          )}

          {/* Primary Plan Route Action */}
          <button
            onClick={onPlanRouteClick}
            className="group inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 text-xs font-medium text-white bg-[#202522] hover:bg-[#385E48] transition-all duration-200 rounded-full shadow-xs whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>Plan Route</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-white/70 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 text-[#5A6860] hover:text-[#202522] rounded-lg transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-[#E5E5DC] bg-[#F7F7F3]/98 px-5 py-4 space-y-3 backdrop-blur-md">
          {[
            { id: 'planner', label: 'Route Planner' },
            { id: 'history', label: 'Saved Route History' },
            { id: 'feedback', label: 'Submit Feedback' },
            { id: 'key-findings', label: 'Key Findings Dashboard' },
            { id: 'how-it-works', label: 'How It Works' },
            { id: 'research', label: 'Routing Model & Weights' },
            { id: 'methodology', label: 'Data & Boundaries' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="block w-full text-left py-1.5 text-sm font-medium text-[#202522] hover:text-[#385E48] cursor-pointer"
            >
              {item.label}
            </button>
          ))}

          <div className="pt-3 border-t border-[#E5E5DC] flex flex-col gap-2">
            {user ? (
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#5A6860]">
                  Signed in as: <strong className="text-[#202522]">{isGuest ? 'Guest' : user.email}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="text-rose-600 font-medium hover:underline"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1.5 pt-1 text-center text-xs">
                <button
                  type="button"
                  onClick={() => openAuthModal('signup')}
                  className="py-1.5 bg-white border border-[#E5E5DC] rounded text-[#202522] font-medium"
                >
                  Sign Up
                </button>
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="py-1.5 bg-white border border-[#E5E5DC] rounded text-[#202522] font-medium"
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    useAuth().loginAsGuest();
                  }}
                  className="py-1.5 bg-[#EBF1ED] border border-[#385E48]/30 rounded text-[#274333] font-medium"
                >
                  Guest
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};