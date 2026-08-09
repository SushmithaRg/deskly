import React, { useState } from 'react';
import { UserProfile, Status } from '../types';
import {
  ShieldCheck,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  GraduationCap,
  Award,
  User,
  Heart,
  CheckCircle2,
  Building
} from 'lucide-react';

interface Props {
  profile: UserProfile;
}

export const ProfileCard: React.FC<Props> = ({ profile: initialProfile }) => {
  const [currentStatus, setCurrentStatus] = useState<Status>(initialProfile.status);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner & Status Controls */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <span>Digital Corporate Identity & Resume Card</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise Digital ID Badge blended with interactive technical credentials & reporting structure
          </p>
        </div>

        {/* Live Status Badge Switcher */}
        <div className="flex items-center space-x-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 pl-2">Live Status:</span>
          {(['ACTIVE', 'ON_LEAVE', 'AWAY'] as Status[]).map(s => (
            <button
              key={s}
              onClick={() => setCurrentStatus(s)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                currentStatus === s
                  ? s === 'ACTIVE'
                    ? 'bg-emerald-600 text-white shadow'
                    : s === 'ON_LEAVE'
                    ? 'bg-amber-600 text-white shadow'
                    : 'bg-slate-700 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s === 'ACTIVE' ? '🟢 Active' : s === 'ON_LEAVE' ? '🟡 On Leave' : '⚪ Away'}
            </button>
          ))}
        </div>
      </div>

      {/* Dual Card Interface */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CARD 1: Corporate ID Badge (1 Column) */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-6 flex flex-col items-center text-center relative overflow-hidden bg-slate-900/90 shadow-2xl">
          {/* Top Badge Accent */}
          <div className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 h-2 rounded-full" />

          <div className="relative">
            <img
              src={initialProfile.photoUrl}
              alt={initialProfile.fullName}
              className="w-28 h-28 rounded-2xl object-cover border-4 border-indigo-500/40 shadow-2xl"
            />
            <span
              className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-slate-900 ${
                currentStatus === 'ACTIVE'
                  ? 'bg-emerald-500'
                  : currentStatus === 'ON_LEAVE'
                  ? 'bg-amber-500'
                  : 'bg-slate-500'
              }`}
            />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">{initialProfile.fullName}</h2>
            <p className="text-indigo-400 text-sm font-semibold mt-0.5">{initialProfile.jobTitle}</p>
            <p className="text-slate-400 text-xs mt-0.5">{initialProfile.department} • {initialProfile.team}</p>
          </div>

          <div className="w-full bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2 text-xs text-left">
            <div className="flex justify-between border-b border-slate-800 pb-1.5">
              <span className="text-slate-500">Employee ID</span>
              <span className="font-mono font-bold text-indigo-300">{initialProfile.employeeId}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1.5">
              <span className="text-slate-500">Manager</span>
              <span className="font-semibold text-slate-200">{initialProfile.managerName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1.5">
              <span className="text-slate-500">Joined</span>
              <span className="text-slate-300">{initialProfile.joiningDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Work Location</span>
              <span className="text-slate-300">{initialProfile.location}</span>
            </div>
          </div>

          <div className="w-full text-xs text-left space-y-1 text-slate-400 pt-2 border-t border-slate-800/80">
            <div className="flex items-center space-x-2">
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              <span className="truncate">{initialProfile.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-3.5 h-3.5 text-indigo-400" />
              <span>{initialProfile.phone}</span>
            </div>
          </div>
        </div>

        {/* CARD 2: Interactive Resume & Technical Credentials (2 Columns) */}
        <div className="md:col-span-2 glass-card rounded-2xl p-6 border border-slate-800 space-y-6">
          {/* About Section */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-indigo-400" />
              <span>About & Professional Bio</span>
            </h3>
            <p className="text-xs text-slate-300 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 leading-relaxed">
              {initialProfile.aboutMe}
            </p>
          </div>

          {/* Technical Skills Tags */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Skills & Tech Stack</h3>
            <div className="flex flex-wrap gap-2">
              {initialProfile.skills.map((skill, i) => (
                <span
                  key={i}
                  className="bg-indigo-950 text-indigo-300 border border-indigo-800 px-3 py-1 rounded-lg text-xs font-medium"
                >
                  #{skill}
                </span>
              ))}
            </div>
          </div>

          {/* Certifications & Education */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Certifications</span>
              </h3>
              <div className="space-y-1.5 text-xs">
                {initialProfile.certifications.map((c, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-200">
                    🏆 {c}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                <span>Education</span>
              </h3>
              <div className="space-y-1.5 text-xs">
                {initialProfile.education.map((e, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-200">
                    🎓 {e}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 text-rose-400" />
              <span>Emergency Contact: <strong className="text-slate-200">{initialProfile.emergencyContact}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
