import React, { useState } from 'react';
import { useFest } from '../context/FestContext';
import { Shield, Bell, Volume2, VolumeX, Menu, X } from 'lucide-react';
import { UserRole } from '../types/fest';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNotifications: () => void;
  onOpenRoleModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNotifications,
  onOpenRoleModal,
}) => {
  const {
    currentRole,
    notifications,
    audioAlertsEnabled,
    toggleAudioAlerts,
    isFirebaseConnected,
    firebaseUser,
    loginWithGoogle,
    logoutFirebase,
  } = useFest();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'judge':
        return 'Judge Panel';
      case 'coordinator':
        return 'Staff Coordinator';
      case 'spectator':
        return 'Public Spectator';
    }
  };

  const navItems = [
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'results', label: 'Results' },
    { id: 'candidates', label: 'Candidates' },
    { id: 'judge', label: 'Judge Console' },
    { id: 'schedule', label: '3-Day Schedule' },
    { id: 'crew', label: 'Crew & Ops' },
    { id: 'register', label: 'Registration' },
    { id: 'analytics', label: 'Analytics' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-rose-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Strictly compliant 3-zone Top Bar Contract */}
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <button
            onClick={() => setActiveTab('leaderboard')}
            className="text-left font-extrabold tracking-tight bg-gradient-to-r from-rose-500 via-purple-600 to-amber-500 bg-clip-text text-transparent text-lg sm:text-xl whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity flex items-center gap-1.5"
          >
            <span>KalaUtsav</span>
            <span className="text-rose-500 text-sm">🌸</span>
            <span>2026</span>
          </button>

          {/* Zone 2: Concise single-line navigation links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`whitespace-nowrap shrink-0 transition-colors pb-0.5 border-b-2 font-medium ${
                    isActive
                      ? 'text-rose-600 border-rose-500 font-bold'
                      : 'border-transparent text-slate-600 hover:text-rose-600'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Functional Actions & Role Access */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Firebase Live Cloud Status & Auth */}
            <div className="hidden sm:flex items-center gap-2">
              <span
                className={`text-[11px] font-semibold px-2 py-1 rounded-lg border flex items-center gap-1.5 ${
                  isFirebaseConnected
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
                title="Firestore Realtime Database Status"
              >
                <span className={`w-2 h-2 rounded-full ${isFirebaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span>{isFirebaseConnected ? '🔥 Cloud Live' : 'Connecting...'}</span>
              </span>

              {firebaseUser ? (
                <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 rounded-xl px-2.5 py-1 text-xs">
                  {firebaseUser.photoURL ? (
                    <img
                      src={firebaseUser.photoURL}
                      alt={firebaseUser.displayName || 'User'}
                      referrerPolicy="no-referrer"
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center text-[10px] font-bold">
                      {(firebaseUser.displayName || firebaseUser.email || 'U')[0].toUpperCase()}
                    </span>
                  )}
                  <span className="font-bold text-slate-800 truncate max-w-[80px]">
                    {firebaseUser.displayName?.split(' ')[0] || 'User'}
                  </span>
                  <button
                    onClick={logoutFirebase}
                    className="text-[10px] text-slate-400 hover:text-rose-600 underline font-semibold ml-1"
                  >
                    Exit
                  </button>
                </div>
              ) : (
                <button
                  onClick={loginWithGoogle}
                  className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-xl transition-colors shadow-2xs"
                  title="Sign in with your Google account"
                >
                  Google Login
                </button>
              )}
            </div>

            {/* Audio alert toggle */}
            <button
              onClick={toggleAudioAlerts}
              title={audioAlertsEnabled ? 'Mute announcement audio chimes' : 'Unmute announcement audio chimes'}
              aria-label={audioAlertsEnabled ? 'Mute audio' : 'Unmute audio'}
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              {audioAlertsEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            {/* Notification button with counter */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Push Notifications & Live Stage Calls"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </button>

            {/* Role switch button with MFA indicator */}
            <button
              onClick={onOpenRoleModal}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-rose-900 bg-rose-50/80 border border-rose-200 hover:bg-rose-100 rounded-xl transition-all whitespace-nowrap shrink-0 shadow-xs"
              title="Switch user role or verify credentials"
            >
              <Shield className="w-3.5 h-3.5 text-rose-500" />
              <span className="hidden sm:inline text-rose-700 font-normal">Role:</span>
              <span className="font-bold text-rose-900">{getRoleLabel(currentRole)}</span>
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile navigation drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-rose-100 grid grid-cols-2 gap-2 text-sm bg-white/95">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`text-left px-3 py-2 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-rose-50 text-rose-700 font-bold border border-rose-200'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};
