// Deskly Real API Client
// All requests go to the real Express/Prisma backend.
// Default: relative "/api/v1" paths are proxied by Vite (vite.config.ts) to http://localhost:5000.
// Set VITE_API_URL to override (e.g. for a direct backend URL in production).

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

function getToken(): string | null {
  return localStorage.getItem('deskly_jwt_token');
}

function describeFetchError(err: any): string {
  if (err instanceof TypeError && err.message === 'Failed to fetch') {
    return 'Server connection failed. Is the Express backend running on port 5000?';
  }
  return err.message || 'Server connection failed. Is Express running on port 5000?';
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || `Request failed: ${res.status}`);
    }
    return data;
  } catch (err: any) {
    console.error(`API Fetch Error (${API_BASE}${endpoint}):`, err);
    throw new Error(describeFetchError(err));
  }
}

// Multipart form (for file uploads)
async function requestMultipart<T>(endpoint: string, formData: FormData): Promise<T> {
  const token = getToken();
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Upload failed');
    return data;
  } catch (err: any) {
    console.error(`API Upload Error (${API_BASE}${endpoint}):`, err);
    throw new Error(describeFetchError(err));
  }
}

// ─────────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────────
export const api = {
  auth: {
    register: (data: {
      email: string; password: string; fullName: string; role?: string;
      employeeId?: string; department?: string; jobTitle?: string; team?: string; phone?: string; location?: string;
    }) => request<{ success: boolean; token: string; user: any }>('/auth/register', {
      method: 'POST', body: JSON.stringify(data)
    }),

    login: (email: string, password: string) =>
      request<{ success: boolean; token: string; user: any }>('/auth/login', {
        method: 'POST', body: JSON.stringify({ email, password })
      }),

    me: () => request<{ success: boolean; user: any }>('/auth/me'),

    updateProfile: (data: Partial<any>) =>
      request<{ success: boolean; user: any }>('/auth/profile', {
        method: 'PATCH', body: JSON.stringify(data)
      })
  },

  // ─────────────────────────────────────────────────────────────
  // DIRECTORY
  // ─────────────────────────────────────────────────────────────
  directory: {
    list: () => request<{ success: boolean; data: any[] }>('/directory'),
    search: (q: string) => request<{ success: boolean; data: any[] }>(`/directory/search?q=${encodeURIComponent(q)}`)
  },

  // ─────────────────────────────────────────────────────────────
  // MANAGER OVERSEER
  // ─────────────────────────────────────────────────────────────
  manager: {
    teamStatus: () => request<{ success: boolean; data: any }>('/manager/team-status'),
    projects: () => request<{ success: boolean; data: any[] }>('/projects'),
    createProject: (data: any) => request<{ success: boolean; data: any }>('/projects', { method: 'POST', body: JSON.stringify(data) })
  },

  // ─────────────────────────────────────────────────────────────
  // TASKS
  // ─────────────────────────────────────────────────────────────
  tasks: {
    list: () => request<{ success: boolean; data: any[] }>('/tasks'),
    create: (data: any) => request<{ success: boolean; data: any }>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<{ success: boolean; data: any }>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
  },

  // ─────────────────────────────────────────────────────────────
  // ATTENDANCE
  // ─────────────────────────────────────────────────────────────
  attendance: {
    list: () => request<{ success: boolean; data: any[] }>('/attendance'),
    checkIn: (location?: string) => request<{ success: boolean; data: any }>('/attendance/checkin', { method: 'POST', body: JSON.stringify({ location }) }),
    checkOut: () => request<{ success: boolean; data: any }>('/attendance/checkout', { method: 'POST', body: JSON.stringify({}) })
  },

  // ─────────────────────────────────────────────────────────────
  // LEAVES
  // ─────────────────────────────────────────────────────────────
  leaves: {
    list: () => request<{ success: boolean; data: any[] }>('/leaves'),
    apply: (data: { type: string; startDate: string; endDate: string; daysCount: number; reason: string }) =>
      request<{ success: boolean; data: any }>('/leaves', { method: 'POST', body: JSON.stringify(data) }),
    decide: (id: string, decision: 'APPROVED' | 'REJECTED') =>
      request<{ success: boolean; data: any }>(`/leaves/${id}/decision`, { method: 'PATCH', body: JSON.stringify({ decision }) })
  },

  // ─────────────────────────────────────────────────────────────
  // DOCUMENTS
  // ─────────────────────────────────────────────────────────────
  documents: {
    list: () => request<{ success: boolean; data: any[] }>('/documents'),
    upload: (file: File, title: string, category: string, isConfidential: boolean) => {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('title', title);
      fd.append('category', category);
      fd.append('isConfidential', String(isConfidential));
      return requestMultipart<{ success: boolean; data: any }>('/documents/upload', fd);
    }
  },

  // ─────────────────────────────────────────────────────────────
  // OKRs
  // ─────────────────────────────────────────────────────────────
  okrs: {
    list: () => request<{ success: boolean; data: any[] }>('/okrs'),
    create: (data: any) => request<{ success: boolean; data: any }>('/okrs', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, current: number) => request<{ success: boolean; data: any }>(`/okrs/${id}`, { method: 'PATCH', body: JSON.stringify({ current }) })
  },

  // ─────────────────────────────────────────────────────────────
  // RECOGNITIONS
  // ─────────────────────────────────────────────────────────────
  recognitions: {
    list: () => request<{ success: boolean; data: any[] }>('/recognitions'),
    give: (receiverId: string, badgeType: string, message: string) =>
      request<{ success: boolean; data: any }>('/recognitions', { method: 'POST', body: JSON.stringify({ receiverId, badgeType, message }) })
  },

  // ─────────────────────────────────────────────────────────────
  // MEETINGS
  // ─────────────────────────────────────────────────────────────
  meetings: {
    list: () => request<{ success: boolean; data: any[] }>('/meetings'),
    schedule: (data: any) => request<{ success: boolean; data: any }>('/meetings', { method: 'POST', body: JSON.stringify(data) })
  },

  // ─────────────────────────────────────────────────────────────
  // ANNOUNCEMENTS
  // ─────────────────────────────────────────────────────────────
  announcements: {
    list: () => request<{ success: boolean; data: any[] }>('/announcements'),
    post: (title: string, content: string, target?: string, tag?: string) =>
      request<{ success: boolean; data: any }>('/announcements', { method: 'POST', body: JSON.stringify({ title, content, target, tag }) })
  }
};

// Token management
export const tokenStore = {
  save: (token: string) => localStorage.setItem('deskly_jwt_token', token),
  clear: () => localStorage.removeItem('deskly_jwt_token'),
  get: getToken
};
