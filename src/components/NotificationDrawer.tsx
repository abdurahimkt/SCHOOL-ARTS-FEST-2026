import React, { useState } from 'react';
import { useFest } from '../context/FestContext';
import { Bell, X, CheckCheck, Megaphone, Send, Sparkles } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    pushPermissionGranted,
    requestPushPermission,
    currentRole,
    broadcastCustomNotification,
  } = useFest();

  const [filterType, setFilterType] = useState<'all' | 'result' | 'call' | 'schedule'>('all');
  const [customTitle, setCustomTitle] = useState('');
  const [customMsg, setCustomMsg] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  if (!isOpen) return null;

  const filteredNotifs = notifications.filter(n => {
    if (filterType === 'all') return true;
    return n.type === filterType;
  });

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle || !customMsg) return;

    broadcastCustomNotification(customTitle, customMsg);
    setCustomTitle('');
    setCustomMsg('');
    setIsBroadcasting(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-rose-950/20 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-rose-200 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-5 py-4 border-b border-rose-100 bg-rose-50/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-rose-600" />
              <div>
                <h2 className="text-sm font-bold text-slate-900">Live Stage Calls & Alerts 🌸</h2>
                <p className="text-xs text-slate-500">Automated real-time notifications</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-rose-100/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Push permission banner */}
          {!pushPermissionGranted && (
            <div className="px-5 py-3 bg-amber-50 border-b border-amber-200 flex items-center justify-between text-xs">
              <span className="text-amber-800 font-medium">Enable device push notifications for live results</span>
              <button
                onClick={() => requestPushPermission()}
                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-xs transition-colors shrink-0 shadow-2xs"
              >
                Allow Alerts
              </button>
            </div>
          )}

          {/* Quick Filter tabs & Mark Read */}
          <div className="px-5 py-2.5 bg-rose-50/30 border-b border-rose-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              {(['all', 'result', 'call', 'schedule'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-2.5 py-1 rounded-lg transition-colors capitalize text-xs font-semibold ${
                    filterType === type
                      ? 'bg-rose-500 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-rose-600'
                  }`}
                >
                  {type === 'all' ? 'All' : type}
                </button>
              ))}
            </div>

            <button
              onClick={markAllNotificationsRead}
              className="flex items-center gap-1 text-slate-500 hover:text-rose-600 font-medium transition-colors"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Read All</span>
            </button>
          </div>

          {/* Admin Broadcast Trigger */}
          {currentRole === 'admin' && (
            <div className="px-5 py-2.5 bg-rose-50/50 border-b border-rose-100">
              {isBroadcasting ? (
                <form onSubmit={handleBroadcast} className="space-y-2 py-1">
                  <input
                    type="text"
                    value={customTitle}
                    onChange={e => setCustomTitle(e.target.value)}
                    placeholder="Alert Title (e.g. Stage 2 Delay Notice)"
                    className="w-full bg-white border border-rose-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-rose-400"
                    required
                  />
                  <textarea
                    value={customMsg}
                    onChange={e => setCustomMsg(e.target.value)}
                    placeholder="Alert Message to Attendees & Stage Managers..."
                    rows={2}
                    className="w-full bg-white border border-rose-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-rose-400"
                    required
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="px-3 py-1 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                    >
                      <Send className="w-3 h-3" />
                      <span>Push Broadcast</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsBroadcasting(false)}
                      className="px-2.5 py-1 text-slate-500 hover:text-slate-800 text-xs transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setIsBroadcasting(true)}
                  className="w-full py-1 text-xs text-rose-700 hover:text-rose-800 flex items-center justify-center gap-1.5 font-bold transition-colors"
                >
                  <Megaphone className="w-3.5 h-3.5 text-rose-600" />
                  <span>Broadcast System Announcement</span>
                </button>
              )}
            </div>
          )}

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto divide-y divide-rose-50 p-4 space-y-2.5">
            {filteredNotifs.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No notifications in this filter category.
              </div>
            ) : (
              filteredNotifs.map(n => {
                const isUnread = !n.read;
                return (
                  <div
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isUnread
                        ? 'bg-rose-50/70 border-rose-200 shadow-2xs'
                        : 'bg-white border-slate-100 hover:border-rose-100 opacity-80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                          {n.type}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-[11px] text-slate-500">{n.timestamp}</span>
                      </div>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 ring-2 ring-rose-200" />
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 mt-1.5 leading-snug">{n.title}</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer note */}
          <div className="px-5 py-3 border-t border-rose-100 bg-rose-50/40 text-[11px] text-slate-500 text-center">
            Pushed over WebSocket & Service Worker simulation
          </div>
        </div>
      </div>
    </div>
  );
};
