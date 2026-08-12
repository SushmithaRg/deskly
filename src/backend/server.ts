import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import {
  sendLoginAlert,
  sendLeaveSubmittedAlert,
  sendLeaveDecisionAlert
} from './emailService.js';

const app = express();
// Create or reuse Prisma client to avoid exhausting connections in serverless environments
const globalAny: any = globalThis as any;
const prisma: PrismaClient = globalAny.__deskly_prisma || new PrismaClient();
if (!globalAny.__deskly_prisma) globalAny.__deskly_prisma = prisma;
const JWT_SECRET = process.env.JWT_SECRET || 'deskly-super-secret-key-2026';
const PORT = Number(process.env.PORT) || 5000;

// Vercel functions can write only to /tmp.
// Local development continues to use ./uploads.
const UPLOAD_DIR =
  process.env.UPLOAD_DIR ||
  (process.env.VERCEL ? '/tmp/uploads' : './uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer config for real file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 25 * 1024 * 1024 } }); // 25MB limit

// Middleware
// Enable CORS for localhost Vite/React frontends (5173 & 3001) and preflight
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.FRONTEND_URL
    ].filter(Boolean) as string[];
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/uploads', express.static(UPLOAD_DIR)); // Serve uploaded files

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────
export interface AuthRequest extends Request {
  user?: { userId: string; role: string; email: string };
}

// ─────────────────────────────────────────────────────────────────
// JWT Auth Middleware
// ─────────────────────────────────────────────────────────────────
export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  try {
    const token = authHeader.split(' ')[1];
    req.user = jwt.verify(token, JWT_SECRET) as AuthRequest['user'];
    next();
  } catch {
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};

// ─────────────────────────────────────────────────────────────────
// Helper: Parse JSON fields stored as strings in the database (PostgreSQL)
// Fields like `skills`, `education`, `certifications`, and `experience`
// are stored as JSON-serialized strings in Prisma models and must be
// parsed back into arrays when returning to the client.
// ─────────────────────────────────────────────────────────────────
function parseUserProfile(user: any) {
  return {
    ...user,
    skills: tryParse(user.skills, []),
    education: tryParse(user.education, []),
    certifications: tryParse(user.certifications, []),
    experience: tryParse(user.experience, [])
  };
}

function tryParse(val: string, fallback: any) {
  try { return JSON.parse(val); } catch { return fallback; }
}

// ─────────────────────────────────────────────────────────────────
// Health Check
// ─────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

app.get('/api/v1/health', (_req, res) => {
  res.json({ success: true, message: '⚡ Deskly Enterprise Backend Running', version: '2.0.0' });
});

// ─────────────────────────────────────────────────────────────────
// AUTH ROUTES
// ─────────────────────────────────────────────────────────────────

