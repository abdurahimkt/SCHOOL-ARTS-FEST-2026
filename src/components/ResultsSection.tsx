import React, { useState } from 'react';
import { useFest } from '../context/FestContext';
import { CheckCircle2, Clock, Download, FileText, ChevronRight, Award, ShieldAlert, Sparkles, Heart } from 'lucide-react';
import { exportProgramResultPDF, exportProgramResultCSV } from '../utils/exportUtils';

interface ResultsSectionProps {
  onSelectProgramForJudging?: (programId: string) => void;
}

export const ResultsSection: React.FC<ResultsSectionProps> = ({ onSelectProgramForJudging }) => {
  const { programs, results, houses, candidates, currentRole, unannounceResult, setSelectedProgramId } = useFest();
  const [activeTab, setActiveTab] = useState<'announced' | 'unannounced'>('announced');
  const [selectedResultProgramId, setSelectedResultProgramId] = useState<string>('prog-01');

  const announcedPrograms = programs.filter(p => results[p.id]?.isAnnounced);
  const unannouncedPrograms = programs.filter(p => !results[p.id]?.isAnnounced);

  const currentProgram = programs.find(p => p.id === selectedResultProgramId) || programs[0];
  const currentResult = results[currentProgram?.id];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner and Segmented Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-rose-100 rounded-2xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Official Festival Declarations</span>
            <span className="text-slate-300">·</span>
            <span className="text-pink-600 font-semibold flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 fill-pink-500" />
              <span>Verified Portfolios</span>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Event Results & Official Score Sheets
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Separated announced official results and in-progress evaluation queues with candidate portraits and automatic grading rubrics.
          </p>
        </div>

        {/* Tab switcher: Announced vs Not Announced */}
        <div className="flex items-center gap-1.5 p-1 bg-rose-50/80 rounded-xl border border-rose-200/80 shrink-0">
          <button
            onClick={() => {
              setActiveTab('announced');
              if (announcedPrograms.length > 0 && !results[selectedResultProgramId]?.isAnnounced) {
                setSelectedResultProgramId(announcedPrograms[0].id);
              }
            }}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'announced'
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm shadow-rose-500/20'
                : 'text-slate-600 hover:text-rose-600'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Announced ({announcedPrograms.length})</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('unannounced');
              if (unannouncedPrograms.length > 0 && results[selectedResultProgramId]?.isAnnounced) {
                setSelectedResultProgramId(unannouncedPrograms[0].id);
              }
            }}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'unannounced'
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm shadow-rose-500/20'
                : 'text-slate-600 hover:text-rose-600'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>In-Progress ({unannouncedPrograms.length})</span>
          </button>
        </div>
      </div>

      {/* Main Split Grid: Program List on Left + Detailed Score Sheet on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Program Directory */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            {activeTab === 'announced' ? 'Officially Declared Events' : 'Pending Judging Consolidation'}
          </div>

          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
            {(activeTab === 'announced' ? announcedPrograms : unannouncedPrograms).map(prog => {
              const res = results[prog.id];
              const isSelected = prog.id === selectedResultProgramId;
              const winner = res?.scores?.find(s => s.rank === 1);
              const scoredCount = res?.scores?.length || 0;

              return (
                <div
                  key={prog.id}
                  onClick={() => setSelectedResultProgramId(prog.id)}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white border-rose-400 ring-2 ring-rose-200/80 shadow-md shadow-rose-100/50'
                      : 'bg-white/80 border-rose-100 hover:border-rose-300 hover:bg-white shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                      {prog.code}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">Day {prog.day} · {prog.department}</span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 line-clamp-1 mt-1">{prog.title}</h3>

                  <div className="mt-2.5 pt-2 border-t border-rose-50 flex items-center justify-between text-[11px]">
                    {activeTab === 'announced' ? (
                      <span className="text-emerald-700 flex items-center gap-1 font-semibold">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        <span>Winner: {winner?.candidateName.split(' ')[0] || 'Ratified'}</span>
                      </span>
                    ) : (
                      <span className="text-amber-700 flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>Status: {prog.status} ({scoredCount} evaluated)</span>
                      </span>
                    )}

                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Full Tabulation Sheet */}
        <div className="lg:col-span-8">
          {currentProgram ? (
            <div className="bg-white border border-rose-100 rounded-2xl p-6 space-y-6 shadow-sm">
              {/* Program Header & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-rose-100">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-rose-600">
                    <span className="font-extrabold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      {currentProgram.code}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-600 font-medium">{currentProgram.department}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-600 font-medium">{currentProgram.category}</span>
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-1">{currentProgram.title}</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {currentProgram.stage} · Day {currentProgram.day} ({currentProgram.timeSlot})
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {currentResult?.isAnnounced ? (
                    <>
                      <button
                        onClick={() => exportProgramResultCSV(currentProgram, currentResult, houses)}
                        className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-500" />
                        <span>CSV Sheet</span>
                      </button>
                      <button
                        onClick={() => exportProgramResultPDF(currentProgram, currentResult, houses)}
                        className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm shadow-rose-500/20"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Official Certificate PDF</span>
                      </button>
                      {currentRole === 'admin' && (
                        <button
                          onClick={() => unannounceResult(currentProgram.id)}
                          className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5"
                          title="Revert announced status for score recalculation"
                        >
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                          <span>Revert (Admin)</span>
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedProgramId(currentProgram.id);
                        if (onSelectProgramForJudging) {
                          onSelectProgramForJudging(currentProgram.id);
                        }
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm shadow-rose-500/20"
                    >
                      <span>Open in Judge Console</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Status Banner */}
              <div
                className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
                  currentResult?.isAnnounced
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
                    : 'bg-amber-50/80 border-amber-200 text-amber-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  {currentResult?.isAnnounced ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                  <span>
                    {currentResult?.isAnnounced
                      ? `Officially declared & ratified on ${new Date(currentResult.announcedTimestamp || '').toLocaleTimeString()} by ${currentResult.announcedBy || 'Tabulation Panel'}.`
                      : 'Evaluation in-progress. Scores will update live as judges evaluate rubrics.'}
                  </span>
                </div>
                <span className="font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-full bg-white/80 border border-current">
                  {currentResult?.isAnnounced ? 'Official Declaration' : 'Provisional View'}
                </span>
              </div>

              {/* Candidate Performance Table with Photos */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5 text-rose-600">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>Candidate Performance & Portraits</span>
                    <span className="text-slate-400 font-normal">· Evaluated with Photo ID</span>
                  </span>
                  <span className="text-slate-500 text-[11px] font-medium">
                    Grading Rubrics: A (≥80), B (≥70), C (≥60)
                  </span>
                </div>

                {/* Announced Winner Podium Cards with Big Photos (if announced) */}
                {currentResult?.isAnnounced && (currentResult.scores || []).length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                    {(currentResult.scores || [])
                      .filter(s => s.rank === 1 || s.rank === 2 || s.rank === 3)
                      .slice(0, 3)
                      .map(winner => {
                        const candObj = candidates.find(c => c.id === winner.candidateId);
                        const candPhoto = winner.photoUrl || candObj?.photoUrl || '/src/assets/images/avatar_classical_dancer_1791536930246.jpg';
                        const house = houses.find(h => h.id === winner.houseId);
                        const isGold = winner.rank === 1;

                        return (
                          <div
                            key={winner.candidateId}
                            className={`p-4 rounded-2xl border relative overflow-hidden transition-all shadow-xs ${
                              isGold
                                ? 'bg-gradient-to-b from-amber-50 via-rose-50/30 to-white border-amber-300 ring-2 ring-amber-200/60 shadow-md shadow-amber-200/30'
                                : winner.rank === 2
                                ? 'bg-gradient-to-b from-slate-50 to-white border-slate-200'
                                : 'bg-gradient-to-b from-orange-50/60 to-white border-orange-200'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={candPhoto}
                                alt={winner.candidateName}
                                referrerPolicy="no-referrer"
                                className="w-14 h-14 rounded-full object-cover ring-2 ring-rose-300 shadow-sm shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <span className={`text-[10px] font-extrabold uppercase tracking-wider block ${
                                  isGold ? 'text-amber-700' : winner.rank === 2 ? 'text-slate-600' : 'text-orange-700'
                                }`}>
                                  {isGold ? '🥇 1st Place (Gold)' : winner.rank === 2 ? '🥈 2nd Place (Silver)' : '🥉 3rd Place (Bronze)'}
                                </span>
                                <h4 className="text-xs font-bold text-slate-900 truncate mt-0.5">{winner.candidateName}</h4>
                                <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                                  <span className="font-mono text-rose-600 font-bold">{winner.chestNumber}</span>
                                  <span>·</span>
                                  <span style={{ color: house?.color }} className="font-semibold">{house?.name}</span>
                                </div>
                              </div>
                            </div>

                            <div className="mt-3 pt-2.5 border-t border-rose-100 flex items-center justify-between text-xs">
                              <span className="font-mono tabular-nums font-black text-slate-900 text-sm">
                                {winner.totalMarks} / 100
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Grade {winner.grade} (+{winner.housePointsEarned} pts)
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}

                <div className="overflow-x-auto border border-rose-100 rounded-2xl mt-3">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-rose-50/80 text-slate-600 uppercase font-bold text-[11px] border-b border-rose-100">
                      <tr>
                        <th className="py-3 px-3.5">Rank</th>
                        <th className="py-3 px-3.5">Candidate Photo & Name</th>
                        <th className="py-3 px-3.5">Chest #</th>
                        <th className="py-3 px-3.5">House</th>
                        <th className="py-3 px-3.5 text-center">Total Marks</th>
                        <th className="py-3 px-3.5 text-center">Grade</th>
                        <th className="py-3 px-3.5 text-right">House Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-50">
                      {(currentResult?.scores || []).length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-10 text-center text-slate-400">
                            No scores recorded yet for this competition. Judges can score candidates in the Judge Console.
                          </td>
                        </tr>
                      ) : (
                        currentResult?.scores?.map((score) => {
                          const house = houses.find(h => h.id === score.houseId);
                          const candObj = candidates.find(c => c.id === score.candidateId);
                          const photo = score.photoUrl || candObj?.photoUrl || '/src/assets/images/avatar_classical_dancer_1791536930246.jpg';

                          return (
                            <tr key={score.candidateId} className="hover:bg-rose-50/40 transition-colors">
                              <td className="py-3 px-3.5 font-mono font-bold">
                                {score.rank === 1 ? (
                                  <span className="text-amber-600 flex items-center gap-1 font-extrabold">
                                    <Award className="w-3.5 h-3.5 text-amber-500" /> 1st
                                  </span>
                                ) : score.rank === 2 ? (
                                  <span className="text-slate-600 font-bold">2nd</span>
                                ) : score.rank === 3 ? (
                                  <span className="text-orange-700 font-bold">3rd</span>
                                ) : (
                                  <span className="text-slate-400">-</span>
                                )}
                              </td>
                              <td className="py-3 px-3.5 font-medium text-slate-800">
                                <div className="flex items-center gap-2.5">
                                  <img
                                    src={photo}
                                    alt={score.candidateName}
                                    referrerPolicy="no-referrer"
                                    className="w-9 h-9 rounded-full object-cover ring-2 ring-rose-200 shadow-2xs shrink-0"
                                  />
                                  <div>
                                    <div className="font-bold text-slate-900">{score.candidateName}</div>
                                    {score.remarks && (
                                      <span className="block text-[10px] text-slate-500 font-normal italic truncate max-w-xs">
                                        "{score.remarks}"
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-3.5 font-mono font-bold text-rose-600">
                                {score.chestNumber}
                              </td>
                              <td className="py-3 px-3.5">
                                <span style={{ color: house?.color || '#333' }} className="font-bold flex items-center gap-1">
                                  <span>{house?.logoEmoji || '🌸'}</span>
                                  <span>{house?.name || score.houseId}</span>
                                </span>
                              </td>
                              <td className="py-3 px-3.5 text-center font-mono tabular-nums font-black text-slate-900 text-sm">
                                {score.totalMarks} <span className="text-slate-400 font-normal text-[10px]">/ 100</span>
                              </td>
                              <td className="py-3 px-3.5 text-center font-mono font-bold">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                    score.grade === 'A'
                                      ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                                      : score.grade === 'B'
                                      ? 'text-blue-700 bg-blue-50 border border-blue-200'
                                      : score.grade === 'C'
                                      ? 'text-amber-700 bg-amber-50 border border-amber-200'
                                      : 'text-slate-400'
                                  }`}
                                >
                                  Grade {score.grade}
                                </span>
                              </td>
                              <td className="py-3 px-3.5 text-right font-mono tabular-nums font-black text-rose-600">
                                +{score.housePointsEarned} pts
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Judges Panel metadata */}
              <div className="pt-4 border-t border-rose-100 text-xs text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-slate-400">Judges Bench: </span>
                  <span className="text-slate-700 font-semibold">{currentProgram.judges.join(' · ')}</span>
                </div>
                <div>
                  <span className="text-slate-400">Stage Coordinator: </span>
                  <span className="text-slate-700 font-semibold">{currentProgram.coordinatorName}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-rose-100 rounded-2xl p-12 text-center text-slate-400 shadow-sm">
              Select an event to view official score sheets.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
