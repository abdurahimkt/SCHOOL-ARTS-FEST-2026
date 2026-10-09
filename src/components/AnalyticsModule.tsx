import React from 'react';
import { useFest } from '../context/FestContext';
import {
  BarChart3,
  TrendingUp,
  Download,
  FileText,
  Users,
  Award,
  Sparkles,
  Heart,
} from 'lucide-react';
import {
  exportConsolidatedFestReportPDF,
  exportHouseStandingsCSV,
  exportCrewOperationsCSV,
  downloadCSV,
} from '../utils/exportUtils';

export const AnalyticsModule: React.FC = () => {
  const { houses, programs, candidates, results, crewMembers, crewTasks } = useFest();

  const totalRegistered = candidates.length;

  // Grade distributions across announced results
  let totalGrades = { A: 0, B: 0, C: 0, D: 0 };
  let totalAwardedGrades = 0;

  Object.values(results).forEach(r => {
    if (r?.isAnnounced) {
      r.scores.forEach(s => {
        if (s.grade === 'A') totalGrades.A++;
        else if (s.grade === 'B') totalGrades.B++;
        else if (s.grade === 'C') totalGrades.C++;
        else totalGrades.D++;
        totalAwardedGrades++;
      });
    }
  });

  if (totalAwardedGrades === 0) totalAwardedGrades = 1; // avoid / 0

  // Count participants per category
  const categoryCounts = candidates.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleExportAllCandidatesCSV = () => {
    const headers = [
      'Chest Number',
      'Name',
      'House ID',
      'House Name',
      'Category',
      'Grade Section',
      'Registered Events Count',
      'Total Points Won',
    ];

    const rows = candidates.map(c => {
      const h = houses.find(house => house.id === c.houseId);
      return [
        c.chestNumber,
        `"${c.name}"`,
        c.houseId,
        `"${h?.name || ''}"`,
        c.category,
        c.gradeSection,
        c.registeredPrograms.length,
        c.totalPointsWon,
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    downloadCSV('KalaUtsav_Master_Candidates.csv', csvContent);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="bg-white border border-rose-100 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-wider">
              <BarChart3 className="w-4 h-4 text-rose-500" />
              <span>Executive Reporting & Planning Intelligence</span>
              <span className="text-slate-300">·</span>
              <span className="text-pink-600 font-semibold flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 fill-pink-500" />
                <span>Audited Insights</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Festival Participation Analytics & Insights
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Historical engagement trends, grade distributions, and multi-format document export engine (PDF and CSV) for future curriculum planning and school administration archiving.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => exportConsolidatedFestReportPDF(houses, programs, results)}
              className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm shadow-rose-500/20"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Export Full PDF Dossier</span>
            </button>
            <button
              onClick={handleExportAllCandidatesCSV}
              className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors flex items-center gap-2 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export All Candidates CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-rose-100 rounded-2xl p-4.5 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold">Total Enrolled Artists</span>
          <div className="text-2xl font-black text-slate-900 font-mono tabular-nums mt-1">
            {totalRegistered}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium mt-1 block">Across {houses.length} Active Houses</span>
        </div>

        <div className="bg-white border border-rose-100 rounded-2xl p-4.5 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold">Total Competitive Events</span>
          <div className="text-2xl font-black text-slate-900 font-mono tabular-nums mt-1">
            {programs.length}
          </div>
          <span className="text-[11px] text-rose-600 font-medium mt-1 block">3 Fest Days</span>
        </div>

        <div className="bg-white border border-rose-100 rounded-2xl p-4.5 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold">Total Grade-A Merits</span>
          <div className="text-2xl font-black text-emerald-700 font-mono tabular-nums mt-1">
            {totalGrades.A}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {Math.round((totalGrades.A / totalAwardedGrades) * 100)}% of scored entries
          </span>
        </div>

        <div className="bg-white border border-rose-100 rounded-2xl p-4.5 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold">Crew Tasks Executed</span>
          <div className="text-2xl font-black text-slate-900 font-mono tabular-nums mt-1">
            {crewTasks.filter(t => t.completed).length} / {crewTasks.length}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium mt-1 block">
            {Math.round((crewTasks.filter(t => t.completed).length / (crewTasks.length || 1)) * 100)}% Readiness
          </span>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Participation Distribution by House */}
        <div className="bg-white border border-rose-100 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-rose-500" />
              <span>House Roster & Turnout Volume</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">{totalRegistered} Total</span>
          </div>

          <div className="space-y-3 pt-1">
            {houses.map(h => {
              const count = candidates.filter(c => c.houseId === h.id).length;
              const share = totalRegistered > 0 ? Math.round((count / totalRegistered) * 100) : 25;

              return (
                <div key={h.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span>{h.logoEmoji || '🌸'}</span>
                      <span>{h.name}</span>
                    </span>
                    <span className="text-slate-500 font-mono tabular-nums">
                      {count} candidates ({share}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${share}%`, backgroundColor: h.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Grade Distribution */}
        <div className="bg-white border border-rose-100 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Academic Grade Distribution (Evaluated Events)</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              {totalAwardedGrades} Scored Marks
            </span>
          </div>

          <div className="space-y-3.5 pt-1">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-emerald-700 font-bold">Grade A (≥ 80 Marks)</span>
                <span className="font-mono tabular-nums text-slate-700 font-semibold">
                  {totalGrades.A} ({Math.round((totalGrades.A / totalAwardedGrades) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${(totalGrades.A / totalAwardedGrades) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-blue-700 font-bold">Grade B (≥ 70 Marks)</span>
                <span className="font-mono tabular-nums text-slate-700 font-semibold">
                  {totalGrades.B} ({Math.round((totalGrades.B / totalAwardedGrades) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${(totalGrades.B / totalAwardedGrades) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-amber-700 font-bold">Grade C (≥ 60 Marks)</span>
                <span className="font-mono tabular-nums text-slate-700 font-semibold">
                  {totalGrades.C} ({Math.round((totalGrades.C / totalAwardedGrades) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${(totalGrades.C / totalAwardedGrades) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown & Document Export Hub */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white border border-rose-100 rounded-2xl p-6 space-y-3 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900">Turnout by Competition Division</h3>
          <div className="grid grid-cols-2 gap-3 text-xs pt-1">
            {Object.entries(categoryCounts).map(([cat, count]) => (
              <div key={cat} className="p-3.5 bg-rose-50/40 rounded-xl border border-rose-100">
                <span className="text-slate-500 font-semibold block">{cat}</span>
                <span className="text-lg font-black text-slate-900 font-mono tabular-nums mt-0.5 block">
                  {count} <span className="text-xs text-slate-400 font-normal">Participants</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Export Hub */}
        <div className="bg-white border border-rose-100 rounded-2xl p-6 space-y-3 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900">Central Export & Printing Vault 🌸</h3>
          <p className="text-xs text-slate-500">
            One-click generated files formatted for high-resolution desk printing or offline spreadsheet analysis.
          </p>

          <div className="grid grid-cols-2 gap-2.5 text-xs pt-1">
            <button
              onClick={() => exportConsolidatedFestReportPDF(houses, programs, results)}
              className="p-3 bg-rose-50/50 hover:bg-rose-50 border border-rose-200 rounded-xl text-left transition-colors shadow-2xs"
            >
              <FileText className="w-4 h-4 text-rose-500 mb-1" />
              <span className="font-bold text-slate-900 block">Official Gazette (PDF)</span>
              <span className="text-[10px] text-slate-500">Championship & events summary</span>
            </button>

            <button
              onClick={() => exportHouseStandingsCSV(houses)}
              className="p-3 bg-rose-50/50 hover:bg-rose-50 border border-rose-200 rounded-xl text-left transition-colors shadow-2xs"
            >
              <Download className="w-4 h-4 text-blue-500 mb-1" />
              <span className="font-bold text-slate-900 block">House Tally (CSV)</span>
              <span className="text-[10px] text-slate-500">Medals & grade totals</span>
            </button>

            <button
              onClick={handleExportAllCandidatesCSV}
              className="p-3 bg-rose-50/50 hover:bg-rose-50 border border-rose-200 rounded-xl text-left transition-colors shadow-2xs"
            >
              <Users className="w-4 h-4 text-emerald-600 mb-1" />
              <span className="font-bold text-slate-900 block">Candidate Master (CSV)</span>
              <span className="text-[10px] text-slate-500">All registered students</span>
            </button>

            <button
              onClick={() => exportCrewOperationsCSV(crewMembers, crewTasks)}
              className="p-3 bg-rose-50/50 hover:bg-rose-50 border border-rose-200 rounded-xl text-left transition-colors shadow-2xs"
            >
              <TrendingUp className="w-4 h-4 text-purple-500 mb-1" />
              <span className="font-bold text-slate-900 block">Crew Workload (CSV)</span>
              <span className="text-[10px] text-slate-500">Staff tasks & completion</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