// POST /api/v1/auth/register — Create new account
app.post('/api/v1/auth/register', async (req, res) => {
  const { email, password, fullName, role, employeeId, department, jobTitle, team, phone, location } = req.body;

  if (!email || !password || !fullName) {
    return res.status(400).json({ success: false, message: 'Email, password, and full name are required.' });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const empId = employeeId || `EMP${Math.floor(1000 + Math.random() * 9000)}`;
    const photoUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`;
    const userRole = ['MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'].includes(role) ? role : 'EMPLOYEE';

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        role: userRole,
        fullName,
        employeeId: empId,
        photoUrl,
        jobTitle: jobTitle || (userRole === 'MANAGER' ? 'Team Manager' : 'Employee'),
        department: department || 'General',
        team: team || `${department || 'General'} Team`,
        phone: phone || '',
        location: location || 'HQ',
        joiningDate: new Date().toISOString().split('T')[0],
        skills: JSON.stringify(['Communication', 'Teamwork']),
        education: JSON.stringify(['Bachelor\'s Degree']),
        certifications: JSON.stringify([]),
        experience: JSON.stringify([`${jobTitle || 'Employee'} at Company`]),
        emergencyContact: '',
        aboutMe: `${fullName} - ${jobTitle || 'Team Member'} at the company.`
      }
    });

    const token = jwt.sign({ userId: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '12h' });
    return res.status(201).json({ success: true, token, user: parseUserProfile(user) });
  } catch (err: any) {
    console.error('Register error:', err);
    // Prisma unique constraint violation (email or employeeId already taken)
    if (err && err.code === 'P2002') {
      const target = err.meta?.target;
      const field = Array.isArray(target) && target.includes('employeeId')
        ? 'An account with that Employee ID already exists.'
        : 'An account with this email already exists.';
      return res.status(409).json({ success: false, message: field });
    }
    return res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
});

// POST /api/v1/auth/login — Sign in
app.post('/api/v1/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const ipAddress = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'Unknown';

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'No account found with this email address.' });
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      return res.status(401).json({ success: false, message: 'Invalid password. Please check your credentials.' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '12h' });

    // Send login alert email asynchronously (non-blocking)
    const loginTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'short' });
    sendLoginAlert(user.email, user.fullName, ipAddress, loginTime).catch(console.error);

    return res.json({ success: true, token, user: parseUserProfile(user) });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
});

// GET /api/v1/auth/me — Get current user profile
app.get('/api/v1/auth/me', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({ success: true, user: parseUserProfile(user) });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
});

// PATCH /api/v1/auth/profile — Update user profile
app.patch('/api/v1/auth/profile', authenticateJWT, async (req: AuthRequest, res) => {
  const { fullName, jobTitle, phone, location, aboutMe, skills, education, certifications, experience, emergencyContact } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: {
        ...(fullName && { fullName }),
        ...(jobTitle && { jobTitle }),
        ...(phone && { phone }),
        ...(location && { location }),
        ...(aboutMe !== undefined && { aboutMe }),
        ...(skills && { skills: JSON.stringify(skills) }),
        ...(education && { education: JSON.stringify(education) }),
        ...(certifications && { certifications: JSON.stringify(certifications) }),
        ...(experience && { experience: JSON.stringify(experience) }),
        ...(emergencyContact !== undefined && { emergencyContact })
      }
    });
    return res.json({ success: true, user: parseUserProfile(user) });
  } catch (err) {
    console.error('Profile update error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

// ─────────────────────────────────────────────────────────────────
// DIRECTORY ROUTES
// ─────────────────────────────────────────────────────────────────

// GET /api/v1/directory — List all users
app.get('/api/v1/directory', authenticateJWT, async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { fullName: 'asc' }
    });
    return res.json({ success: true, data: users.map(parseUserProfile) });
  } catch {
    return res.status(500).json({ success: false, message: 'Failed to fetch directory' });
  }
});

// GET /api/v1/directory/search?q=query
app.get('/api/v1/directory/search', authenticateJWT, async (req, res) => {
  const q = String(req.query.q || '').toLowerCase();
  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { fullName: { contains: q } },
          { jobTitle: { contains: q } },
          { department: { contains: q } },
          { skills: { contains: q } }
        ]
      },
      orderBy: { fullName: 'asc' }
    });
    return res.json({ success: true, data: users.map(parseUserProfile) });
  } catch {
    return res.status(500).json({ success: false, message: 'Search failed' });
  }
});

// ─────────────────────────────────────────────────────────────────
// TASKS ROUTES
// ─────────────────────────────────────────────────────────────────

app.get('/api/v1/tasks', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const isManager = ['MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'].includes(req.user!.role);
    const tasks = await prisma.task.findMany({
      where: isManager ? {} : { assigneeId: req.user!.userId },
      include: { assignee: true, creator: true },
      orderBy: { createdAt: 'desc' }
    });
    const formatted = tasks.map(t => ({
      ...t,
      tags: tryParse(t.tags, []),
      assigneeName: t.assignee.fullName,
      creatorName: t.creator.fullName
    }));
    return res.json({ success: true, data: formatted });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Failed to fetch tasks' });
  }
});

app.post('/api/v1/tasks', authenticateJWT, async (req: AuthRequest, res) => {
  const { title, description, status, priority, projectName, assigneeId, dueDate, progress, tags } = req.body;
  if (!title || !dueDate) return res.status(400).json({ success: false, message: 'Title and due date are required' });

  try {
    const task = await prisma.task.create({
      data: {
        title,
        description: description || '',
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        projectName: projectName || null,
        assigneeId: assigneeId || req.user!.userId,
        creatorId: req.user!.userId,
        dueDate,
        progress: progress || 0,
        tags: JSON.stringify(tags || [])
      },
      include: { assignee: true, creator: true }
    });
    return res.status(201).json({
      success: true,
      data: { ...task, tags: tryParse(task.tags, []), assigneeName: task.assignee.fullName, creatorName: task.creator.fullName }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Failed to create task' });
  }
});

app.patch('/api/v1/tasks/:id', authenticateJWT, async (req: AuthRequest, res) => {
  const { status, progress, priority, title, description, dueDate } = req.body;
  try {
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        ...(status !== undefined && { status }),
        ...(progress !== undefined && { progress }),
        ...(priority !== undefined && { priority }),
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(dueDate && { dueDate })
      },
      include: { assignee: true, creator: true }
    });
    return res.json({
      success: true,
      data: { ...task, tags: tryParse(task.tags, []), assigneeName: task.assignee.fullName, creatorName: task.creator.fullName }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Failed to update task' });
  }
});

// ─────────────────────────────────────────────────────────────────
// PROJECTS ROUTES
// ─────────────────────────────────────────────────────────────────

app.get('/api/v1/projects', authenticateJWT, async (_req, res) => {
  try {
    const projects = await prisma.project.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json({ success: true, data: projects });
  } catch {
    return res.status(500).json({ success: false, message: 'Failed to fetch projects' });
  }
});

app.post('/api/v1/projects', authenticateJWT, async (req: AuthRequest, res) => {
  const { name, description, status, progress, dueDate, ownerId, department } = req.body;
  if (!name || !dueDate) return res.status(400).json({ success: false, message: 'Name and due date are required' });

  try {
    const project = await prisma.project.create({
      data: {
        name,
        description: description || '',
        status: status || 'On Track',
        progress: progress || 0,
        dueDate,
        ownerId: ownerId || req.user!.userId,
        department: department || 'Engineering'
      }
    });
    return res.status(201).json({ success: true, data: project });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Failed to create project' });
  }
});

// ─────────────────────────────────────────────────────────────────
// ATTENDANCE ROUTES
// ─────────────────────────────────────────────────────────────────

app.get('/api/v1/attendance', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const isManager = ['MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'].includes(req.user!.role);
    const records = await prisma.attendance.findMany({
      where: isManager ? {} : { userId: req.user!.userId },
      include: { user: { select: { fullName: true, employeeId: true } } },
      orderBy: { date: 'desc' },
      take: 60
    });
    return res.json({ success: true, data: records });
  } catch {
    return res.status(500).json({ success: false, message: 'Failed to fetch attendance' });
  }
});

app.post('/api/v1/attendance/checkin', authenticateJWT, async (req: AuthRequest, res) => {
  const today = new Date().toISOString().split('T')[0];
  const checkIn = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  try {
    // Check if already checked in today
    const existing = await prisma.attendance.findFirst({
      where: { userId: req.user!.userId, date: today }
    });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Already checked in today.' });
    }

    // Update user status
    await prisma.user.update({ where: { id: req.user!.userId }, data: { status: 'ACTIVE' } });

    const record = await prisma.attendance.create({
      data: {
        userId: req.user!.userId,
        date: today,
        checkIn,
        location: req.body.location || 'Office',
        status: 'Present'
      }
    });
    return res.status(201).json({ success: true, data: record });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Check-in failed' });
  }
});

app.post('/api/v1/attendance/checkout', authenticateJWT, async (req: AuthRequest, res) => {
  const today = new Date().toISOString().split('T')[0];
  const checkOut = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  try {
    const existing = await prisma.attendance.findFirst({
      where: { userId: req.user!.userId, date: today, checkOut: null }
    });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'No active check-in found for today.' });
    }

    // Calculate hours
    const inTime = new Date(`${today} ${existing.checkIn}`);
    const outTime = new Date(`${today} ${checkOut}`);
    const totalHours = parseFloat(((outTime.getTime() - inTime.getTime()) / 3600000).toFixed(2));

    const record = await prisma.attendance.update({
      where: { id: existing.id },
      data: { checkOut, totalHours }
    });
    return res.json({ success: true, data: record });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Check-out failed' });
  }
});

// ─────────────────────────────────────────────────────────────────
// LEAVE ROUTES
// ─────────────────────────────────────────────────────────────────

app.get('/api/v1/leaves', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const isManager = ['MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'].includes(req.user!.role);
    const leaves = await prisma.leaveRequest.findMany({
      where: isManager ? {} : { userId: req.user!.userId },
      include: { user: { select: { fullName: true, jobTitle: true, photoUrl: true, employeeId: true } } },
      orderBy: { createdAt: 'desc' }
    });
    return res.json({ success: true, data: leaves });
  } catch {
    return res.status(500).json({ success: false, message: 'Failed to fetch leaves' });
  }
});

app.post('/api/v1/leaves', authenticateJWT, async (req: AuthRequest, res) => {
  const { type, startDate, endDate, daysCount, reason } = req.body;
  if (!type || !startDate || !endDate || !reason) {
    return res.status(400).json({ success: false, message: 'All leave fields are required.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const leave = await prisma.leaveRequest.create({
      data: {
        userId: req.user!.userId,
        type,
        startDate,
        endDate,
        daysCount: daysCount || 1,
        reason
      },
      include: { user: { select: { fullName: true, jobTitle: true, photoUrl: true } } }
    });

    // Update user status to ON_LEAVE when approved (stays ACTIVE until then)
    // Notify manager by email
    const managers = await prisma.user.findMany({
      where: { role: { in: ['MANAGER', 'HR_ADMIN'] } }
    });
    for (const manager of managers) {
      sendLeaveSubmittedAlert(manager.email, manager.fullName, user.fullName, type, startDate, endDate, daysCount || 1, reason).catch(console.error);
    }

    return res.status(201).json({ success: true, data: leave });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Failed to submit leave request' });
  }
});

app.patch('/api/v1/leaves/:id/decision', authenticateJWT, async (req: AuthRequest, res) => {
  const { decision } = req.body; // 'APPROVED' | 'REJECTED'
  if (!['APPROVED', 'REJECTED'].includes(decision)) {
    return res.status(400).json({ success: false, message: 'Decision must be APPROVED or REJECTED' });
  }

  const isManager = ['MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'].includes(req.user!.role);
  if (!isManager) {
    return res.status(403).json({ success: false, message: 'Only managers can approve/reject leave requests' });
  }

  try {
    const manager = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    const leave = await prisma.leaveRequest.update({
      where: { id: req.params.id },
      data: { status: decision, approvedBy: manager?.fullName || 'Manager' },
      include: { user: true }
    });

    // If approved, update user status
    if (decision === 'APPROVED') {
      await prisma.user.update({ where: { id: leave.userId }, data: { status: 'ON_LEAVE' } });
    }

    // Notify employee
    sendLeaveDecisionAlert(leave.user.email, leave.user.fullName, leave.type, leave.startDate, leave.endDate, decision, manager?.fullName || 'Manager').catch(console.error);

    return res.json({ success: true, data: leave });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Failed to update leave decision' });
  }
});

// ─────────────────────────────────────────────────────────────────
// DOCUMENTS ROUTES
// ─────────────────────────────────────────────────────────────────

app.get('/api/v1/documents', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const isManager = ['MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'].includes(req.user!.role);
    const docs = await prisma.document.findMany({
      where: isManager ? {} : {
        OR: [{ uploadedById: req.user!.userId }, { isConfidential: false }]
      },
      include: { uploadedBy: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' }
    });
    return res.json({ success: true, data: docs });
  } catch {
    return res.status(500).json({ success: false, message: 'Failed to fetch documents' });
  }
});

app.post('/api/v1/documents/upload', authenticateJWT, upload.single('file'), async (req: AuthRequest, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

  const { title, category, isConfidential } = req.body;
  const fileUrl = `/uploads/${req.file.filename}`;
  const fileSizeKB = (req.file.size / 1024).toFixed(0);
  const fileSize = fileSizeKB > '1024' ? `${(req.file.size / (1024 * 1024)).toFixed(1)} MB` : `${fileSizeKB} KB`;
  const fileExt = path.extname(req.file.originalname).replace('.', '').toLowerCase();

  try {
    const doc = await prisma.document.create({
      data: {
        title: title || req.file.originalname,
        category: category || 'Personal',
        fileUrl,
        fileSize,
        fileType: fileExt,
        isConfidential: isConfidential === 'true',
        uploadedById: req.user!.userId
      },
      include: { uploadedBy: { select: { fullName: true } } }
    });
    return res.status(201).json({ success: true, data: doc });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Failed to save document record' });
  }
});

// ─────────────────────────────────────────────────────────────────
// OKR ROUTES
// ─────────────────────────────────────────────────────────────────

app.get('/api/v1/okrs', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const okrs = await prisma.goalOKR.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' }
    });
    return res.json({ success: true, data: okrs });
  } catch {
    return res.status(500).json({ success: false, message: 'Failed to fetch OKRs' });
  }
});

app.post('/api/v1/okrs', authenticateJWT, async (req: AuthRequest, res) => {
  const { title, category, target, current, quarter, year, unit } = req.body;
  if (!title || !quarter) return res.status(400).json({ success: false, message: 'Title and quarter required' });

  try {
    const okr = await prisma.goalOKR.create({
      data: {
        userId: req.user!.userId,
        title,
        category: category || 'Personal',
        target: target || 100,
        current: current || 0,
        quarter,
        year: year || new Date().getFullYear(),
        unit: unit || 'units'
      }
    });
    return res.status(201).json({ success: true, data: okr });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Failed to create OKR' });
  }
});

app.patch('/api/v1/okrs/:id', authenticateJWT, async (req: AuthRequest, res) => {
  const { current } = req.body;
  try {
    const okr = await prisma.goalOKR.update({
      where: { id: req.params.id, userId: req.user!.userId },
      data: { ...(current !== undefined && { current }) }
    });
    return res.json({ success: true, data: okr });
  } catch {
    return res.status(500).json({ success: false, message: 'Failed to update OKR' });
  }
});

// ─────────────────────────────────────────────────────────────────
// RECOGNITION ROUTES
// ─────────────────────────────────────────────────────────────────

app.get('/api/v1/recognitions', authenticateJWT, async (_req, res) => {
  try {
    const recognitions = await prisma.recognition.findMany({
      include: {
        giver: { select: { fullName: true, photoUrl: true } },
        receiver: { select: { fullName: true, photoUrl: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.json({ success: true, data: recognitions });
  } catch {
    return res.status(500).json({ success: false, message: 'Failed to fetch recognitions' });
  }
});

app.post('/api/v1/recognitions', authenticateJWT, async (req: AuthRequest, res) => {
  const { receiverId, badgeType, message } = req.body;
  if (!receiverId || !badgeType || !message) {
    return res.status(400).json({ success: false, message: 'Receiver, badge type, and message are required' });
  }

  try {
    const recognition = await prisma.recognition.create({
      data: {
        giverId: req.user!.userId,
        receiverId,
        badgeType,
        message
      },
      include: {
        giver: { select: { fullName: true, photoUrl: true } },
        receiver: { select: { fullName: true, photoUrl: true } }
      }
    });
    return res.status(201).json({ success: true, data: recognition });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Failed to give recognition' });
  }
});

// ─────────────────────────────────────────────────────────────────
// MEETINGS ROUTES
// ─────────────────────────────────────────────────────────────────

app.get('/api/v1/meetings', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const meetings = await prisma.meeting.findMany({
      where: {
        OR: [
          { organizerId: req.user!.userId },
          { attendees: { some: { userId: req.user!.userId } } }
        ]
      },
      include: {
        organizer: { select: { fullName: true } },
        attendees: { include: { user: { select: { fullName: true } } } }
      },
      orderBy: { date: 'asc' }
    });
    const formatted = meetings.map(m => ({
      ...m,
      organizerName: m.organizer.fullName,
      attendees: m.attendees.map(a => a.user.fullName)
    }));
    return res.json({ success: true, data: formatted });
  } catch {
    return res.status(500).json({ success: false, message: 'Failed to fetch meetings' });
  }
});

app.post('/api/v1/meetings', authenticateJWT, async (req: AuthRequest, res) => {
  const { title, date, startTime, endTime, locationOrLink, category, description, attendeeIds } = req.body;
  if (!title || !date || !startTime || !endTime) {
    return res.status(400).json({ success: false, message: 'Title, date, start time, and end time are required' });
  }

  try {
    const allAttendeeIds: string[] = [...new Set([req.user!.userId, ...(attendeeIds || [])])];

    const meeting = await prisma.meeting.create({
      data: {
        title,
        date,
        startTime,
        endTime,
        locationOrLink: locationOrLink || 'TBD',
        organizerId: req.user!.userId,
        category: category || 'Sync',
        description: description || '',
        attendees: {
          create: allAttendeeIds.map(uid => ({ userId: uid }))
        }
      },
      include: {
        organizer: { select: { fullName: true } },
        attendees: { include: { user: { select: { fullName: true } } } }
      }
    });

    return res.status(201).json({
      success: true,
      data: {
        ...meeting,
        organizerName: meeting.organizer.fullName,
        attendees: meeting.attendees.map(a => a.user.fullName)
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Failed to schedule meeting' });
  }
});

// ─────────────────────────────────────────────────────────────────
// ANNOUNCEMENTS ROUTES
// ─────────────────────────────────────────────────────────────────

app.get('/api/v1/announcements', authenticateJWT, async (_req, res) => {
  try {
    const announcements = await prisma.announcement.findMany({ orderBy: { createdAt: 'desc' }, take: 20 });
    return res.json({ success: true, data: announcements });
  } catch {
    return res.status(500).json({ success: false, message: 'Failed to fetch announcements' });
  }
});

app.post('/api/v1/announcements', authenticateJWT, async (req: AuthRequest, res) => {
  const { title, content, target, tag } = req.body;
  const isManager = ['MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'].includes(req.user!.role);
  if (!isManager) return res.status(403).json({ success: false, message: 'Only managers can post announcements' });
  if (!title || !content) return res.status(400).json({ success: false, message: 'Title and content required' });

  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    const announcement = await prisma.announcement.create({
      data: { title, content, author: user?.fullName || 'Management', target: target || 'ALL', tag: tag || 'General' }
    });
    return res.status(201).json({ success: true, data: announcement });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Failed to post announcement' });
  }
});

// ─────────────────────────────────────────────────────────────────
// PROFILE ROUTES
// ─────────────────────────────────────────────────────────────────

// GET /api/v1/profiles/me — current user profile (plan endpoint alias)
app.get('/api/v1/profiles/me', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({ success: true, user: parseUserProfile(user) });
  } catch {
    return res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
});

// ─────────────────────────────────────────────────────────────────
// MANAGER OVERSEER ROUTES
// ─────────────────────────────────────────────────────────────────

// GET /api/v1/manager/team-status — live direct reports status, check-ins, tasks, pending approvals
app.get('/api/v1/manager/team-status', authenticateJWT, async (req: AuthRequest, res) => {
  const isManager = ['MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'].includes(req.user!.role);
  if (!isManager) return res.status(403).json({ success: false, message: 'Only managers can view team status' });

  try {
    const manager = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    const team = await prisma.user.findMany({
      where: { id: { not: req.user!.userId } },
      include: {
        attendance: { orderBy: { date: 'desc' }, take: 1 },
        _count: {
          select: {
            tasks: { where: { status: { not: 'COMPLETED' } } },
            leaveRequests: { where: { status: 'PENDING' } }
          }
        }
      },
      orderBy: { department: 'asc' }
    });

    const now = new Date();
    const today = now.toISOString().split('T')[0];

    const report = team.map(member => ({
      id: member.id,
      fullName: member.fullName,
      employeeId: member.employeeId,
      photoUrl: member.photoUrl,
      jobTitle: member.jobTitle,
      department: member.department,
      status: member.status,
      team: member.team,
      location: member.location,
      lastCheckIn: member.attendance[0]?.checkIn || null,
      lastCheckOut: member.attendance[0]?.checkOut || null,
      lastAttendanceDate: member.attendance[0]?.date || null,
      checkedInToday: member.attendance.some(a => a.date === today && !a.checkOut),
      activeTasks: member._count.tasks,
      pendingLeaves: member._count.leaveRequests
    }));

    const activeToday = team.filter(m => m.status === 'ACTIVE').length;
    const onLeave = team.filter(m => m.status === 'ON_LEAVE').length;
    const away = team.filter(m => m.status === 'AWAY').length;

    const pendingApprovals = await prisma.leaveRequest.count({ where: { status: 'PENDING' } });

    return res.json({
      success: true,
      data: {
        manager: manager ? { fullName: manager.fullName, department: manager.department } : null,
        overview: {
          totalDirectReports: team.length,
          activeToday,
          onLeave,
          away,
          pendingApprovals,
          avg: activeToday > 0 ? Math.round((activeToday / (team.length || 1)) * 100) : 0
        },
        teamStatus: report
      }
    });
  } catch (err) {
    console.error('Team status error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch team status' });
  }
});

// ─────────────────────────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────────────────────────

// Local development:
//    npm run dev → Express listens on port 5000
//
// Vercel:
//    Vercel handles the serverless function itself,
//    so app.listen() must NOT be called.
if (!process.env.VERCEL) {
  app.listen(PORT, async () => {
    console.log(`\n⚡ Deskly Enterprise Backend`);
    console.log(`   Running on: http://localhost:${PORT}`);
    console.log(`   Database: ${process.env.DATABASE_URL ? 'PostgreSQL' : 'Database URL not configured'}`);
    console.log(
      `   Email: ${
        process.env.GMAIL_USER &&
        process.env.GMAIL_USER !== 'your-gmail@gmail.com'
          ? '✅ Configured (real Gmail SMTP)'
          : '⚠️ Not configured — email alerts will log to console only'
      }`
    );
    console.log('');
  });
}

export default app;
