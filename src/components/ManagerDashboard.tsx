import React, { useState } from 'react';
import {
  UserProfile,
  ProjectItem,
  ApprovalRequest,
  TaskItem
} from '../types';
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Briefcase,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  FileCheck,
  Award,
  Layers,
  ArrowUpRight
} from 'lucide-react';

interface Props {
  profile: UserProfile;
  projects: ProjectItem[];
  approvals: ApprovalRequest[];
  tasks: TaskItem[];
  onNavigate: (tab: any) => void;
  onApproveRequest?: (id: string) => void;
  onRejectRequest?: (id: string) => void;
}

export const ManagerDashboard: React.FC<Props> = ({
  profile,
  projects,
  approvals,
  tasks,
  onNavigate,
  onApproveRequest,
  onRejectRequest
}) => {
  const [localApprovals, setLocalApprovals] = useState<ApprovalRequest[]>(approvals);

  const handleApprove = (id: string) => {
    setLocalApprovals(prev => prev.map(a => a.id === id ? { ...a, status: 'APPROVED' } : a));
    if (onApproveRequest) onApproveRequest(id);
  };

  const handleReject = (id: string) => {
    setLocalApprovals(prev => prev.map(a => a.id === id ? { ...a, status: 'REJECTED' } : a));
    if (onRejectRequest) onRejectRequest(id);
  };

  const pendingApprovals = localApprovals.filter(a => a.status === 'PENDING');
  const urgentTasks = tasks.filter(t => t.priority === 'URGENT' || t.priority === 'HIGH');

  return (
    <div className="space-y-6">
      {/* Manager Banner Header */}
      <div className="glass-card rounded-2xl p-6 relative overflow-hidden border-emerald-500/20 bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="flex items-center space-x-4">
            <img
              src={profile.photoUrl}
              alt={profile.fullName}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-xl"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Manager Control Tower — {profile.fullName}
                </h1>
                <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  {profile.jobTitle}
                </span>
              </div>
              <p className="text-slate-400 text-sm mt-0.5">
                Overseeing {profile.department} • Backend Engineering & Cloud Teams (8 Direct Reports)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigate('tasks')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg transition-all flex items-center space-x-1.5"
            >
              <Briefcase className="w-4 h-4" />
              <span>Delegate New Task</span>
            </button>
          </div>
        </div>
      </div>

      {/* Headcount & Team Bandwidth Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>Total Team Headcount</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">12 Members</p>
          <div className="flex items-center text-[11px] text-emerald-400 mt-1 space-x-2">
            <span>10 Present</span>
            <span>•</span>
            <span className="text-amber-400">1 On Leave</span>
            <span>•</span>
            <span className="text-slate-400">1 Away</span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>Active Projects</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-indigo-400 mt-2">{projects.length} Projects</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Average Progress: 68%</span>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>Pending Approvals</span>
            <FileCheck className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400 mt-2">{pendingApprovals.length} Requests</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Requires Manager Signature</span>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>Team Workload Capacity</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-purple-400 mt-2">84% Capacity</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Bandwidth: High (Sprint 14)</span>
        </div>
      </div>

      {/* Main Grid: Pending Approvals Drawer & Project Execution Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Approvals Drawer (2 Columns) */}
        <div className="lg:col-span-2 glass-card rounded-xl p-5 border border-slate-800 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-amber-400" />
                <span>Pending Approvals Drawer</span>
                <span className="bg-amber-500/20 text-amber-300 text-xs px-2 py-0.5 rounded-full">
                  {pendingApprovals.length} Action Needed
                </span>
              </h2>
              <p className="text-xs text-slate-400">Leave, Expense reimbursement, and equipment request sign-offs</p>
            </div>
            <button
              onClick={() => onNavigate('attendance')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
            >
              View Full Leave Log <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {pendingApprovals.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 rounded-xl border border-dashed border-slate-800">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
              <p className="text-xs text-slate-300 font-semibold">All pending manager requests cleared!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingApprovals.map(req => (
                <div
                  key={req.id}
                  className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                        {req.category}
                      </span>
                      <h4 className="font-semibold text-xs text-white">{req.title}</h4>
                    </div>
                    <p className="text-xs text-slate-300">
                      Applicant: <span className="font-semibold text-indigo-300">{req.applicantName}</span> ({req.applicantRole})
                    </p>
                    <p className="text-[11px] text-slate-400">Details: {req.amountOrDetails}</p>
                    <span className="text-[10px] text-slate-500 block">Submitted on {req.date}</span>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    <button
                      onClick={() => handleReject(req.id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold border border-rose-500/30 transition-all flex items-center space-x-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleApprove(req.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow border border-emerald-400/30 transition-all flex items-center space-x-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Project Health & Workload Meters */}
        <div className="space-y-6">
          {/* Active Projects Health */}
          <div className="glass-card rounded-xl p-5 border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-400" />
              <span>Project Health & Progress</span>
            </h2>

            <div className="space-y-4">
              {projects.map(proj => (
                <div key={proj.id} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-200">{proj.name}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        proj.status === 'On Track'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {proj.status}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        proj.status === 'On Track' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${proj.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>Due: {proj.dueDate}</span>
                    <span>{proj.progress}% Complete</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Urgent Items Alert */}
          <div className="glass-card rounded-xl p-5 border border-slate-800 space-y-3">
            <h2 className="text-sm font-bold text-rose-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Urgent Task Bottlenecks ({urgentTasks.length})</span>
            </h2>

            <div className="space-y-2">
              {urgentTasks.map(t => (
                <div key={t.id} className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs">
                  <div className="font-semibold text-rose-200">{t.title}</div>
                  <div className="text-[11px] text-slate-400">Assignee: {t.assigneeName} • Due: {t.dueDate}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
