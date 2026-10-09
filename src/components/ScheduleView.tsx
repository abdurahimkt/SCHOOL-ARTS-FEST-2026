import React, { useState } from 'react';
import { useFest } from '../context/FestContext';
import { Calendar, Clock, MapPin, Users, ChevronRight, Sparkles, Heart } from 'lucide-react';

interface ScheduleViewProps {
  onSelectProgram?: (programId: string) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ onSelectProgram }) => {
  const { programs, candidates, results, setSelectedProgramId } = useFest();
  const [activeDay, setActiveDay] = useState<1 | 2 | 3>(1);
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');

  const filteredPrograms = programs.filter(p => {
    if (p.day !== activeDay) return false;
    if (selectedDept !== 'all' && p.department !== selectedDept) return false;
    if (selectedStage !== 'all' && !p.stage.includes(selectedStage)) return false;
    return true;
  });

  const dayDates = {
    1: 'Thursday, October 15, 2026 · Solos & Opening Day 🌸',
    2: 'Friday, October 16, 2026 · Folk, Choral & Studio Arts ✨',
    3: 'Saturday, October 17, 2026 · Theatre, Anthems & Grand Finale 👑',
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header and Day Switcher */}
      <div className="bg-white border border-rose-100 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-wider">
              <Calendar className="w-4 h-4 text-rose-500" />
              <span>Official 3-Day Festival Itinerary</span>
              <span className="text-slate-300">·</span>
              <span className="text-pink-600 font-semibold flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 fill-pink-500" />
                <span>Live Synchronized</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Events Schedule & Stage Matrix
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {dayDates[activeDay]}
            </p>
          </div>

          {/* 3-Day Segmented Controls */}
          <div className="flex items-center p-1 bg-rose-50/80 rounded-xl border border-rose-200/80 shrink-0">
            {([1, 2, 3] as const).map(day => (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                  activeDay === day
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm shadow-rose-500/20'
                    : 'text-slate-600 hover:text-rose-600'
                }`}
              >
                Day {day}
              </button>
            ))}
          </div>
        </div>

        {/* Filters Strip */}
        <div className="mt-6 pt-4 border-t border-rose-100 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-semibold">Department:</span>
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="bg-white border border-rose-200 text-slate-800 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200/50 shadow-2xs"
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

          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-semibold">Venue / Stage:</span>
            <select
              value={selectedStage}
              onChange={e => setSelectedStage(e.target.value)}
              className="bg-white border border-rose-200 text-slate-800 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200/50 shadow-2xs"
            >
              <option value="all">All Stages</option>
              <option value="Ragam">Stage 1 - Ragam Auditorium</option>
              <option value="Thalam">Stage 2 - Thalam Open Air</option>
              <option value="Laya">Stage 3 - Laya Seminar Hall</option>
              <option value="Varnam">Stage 4 - Varnam Studio</option>
              <option value="Shruthi">Stage 5 - Shruthi Chamber</option>
            </select>
          </div>

          <div className="ml-auto text-slate-500 text-xs">
            Showing <strong className="text-rose-600 font-mono font-bold">{filteredPrograms.length}</strong> events scheduled for Day {activeDay}
          </div>
        </div>
      </div>

      {/* Program Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPrograms.map(p => {
          const registered = candidates.filter(c => c.registeredPrograms.includes(p.id)).length;
          const res = results[p.id];
          const isAnnounced = res?.isAnnounced;

          return (
            <div
              key={p.id}
              className="bg-white border border-rose-100 hover:border-rose-300 rounded-2xl p-5 space-y-4 transition-all hover:shadow-md hover:shadow-rose-100/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-rose-600">
                    <span className="font-extrabold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">{p.code}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-500 font-medium">{p.department}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-500 font-medium">{p.category}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{p.title}</h3>
                </div>

                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shrink-0 ${
                    isAnnounced
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : p.status === 'in_progress'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {isAnnounced ? 'Announced' : p.status}
                </span>
              </div>

              {/* Time & Venue Info */}
              <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 pt-1">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="truncate font-medium">{p.timeSlot} ({p.maxDurationMins}m)</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                  <span className="truncate font-medium">{p.stage.split(' - ')[0]}</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 line-clamp-1">
                {p.venueDetail}
              </p>

              {/* Judges and registered candidates count */}
              <div className="pt-3 border-t border-rose-50 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Users className="w-3.5 h-3.5 text-rose-400" />
                  <span>
                    <strong className="text-slate-800 font-mono">{registered}</strong> Candidates Enrolled
                  </span>
                </div>

                <button
                  onClick={() => {
                    setSelectedProgramId(p.id);
                    if (onSelectProgram) onSelectProgram(p.id);
                  }}
                  className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-bold transition-colors"
                >
                  <span>View Details & Roster</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
