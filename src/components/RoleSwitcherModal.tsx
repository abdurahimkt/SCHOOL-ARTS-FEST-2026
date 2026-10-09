import React, { useState } from 'react';
import { useFest } from '../context/FestContext';
import { UserRole } from '../types/fest';
import { ShieldCheck, Lock, KeyRound, Eye, EyeOff, X, CheckCircle2, Heart } from 'lucide-react';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({ isOpen, onClose }) => {
  const {
    currentRole,
    switchRole,
    isMfaModalOpen,
    verifyMfaCode,
    cancelMfa,
    privacyDataVisible,
    togglePrivacyData,
    resetToSampleData,
  } = useFest();

  const [mfaCode, setMfaCode] = useState('');
  const [mfaError, setMfaError] = useState('');

  if (!isOpen) return null;

  const roles: {
    id: UserRole;
    name: string;
    description: string;
    requiresMfa: boolean;
    permissions: string[];
  }[] = [
    {
      id: 'spectator',
      name: 'Public Spectator & Student',
      description: 'View real-time leaderboards, announced competition scores, and schedules with masked privacy details.',
      requiresMfa: false,
      permissions: ['View Live Leaderboard', 'Check 3-Day Schedule', 'Self Registration', 'Receive Stage Call Alerts'],
    },
    {
      id: 'coordinator',
      name: 'Staff Coordinator & Stage Ops',
      description: 'Manage candidate call sheets, mark stage readiness, and update logistical work items across venues.',
      requiresMfa: false,
      permissions: ['Export Candidate Call Sheets (PDF/CSV)', 'Toggle Crew Tasks', 'View Contact Info', 'Desk Check-In'],
    },
    {
      id: 'judge',
      name: 'Judge & Official Evaluator',
      description: 'Input rubric scores, calculate grades, verify dynamic rankings, and ratify official contest results.',
      requiresMfa: true,
      permissions: ['Dynamic Rubric Scoring', '3-Judge Bench Averaging', 'Declare & Ratify Results', 'Audit Marks'],
    },
    {
      id: 'admin',
      name: 'Administrator (Festival Bureau)',
      description: 'Full supervisory authority: add/remove teams, revert declared results, push broadcasts, and export gazettes.',
      requiresMfa: true,
      permissions: ['Add / Remove Teams', 'Revert Announce Status', 'System Push Broadcast', 'Executive Analytics Export'],
    },
  ];

  const handleSelectRole = (role: UserRole) => {
    switchRole(role);
    if (!roles.find(r => r.id === role)?.requiresMfa) {
      onClose();
    }
  };

  const handleVerifyMfa = (e: React.FormEvent) => {
    e.preventDefault();
    const success = verifyMfaCode(mfaCode);
    if (success) {
      setMfaCode('');
      setMfaError('');
      onClose();
    } else {
      setMfaError('Invalid code. Please verify and retry.');
    }
  };

  const autofillDemoCode = () => {
    setMfaCode('482910');
    setMfaError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rose-950/25 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white border border-rose-200 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-rose-100 bg-rose-50/50">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-rose-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Access Control & Role Permissions</h2>
              <p className="text-xs text-slate-500">Manage user authorization, add/remove teams permissions, and student data privacy</p>
            </div>
          </div>
          <button
            onClick={() => {
              cancelMfa();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-rose-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* MFA Verification View (if challenge is active) */}
          {isMfaModalOpen ? (
            <div className="bg-rose-50/60 p-5 rounded-2xl border border-rose-200 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-rose-100 rounded-xl text-rose-600 mt-0.5">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Multi-Factor Authentication Required</h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Elevated permissions require secondary authentication to safeguard official tabulation scores and team management.
                  </p>
                </div>
              </div>

              <form onSubmit={handleVerifyMfa} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Enter 6-Digit Authorization PIN
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={mfaCode}
                      onChange={e => {
                        setMfaCode(e.target.value.replace(/\D/g, ''));
                        setMfaError('');
                      }}
                      placeholder="e.g. 482910"
                      className="w-48 bg-white border border-rose-300 focus:border-rose-500 rounded-xl px-3 py-2 text-sm text-center font-mono tracking-widest text-slate-800 placeholder-slate-400 outline-none font-bold"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={autofillDemoCode}
                      className="text-xs text-rose-600 hover:text-rose-700 underline font-bold px-2 py-1"
                    >
                      Use Demo PIN (482910)
                    </button>
                  </div>
                  {mfaError && <p className="text-xs text-rose-600 font-semibold mt-1">{mfaError}</p>}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs rounded-xl shadow-sm shadow-rose-500/20 transition-all"
                  >
                    Confirm & Authenticate
                  </button>
                  <button
                    type="button"
                    onClick={cancelMfa}
                    className="px-3 py-2 text-slate-500 hover:text-slate-800 text-xs transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Role Selection Grid */
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Select Operating Role
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {roles.map(r => {
                  const isCurrent = currentRole === r.id;
                  return (
                    <div
                      key={r.id}
                      onClick={() => handleSelectRole(r.id)}
                      className={`p-4.5 rounded-2xl border text-left cursor-pointer transition-all ${
                        isCurrent
                          ? 'bg-rose-50/90 border-rose-400 ring-2 ring-rose-200/80 shadow-sm text-slate-900'
                          : 'bg-white border-rose-100 hover:border-rose-300 hover:bg-rose-50/30 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900">{r.name}</span>
                        {isCurrent ? (
                          <CheckCircle2 className="w-4 h-4 text-rose-600" />
                        ) : r.requiresMfa ? (
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                        ) : null}
                      </div>
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{r.description}</p>
                      <div className="mt-3 pt-2.5 border-t border-rose-100 flex flex-wrap gap-1.5">
                        {r.permissions.slice(0, 2).map((perm, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 font-medium"
                          >
                            {perm}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Attendee Data Encryption & Privacy Protection Section */}
          <div className="p-4.5 rounded-2xl bg-rose-50/40 border border-rose-100 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">Student Data Privacy & Masking</span>
              </div>
              <button
                onClick={togglePrivacyData}
                className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-xl bg-white border border-rose-200 hover:border-rose-300 transition-colors shadow-2xs font-semibold"
              >
                {privacyDataVisible ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-rose-600" />
                    <span>Mask Confidential Info</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Show Full Details (Privileged)</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              In accordance with educational student privacy standards, phone numbers and emergency contacts are encrypted in transit and masked by default across public rosters.
            </p>
          </div>

          {/* Quick sample restore for testing */}
          <div className="flex items-center justify-between pt-2 border-t border-rose-100 text-xs text-slate-500">
            <span>Festival Database Status: Synchronized (Firebase Firestore Cloud)</span>
            <button
              onClick={resetToSampleData}
              className="text-rose-600 hover:text-rose-700 underline font-semibold transition-colors"
            >
              Reset to Factory Demo State
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
