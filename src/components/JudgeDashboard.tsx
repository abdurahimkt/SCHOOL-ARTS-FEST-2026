import React, { useState, useEffect } from 'react';
import { useFest } from '../context/FestContext';
import { Check, Sparkles, Send, Users, ShieldCheck, Scale, Award, Heart } from 'lucide-react';

export const JudgeDashboard: React.FC = () => {
  const {
    programs,
    candidates,
    houses,
    results,
    saveScore,
    announceResult,
    calculateGrade,
    selectedProgramId,
    setSelectedProgramId,
  } = useFest();

  const program = programs.find(p => p.id === selectedProgramId) || programs[0];
  const programCandidates = candidates.filter(c => c.registeredPrograms.includes(program.id));
  const currentResult = results[program.id];

  const [activeCandidateId, setActiveCandidateId] = useState<string>(
    programCandidates[0]?.id || ''
  );

  // Criteria marks keyed by criterion id
  const [criteriaMarks, setCriteriaMarks] = useState<Record<string, number>>({});
  const [judgeRemarks, setJudgeRemarks] = useState<string>('');
  const [judgeNameInput, setJudgeNameInput] = useState<string>('Prof. Kalyani Menon');
  const [multiJudgeMode, setMultiJudgeMode] = useState<boolean>(false);
  const [judge1Score, setJudge1Score] = useState<number>(85);
  const [judge2Score, setJudge2Score] = useState<number>(88);
  const [judge3Score, setJudge3Score] = useState<number>(82);

  // When active program changes, sync candidate selection
  useEffect(() => {
    if (programCandidates.length > 0) {
      setActiveCandidateId(programCandidates[0].id);
    }
  }, [selectedProgramId]);

  // Load existing candidate score if already recorded
  useEffect(() => {
    if (!activeCandidateId || !currentResult) return;
    const existingScore = currentResult.scores.find(s => s.candidateId === activeCandidateId);
    if (existingScore) {
      if (existingScore.criteriaScores) {
        setCriteriaMarks(existingScore.criteriaScores);
      }
      setJudgeRemarks(existingScore.remarks || '');
    } else {
      // Default initial marks to 80% of max for fast evaluation
      const initial: Record<string, number> = {};
      program.criteria.forEach(c => {
        initial[c.id] = Math.round(c.maxMarks * 0.85);
      });
      setCriteriaMarks(initial);
      setJudgeRemarks('');
    }
  }, [activeCandidateId, selectedProgramId]);

  const activeCandidate = candidates.find(c => c.id === activeCandidateId);
  const activeHouse = houses.find(h => h.id === activeCandidate?.houseId);

  // Compute live marks
  const computedTotal = multiJudgeMode
    ? Math.round((judge1Score + judge2Score + judge3Score) / 3)
    : Object.values(criteriaMarks).reduce((acc, curr) => acc + curr, 0);

  const computedGrade = calculateGrade(computedTotal);

  const handleCriteriaChange = (critId: string, val: number, max: number) => {
    const clamped = Math.max(0, Math.min(max, val));
    setCriteriaMarks(prev => ({ ...prev, [critId]: clamped }));
  };

  const handleSaveActiveCandidateScore = () => {
    if (!activeCandidate || !program) return;
    saveScore(
      program.id,
      activeCandidate.id,
      computedTotal,
      computedGrade,
      criteriaMarks,
      judgeRemarks
    );
  };

  const handleAnnounceNow = () => {
    if (!program) return;
    handleSaveActiveCandidateScore();
    announceResult(program.id, judgeNameInput);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header with program selector */}
      <div className="bg-white border border-rose-100 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-wider">
              <Scale className="w-4 h-4 text-rose-500" />
              <span>Official Evaluator & Judging Console</span>
              <span className="text-slate-300">·</span>
              <span className="text-pink-600 font-semibold flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 fill-pink-500" />
                <span>Automated Grading Rubric Active</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Live Candidate Score Entry & Dynamic Rank Derivation
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Marks entered calculate percentage, letter grade (A/B/C), and dynamically order ranks without manual math errors.
            </p>
          </div>

          {/* Program Select Dropdown */}
          <div className="w-full md:w-72 shrink-0">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Competition Program:
            </label>
            <select
              value={selectedProgramId}
              onChange={e => setSelectedProgramId(e.target.value)}
              className="w-full bg-white border border-rose-200 text-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:border-rose-400 focus:ring-2 focus:ring-rose-200/50 outline-none shadow-xs"
            >
              {programs.map(p => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.title} (Day {p.day})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Program Status strip */}
        <div className="mt-5 pt-4 border-t border-rose-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Venue:</span>
            <span className="text-slate-800 font-semibold">{program.stage}</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-400">Day:</span>
            <span className="text-slate-800 font-semibold">{program.day} ({program.timeSlot})</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400">Status:</span>
            <span
              className={`font-bold uppercase tracking-wider text-[11px] px-2.5 py-0.5 rounded-full ${
                currentResult?.isAnnounced
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {currentResult?.isAnnounced ? 'Official Declaration Ratified' : 'Evaluating / Unannounced'}
            </span>
          </div>
        </div>
      </div>

      {/* Main 3-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Col 1: Candidate List for selected event (3 cols) */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-rose-500" />
              <span>Candidates ({programCandidates.length})</span>
            </span>
            <span className="text-slate-400 font-normal text-[11px]">Select to Score</span>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {programCandidates.length === 0 ? (
              <div className="p-6 bg-white border border-rose-100 rounded-xl text-xs text-slate-400 text-center shadow-xs">
                No candidates registered for this event yet.
              </div>
            ) : (
              programCandidates.map((cand) => {
                const isSelected = cand.id === activeCandidateId;
                const candHouse = houses.find(h => h.id === cand.houseId);
                const candScore = currentResult?.scores?.find(s => s.candidateId === cand.id);
                const photo = cand.photoUrl || '/src/assets/images/avatar_classical_dancer_1791536930246.jpg';

                return (
                  <div
                    key={cand.id}
                    onClick={() => setActiveCandidateId(cand.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-white border-rose-400 ring-2 ring-rose-200/80 shadow-md shadow-rose-100/50 text-slate-900'
                        : 'bg-white/80 border-rose-100 hover:border-rose-300 hover:bg-white text-slate-700 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                        {cand.chestNumber}
                      </span>
                      <span
                        className="text-[11px] font-bold"
                        style={{ color: candHouse?.color || '#333' }}
                      >
                        {candHouse?.logoEmoji || '🌸'} {candHouse?.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <img
                        src={photo}
                        alt={cand.name}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-rose-200 shrink-0"
                      />
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{cand.name}</h4>
                    </div>

                    <div className="mt-2.5 pt-1.5 border-t border-rose-50 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">{cand.gradeSection}</span>
                      {candScore ? (
                        <span className="font-mono tabular-nums text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {candScore.totalMarks}/100 (Grade {candScore.grade})
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unscored</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Col 2: Interactive Scoring Sheet (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {activeCandidate ? (
            <div className="bg-white border border-rose-100 rounded-2xl p-6 space-y-5 shadow-sm">
              {/* Active candidate card with photo */}
              <div className="flex items-start justify-between pb-4 border-b border-rose-100">
                <div className="flex items-center gap-3.5">
                  <img
                    src={activeCandidate.photoUrl || '/src/assets/images/avatar_classical_dancer_1791536930246.jpg'}
                    alt={activeCandidate.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-rose-300 shadow-sm shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                        Chest #{activeCandidate.chestNumber}
                      </span>
                      <span
                        className="text-xs font-bold"
                        style={{ color: activeHouse?.color || '#333' }}
                      >
                        {activeHouse?.logoEmoji || '🌸'} {activeHouse?.name}
                      </span>
                    </div>
                    <h2 className="text-lg font-black text-slate-900 mt-1">{activeCandidate.name}</h2>
                    <p className="text-xs text-slate-500">
                      Category: {activeCandidate.category} · Class: {activeCandidate.gradeSection}
                    </p>
                  </div>
                </div>

                {/* Live Grade Preview Pill */}
                <div className="text-right">
                  <div className="text-2xl font-black font-mono tabular-nums text-rose-600">
                    {computedTotal}
                    <span className="text-xs text-slate-400 font-sans font-normal"> / 100</span>
                  </div>
                  <div className="mt-0.5">
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        computedGrade === 'A'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : computedGrade === 'B'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : computedGrade === 'C'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Auto Grade: {computedGrade}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mode toggle: Multi-Criteria Rubric vs 3-Judge Aggregate */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 font-semibold">Scoring Methodology:</span>
                <div className="flex items-center gap-1 bg-rose-50/80 p-1 rounded-xl border border-rose-200/80">
                  <button
                    type="button"
                    onClick={() => setMultiJudgeMode(false)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      !multiJudgeMode ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xs' : 'text-slate-600 hover:text-rose-600'
                    }`}
                  >
                    Multi-Criteria Rubric
                  </button>
                  <button
                    type="button"
                    onClick={() => setMultiJudgeMode(true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      multiJudgeMode ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xs' : 'text-slate-600 hover:text-rose-600'
                    }`}
                  >
                    3-Judge Bench Average
                  </button>
                </div>
              </div>

              {/* Rubric Criteria Sliders */}
              {!multiJudgeMode ? (
                <div className="space-y-3.5">
                  {program.criteria.map(crit => {
                    const currentVal = criteriaMarks[crit.id] ?? Math.round(crit.maxMarks * 0.85);

                    return (
                      <div key={crit.id} className="bg-rose-50/40 p-3.5 rounded-xl border border-rose-100 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-800">{crit.name}</span>
                            <span className="text-slate-400 text-[11px] block">{crit.description}</span>
                          </div>
                          <div className="text-right font-mono tabular-nums font-black text-rose-600 text-sm">
                            {currentVal} <span className="text-xs text-slate-400 font-normal">/ {crit.maxMarks}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="0"
                            max={crit.maxMarks}
                            value={currentVal}
                            onChange={e => handleCriteriaChange(crit.id, Number(e.target.value), crit.maxMarks)}
                            className="w-full accent-rose-500 h-2 bg-rose-100 rounded-lg cursor-pointer"
                          />
                          <input
                            type="number"
                            min="0"
                            max={crit.maxMarks}
                            value={currentVal}
                            onChange={e => handleCriteriaChange(crit.id, Number(e.target.value), crit.maxMarks)}
                            className="w-14 bg-white border border-rose-200 text-slate-800 rounded-lg px-2 py-1 text-center font-mono text-xs outline-none focus:border-rose-400 font-bold"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* 3-Judge Aggregate Inputs */
                <div className="space-y-3 bg-rose-50/40 p-4 rounded-xl border border-rose-100">
                  <span className="text-xs font-bold text-slate-800 block mb-2">
                    Individual Judge Mark Sheets (Out of 100)
                  </span>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="text-slate-600 font-medium block mb-1">Judge 1 ({program.judges[0]?.split(' ')[0] || 'Lead'})</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={judge1Score}
                        onChange={e => setJudge1Score(Number(e.target.value))}
                        className="w-full bg-white border border-rose-200 text-slate-800 font-mono text-center rounded-lg p-2 text-sm focus:border-rose-400 outline-none font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 font-medium block mb-1">Judge 2 ({program.judges[1]?.split(' ')[0] || 'Member'})</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={judge2Score}
                        onChange={e => setJudge2Score(Number(e.target.value))}
                        className="w-full bg-white border border-rose-200 text-slate-800 font-mono text-center rounded-lg p-2 text-sm focus:border-rose-400 outline-none font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 font-medium block mb-1">Judge 3 ({program.judges[2]?.split(' ')[0] || 'Member'})</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={judge3Score}
                        onChange={e => setJudge3Score(Number(e.target.value))}
                        className="w-full bg-white border border-rose-200 text-slate-800 font-mono text-center rounded-lg p-2 text-sm focus:border-rose-400 outline-none font-bold"
                      />
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500 pt-2 text-center">
                    Mathematical Mean: <strong className="text-rose-600 font-mono text-xs">{computedTotal} Marks</strong>
                  </div>
                </div>
              )}

              {/* Remarks Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Evaluator Technical Feedback / Citation:
                </label>
                <input
                  type="text"
                  value={judgeRemarks}
                  onChange={e => setJudgeRemarks(e.target.value)}
                  placeholder="e.g. Exceptional rhythmic agility in the fast tempo mudras..."
                  className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200/50"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleSaveActiveCandidateScore}
                  className="px-4 py-2 bg-white hover:bg-rose-50 text-slate-700 text-xs font-bold rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Save Candidate Score</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAnnounceNow}
                    className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-rose-500/20"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Ratify & Declare Results</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 bg-white border border-rose-100 rounded-2xl text-center text-slate-400 shadow-sm">
              Select a candidate from the left list to score.
            </div>
          )}
        </div>

        {/* Col 3: Dynamic Live Rank Order (3 cols) */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1 text-rose-600">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Live Dynamic Rankings</span>
            </span>
            <span className="text-[10px] text-slate-400 font-normal">Auto Updated</span>
          </div>

          <div className="bg-white border border-rose-100 rounded-2xl p-4 space-y-3 shadow-sm">
            {(currentResult?.scores || []).length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">
                As scores are saved, automatic rankings will appear here instantly.
              </p>
            ) : (
              currentResult?.scores?.map((sc, idx) => {
                const h = houses.find(house => house.id === sc.houseId);

                return (
                  <div
                    key={sc.candidateId}
                    className={`p-3 rounded-xl border text-xs transition-all ${
                      sc.rank === 1
                        ? 'bg-amber-50/70 border-amber-300 text-slate-900 shadow-xs'
                        : sc.rank === 2
                        ? 'bg-slate-50 border-slate-200 text-slate-800'
                        : sc.rank === 3
                        ? 'bg-orange-50/60 border-orange-200 text-slate-800'
                        : 'bg-white border-rose-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold font-mono">
                        {sc.rank === 1 ? '🥇 1st Place' : sc.rank === 2 ? '🥈 2nd Place' : sc.rank === 3 ? '🥉 3rd Place' : `#${idx + 1}`}
                      </span>
                      <span className="font-mono font-black text-rose-600">{sc.totalMarks}/100</span>
                    </div>

                    <div className="font-bold text-slate-900 mt-1">{sc.candidateName}</div>
                    <div className="flex items-center justify-between mt-1 text-[11px]">
                      <span style={{ color: h?.color || '#333' }} className="font-medium">{h?.name}</span>
                      <span className="font-bold text-emerald-700">Grade {sc.grade}</span>
                    </div>
                  </div>
                );
              })
            )}

            {/* Auto Grade rules reminder */}
            <div className="pt-3 border-t border-rose-100 text-[10px] text-slate-500 space-y-1">
              <div className="font-bold text-slate-700">Grading Rubric Rules:</div>
              <div>Grade A: ≥ 80 Marks (+5 House Pts)</div>
              <div>Grade B: ≥ 70 Marks (+3 House Pts)</div>
              <div>Grade C: ≥ 60 Marks (+1 House Pt)</div>
              <div>1st Rank: +5 Pts | 2nd: +3 Pts | 3rd: +1 Pt</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
