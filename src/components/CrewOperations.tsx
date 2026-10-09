import React, { useState } from 'react';
import { useFest } from '../context/FestContext';
import { Users, CheckCircle2, Circle, Plus, Download, Sparkles, Heart } from 'lucide-react';
import { exportCrewOperationsCSV } from '../utils/exportUtils';

export const CrewOperations: React.FC = () => {
  const {
    crewMembers,
    crewTasks,
    programs,
    toggleTaskComplete,
    addCrewTask,
  } = useFest();

  const [selectedMemberId, setSelectedMemberId] = useState<string>(crewMembers[0]?.id || '');
  const [showAddTaskModal, setShowAddTaskModal] = useState<boolean>(false);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskMemberId, setNewTaskMemberId] = useState(crewMembers[0]?.id || '');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [newTaskDay, setNewTaskDay] = useState<1 | 2 | 3>(1);

  const activeMember = crewMembers.find(m => m.id === selectedMemberId);
  const memberTasks = crewTasks.filter(t => t.crewMemberId === selectedMemberId);
  const totalTasks = crewTasks.length;
  const completedTasks = crewTasks.filter(t => t.completed).length;
  const overallProgressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const memberCompleted = memberTasks.filter(t => t.completed).length;
  const memberRate = memberTasks.length > 0 ? Math.round((memberCompleted / memberTasks.length) * 100) : 100;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;

    addCrewTask({
      crewMemberId: newTaskMemberId,
      title: newTaskTitle,
      priority: newTaskPriority,
      day: newTaskDay,
      dueDate: `Day ${newTaskDay} · 08:30 AM`,
    });

    setNewTaskTitle('');
    setShowAddTaskModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="bg-white border border-rose-100 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-wider">
              <Users className="w-4 h-4 text-rose-500" />
              <span>Event Operations & Staff Crew Dispatch</span>
              <span className="text-slate-300">·</span>
              <span className="text-pink-600 font-semibold flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 fill-pink-500" />
                <span>Live Coordination</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Team Workload & Active Assigned Projects
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Track active projects assigned to each individual user, venue management tasks, and real-time operational task completion rates across all 3 festival days.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => exportCrewOperationsCSV(crewMembers, crewTasks)}
              className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors flex items-center gap-2 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Workload CSV</span>
            </button>
            <button
              onClick={() => setShowAddTaskModal(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm shadow-rose-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Assign New Project</span>
            </button>
          </div>
        </div>

        {/* Global Crew Progress Visualization */}
        <div className="mt-6 pt-5 border-t border-rose-100">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-slate-800">Overall Event Readiness & Operations Progress</span>
            <span className="font-mono tabular-nums text-rose-600 font-bold">
              {completedTasks} / {totalTasks} Tasks Completed ({overallProgressPct}%)
            </span>
          </div>
          <div className="w-full bg-rose-100 rounded-full h-2.5 overflow-hidden border border-rose-200">
            <div
              className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${overallProgressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid: Crew Members Workload Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {crewMembers.map(member => {
          const userTasks = crewTasks.filter(t => t.crewMemberId === member.id);
          const activeProjectCount = userTasks.filter(t => !t.completed).length;
          const completedProjectCount = userTasks.filter(t => t.completed).length;
          const completionPct = userTasks.length > 0 ? Math.round((completedProjectCount / userTasks.length) * 100) : 100;
          const isSelected = member.id === selectedMemberId;

          // Assigned program names
          const memberProgramObjs = programs.filter(p => member.assignedPrograms.includes(p.id));

          return (
            <div
              key={member.id}
              onClick={() => setSelectedMemberId(member.id)}
              className={`rounded-2xl border p-5 cursor-pointer transition-all ${
                isSelected
                  ? 'bg-white border-rose-400 ring-2 ring-rose-200/80 shadow-md shadow-rose-100/50'
                  : 'bg-white/80 border-rose-100 hover:border-rose-300 hover:bg-white shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{member.name}</h3>
                  <p className="text-xs text-rose-600 font-bold mt-0.5">{member.role}</p>
                  <span className="text-[11px] text-slate-400 block">{member.department}</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black font-mono text-rose-600 tabular-nums">
                    {activeProjectCount}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-semibold">Active Tasks</span>
                </div>
              </div>

              {/* Progress bar per user */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                  <span>Task Completion Rate</span>
                  <span className="font-mono tabular-nums font-bold text-emerald-600">{completionPct}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 to-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
              </div>

              {/* Assigned Programs Preview */}
              <div className="mt-4 pt-3 border-t border-rose-50">
                <span className="text-[11px] font-bold text-slate-600 block mb-1.5">
                  Assigned Programs ({memberProgramObjs.length}):
                </span>
                <div className="flex flex-wrap gap-1">
                  {memberProgramObjs.slice(0, 3).map(p => (
                    <span
                      key={p.id}
                      className="text-[10px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md border border-rose-200 font-mono font-bold"
                    >
                      {p.code}
                    </span>
                  ))}
                  {memberProgramObjs.length > 3 && (
                    <span className="text-[10px] text-slate-400 py-0.5 px-1 font-medium">
                      +{memberProgramObjs.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Member Focus & Task Checklist */}
      {activeMember && (
        <div className="bg-white border border-rose-100 rounded-2xl p-6 space-y-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-rose-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                  Operational Dossier 🌸
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-500 font-medium">{activeMember.department}</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 mt-1">{activeMember.name}</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeMember.role} · Direct: {activeMember.phone}
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="bg-rose-50/60 px-3.5 py-2 rounded-xl border border-rose-100 text-center">
                <span className="text-slate-500 block text-[11px]">Total Work Items</span>
                <span className="font-mono font-black text-slate-900 text-sm">{memberTasks.length}</span>
              </div>
              <div className="bg-amber-50/70 px-3.5 py-2 rounded-xl border border-amber-100 text-center">
                <span className="text-amber-700 block text-[11px] font-semibold">Pending / Active</span>
                <span className="font-mono font-black text-amber-800 text-sm">
                  {memberTasks.filter(t => !t.completed).length}
                </span>
              </div>
              <div className="bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-100 text-center">
                <span className="text-emerald-700 block text-[11px] font-semibold">Completion Rate</span>
                <span className="font-mono font-black text-emerald-800 text-sm">{memberRate}%</span>
              </div>
            </div>
          </div>

          {/* Programs assigned list */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Programs Handled by {activeMember.name.split(' ')[0]}:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {programs
                .filter(p => activeMember.assignedPrograms.includes(p.id))
                .map(prog => (
                  <div
                    key={prog.id}
                    className="p-3 rounded-xl bg-rose-50/30 border border-rose-100 text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="font-mono font-bold text-rose-600 block">{prog.code}</span>
                      <span className="text-slate-800 font-bold line-clamp-1">{prog.title}</span>
                      <span className="text-[10px] text-slate-400">{prog.stage.split(' - ')[0]} · Day {prog.day}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Interactive Checklist */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Assigned Action Tasks & Milestones
            </h3>
            <div className="space-y-2">
              {memberTasks.length === 0 ? (
                <div className="p-6 bg-slate-50 rounded-xl text-xs text-slate-400 text-center">
                  No tasks currently assigned to this member. Click "Assign New Project" above.
                </div>
              ) : (
                memberTasks.map(task => {
                  return (
                    <div
                      key={task.id}
                      onClick={() => toggleTaskComplete(task.id)}
                      className={`p-3.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                        task.completed
                          ? 'bg-slate-50 border-slate-200 text-slate-400 opacity-80'
                          : 'bg-white border-rose-100 hover:border-rose-300 text-slate-800 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          className="text-rose-500 hover:text-rose-600 transition-colors"
                          aria-label={task.completed ? 'Mark task as incomplete' : 'Mark task as complete'}
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-300" />
                          )}
                        </button>
                        <div>
                          <span
                            className={`font-semibold ${
                              task.completed ? 'line-through text-slate-400' : 'text-slate-900'
                            }`}
                          >
                            {task.title}
                          </span>
                          <span className="text-[11px] text-slate-400 block">
                            Target: {task.dueDate} {task.stage ? `· ${task.stage.split(' - ')[0]}` : ''}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            task.priority === 'urgent'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : task.priority === 'high'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rose-950/30 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white border border-rose-200 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Assign Task to Crew Member</h3>

            <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Assignee</label>
                <select
                  value={newTaskMemberId}
                  onChange={e => setNewTaskMemberId(e.target.value)}
                  className="w-full bg-white border border-rose-200 text-slate-800 rounded-xl px-3 py-2 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200/50"
                >
                  {crewMembers.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Task Title / Directive</label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Stage 1 Audio cabling check"
                  required
                  className="w-full bg-white border border-rose-200 text-slate-800 rounded-xl px-3 py-2 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Festival Day</label>
                  <select
                    value={newTaskDay}
                    onChange={e => setNewTaskDay(Number(e.target.value) as 1 | 2 | 3)}
                    className="w-full bg-white border border-rose-200 text-slate-800 rounded-xl px-3 py-2 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200/50"
                  >
                    <option value={1}>Day 1</option>
                    <option value={2}>Day 2</option>
                    <option value={3}>Day 3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={e => setNewTaskPriority(e.target.value as any)}
                    className="w-full bg-white border border-rose-200 text-slate-800 rounded-xl px-3 py-2 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200/50"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-rose-100">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-3.5 py-2 text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold rounded-xl shadow-md shadow-rose-500/20 transition-all"
                >
                  Create & Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
