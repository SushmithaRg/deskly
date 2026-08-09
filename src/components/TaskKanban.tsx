import React, { useState } from 'react';
import { TaskItem, TaskStatus, Priority } from '../types';
import {
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  Paperclip,
  ChevronRight,
  Filter,
  User,
  X
} from 'lucide-react';

interface Props {
  tasks: TaskItem[];
  userRole: 'EMPLOYEE' | 'MANAGER' | 'HR_ADMIN' | 'SUPER_ADMIN';
  onAddTask?: (task: TaskItem) => void;
  onUpdateTaskStatus?: (id: string, newStatus: TaskStatus) => void;
}

export const TaskKanban: React.FC<Props> = ({
  tasks: initialTasks,
  userRole,
  onAddTask,
  onUpdateTaskStatus
}) => {
  const [taskList, setTaskList] = useState<TaskItem[]>(initialTasks);
  const [showModal, setShowModal] = useState(false);
  const [filterPriority, setFilterPriority] = useState<string>('ALL');

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('MEDIUM');
  const [newAssignee, setNewAssignee] = useState('Sushmitha R G');
  const [newDueDate, setNewDueDate] = useState('2026-08-25');

  const columns: { id: TaskStatus; label: string; color: string }[] = [
    { id: 'TODO', label: 'To Do', color: 'border-l-slate-500' },
    { id: 'IN_PROGRESS', label: 'In Progress', color: 'border-l-indigo-500' },
    { id: 'REVIEW', label: 'Review', color: 'border-l-amber-500' },
    { id: 'COMPLETED', label: 'Completed', color: 'border-l-emerald-500' }
  ];

  const handleMoveStatus = (id: string, currentStatus: TaskStatus) => {
    const order: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'];
    const nextIndex = (order.indexOf(currentStatus) + 1) % order.length;
    const newStatus = order[nextIndex];

    setTaskList(prev =>
      prev.map(t => (t.id === id ? { ...t, status: newStatus, progress: newStatus === 'COMPLETED' ? 100 : t.progress } : t))
    );

    if (onUpdateTaskStatus) onUpdateTaskStatus(id, newStatus);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: TaskItem = {
      id: `tsk-${Date.now()}`,
      title: newTitle,
      description: newDesc || 'Sprint task deliverable.',
      status: 'TODO',
      priority: newPriority,
      projectName: 'Deskly Operating System',
      assigneeId: 'prof-emp-1024',
      assigneeName: newAssignee,
      creatorName: 'Priya Sharma (Manager)',
      dueDate: newDueDate,
      progress: 0,
      commentsCount: 0,
      tags: ['Deliverable']
    };

    setTaskList(prev => [newTask, ...prev]);
    if (onAddTask) onAddTask(newTask);

    setNewTitle('');
    setNewDesc('');
    setShowModal(false);
  };

  const filteredTasks = taskList.filter(t => {
    if (filterPriority !== 'ALL' && t.priority !== filterPriority) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Kanban Header Bar */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📋 Task Pipeline & Sprint Board</span>
            <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2.5 py-0.5 rounded-full font-mono">
              {filteredTasks.length} Deliverables
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {userRole === 'MANAGER'
              ? 'Manager View: Delegate sprint tasks, review progress & reassign team workload'
              : 'Employee View: Click task status badges to shift stage (To Do → In Progress → Review → Completed)'}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Grid (4 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map(col => {
          const colTasks = filteredTasks.filter(t => t.status === col.id);
          return (
            <div key={col.id} className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3 min-h-[500px] flex flex-col">
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-2.5">
                <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.id === 'COMPLETED' ? 'bg-emerald-400' : 'bg-indigo-400'}`} />
                  <span>{col.label}</span>
                </h3>
                <span className="bg-slate-800 text-slate-400 text-[11px] font-mono px-2 py-0.5 rounded-full">
                  {colTasks.length}
                </span>
              </div>

              <div className="space-y-3 flex-1">
                {colTasks.map(task => (
                  <div
                    key={task.id}
                    className={`bg-slate-900/80 p-4 rounded-xl border border-slate-800 border-l-4 ${col.color} hover:border-indigo-500/50 transition-all space-y-2.5 shadow-lg group`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">
                        {task.projectName}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border ${
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

                    <h4 className="font-semibold text-xs text-slate-100 group-hover:text-indigo-300 transition-colors">
                      {task.title}
                    </h4>

                    <p className="text-[11px] text-slate-400 line-clamp-2">{task.description}</p>

                    {/* Progress Bar */}
                    <div className="space-y-1 pt-1">
                      <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                        <div
                          className="bg-indigo-500 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-800/40">
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3 text-slate-500" />
                        <span>{task.assigneeName.split(' ')[0]}</span>
                      </div>

                      {/* Advance Stage Shift Button */}
                      <button
                        onClick={() => handleMoveStatus(task.id, task.status)}
                        className="text-[10px] bg-slate-800 hover:bg-indigo-600 hover:text-white px-2 py-0.5 rounded border border-slate-700 transition-colors"
                        title="Click to shift to next stage"
                      >
                        Shift Stage ➔
                      </button>
                    </div>
                  </div>
                ))}

                {colTasks.length === 0 && (
                  <div className="h-32 border border-dashed border-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-600">
                    No tasks in {col.label}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Task Creator Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">Create New Sprint Task</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement OAuth2 refresh token rotation"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Provide task scope and technical acceptance criteria..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Priority Level</label>
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value as Priority)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Assignee</label>
                  <select
                    value={newAssignee}
                    onChange={e => setNewAssignee(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none"
                  >
                    <option value="Sushmitha R G">Sushmitha R G</option>
                    <option value="Rohan Verma">Rohan Verma</option>
                    <option value="Ananya Deshmukh">Ananya Deshmukh</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Due Date</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={e => setNewDueDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none"
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
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
