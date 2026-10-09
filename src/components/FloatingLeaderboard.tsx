import React, { useState } from 'react';
import { useFest } from '../context/FestContext';
import { Trophy, ChevronUp, ChevronDown, Sparkles, Award, ArrowUpRight } from 'lucide-react';

interface FloatingLeaderboardProps {
  onOpenFullLeaderboard: () => void;
}

export const FloatingLeaderboard: React.FC<FloatingLeaderboardProps> = ({ onOpenFullLeaderboard }) => {
  const { houses, candidates, results } = useFest();
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-40 px-3.5 py-2 rounded-full bg-gradient-to-r from-rose-500 via-fuchsia-500 to-amber-500 text-white shadow-xl shadow-rose-500/25 text-xs font-bold flex items-center gap-2 hover:scale-105 transition-all"
        title="Open Floating Leaderboard"
      >
        <Trophy className="w-3.5 h-3.5 text-amber-200" />
        <span>Live Standings</span>
      </button>
    );
  }

  const sortedHouses = [...houses].sort((a, b) => b.points - a.points);
  const leader = sortedHouses[0];
  const runnerUp = sortedHouses[1];

  // Best candidate (highest points won)
  const topCandidate = [...candidates]
    .filter(c => c.totalPointsWon > 0)
    .sort((a, b) => b.totalPointsWon - a.totalPointsWon)[0] || candidates[0];

  const topCandidateHouse = houses.find(h => h.id === topCandidate?.houseId);

  return (
    <aside
      aria-label="Live floating scoreboard"
      className="fixed bottom-4 right-4 z-40 max-w-sm w-[calc(100vw-2rem)] sm:w-88 transition-all duration-300"
    >
      <div className="bg-white/95 backdrop-blur-xl border border-rose-200 rounded-2xl shadow-2xl shadow-rose-950/15 overflow-hidden ring-1 ring-rose-100">
        {/* Floating Header Banner */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-4 py-2.5 bg-gradient-to-r from-rose-500 via-purple-500 to-pink-500 border-b border-rose-200 flex items-center justify-between cursor-pointer select-none text-white shadow-xs"
        >
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-full bg-white/20 text-white text-xs">
              <Trophy className="w-3.5 h-3.5" />
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white tracking-wide">Live Scoreboard</span>
              <span>🌸</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-amber-200">
              {leader ? `${leader.logoEmoji || '👑'} ${leader.name}: ${leader.points} pts` : ''}
            </span>
            <button
              onClick={e => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="text-white/80 hover:text-white transition-colors p-0.5"
              aria-label={isExpanded ? 'Minimize floating scoreboard' : 'Expand floating scoreboard'}
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Expanded Body */}
        {isExpanded && (
          <div className="p-4 space-y-3.5 max-h-96 overflow-y-auto bg-white/90">
            {/* House Tally Rows */}
            <div className="space-y-2">
              {sortedHouses.map((house, idx) => {
                const isLeader = idx === 0;
                return (
                  <div
                    key={house.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                      isLeader
                        ? 'bg-rose-50/80 border-rose-300 text-slate-900 shadow-xs ring-1 ring-rose-200'
                        : 'bg-slate-50/70 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-slate-400 w-4">
                        #{idx + 1}
                      </span>
                      <span className="text-sm">{house.logoEmoji || '🌸'}</span>
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{house.name}</span>
                          {isLeader && (
                            <span className="text-[10px] text-rose-700 font-semibold bg-rose-100 px-1.5 py-0.2 rounded-full border border-rose-200">
                              Lead +{house.points - (runnerUp?.points || 0)}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {house.firstCount} Gold 🥇 · {house.gradeACount} A-Grades
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-black font-mono tabular-nums text-rose-600">
                        {house.points}
                      </div>
                      <span className="text-[10px] text-slate-400">pts</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Star Performer Spotlight with Photo */}
            {topCandidate && (
              <div className="pt-2 border-t border-rose-100">
                <div className="text-[10px] font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1 mb-1.5">
                  <Sparkles className="w-3 h-3 text-rose-500" />
                  <span>Championship Star Contender</span>
                </div>
                <div className="p-2.5 rounded-xl bg-rose-50/50 border border-rose-100 flex items-center gap-3">
                  <img
                    src={topCandidate.photoUrl || '/src/assets/images/avatar_classical_dancer_1791536930246.jpg'}
                    alt={topCandidate.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-rose-400/50 shadow-md shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {topCandidate.name}
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1.5 truncate">
                      <span className="font-mono text-rose-600 font-bold">{topCandidate.chestNumber}</span>
                      <span>·</span>
                      <span style={{ color: topCandidateHouse?.color }} className="font-semibold">{topCandidateHouse?.name}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-extrabold font-mono text-emerald-600 tabular-nums">
                      {topCandidate.totalPointsWon} pts
                    </span>
                    <span className="text-[9px] text-slate-400 block">earned</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions Footer */}
            <div className="pt-2 border-t border-rose-100 flex items-center justify-between text-xs">
              <button
                onClick={onOpenFullLeaderboard}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors"
              >
                <span>Full Leaderboard Hub</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
              >
                Hide Floating Pill
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
