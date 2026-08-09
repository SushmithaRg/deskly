import React, { useState, useEffect, useCallback } from 'react';
import { Role, UserProfile, TaskItem, AttendanceRecord, LeaveItem, ApprovalRequest, DocumentItem, GoalOKRItem, RecognitionBadge, AnnouncementItem, MeetingItem } from './types';
import { api } from './api/client';
import { getActiveSession, logoutSession, mapApiUserToProfile } from './services/authStore';

// Component imports
import { AuthScreen } from './components/AuthScreen';
import { EmployeeDashboard } from './components/EmployeeDashboard';
import { ManagerDashboard } from './components/ManagerDashboard';
import { DirectoryView } from './components/DirectoryView';
import { TaskKanban } from './components/TaskKanban';
import { AttendanceLeaveView } from './components/AttendanceLeaveView';
import { DocumentVault } from './components/DocumentVault';
import { PerformanceRecognitionView } from './components/PerformanceRecognitionView';
import { ProfileCard } from './components/ProfileCard';
import { DeskAIWidget } from './components/DeskAIWidget';
import { ScheduleMeetingModal } from './components/ScheduleMeetingModal';

import {
  LayoutDashboard, Users, Kanban, Clock, FileText, Award,
  UserCheck, Bell, LogOut, Plus, ShieldCheck, RefreshCw
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────
// Type adapters: convert API responses to frontend types
// ─────────────────────────────────────────────────────────────────
function adaptTask(t: any): TaskItem {
  return {
    id: t.id,
    title: t.title,
    description: t.description || '',
    status: t.status as TaskItem['status'],
    priority: t.priority as TaskItem['priority'],
    projectName: t.projectName || undefined,
    assigneeId: t.assigneeId,
    assigneeName: t.assigneeName || t.assignee?.fullName || 'Unknown',
    creatorName: t.creatorName || t.creator?.fullName || 'Unknown',
    dueDate: t.dueDate,
    progress: t.progress || 0,
    commentsCount: 0,
    tags: Array.isArray(t.tags) ? t.tags : []
  };
}

function adaptLeave(l: any): LeaveItem {
  return {
    id: l.id,
    profileId: l.userId,
    applicantName: l.user?.fullName || 'Employee',
    applicantRole: l.user?.jobTitle || 'Employee',
    applicantPhoto: l.user?.photoUrl,
    type: l.type as LeaveItem['type'],
    startDate: l.startDate,
    endDate: l.endDate,
    daysCount: l.daysCount,
    reason: l.reason,
    status: l.status as LeaveItem['status'],
    createdAt: l.createdAt,
    approvedBy: l.approvedBy
  };
}

function adaptAttendance(a: any): AttendanceRecord {
  return {
    id: a.id,
    profileId: a.userId,
    date: a.date,
    checkIn: a.checkIn,
    checkOut: a.checkOut,
    totalHours: a.totalHours,
    location: a.location || 'Office',
    status: (a.status || 'Present') as AttendanceRecord['status']
  };
}

function adaptDocument(d: any): DocumentItem {
  return {
    id: d.id,
    title: d.title,
    category: d.category as DocumentItem['category'],
    fileUrl: d.fileUrl,
    fileSize: d.fileSize,
    fileType: (d.fileType || 'pdf') as DocumentItem['fileType'],
    isConfidential: d.isConfidential || false,
    uploadedById: d.uploadedById,
    uploadedBy: d.uploadedBy?.fullName || 'Unknown',
    uploadedAt: d.createdAt,
    realDataUrl: d.fileUrl.startsWith('/uploads/') ? `http://localhost:5000${d.fileUrl}` : d.fileUrl
  };
}

function adaptOKR(o: any): GoalOKRItem {
  return {
    id: o.id,
    profileId: o.userId,
    title: o.title,
    category: o.category as GoalOKRItem['category'],
    target: o.target,
    current: o.current,
    quarter: o.quarter,
    year: o.year,
    unit: o.unit || 'units'
  };
}

function adaptRecognition(r: any): RecognitionBadge {
  return {
    id: r.id,
    giverName: r.giver?.fullName || 'Colleague',
    giverPhoto: r.giver?.photoUrl,
    receiverName: r.receiver?.fullName || 'Employee',
    receiverPhoto: r.receiver?.photoUrl,
    badgeType: r.badgeType as RecognitionBadge['badgeType'],
    message: r.message,
    createdAt: r.createdAt
  };
}

function adaptAnnouncement(a: any): AnnouncementItem {
  return {
    id: a.id,
    title: a.title,
    content: a.content,
    author: a.author,
    target: a.target,
    date: a.createdAt,
    tag: (a.tag || 'General') as AnnouncementItem['tag']
  };
}

function adaptMeeting(m: any): MeetingItem {
  return {
    id: m.id,
    title: m.title,
    date: m.date,
    startTime: m.startTime,
    endTime: m.endTime,
    locationOrLink: m.locationOrLink,
    organizerName: m.organizerName || m.organizer?.fullName || 'Organizer',
    attendees: Array.isArray(m.attendees) ? m.attendees : [],
    description: m.description,
    category: (m.category || 'Sync') as MeetingItem['category']
  };
}

// ─────────────────────────────────────────────────────────────────
// Main App Component
// ─────────────────────────────────────────────────────────────────
export const App: React.FC = () => {
  const [activeUser, setActiveUser] = useState<UserProfile | null>(getActiveSession());
  const [activeTab, setActiveTab] = useState<'dash' | 'manager' | 'directory' | 'tasks' | 'attendance' | 'documents' | 'okrs' | 'profile'>('dash');

  // Application data - loaded from real API
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [directory, setDirectory] = useState<UserProfile[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveItem[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [okrs, setOkrs] = useState<GoalOKRItem[]>([]);
  const [recognitions, setRecognitions] = useState<RecognitionBadge[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [dataError, setDataError] = useState('');

  // ─────────────────────────────────────────────────────────────
  // Load all data from real backend
  // ─────────────────────────────────────────────────────────────
  const loadAllData = useCallback(async () => {
    if (!activeUser) return;
    setDataError('');
    try {
      const isManager = ['MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'].includes(activeUser.role);

      const [tasksRes, attendanceRes, leavesRes, docsRes, okrsRes, recsRes, annRes, meetingsRes, dirRes] = await Promise.allSettled([
        api.tasks.list(),
        api.attendance.list(),
        api.leaves.list(),
        api.documents.list(),
        api.okrs.list(),
        api.recognitions.list(),
        api.announcements.list(),
        api.meetings.list(),
        isManager ? api.directory.list() : api.directory.list()
      ]);

      if (tasksRes.status === 'fulfilled') setTasks(tasksRes.value.data.map(adaptTask));
      if (attendanceRes.status === 'fulfilled') setAttendance(attendanceRes.value.data.map(adaptAttendance));
      if (leavesRes.status === 'fulfilled') setLeaveRequests(leavesRes.value.data.map(adaptLeave));
      if (docsRes.status === 'fulfilled') setDocuments(docsRes.value.data.map(adaptDocument));
      if (okrsRes.status === 'fulfilled') setOkrs(okrsRes.value.data.map(adaptOKR));
      if (recsRes.status === 'fulfilled') setRecognitions(recsRes.value.data.map(adaptRecognition));
      if (annRes.status === 'fulfilled') setAnnouncements(annRes.value.data.map(adaptAnnouncement));
      if (meetingsRes.status === 'fulfilled') setMeetings(meetingsRes.value.data.map(adaptMeeting));
      if (dirRes.status === 'fulfilled') setDirectory(dirRes.value.data.map(mapApiUserToProfile));

      setDataLoaded(true);
    } catch (err: any) {
      setDataError('Could not connect to Deskly backend. Make sure the server is running on port 5000.');
      console.error('Data load error:', err);
    }
  }, [activeUser]);

  useEffect(() => {
    if (activeUser) {
      loadAllData();
      if (activeUser.role === 'MANAGER' && activeTab === 'dash') {
        setActiveTab('manager');
      }
    }
  }, [activeUser]);

  const handleSignOut = () => {
    logoutSession();
    setActiveUser(null);
    setDataLoaded(false);
  };

  // ─────────────────────────────────────────────────────────────
  // Attendance Clock Handler (real API)
  // ─────────────────────────────────────────────────────────────
  const handleClockAction = async (action: 'IN' | 'OUT'): Promise<boolean> => {
    try {
      const res = action === 'IN' ? await api.attendance.checkIn('Office') : await api.attendance.checkOut();
      if (res.success) {
        await loadAllData();
        return true;
      }
    } catch (err: any) {
      console.error(`Clock ${action} error:`, err.message);
    }
    return false;
  };

  // ─────────────────────────────────────────────────────────────
  // Leave Handlers
  // ─────────────────────────────────────────────────────────────
  const handleApplyLeave = async (newLeave: LeaveItem) => {
    try {
      const res = await api.leaves.apply({
        type: newLeave.type,
        startDate: newLeave.startDate,
        endDate: newLeave.endDate,
        daysCount: newLeave.daysCount,
        reason: newLeave.reason
      });
      const adapted = adaptLeave(res.data);
      setLeaveRequests(prev => [adapted, ...prev]);
      setNotificationsCount(c => c + 1);
    } catch (err: any) {
      console.error('Leave apply error:', err);
      // Optimistically add even if email fails
      setLeaveRequests(prev => [newLeave, ...prev]);
    }
  };

  const handleApproveRequest = async (approvalId: string) => {
    const leave = leaveRequests.find(l => l.id === approvalId);
    if (!leave) return;
    try {
      await api.leaves.decide(approvalId, 'APPROVED');
      setLeaveRequests(prev => prev.map(l => l.id === approvalId ? { ...l, status: 'APPROVED' } : l));
    } catch (err) {
      console.error('Approve error:', err);
      setLeaveRequests(prev => prev.map(l => l.id === approvalId ? { ...l, status: 'APPROVED' } : l));
    }
  };

  const handleRejectRequest = async (approvalId: string) => {
    try {
      await api.leaves.decide(approvalId, 'REJECTED');
      setLeaveRequests(prev => prev.map(l => l.id === approvalId ? { ...l, status: 'REJECTED' } : l));
    } catch (err) {
      console.error('Reject error:', err);
      setLeaveRequests(prev => prev.map(l => l.id === approvalId ? { ...l, status: 'REJECTED' } : l));
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Task Handlers
  // ─────────────────────────────────────────────────────────────
  const handleAddTask = async (newTask: TaskItem) => {
    try {
      const res = await api.tasks.create({
        title: newTask.title,
        description: newTask.description,
        status: newTask.status,
        priority: newTask.priority,
        projectName: newTask.projectName,
        assigneeId: activeUser?.id,
        dueDate: newTask.dueDate,
        progress: newTask.progress,
        tags: newTask.tags
      });
      setTasks(prev => [adaptTask(res.data), ...prev]);
    } catch {
      setTasks(prev => [newTask, ...prev]);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Meeting Handler
  // ─────────────────────────────────────────────────────────────
  const handleScheduleMeeting = async (newMeeting: MeetingItem) => {
    try {
      const allUserIds = directory
        .filter(u => newMeeting.attendees.includes(u.fullName))
        .map(u => u.id);

      const res = await api.meetings.schedule({
        title: newMeeting.title,
        date: newMeeting.date,
        startTime: newMeeting.startTime,
        endTime: newMeeting.endTime,
        locationOrLink: newMeeting.locationOrLink,
        category: newMeeting.category,
        description: newMeeting.description,
        attendeeIds: allUserIds
      });
      setMeetings(prev => [adaptMeeting(res.data), ...prev]);
    } catch {
      setMeetings(prev => [newMeeting, ...prev]);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Recognition Handler
  // ─────────────────────────────────────────────────────────────
  const handleGiveRecognition = async (newBadge: RecognitionBadge) => {
    try {
      const receiver = directory.find(u => u.fullName === newBadge.receiverName);
      if (receiver) {
        const res = await api.recognitions.give(receiver.id, newBadge.badgeType, newBadge.message);
        setRecognitions(prev => [adaptRecognition(res.data), ...prev]);
        return;
      }
    } catch {}
    setRecognitions(prev => [newBadge, ...prev]);
  };

  // Build approvals list from leave requests for manager view
  const approvals: ApprovalRequest[] = leaveRequests
    .filter(l => l.status === 'PENDING')
    .map(l => ({
      id: l.id,
      category: 'Leave' as const,
      title: `${l.daysCount} Day${l.daysCount > 1 ? 's' : ''} ${l.type} Leave`,
      applicantName: l.applicantName,
      applicantId: l.profileId,
      applicantRole: l.applicantRole,
      amountOrDetails: `${l.startDate} to ${l.endDate}`,
      date: l.createdAt,
      status: l.status as 'PENDING',
      leaveRequestId: l.id
    }));

  // Auth check
  if (!activeUser) {
    return <AuthScreen onLoginSuccess={user => setActiveUser(user)} />;
  }

  // Backend error banner
  const BackendErrorBanner = dataError && (
    <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 text-amber-300 text-xs flex items-center justify-between">
      <span>⚠️ {dataError}</span>
      <button onClick={loadAllData} className="flex items-center space-x-1 text-amber-400 hover:underline">
        <RefreshCw className="w-3 h-3" /><span>Retry</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Header Bar */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 sm:px-6 py-3 flex items-center justify-between shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-lg shadow-indigo-500/25 border border-indigo-400/30">
            D
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-lg text-white tracking-tight">Deskly</span>
              <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30 font-semibold">
                v2.0 Enterprise
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">Company Management Platform</p>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-400">Authenticated:</span>
          <span className="font-bold text-white uppercase">{activeUser.role}</span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowScheduleModal(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Schedule Meeting</span>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              {notificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-slate-900">
                  {notificationsCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 z-50 space-y-2 text-xs">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="font-bold text-white">Notifications</span>
                  <button onClick={() => setNotificationsCount(0)} className="text-[10px] text-indigo-400 hover:underline">
                    Clear all
                  </button>
                </div>
                {notificationsCount === 0 ? (
                  <p className="text-slate-500 text-center py-2">No new notifications</p>
                ) : (
                  <div className="p-2 bg-slate-800/60 rounded-lg">
                    <span className="font-semibold text-slate-200 block">New leave request submitted</span>
                    <span className="text-slate-400 text-[10px]">Awaiting manager approval</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Profile & Sign Out */}
          <div className="flex items-center space-x-2 border-l border-slate-800 pl-3">
            <img
              src={activeUser.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(activeUser.fullName)}`}
              alt={activeUser.fullName}
              className="w-8 h-8 rounded-lg object-cover border border-indigo-400/40"
            />
            <div className="hidden lg:block text-left">
              <span className="text-xs font-semibold text-white block leading-tight">{activeUser.fullName}</span>
              <span className="text-[10px] text-indigo-400 block leading-none truncate max-w-[110px]">{activeUser.email}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors ml-1"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {BackendErrorBanner}

      {/* Navigation */}
      <nav className="bg-slate-900 border-b border-slate-800/80 px-4 sm:px-6 py-2 flex items-center space-x-1 overflow-x-auto">
        {['EMPLOYEE', 'MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'].includes(activeUser.role) && (
          <button
            onClick={() => setActiveTab('dash')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 whitespace-nowrap ${activeTab === 'dash' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>🏠 My Dashboard</span>
          </button>
        )}

        {(['MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'] as Role[]).includes(activeUser.role) && (
          <button
            onClick={() => setActiveTab('manager')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 whitespace-nowrap ${activeTab === 'manager' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
          >
            <Users className="w-4 h-4" />
            <span>👨‍💼 Manager View</span>
          </button>
        )}

        <button onClick={() => setActiveTab('directory')} className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 whitespace-nowrap ${activeTab === 'directory' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
          <Users className="w-4 h-4" /><span>🗂️ Directory</span>
        </button>

        <button onClick={() => setActiveTab('tasks')} className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 whitespace-nowrap ${activeTab === 'tasks' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
          <Kanban className="w-4 h-4" /><span>📋 Tasks</span>
        </button>

        <button onClick={() => setActiveTab('attendance')} className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 whitespace-nowrap ${activeTab === 'attendance' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
          <Clock className="w-4 h-4" /><span>🕐 Attendance</span>
        </button>

        <button onClick={() => setActiveTab('documents')} className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 whitespace-nowrap ${activeTab === 'documents' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
          <FileText className="w-4 h-4" /><span>📄 Documents</span>
        </button>

        <button onClick={() => setActiveTab('okrs')} className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 whitespace-nowrap ${activeTab === 'okrs' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
          <Award className="w-4 h-4" /><span>📈 OKRs & Badges</span>
        </button>

        <button onClick={() => setActiveTab('profile')} className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 whitespace-nowrap ${activeTab === 'profile' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
          <UserCheck className="w-4 h-4" /><span>👤 Profile</span>
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
        {activeTab === 'dash' && (
          <EmployeeDashboard
            profile={activeUser}
            tasks={tasks}
            attendance={attendance}
            announcements={announcements}
            meetings={meetings}
            onNavigate={tab => setActiveTab(tab)}
            onOpenScheduleModal={() => setShowScheduleModal(true)}
            onClockAction={handleClockAction}
          />
        )}

        {activeTab === 'manager' && (
          <ManagerDashboard
            profile={activeUser}
            projects={[]}
            approvals={approvals}
            tasks={tasks}
            onNavigate={tab => setActiveTab(tab)}
            onApproveRequest={handleApproveRequest}
            onRejectRequest={handleRejectRequest}
          />
        )}

        {activeTab === 'directory' && (
          <DirectoryView profiles={directory} />
        )}

        {activeTab === 'tasks' && (
          <TaskKanban
            tasks={tasks}
            userRole={activeUser.role}
            onAddTask={handleAddTask}
          />
        )}

        {activeTab === 'attendance' && (
          <AttendanceLeaveView
            attendanceLogs={attendance}
            leaveRequests={leaveRequests}
            userRole={activeUser.role}
            activeUser={activeUser}
            onApplyLeave={handleApplyLeave}
          />
        )}

        {activeTab === 'documents' && (
          <DocumentVault
            documents={documents}
            activeUser={activeUser}
            onUploadDocument={async (newDoc) => {
              if (newDoc.realDataUrl && newDoc.realDataUrl.startsWith('data:')) {
                // Legacy: optimistically add
                setDocuments(prev => [newDoc, ...prev]);
              }
              // Real uploads go through DocumentVault's own upload handler
            }}
          />
        )}

        {activeTab === 'okrs' && (
          <PerformanceRecognitionView
            okrs={okrs}
            recognitions={recognitions}
            onGiveRecognition={handleGiveRecognition}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileCard profile={activeUser} />
        )}
      </main>

      {/* Schedule Meeting Modal */}
      {showScheduleModal && (
        <ScheduleMeetingModal
          onClose={() => setShowScheduleModal(false)}
          onScheduleMeeting={handleScheduleMeeting}
          teamMembers={directory}
        />
      )}

      {/* Deskly AI */}
      <DeskAIWidget
        userRole={activeUser.role}
        tasks={tasks}
        profiles={directory}
      />
    </div>
  );
};

export default App;
