import React, { useState } from 'react';
import { useFest } from '../context/FestContext';
import { House, FestCategory } from '../types/fest';
import { UserPlus, Shield, QrCode, ArrowRight, Sparkles, Heart } from 'lucide-react';

export const StudentRegistration: React.FC = () => {
  const { houses, programs, registerStudent, candidates } = useFest();

  const [name, setName] = useState('');
  const [houseId, setHouseId] = useState<House['id']>('ruby');
  const [category, setCategory] = useState<FestCategory>('Senior');
  const [gradeSection, setGradeSection] = useState('10-A');
  const [phone, setPhone] = useState('9876543210');
  const [parentPhone, setParentPhone] = useState('9876543299');
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>(['prog-01']);
  const [lastRegisteredCand, setLastRegisteredCand] = useState<any>(candidates[0]);

  const avatarOptions = [
    { id: 'dancer', label: 'Classical Dancer', path: '/src/assets/images/avatar_classical_dancer_1791536930246.jpg' },
    { id: 'singer', label: 'Vocal Musician', path: '/src/assets/images/avatar_vocalist_singer_1791536943467.jpg' },
    { id: 'artist', label: 'Fine Artist', path: '/src/assets/images/avatar_artist_painter_1791536943642.jpg' },
    { id: 'orator', label: 'Orator / Literary', path: '/src/assets/images/avatar_orator_student_1791536952774.jpg' },
  ];
  const [selectedAvatar, setSelectedAvatar] = useState<string>(avatarOptions[0].path);

  const eligiblePrograms = programs.filter(p => p.category === category);

  const handleToggleProgram = (progId: string) => {
    if (selectedPrograms.includes(progId)) {
      setSelectedPrograms(selectedPrograms.filter(id => id !== progId));
    } else {
      setSelectedPrograms([...selectedPrograms, progId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || selectedPrograms.length === 0) return;

    const newCandidate = registerStudent({
      name,
      houseId,
      category,
      gradeSection,
      phone,
      parentPhone,
      registeredPrograms: selectedPrograms,
      photoUrl: selectedAvatar,
    });

    setLastRegisteredCand(newCandidate);
    setName('');
    setSelectedPrograms([]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="bg-white border border-rose-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-wider">
          <UserPlus className="w-4 h-4 text-rose-500" />
          <span>Participant Portal</span>
          <span className="text-slate-300">·</span>
          <span className="text-pink-600 font-semibold flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 fill-pink-500" />
            <span>Online Event Registration</span>
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
          Candidate Enrollment & Chest Number Issuance
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl">
          Register students for inter-house art competitions. Upon submission, a unique digital chest number is generated, candidate badge issued, and notifications linked for stage reporting calls.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Registration Form (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-rose-100 rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-rose-100 pb-2">
              1. Student Details & House Affiliation
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Student Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Meera Nambiar"
                  required
                  className="w-full bg-white border border-rose-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200/50 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">House / Team Affiliation *</label>
                <select
                  value={houseId}
                  onChange={e => setHouseId(e.target.value as House['id'])}
                  className="w-full bg-white border border-rose-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200/50 shadow-2xs"
                >
                  {houses.map(h => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Age Competition Category *</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as FestCategory)}
                  className="w-full bg-white border border-rose-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200/50 shadow-2xs"
                >
                  <option value="Sub-Junior">Sub-Junior (Grades 5-6)</option>
                  <option value="Junior">Junior (Grades 7-8)</option>
                  <option value="Senior">Senior (Grades 9-10)</option>
                  <option value="Super Senior">Super Senior (Grades 11-12)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Class & Section *</label>
                <input
                  type="text"
                  value={gradeSection}
                  onChange={e => setGradeSection(e.target.value)}
                  placeholder="e.g. 10-B"
                  required
                  className="w-full bg-white border border-rose-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200/50 shadow-2xs"
                />
              </div>
            </div>

            {/* Participant Portrait Photo Selection */}
            <div className="pt-3 border-t border-rose-100 space-y-2">
              <span className="text-xs font-bold text-rose-700 block">
                2. Select Participant Profile Portrait
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {avatarOptions.map(av => {
                  const isPicked = selectedAvatar === av.path;
                  return (
                    <div
                      key={av.id}
                      onClick={() => setSelectedAvatar(av.path)}
                      className={`p-2.5 rounded-2xl border cursor-pointer text-center transition-all ${
                        isPicked
                          ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-200 shadow-sm shadow-rose-100/50'
                          : 'bg-white border-rose-100 hover:border-rose-200 hover:bg-rose-50/30'
                      }`}
                    >
                      <img
                        src={av.path}
                        alt={av.label}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-full object-cover mx-auto ring-2 ring-rose-200 mb-1.5 shadow-2xs"
                      />
                      <span className="text-[10px] font-bold text-slate-800 block truncate">{av.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Privacy protected contact details */}
            <div className="pt-3 border-t border-rose-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">3. Contact & Emergency Details</span>
                <span className="text-[11px] text-emerald-700 flex items-center gap-1 font-semibold">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Masked in public view</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Student Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="Mobile number for stage calls"
                    className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200/50 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Parent / Guardian Contact</label>
                  <input
                    type="tel"
                    value={parentPhone}
                    onChange={e => setParentPhone(e.target.value)}
                    placeholder="Emergency guardian phone"
                    className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200/50 shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Program Selection Checkbox List */}
            <div className="pt-3 border-t border-rose-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  4. Select Programs for {category}
                </span>
                <span className="text-[11px] text-rose-600 font-bold">
                  {selectedPrograms.length} item(s) selected
                </span>
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {eligiblePrograms.map(p => {
                  const isChecked = selectedPrograms.includes(p.id);
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleToggleProgram(p.id)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                        isChecked
                          ? 'bg-rose-50 border-rose-300 ring-1 ring-rose-200 text-slate-900 shadow-2xs'
                          : 'bg-white border-rose-100 text-slate-600 hover:border-rose-200 hover:bg-rose-50/20'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">{p.code}</span>
                          <span className="font-bold text-slate-800">{p.title}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          Day {p.day} ({p.timeSlot}) · {p.stage}
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // handled by parent div
                        className="accent-rose-500 w-4 h-4 rounded cursor-pointer"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={!name || selectedPrograms.length === 0}
              className="w-full mt-4 py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-md shadow-rose-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Confirm & Generate Digital Chest Number</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right Preview Card / Digital Pass (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="text-xs font-bold text-slate-600 uppercase tracking-wider px-1">
            Issued Participant Digital Badge
          </div>

          {lastRegisteredCand ? (
            <div className="bg-white border border-rose-200 rounded-2xl p-6 relative overflow-hidden shadow-lg shadow-rose-100/50 space-y-4">
              {/* Badge Header */}
              <div className="flex items-center justify-between pb-4 border-b border-rose-100">
                <div className="flex items-center gap-3.5">
                  <img
                    src={lastRegisteredCand.photoUrl || '/src/assets/images/avatar_classical_dancer_1791536930246.jpg'}
                    alt={lastRegisteredCand.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-rose-300 shadow-sm shrink-0"
                  />
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-rose-600">
                      Official Competitor Pass 🌸
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">{lastRegisteredCand.name}</h3>
                    <span className="text-xs text-slate-500">
                      Class {lastRegisteredCand.gradeSection} · {lastRegisteredCand.category}
                    </span>
                  </div>
                </div>
                <div className="text-center p-2.5 bg-rose-50 rounded-xl border border-rose-200 shrink-0">
                  <span className="text-[10px] text-slate-500 font-semibold block">Chest Number</span>
                  <span className="text-xl font-black font-mono tabular-nums text-rose-600">
                    {lastRegisteredCand.chestNumber}
                  </span>
                </div>
              </div>

              {/* House affiliation */}
              <div className="flex items-center justify-between text-xs py-2 bg-rose-50/50 px-3.5 rounded-xl border border-rose-100">
                <span className="text-slate-500 font-semibold">House / Team:</span>
                <span className="font-extrabold text-slate-800 uppercase tracking-wider">
                  {houses.find(h => h.id === lastRegisteredCand.houseId)?.name}
                </span>
              </div>

              {/* Registered Programs */}
              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Enrolled Events:
                </span>
                <div className="space-y-1.5">
                  {lastRegisteredCand.registeredPrograms.map((pId: string) => {
                    const prog = programs.find(p => p.id === pId);
                    return (
                      <div
                        key={pId}
                        className="text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between"
                      >
                        <span className="text-slate-800 font-medium">{prog?.title}</span>
                        <span className="text-rose-600 font-mono font-bold text-[11px]">{prog?.code}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-rose-100 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Status: Digital Record Synced</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Ready for Check-In</span>
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-rose-100 rounded-2xl p-8 text-center text-xs text-slate-400 space-y-2 shadow-sm">
              <QrCode className="w-10 h-10 text-rose-300 mx-auto" />
              <p>Complete the registration form to generate a live chest number pass and printable badge.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
