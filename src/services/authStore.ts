// Real auth session management using JWT token + localStorage
import { api, tokenStore } from '../api/client';
import { UserProfile } from '../types';

const ACTIVE_SESSION_KEY = 'deskly_active_session_v3';

export function mapApiUserToProfile(apiUser: any): UserProfile {
  return {
    id: apiUser.id,
    userId: apiUser.id,
    employeeId: apiUser.employeeId,
    fullName: apiUser.fullName,
    photoUrl: apiUser.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(apiUser.fullName)}`,
    jobTitle: apiUser.jobTitle,
    department: apiUser.department,
    departmentCode: apiUser.department?.substring(0, 3)?.toUpperCase() || 'GEN',
    team: apiUser.team || `${apiUser.department} Team`,
    managerName: apiUser.managerName || undefined,
    joiningDate: apiUser.joiningDate || new Date().toISOString().split('T')[0],
    location: apiUser.location || 'HQ',
    phone: apiUser.phone || '',
    email: apiUser.email,
    role: apiUser.role as UserProfile['role'],
    skills: Array.isArray(apiUser.skills) ? apiUser.skills : [],
    aboutMe: apiUser.aboutMe || '',
    education: Array.isArray(apiUser.education) ? apiUser.education : [],
    certifications: Array.isArray(apiUser.certifications) ? apiUser.certifications : [],
    experience: Array.isArray(apiUser.experience) ? apiUser.experience : [],
    emergencyContact: apiUser.emergencyContact || '',
    status: (apiUser.status as UserProfile['status']) || 'ACTIVE'
  };
}

export async function loginUser(email: string, password: string): Promise<UserProfile> {
  const res = await api.auth.login(email, password);
  tokenStore.save(res.token);
  const profile = mapApiUserToProfile(res.user);
  localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify({ profile, token: res.token }));
  return profile;
}

export async function registerUser(data: {
  fullName: string;
  email: string;
  password: string;
  role?: string;
  employeeId?: string;
  department?: string;
  jobTitle?: string;
  team?: string;
  phone?: string;
  location?: string;
}): Promise<UserProfile> {
  const res = await api.auth.register(data);
  tokenStore.save(res.token);
  const profile = mapApiUserToProfile(res.user);
  localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify({ profile, token: res.token }));
  return profile;
}

export function getActiveSession(): UserProfile | null {
  const data = localStorage.getItem(ACTIVE_SESSION_KEY);
  if (!data) return null;
  try {
    const { profile, token } = JSON.parse(data);
    if (token) tokenStore.save(token);
    return profile;
  } catch {
    return null;
  }
}

export function logoutSession(): void {
  tokenStore.clear();
  localStorage.removeItem(ACTIVE_SESSION_KEY);
}

export async function refreshSession(): Promise<UserProfile | null> {
  if (!tokenStore.get()) return null;
  try {
    const res = await api.auth.me();
    const profile = mapApiUserToProfile(res.user);
    const existingData = localStorage.getItem(ACTIVE_SESSION_KEY);
    const token = existingData ? JSON.parse(existingData).token : tokenStore.get();
    localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify({ profile, token }));
    return profile;
  } catch {
    logoutSession();
    return null;
  }
}
