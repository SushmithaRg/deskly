import React, { useState } from 'react';
import { UserProfile } from '../types';
import {
  Search,
  Users,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  ChevronRight,
  Sparkles,
  Filter,
  X,
  UserCheck
} from 'lucide-react';

interface Props {
  profiles: UserProfile[];
  onSelectProfile?: (profile: UserProfile) => void;
}

export const DirectoryView: React.FC<Props> = ({ profiles, onSelectProfile }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [activeModalProfile, setActiveModalProfile] = useState<UserProfile | null>(null);

  // Extract unique skills and departments
  const allSkills = Array.from(new Set(profiles.flatMap(p => p.skills)));
  const allDepartments = Array.from(new Set(profiles.map(p => p.department)));

  // Filter profiles
  const filteredProfiles = profiles.filter(p => {
    const matchesSearch =
      p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSkill = selectedSkill ? p.skills.includes(selectedSkill) : true;
    const matchesDept = selectedDepartment ? p.department === selectedDepartment : true;

    return matchesSearch && matchesSkill && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              <span>Searchable Knowledge Directory</span>
              <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2.5 py-0.5 rounded-full font-mono">
                {filteredProfiles.length} Team Members
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Multi-field natural language directory search across Name, EMP ID, Department, Job Title & Skills tags
            </p>
          </div>

          {(selectedSkill || selectedDepartment || searchTerm) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedSkill(null);
                setSelectedDepartment(null);
              }}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center space-x-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, role, skill ('Python', 'React'), department, or employee ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Popular Skill Tags Filter Bar */}
        <div className="space-y-2 pt-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Filter by Skill Keywords:
          </span>
          <div className="flex flex-wrap gap-2">
            {allSkills.map(skill => {
              const isSelected = selectedSkill === skill;
              return (
                <button
                  key={skill}
                  onClick={() => setSelectedSkill(isSelected ? null : skill)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow border border-indigo-400'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  #{skill}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Profile Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProfiles.map(profile => (
          <div
            key={profile.id}
            onClick={() => setActiveModalProfile(profile)}
            className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-indigo-500/40 transition-all cursor-pointer group space-y-4 relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3.5">
                <img
                  src={profile.photoUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
                  alt={profile.fullName}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-700 group-hover:border-indigo-400 transition-colors"
                />
                <div>
                  <h3 className="font-bold text-slate-100 text-base group-hover:text-indigo-300 transition-colors">
                    {profile.fullName}
                  </h3>
                  <p className="text-xs text-indigo-400 font-medium">{profile.jobTitle}</p>
                  <p className="text-[11px] text-slate-400">{profile.department} Team</p>
                </div>
              </div>

              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  profile.status === 'ACTIVE'
                    ? 'bg-emerald-500'
                    : profile.status === 'ON_LEAVE'
                    ? 'bg-amber-500'
                    : 'bg-slate-500'
                }`}
                title={`Status: ${profile.status}`}
              />
            </div>

            {/* Quick Metadata Pill Grid */}
            <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <div>
                <span className="text-slate-500 block">EMP ID</span>
                <span className="font-mono font-semibold text-slate-300">{profile.employeeId}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Location</span>
                <span className="font-semibold text-slate-300 line-clamp-1">{profile.location}</span>
              </div>
            </div>

            {/* Skills Pills */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Core Skills:</span>
              <div className="flex flex-wrap gap-1">
                {profile.skills.slice(0, 4).map((s, i) => (
                  <span
                    key={i}
                    className="bg-indigo-950/60 text-indigo-300 border border-indigo-800/60 px-2 py-0.5 rounded text-[10px]"
                  >
                    {s}
                  </span>
                ))}
                {profile.skills.length > 4 && (
                  <span className="text-[10px] text-slate-500 font-mono">+{profile.skills.length - 4} more</span>
                )}
              </div>
            </div>

            {/* Footer View Card Link */}
            <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center text-xs text-slate-400 group-hover:text-indigo-400">
              <span>View Corporate Identity Card</span>
              <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {/* Modal Profile Viewer */}
      {activeModalProfile && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveModalProfile(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-4 border-b border-slate-800 pb-4">
              <img
                src={activeModalProfile.photoUrl}
                alt={activeModalProfile.fullName}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500/40"
              />
              <div>
                <h2 className="text-xl font-bold text-white">{activeModalProfile.fullName}</h2>
                <p className="text-indigo-400 text-sm font-medium">{activeModalProfile.jobTitle}</p>
                <p className="text-slate-400 text-xs">{activeModalProfile.department} • {activeModalProfile.team}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div><span className="text-slate-500 block">Employee ID</span><span className="font-mono font-bold text-white">{activeModalProfile.employeeId}</span></div>
              <div><span className="text-slate-500 block">Manager</span><span className="font-semibold text-indigo-300">{activeModalProfile.managerName || 'N/A'}</span></div>
              <div><span className="text-slate-500 block">Email</span><span className="text-slate-300 font-mono">{activeModalProfile.email}</span></div>
              <div><span className="text-slate-500 block">Phone</span><span className="text-slate-300">{activeModalProfile.phone}</span></div>
              <div><span className="text-slate-500 block">Location</span><span className="text-slate-300">{activeModalProfile.location}</span></div>
              <div><span className="text-slate-500 block">Joined</span><span className="text-slate-300">{activeModalProfile.joiningDate}</span></div>
            </div>

            <div className="space-y-1 text-xs">
              <span className="text-slate-400 font-semibold uppercase">About</span>
              <p className="text-slate-300 bg-slate-950/50 p-3 rounded-lg border border-slate-800">{activeModalProfile.aboutMe}</p>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-400 uppercase">Skills & Proficiencies</span>
              <div className="flex flex-wrap gap-1.5">
                {activeModalProfile.skills.map((s, i) => (
                  <span key={i} className="bg-indigo-950 text-indigo-300 border border-indigo-800 px-2.5 py-1 rounded-md text-xs">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
