import React, { useState } from 'react';
import { MeetingItem, UserProfile } from '../types';
import { Calendar, Clock, Video, Users, X, Plus } from 'lucide-react';

interface Props {
  onClose: () => void;
  onScheduleMeeting: (meeting: MeetingItem) => void;
  teamMembers: UserProfile[];
}

export const ScheduleMeetingModal: React.FC<Props> = ({ onClose, onScheduleMeeting, teamMembers }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2026-08-14');
  const [startTime, setStartTime] = useState('03:00 PM');
  const [endTime, setEndTime] = useState('04:00 PM');
  const [locationOrLink, setLocationOrLink] = useState('Google Meet • meet.google.com/dsk-sync');
  const [category, setCategory] = useState<'Sync' | 'Town Hall' | '1-on-1' | 'Client'>('Sync');
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>(['Priya Sharma', 'Rohan Verma']);
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newMeeting: MeetingItem = {
      id: `mtg-${Date.now()}`,
      title,
      date,
      startTime,
      endTime,
      locationOrLink,
      organizerName: 'Current User',
      attendees: selectedAttendees,
      description: description || 'Sprint sync meeting.',
      category
    };

    onScheduleMeeting(newMeeting);
    onClose();
  };

  const toggleAttendee = (name: string) => {
    setSelectedAttendees(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <span>Schedule Real Meeting</span>
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Meeting Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Q3 Sprint Architecture & Security Review"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Start Time</label>
              <input
                type="text"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                placeholder="02:00 PM"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">End Time</label>
              <input
                type="text"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                placeholder="03:00 PM"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Meeting Link or Location</label>
            <input
              type="text"
              value={locationOrLink}
              onChange={e => setLocationOrLink(e.target.value)}
              placeholder="Meet URL or Conference Room 4B"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Invite Team Attendees</label>
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto bg-slate-950 p-2 rounded-xl border border-slate-800">
              {teamMembers.map(m => {
                const isSelected = selectedAttendees.includes(m.fullName);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleAttendee(m.fullName)}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}{m.fullName}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 shadow"
            >
              Schedule Meeting
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
