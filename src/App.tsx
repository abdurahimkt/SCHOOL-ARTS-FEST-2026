/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FestProvider, useFest } from './context/FestContext';
import { Navbar } from './components/Navbar';
import { LiveLeaderboard } from './components/LiveLeaderboard';
import { ResultsSection } from './components/ResultsSection';
import { ProgramCandidateDirectory } from './components/ProgramCandidateDirectory';
import { JudgeDashboard } from './components/JudgeDashboard';
import { ScheduleView } from './components/ScheduleView';
import { StudentRegistration } from './components/StudentRegistration';
import { CrewOperations } from './components/CrewOperations';
import { AnalyticsModule } from './components/AnalyticsModule';
import { NotificationDrawer } from './components/NotificationDrawer';
import { RoleSwitcherModal } from './components/RoleSwitcherModal';
import { FloatingLeaderboard } from './components/FloatingLeaderboard';

function MainApp() {
  const [activeTab, setActiveTab] = useState<string>('leaderboard');
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState<boolean>(false);

  const { setSelectedProgramId } = useFest();

  const handleSelectProgramForJudging = (progId: string) => {
    setSelectedProgramId(progId);
    setActiveTab('judge');
  };

  const handleSelectProgramFromSchedule = (progId: string) => {
    setSelectedProgramId(progId);
    setActiveTab('candidates');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5F7] via-[#FAF5FF] to-[#FFF1F2] text-slate-800 flex flex-col font-sans selection:bg-rose-500/25 selection:text-rose-700">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNotifications={() => setIsNotifOpen(true)}
        onOpenRoleModal={() => setIsRoleModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'leaderboard' && <LiveLeaderboard />}
        {activeTab === 'results' && (
          <ResultsSection onSelectProgramForJudging={handleSelectProgramForJudging} />
        )}
        {activeTab === 'candidates' && <ProgramCandidateDirectory />}
        {activeTab === 'judge' && <JudgeDashboard />}
        {activeTab === 'schedule' && (
          <ScheduleView onSelectProgram={handleSelectProgramFromSchedule} />
        )}
        {activeTab === 'crew' && <CrewOperations />}
        {activeTab === 'register' && <StudentRegistration />}
        {activeTab === 'analytics' && <AnalyticsModule />}
      </main>

      {/* Persistent Floating Leaderboard Widget */}
      <FloatingLeaderboard onOpenFullLeaderboard={() => setActiveTab('leaderboard')} />

      {/* Drawer & Modals */}
      <NotificationDrawer
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
      />
      <RoleSwitcherModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-rose-100 bg-white/70 backdrop-blur-sm py-6 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-medium text-slate-600">KalaUtsav 🌸 2026 · Annual Inter-House Arts Festival Management System</span>
          <div className="flex items-center gap-4 text-slate-500 font-medium">
            <button
              onClick={() => setActiveTab('leaderboard')}
              className="hover:text-rose-600 transition-colors"
            >
              Standings
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className="hover:text-rose-600 transition-colors"
            >
              Schedules
            </button>
            <button
              onClick={() => setIsRoleModalOpen(true)}
              className="hover:text-rose-600 transition-colors"
            >
              Security & Roles
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <FestProvider>
      <MainApp />
    </FestProvider>
  );
}
