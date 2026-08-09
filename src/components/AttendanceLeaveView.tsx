import React, { useState, useEffect } from 'react';
import { AttendanceRecord, LeaveItem, LeaveType, UserProfile } from '../types';
import {
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
  Plus,
  ShieldCheck,
  UserCheck,
  TrendingUp,
  X
} from 'lucide-react';

interface Props {
  attendanceLogs: AttendanceRecord[];
  leaveRequests: LeaveItem[];
  userRole: 'EMPLOYEE' | 'MANAGER' | 'HR_ADMIN' | 'SUPER_ADMIN';
  activeUser?: UserProfile;
  onApplyLeave?: (request: LeaveItem) => void;
}

export const AttendanceLeaveView: React.FC<Props> = ({
  attendanceLogs,
  leaveRequests: initialLeaveRequests,
  userRole,
  activeUser,
  onApplyLeave
}) => {
  const [leaves, setLeaves] = useState<LeaveItem[]>(initialLeaveRequests);

  useEffect(() => {
    setLeaves(initialLeaveRequests);
  }, [initialLeaveRequests]);

  const [showModal, setShowModal] = useState(false);

  // Leave Form
  const [leaveType, setLeaveType] = useState<LeaveType>('CASUAL');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');

  const computeDays = (start: string, end: string): number => {
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    if (!s || !e || e < s) return 1;
    return Math.max(1, Math.round((e - s) / 86400000) + 1);
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    const daysCount = computeDays(startDate, endDate);
    const newLeave: LeaveItem = {
      id: `lv-${Date.now()}`,
      profileId: activeUser?.id || '',
      applicantName: activeUser?.fullName || 'Employee',
      applicantRole: activeUser?.jobTitle || 'Employee',
      applicantPhoto: activeUser?.photoUrl,
      type: leaveType,
      startDate,
      endDate,
      daysCount,
      reason,
      status: 'PENDING',
      createdAt: 'Today'
    };

    setLeaves(prev => [newLeave, ...prev]);
    if (onApplyLeave) onApplyLeave(newLeave);

    setReason('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            <span>Attendance & Leave Governance</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Geofenced clock-in validation, daily work hour counters, leave balances & team calendar oversight
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg transition-all flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* Leave Balances Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 block font-medium">Casual Leave (CL)</span>
          <p className="text-2xl font-bold text-emerald-400 mt-1">8 Days Left</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Total Quota: 12 Days/Year</span>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 block font-medium">Sick Leave (SL)</span>
          <p className="text-2xl font-bold text-indigo-400 mt-1">6 Days Left</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Total Quota: 8 Days/Year</span>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 block font-medium">Earned Leave (EL)</span>
          <p className="text-2xl font-bold text-amber-400 mt-1">14 Days Left</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Accumulated Balance</span>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 block font-medium">IP & Geofence Validator</span>
          <p className="text-sm font-bold text-emerald-400 mt-2 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Authorized Office IP</span>
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">Bengaluru HQ Subnet (10.4.0.0/16)</span>
        </div>
      </div>

      {/* Attendance Log Table & Leave Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Log Table (2 Columns) */}
        <div className="lg:col-span-2 glass-card rounded-xl p-5 border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-indigo-400" />
            <span>My Attendance Clock Logs</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Check-In</th>
                  <th className="p-3">Check-Out</th>
                  <th className="p-3">Total Hours</th>
                  <th className="p-3">Location / IP Validation</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {attendanceLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition-colors text-slate-200">
                    <td className="p-3 font-sans font-semibold">{log.date}</td>
                    <td className="p-3 text-emerald-400">{log.checkIn}</td>
                    <td className="p-3 text-slate-300">{log.checkOut || 'Active Now'}</td>
                    <td className="p-3 font-bold">{log.totalHours ? `${log.totalHours} hrs` : 'In Progress'}</td>
                    <td className="p-3 font-sans text-slate-400 text-[11px]">{log.location}</td>
                    <td className="p-3 font-sans">
                      <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded font-bold">
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Leave Requests Log */}
        <div className="glass-card rounded-xl p-5 border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>Leave Requests History</span>
          </h2>

          <div className="space-y-3 text-xs">
            {leaves.map(l => (
              <div key={l.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-200">{l.applicantName}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      l.status === 'APPROVED'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : l.status === 'PENDING'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {l.status}
                  </span>
                </div>
                <p className="text-[11px] text-indigo-400 font-medium">{l.type} Leave • {l.daysCount} Days</p>
                <p className="text-[11px] text-slate-400">{l.startDate} to {l.endDate}</p>
                <p className="text-[11px] text-slate-500 italic">"{l.reason}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leave Application Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">Apply for Leave</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApply} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={e => setLeaveType(e.target.value as LeaveType)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none"
                >
                  <option value="CASUAL">Casual Leave (CL)</option>
                  <option value="SICK">Sick Leave (SL)</option>
                  <option value="EARNED">Earned Leave (EL)</option>
                  <option value="MATERNITY">Maternity / Paternity</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Reason for Leave</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide reason for approval..."
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-medium hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-500 shadow"
                >
                  Submit ({computeDays(startDate, endDate)} day{computeDays(startDate, endDate) > 1 ? 's' : ''})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
