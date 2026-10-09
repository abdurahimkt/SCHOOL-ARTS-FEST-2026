import React, { useState } from 'react';
import { useFest } from '../context/FestContext';
import { Download, FileText, Search, UserCheck, Filter, Sparkles, Heart } from 'lucide-react';
import { exportProgramCandidatesPDF, exportProgramCandidatesCSV } from '../utils/exportUtils';

export const ProgramCandidateDirectory: React.FC = () => {
  const { programs, candidates, houses, selectedProgramId, setSelectedProgramId } = useFest();
  const [filterDept, setFilterDept] = useState<string>('all');
  const [filterDay, setFilterDay] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const eligiblePrograms = programs.filter(p => {
    if (filterDept !== 'all' && p.department !== filterDept) return false;
    if (filterDay !== 'all' && String(p.day) !== filterDay) return false;
    return true;
  });

  const selectedProgram =
    programs.find(p => p.id === selectedProgramId) || eligiblePrograms[0] || programs[0];

  const programCandidates = candidates.filter(c =>
    c.registeredPrograms.includes(selectedProgram?.id || '')
  );

  const filteredCandidates = programCandidates.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const h = houses.find(house => house.id === c.houseId);
    return (
      c.name.toLowerCase().includes(q) ||
      c.chestNumber.toLowerCase().includes(q) ||
      h?.name.toLowerCase().includes(q) ||
      c.gradeSection.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white border border-rose-100 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-wider">
              <UserCheck className="w-4 h-4 text-rose-500" />
              <span>Program Candidate Roster & Call Desk</span>
              <span className="text-slate-300">·</span>
              <span className="text-pink-600 font-semibold flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 fill-pink-500" />
                <span>Verified Rosters</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Candidate Lists for Every Competition Event
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Select any program to view full roster of registered candidates, assigned chest numbers, and team names. Ready for instant PDF / CSV export for printing and stage verification.
            </p>
          </div>

          {/* Export Buttons for the selected program */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => exportProgramCandidatesCSV(selectedProgram, candidates, houses)}
              className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors flex items-center gap-2 shadow-2xs"
              title="Download call sheet as spreadsheet CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Call Sheet CSV</span>
            </button>
            <button
              onClick={() => exportProgramCandidatesPDF(selectedProgram, candidates, houses)}
              className="px-3.5 py-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm shadow-rose-500/20"
              title="Printable official PDF call sheet with signature columns"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Export Printable PDF</span>
            </button>
          </div>
        </div>

        {/* Filters and Program Selection */}
        <div className="mt-6 pt-5 border-t border-rose-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Filter Department</label>
            <select
              value={filterDept}
              onChange={e => setFilterDept(e.target.value)}
              className="w-full bg-white border border-rose-200 text-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200/50 shadow-2xs"
            >
              <option value="all">All Departments</option>
              <option value="Dance">Dance</option>
              <option value="Music">Music</option>
              <option value="Fine Arts">Fine Arts</option>
              <option value="Literary">Literary</option>
              <option value="Theatre">Theatre</option>
              <option value="Digital Media">Digital Media</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Filter Festival Day</label>
            <select
              value={filterDay}
              onChange={e => setFilterDay(e.target.value)}
              className="w-full bg-white border border-rose-200 text-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200/50 shadow-2xs"
            >
              <option value="all">All 3 Days</option>
              <option value="1">Day 1 (Opening & Solos)</option>
              <option value="2">Day 2 (Folk, Choral & Arts)</option>
              <option value="3">Day 3 (Theatre & Grand Finale)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Active Program Selector</label>
            <select
              value={selectedProgramId}
              onChange={e => setSelectedProgramId(e.target.value)}
              className="w-full bg-white border border-rose-300 text-rose-700 font-bold rounded-xl px-3 py-2 text-xs outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200/50 shadow-2xs"
            >
              {eligiblePrograms.map(p => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Program Summary Card */}
      {selectedProgram && (
        <div className="bg-white border border-rose-100 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-xs text-rose-600 font-mono">
              <span className="font-extrabold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">{selectedProgram.code}</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-600 font-medium">{selectedProgram.category}</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-600 font-medium">{selectedProgram.department}</span>
            </div>
            <h2 className="text-lg font-black text-slate-900 mt-1">{selectedProgram.title}</h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
              <span>Venue: <strong className="text-slate-800">{selectedProgram.stage}</strong></span>
              <span>·</span>
              <span>Schedule: <strong className="text-slate-800">Day {selectedProgram.day} ({selectedProgram.timeSlot})</strong></span>
              <span>·</span>
              <span>Enrolled Candidates: <strong className="text-rose-600">{programCandidates.length}</strong></span>
            </div>
          </div>

          {/* Search within current program roster */}
          <div className="w-full md:w-64 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search candidate or house..."
              className="w-full bg-white border border-rose-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200/50 shadow-2xs"
            />
          </div>
        </div>
      )}

      {/* Candidates Table */}
      <div className="bg-white border border-rose-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-rose-100 bg-rose-50/50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Eligible Call Order for Stage Call Desk</span>
          </div>
          <span className="text-slate-500">
            Showing {filteredCandidates.length} of {programCandidates.length} Contestants
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-rose-50/80 text-slate-600 uppercase font-bold text-[11px] border-b border-rose-100">
              <tr>
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Candidate Photo & Name</th>
                <th className="py-3 px-4">Chest Number</th>
                <th className="py-3 px-4">House / Team</th>
                <th className="py-3 px-4">Class & Section</th>
                <th className="py-3 px-4">Confidential Contact</th>
                <th className="py-3 px-4 text-center">Stage Readiness</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-50">
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No candidates found for this selection.
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((cand, index) => {
                  const house = houses.find(h => h.id === cand.houseId);
                  const photo = cand.photoUrl || '/src/assets/images/avatar_classical_dancer_1791536930246.jpg';

                  return (
                    <tr key={cand.id} className="hover:bg-rose-50/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-400 font-bold">
                        #{index + 1}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={photo}
                            alt={cand.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-rose-200 shadow-2xs shrink-0"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">{cand.name}</span>
                            <span className="text-slate-400 text-[10px] block">
                              Category: {cand.category}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-rose-600 text-sm">
                        {cand.chestNumber}
                      </td>
                      <td className="py-3.5 px-4 font-semibold">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{house?.logoEmoji || '🌸'}</span>
                          <span style={{ color: house?.color || '#333' }}>
                            {house?.name || cand.houseId}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {cand.gradeSection}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                        {cand.phoneEncrypted}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                            index % 2 === 0
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {index % 2 === 0 ? 'Ready / In-Queue' : 'Reported at Desk'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
