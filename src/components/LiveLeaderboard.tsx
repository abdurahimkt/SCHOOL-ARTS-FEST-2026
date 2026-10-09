import React, { useState } from 'react';
import { useFest } from '../context/FestContext';
import {
  Trophy,
  Award,
  Download,
  Users,
  TrendingUp,
  Sparkles,
  Plus,
  Trash2,
  ShieldAlert,
  Heart,
  X,
  Check,
} from 'lucide-react';
import { exportHouseStandingsCSV, exportConsolidatedFestReportPDF } from '../utils/exportUtils';

export const LiveLeaderboard: React.FC = () => {
  const { houses, candidates, programs, results, currentRole, addHouse, removeHouse } = useFest();

  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamMotto, setTeamMotto] = useState('');
  const [teamColor, setTeamColor] = useState('#EC4899'); // Pink default
  const [teamCaptain, setTeamCaptain] = useState('');
  const [teamViceCaptain, setTeamViceCaptain] = useState('');
  const [teamEmoji, setTeamEmoji] = useState('🌸');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const sortedHouses = [...houses].sort((a, b) => b.points - a.points);
  const leadingHouse = sortedHouses[0];
  const maxPoints = Math.max(...houses.map(h => h.points), 1);

  // Individual Star Candidates (Topper-wise Leaderboard Analytics)
  const topperCandidates = [...candidates]
    .filter(c => c.totalPointsWon > 0 || c.registeredPrograms.length > 0)
    .map(c => {
      const registeredCount = c.registeredPrograms.length;
      const evaluatedResults = c.registeredPrograms
        .map(pId => results[pId])
        .filter(r => r && r.isAnnounced);

      const completedEventsCount = evaluatedResults.length;
      const completionRate = registeredCount > 0 ? Math.round((completedEventsCount / registeredCount) * 100) : 0;

      let firstCount = 0;
      evaluatedResults.forEach(r => {
        const myScore = r?.scores.find(s => s.candidateId === c.id);
        if (myScore?.rank === 1) firstCount++;
      });

      const productivityScore = Math.round(c.totalPointsWon * 10 + completionRate * 0.5);

      return {
        ...c,
        completedEventsCount,
        completionRate,
        firstCount,
        productivityScore,
      };
    })
    .sort((a, b) => b.productivityScore - a.productivityScore || b.totalPointsWon - a.totalPointsWon)
    .slice(0, 8);

  const announcedCount = programs.filter(p => results[p.id]?.isAnnounced).length;
  const totalPrograms = programs.length;
  const festProgressPct = Math.round((announcedCount / totalPrograms) * 100);

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName || !teamCaptain) return;

    addHouse({
      name: teamName,
      motto: teamMotto || 'Grace, Art & Creative Harmony',
      color: teamColor,
      captain: teamCaptain,
      viceCaptain: teamViceCaptain,
      logoEmoji: teamEmoji,
    });

    setTeamName('');
    setTeamMotto('');
    setTeamCaptain('');
    setTeamViceCaptain('');
    setShowAddTeamModal(false);
  };

  const handleConfirmDelete = (id: string) => {
    removeHouse(id);
    setConfirmDeleteId(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Warm, Girls-Friendly Hero Strip with Festive Floral Accents */}
      <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden bg-gradient-to-r from-rose-500 via-purple-600 to-pink-500 text-white shadow-xl shadow-rose-500/15">
        {/* Soft Background Radial Glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-72 h-72 rounded-full bg-white/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-rose-100 uppercase tracking-wider">
              <span className="p-1 rounded-full bg-white/20 text-white">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
              <span>KalaUtsav Festival Championship</span>
              <span className="text-white/40">·</span>
              <span className="text-amber-200 flex items-center gap-1 font-semibold">
                <Heart className="w-3.5 h-3.5 text-rose-200 fill-rose-200" />
                <span>Live Real-Time Standings</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5 flex items-center gap-2.5">
              <span>{leadingHouse ? `${leadingHouse.logoEmoji || '🌸'} ${leadingHouse.name} in 1st Place` : 'Live Standings'}</span>
            </h1>

            <p className="text-xs sm:text-sm text-rose-100 mt-1.5 max-w-xl leading-relaxed">
              Real-time score tracking across all participating creative houses and stages. Scores update automatically when judges ratify competition performances!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Admin Add Team Button */}
            {currentRole === 'admin' ? (
              <button
                onClick={() => setShowAddTeamModal(true)}
                className="px-4 py-2 bg-white text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                title="Add a new competitive team / house (Admin Only)"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Team</span>
              </button>
            ) : (
              <span className="text-[11px] text-white/80 bg-white/10 backdrop-blur-xs border border-white/20 px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-medium">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-200" />
                <span>Admin controls teams</span>
              </span>
            )}

            <button
              onClick={() => exportHouseStandingsCSV(houses)}
              className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold rounded-xl border border-white/20 transition-colors flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5 text-white/80" />
              <span>Standings CSV</span>
            </button>
            <button
              onClick={() => exportConsolidatedFestReportPDF(houses, programs, results)}
              className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 text-xs font-bold rounded-xl transition-colors flex items-center gap-2 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Executive PDF</span>
            </button>
          </div>
        </div>

        {/* Milestone Stats Bar */}
        <div className="relative z-10 mt-6 pt-5 border-t border-white/20 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-white/10 backdrop-blur-xs p-2.5 rounded-xl border border-white/15">
            <span className="text-rose-100 block">Decided Events</span>
            <div className="text-base font-bold text-white font-mono tabular-nums mt-0.5">
              {announcedCount} / {totalPrograms} <span className="text-xs text-rose-200 font-sans">({festProgressPct}%)</span>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-2.5 rounded-xl border border-white/15">
            <span className="text-rose-100 block">Artists Enrolled</span>
            <div className="text-base font-bold text-white font-mono tabular-nums mt-0.5">
              {candidates.length} <span className="text-xs text-rose-200 font-sans">Students</span>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-2.5 rounded-xl border border-white/15">
            <span className="text-rose-100 block">Total Championship Points</span>
            <div className="text-base font-bold text-amber-200 font-mono tabular-nums mt-0.5">
              {houses.reduce((acc, h) => acc + h.points, 0)} Pts
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-2.5 rounded-xl border border-white/15">
            <span className="text-rose-100 block">Championship Houses</span>
            <div className="text-base font-bold text-white font-mono tabular-nums mt-0.5">
              {houses.length} Active Teams
            </div>
          </div>
        </div>
      </div>

      {/* House Standings Cards Grid with Delete Button for Admin */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-rose-800 uppercase tracking-wider px-1">
          <span>Competitive Houses & Team Standings</span>
          {currentRole === 'admin' && (
            <span className="text-slate-500 font-normal normal-case">
              (Admin: You can add new teams or remove teams below)
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sortedHouses.map((house, idx) => {
            const isLeader = idx === 0;
            const sharePercent = Math.round((house.points / maxPoints) * 100);

            return (
              <div
                key={house.id}
                className={`rounded-2xl border p-5 relative overflow-hidden transition-all duration-300 hover:scale-[1.01] ${
                  isLeader
                    ? 'bg-white border-rose-300 shadow-lg shadow-rose-950/5 ring-2 ring-rose-200'
                    : 'bg-white/90 border-rose-100 hover:border-rose-200 shadow-xs'
                }`}
              >
                {/* House accent top stripe */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: house.color }}
                />

                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{house.logoEmoji || '🌸'}</span>
                    <div>
                      <span className="text-xs font-extrabold font-mono text-slate-400">
                        #{idx + 1}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 leading-tight">{house.name}</h3>
                      <p className="text-[11px] text-slate-500 italic mt-0.5">"{house.motto}"</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-black text-rose-600 font-mono tabular-nums">
                      {house.points}
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Points</span>
                  </div>
                </div>

                {/* Relative Progress bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span>Championship Share</span>
                    <span className="font-mono tabular-nums font-bold text-slate-700">{sharePercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${sharePercent}%`,
                        backgroundColor: house.color,
                      }}
                    />
                  </div>
                </div>

                {/* Medals & Grades Tally */}
                <div className="mt-4 pt-3 border-t border-rose-50 grid grid-cols-3 gap-1.5 text-center text-xs">
                  <div className="bg-amber-50/70 p-1.5 rounded-lg border border-amber-100">
                    <span className="text-[10px] text-amber-700 block font-bold">🥇 Gold</span>
                    <span className="text-sm font-bold text-amber-900 font-mono tabular-nums">
                      {house.firstCount}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-600 block font-bold">🥈 Silver</span>
                    <span className="text-sm font-bold text-slate-800 font-mono tabular-nums">
                      {house.secondCount}
                    </span>
                  </div>
                  <div className="bg-rose-50/60 p-1.5 rounded-lg border border-rose-100">
                    <span className="text-[10px] text-rose-700 block font-bold">🥉 Bronze</span>
                    <span className="text-sm font-bold text-rose-900 font-mono tabular-nums">
                      {house.thirdCount}
                    </span>
                  </div>
                </div>

                {/* Team Captain & Admin Remove Action */}
                <div className="mt-3.5 pt-2 border-t border-rose-50 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Captain: <strong className="text-slate-800">{house.captain.split(' ')[0]}</strong></span>

                  {currentRole === 'admin' && (
                    <div>
                      {confirmDeleteId === house.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleConfirmDelete(house.id)}
                            className="p-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold"
                            title="Confirm delete this team"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="p-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px]"
                            title="Cancel"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(house.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                          title="Remove team (Admin Only)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Topper-wise Leaderboard Analytics with Candidate Portraits */}
      <div className="bg-white/90 border border-rose-100 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-bold text-slate-900">
                Topper-Wise Leaderboard Analytics (Star Artists with Portraits)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Candidate ranking metrics based on total championship points won, gold finishes, and event completion rates.
            </p>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-rose-600 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Kalaprathibha / Kalathilakam Contenders</span>
            </span>
          </div>
        </div>

        {/* Data Table with Photos */}
        <div className="overflow-x-auto border border-rose-100 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-rose-50/70 text-slate-600 uppercase font-bold text-[11px] border-b border-rose-100">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Artist Portrait & Name</th>
                <th className="py-3 px-4">Chest #</th>
                <th className="py-3 px-4">House / Team</th>
                <th className="py-3 px-4 text-center">Events</th>
                <th className="py-3 px-4 text-center">Completed</th>
                <th className="py-3 px-4 text-center">1st Places</th>
                <th className="py-3 px-4 text-right">Points Won</th>
                <th className="py-3 px-4 text-right">Productivity Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-50">
              {topperCandidates.map((cand, idx) => {
                const houseObj = houses.find(h => h.id === cand.houseId);
                const photo = cand.photoUrl || '/src/assets/images/avatar_classical_dancer_1791536930246.jpg';

                return (
                  <tr key={cand.id} className="hover:bg-rose-50/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold">
                      {idx === 0 ? (
                        <span className="text-amber-600 flex items-center gap-1 font-extrabold">
                          <Award className="w-4 h-4 text-amber-500" /> 1st
                        </span>
                      ) : idx === 1 ? (
                        <span className="text-slate-600 font-bold">2nd</span>
                      ) : idx === 2 ? (
                        <span className="text-amber-700 font-bold">3rd</span>
                      ) : (
                        <span className="text-slate-400">#{idx + 1}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      <div className="flex items-center gap-3">
                        <img
                          src={photo}
                          alt={cand.name}
                          referrerPolicy="no-referrer"
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-rose-200 shadow-xs shrink-0"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">{cand.name}</span>
                          <span className="text-slate-400 block text-[10px] font-normal">
                            {cand.category} · {cand.gradeSection}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-rose-600">
                      {cand.chestNumber}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className="font-bold inline-flex items-center gap-1.5"
                        style={{ color: houseObj?.color || '#333' }}
                      >
                        <span>{houseObj?.logoEmoji || '🌸'}</span>
                        <span>{houseObj?.name || cand.houseId}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono tabular-nums text-slate-600">
                      {cand.registeredPrograms.length}
                    </td>
                    <td className="py-3 px-4 text-center font-mono tabular-nums text-emerald-600 font-semibold">
                      {cand.completedEventsCount}
                    </td>
                    <td className="py-3 px-4 text-center font-mono tabular-nums text-amber-600 font-bold">
                      {cand.firstCount}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-black text-slate-900 text-sm">
                      {cand.totalPointsWon} pts
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-mono tabular-nums font-bold text-emerald-600">
                          {cand.productivityScore}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Add Team Modal */}
      {showAddTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rose-950/30 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white border border-rose-200 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-rose-100">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌸</span>
                <h3 className="text-base font-bold text-slate-900">Enroll New Competitive House</h3>
              </div>
              <button
                onClick={() => setShowAddTeamModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTeam} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">House / Team Name *</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={e => setTeamName(e.target.value)}
                  placeholder="e.g. Amethyst Angels or Jasmine Stars"
                  required
                  className="w-full bg-white border border-rose-200 text-slate-800 rounded-lg px-3 py-2 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200/50"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Team Motto / Slogan</label>
                <input
                  type="text"
                  value={teamMotto}
                  onChange={e => setTeamMotto(e.target.value)}
                  placeholder="e.g. Grace in Art, Joy in Unity"
                  className="w-full bg-white border border-rose-200 text-slate-800 rounded-lg px-3 py-2 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Theme Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={teamColor}
                      onChange={e => setTeamColor(e.target.value)}
                      className="w-9 h-9 rounded cursor-pointer bg-white border border-rose-200 p-0.5"
                    />
                    <input
                      type="text"
                      value={teamColor}
                      onChange={e => setTeamColor(e.target.value)}
                      className="w-full bg-white border border-rose-200 text-slate-800 rounded px-2.5 py-1.5 font-mono text-xs outline-none focus:border-rose-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">House Emblem Emoji</label>
                  <select
                    value={teamEmoji}
                    onChange={e => setTeamEmoji(e.target.value)}
                    className="w-full bg-white border border-rose-200 text-slate-800 rounded-lg px-3 py-2 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200/50"
                  >
                    <option value="🌸">🌸 Cherry Blossom</option>
                    <option value="🌺">🌺 Hibiscus Rose</option>
                    <option value="💎">💎 Royal Diamond</option>
                    <option value="🦋">🦋 Violet Butterfly</option>
                    <option value="✨">✨ Starlight</option>
                    <option value="🦚">🦚 Peacock</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Team Captain *</label>
                  <input
                    type="text"
                    value={teamCaptain}
                    onChange={e => setTeamCaptain(e.target.value)}
                    placeholder="e.g. Sreya Narayanan"
                    required
                    className="w-full bg-white border border-rose-200 text-slate-800 rounded-lg px-3 py-2 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200/50"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Vice Captain</label>
                  <input
                    type="text"
                    value={teamViceCaptain}
                    onChange={e => setTeamViceCaptain(e.target.value)}
                    placeholder="e.g. Anjali Menon"
                    className="w-full bg-white border border-rose-200 text-slate-800 rounded-lg px-3 py-2 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200/50"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-rose-100">
                <button
                  type="button"
                  onClick={() => setShowAddTeamModal(false)}
                  className="px-3.5 py-2 text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-rose-500 to-fuchsia-500 hover:from-rose-600 hover:to-fuchsia-600 text-white font-bold rounded-xl shadow-md shadow-rose-500/20 transition-all"
                >
                  Create & Enroll House
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
