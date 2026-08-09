import React, { useState } from 'react';
import { GoalOKRItem, RecognitionBadge } from '../types';
import {
  Award,
  Target,
  Plus,
  Heart,
  Star,
  Trophy,
  Sparkles,
  ChevronRight,
  Send,
  X
} from 'lucide-react';

interface Props {
  okrs: GoalOKRItem[];
  recognitions: RecognitionBadge[];
  onGiveRecognition?: (badge: RecognitionBadge) => void;
}

export const PerformanceRecognitionView: React.FC<Props> = ({
  okrs,
  recognitions: initialRecognitions,
  onGiveRecognition
}) => {
  const [badgeList, setBadgeList] = useState<RecognitionBadge[]>(initialRecognitions);
  const [showModal, setShowModal] = useState(false);

  // Shoutout Form
  const [receiverName, setReceiverName] = useState('Ananya Deshmukh');
  const [badgeType, setBadgeType] = useState<any>('Appreciation');
  const [message, setMessage] = useState('');

  const handleSendShoutout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newBadge: RecognitionBadge = {
      id: `rec-${Date.now()}`,
      giverName: 'Sushmitha R G',
      giverPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      receiverName,
      badgeType,
      message,
      createdAt: 'Just Now'
    };

    setBadgeList(prev => [newBadge, ...prev]);
    if (onGiveRecognition) onGiveRecognition(newBadge);

    setMessage('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>Performance OKRs & Peer Recognition</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Goal tracking hierarchy (Company → Team → Personal) & peer-to-peer appreciation wall
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg transition-all flex items-center space-x-1.5"
        >
          <Sparkles className="w-4 h-4" />
          <span>Send Peer Shoutout</span>
        </button>
      </div>

      {/* OKRs Section */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Target className="w-5 h-5 text-indigo-400" />
          <span>Goal Tracking & OKRs (Q3 2026)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {okrs.map(okr => (
            <div key={okr.id} className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {okr.category} Goal
                </span>
                <span className="font-mono text-xs text-indigo-400 font-bold">
                  {okr.current} / {okr.target} {okr.unit}
                </span>
              </div>

              <h4 className="font-semibold text-xs text-white">{okr.title}</h4>

              {/* Progress Bar */}
              <div className="space-y-1 pt-1">
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (okr.current / okr.target) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recognition Wall */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Star className="w-5 h-5 text-amber-400" />
          <span>Wall of Recognition & Badges</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {badgeList.map(b => (
            <div
              key={b.id}
              className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3 relative overflow-hidden group hover:border-amber-500/40 transition-all"
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">
                  {b.badgeType === 'Employee of the Month' ? '⭐' : b.badgeType === 'Achievement' ? '🏆' : '👏'}
                </span>
                <div>
                  <span className="text-xs font-bold text-amber-300 block">{b.badgeType}</span>
                  <span className="text-[10px] text-slate-400">Awarded {b.createdAt}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 italic">"{b.message}"</p>

              <div className="flex justify-between items-center text-[11px] pt-2 border-t border-slate-800/80">
                <span className="text-indigo-300 font-semibold">{b.giverName}</span>
                <span className="text-slate-500">➔</span>
                <span className="text-emerald-300 font-semibold">{b.receiverName}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shoutout Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">Send Peer Recognition</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendShoutout} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Teammate</label>
                <select
                  value={receiverName}
                  onChange={e => setReceiverName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none"
                >
                  <option value="Ananya Deshmukh">Ananya Deshmukh (DevOps)</option>
                  <option value="Rohan Verma">Rohan Verma (Frontend)</option>
                  <option value="Priya Sharma">Priya Sharma (Manager)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Badge Type</label>
                <select
                  value={badgeType}
                  onChange={e => setBadgeType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none"
                >
                  <option value="Appreciation">👏 Appreciation</option>
                  <option value="Achievement">🏆 Achievement</option>
                  <option value="Employee of the Month">⭐ Employee of the Month</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Recognition Message</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Express your gratitude or celebrate team milestone..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
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
                  className="px-4 py-2 rounded-lg bg-amber-600 text-white font-semibold hover:bg-amber-500 shadow"
                >
                  Send Shoutout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
