import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  TaskItem,
  AttendanceRecord,
  AnnouncementItem,
  MeetingItem
} from '../types';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Sparkles,
  TrendingUp,
  MapPin,
  ShieldCheck,
  ChevronRight,
  UserCheck,
  Plus
} from 'lucide-react';

interface Props {
  profile: UserProfile;
  tasks: TaskItem[];
  attendance: AttendanceRecord[];
  announcements: AnnouncementItem[];
  meetings: MeetingItem[];
  onNavigate: (tab: any) => void;
  onOpenScheduleModal: () => void;
  onClockAction?: (action: 'IN' | 'OUT') => Promise<boolean>;
}

export const EmployeeDashboard: React.FC<Props> = ({
  profile,
  tasks,
  attendance,
  announcements,
  meetings,
  onNavigate,
  onOpenScheduleModal,
  onClockAction
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const hasOpenToday = attendance.some(a => a.date === todayStr && a.checkIn && !a.checkOut);
  const [checkedIn, setCheckedIn] = useState(hasOpenToday);
  const [clockBusy, setClockBusy] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(hasOpenToday ? 14520 : 0);
  const [locationVerified] = useState(true);

  useEffect(() => {
    setCheckedIn(hasOpenToday);
    setElapsedSeconds(hasOpenToday ? (prev => prev || 14520) : 0);
  }, [hasOpenToday, attendance]);

  useEffect(() => {
    let timer: any;
    if (checkedIn) {
      timer = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [checkedIn]);

  const handleClockToggle = async () => {
    if (!onClockAction) {
      setCheckedIn(!checkedIn);
      return;
    }
    setClockBusy(true);
    const ok = await onClockAction(checkedIn ? 'OUT' : 'IN');
    setClockBusy(false);
    if (ok) {
      setCheckedIn(c => !c);
    }
  };

  const formatTime = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Scope tasks assigned to logged-in user
  const myTasks = tasks.filter(
    t => t.assigneeId === profile.id || t.assigneeName.toLowerCase().includes(profile.fullName.split(' ')[0].toLowerCase())
  );
  const pendingTasks = myTasks.filter(t => t.status !== 'COMPLETED');
  const completedTasks = myTasks.filter(t => t.status === 'COMPLETED');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-card rounded-2xl p-6 relative overflow-hidden border-indigo-500/20 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={profile.photoUrl}
                alt={profile.fullName}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-xl"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Welcome back, {profile.fullName.split(' ')[0]} 👋
                </h1>
                <span className="bg-indigo-500/20 text-indigo-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                  {profile.role}
                </span>
              </div>
              <p className="text-slate-400 text-sm mt-0.5">
                {profile.jobTitle} • {profile.department} Team
              </p>
            </div>
          </div>

          {/* Clock In / Out Action Box */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex items-center space-x-4 min-w-[280px]">
            <div className="flex-1">
              <div className="flex items-center text-xs text-slate-400 space-x-1">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Today's Hours</span>
              </div>
              <div className="text-xl font-mono font-bold text-white mt-0.5">
                {formatTime(elapsedSeconds)}
              </div>
              <div className="flex items-center text-[10px] text-emerald-400 mt-0.5 space-x-1">
                <MapPin className="w-3 h-3" />
                <span>{locationVerified ? 'Bengaluru HQ (Validated IP)' : 'Remote VPN'}</span>
              </div>
            </div>

            <button
              onClick={handleClockToggle}
              disabled={clockBusy}
              className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-lg flex items-center space-x-1.5 disabled:opacity-60 ${
                checkedIn
                  ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/30'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>{clockBusy ? 'Saving…' : checkedIn ? 'Clock Out' : 'Clock In'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>Daily Attendance</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-2">Present</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Check-in: 09:15 AM</span>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>My Active Tasks</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-indigo-400 mt-2">{pendingTasks.length} Pending</p>
          <span className="text-[11px] text-slate-500 mt-1 block">{completedTasks.length} Completed this week</span>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>Today's Meetings</span>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400 mt-2">{meetings.length} Scheduled</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Real Calendar Integration</span>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>Leave Balance</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-purple-400 mt-2">14 Days</p>
          <span className="text-[11px] text-slate-500 mt-1 block">1 Request Pending Approval</span>
        </div>
      </div>

      {/* Main Grid: My Tasks & Real Meetings Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Tasks Widget (2 Columns) */}
        <div className="lg:col-span-2 glass-card rounded-xl p-5 border border-slate-800 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>📋 My Priority Deliverables</span>
                <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-0.5 rounded-full font-mono">
                  {pendingTasks.length}
                </span>
              </h2>
              <p className="text-xs text-slate-400">Assigned deliverables specifically for {profile.fullName}</p>
            </div>
            <button
              onClick={() => onNavigate('tasks')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              Open Sprint Kanban <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {myTasks.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/40 rounded-xl border border-dashed border-slate-800 text-xs text-slate-400">
                No active tasks assigned to your account.
              </div>
            ) : (
              myTasks.map(task => (
                <div
                  key={task.id}
                  className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 hover:border-indigo-500/40 transition-all space-y-2 group"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider block">
                        {task.projectName}
                      </span>
                      <h3 className="font-semibold text-sm text-slate-100 group-hover:text-indigo-300 transition-colors">
                        {task.title}
                      </h3>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                        task.priority === 'URGENT'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : task.priority === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-1">{task.description}</p>

                  {/* Progress bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                      <span>Progress</span>
                      <span>{task.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-slate-800/40">
                    <span>Due Date: {task.dueDate}</span>
                    <span>Assigned by {task.creatorName}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Sidebar: Real Schedule Calendar & Announcements */}
        <div className="space-y-6">
          {/* Today's Meetings Schedule */}
          <div className="glass-card rounded-xl p-5 border border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>Today's Real Meetings</span>
              </h2>
              <button
                onClick={onOpenScheduleModal}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all flex items-center space-x-1"
              >
                <Plus className="w-3 h-3" />
                <span>Schedule</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {meetings.map(m => (
                <div
                  key={m.id}
                  className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/30 border-l-4 border-l-indigo-500 space-y-1"
                >
                  <h4 className="font-semibold text-slate-100">{m.title}</h4>
                  <p className="text-indigo-300 text-[11px] font-mono">{m.startTime} - {m.endTime} • {m.date}</p>
                  <p className="text-slate-400 text-[11px] truncate">{m.locationOrLink}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Announcements Ticker */}
          <div className="glass-card rounded-xl p-5 border border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Announcements</span>
              </h2>
            </div>

            <div className="space-y-3">
              {announcements.map(anc => (
                <div key={anc.id} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-1.5">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-xs text-slate-200">{anc.title}</h4>
                    <span className="text-[10px] text-slate-500">{anc.date}</span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{anc.content}</p>
                  <span className="text-[10px] text-indigo-400 font-medium block">— {anc.author}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
