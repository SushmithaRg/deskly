export type Role = 'SUPER_ADMIN' | 'HR_ADMIN' | 'MANAGER' | 'EMPLOYEE';
export type Status = 'ACTIVE' | 'ON_LEAVE' | 'AWAY';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type LeaveType = 'CASUAL' | 'SICK' | 'EARNED' | 'MATERNITY';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface UserProfile {
  id: string;
  userId: string;
  employeeId: string;
  fullName: string;
  photoUrl?: string;
  jobTitle: string;
  department: string;
  departmentCode: string;
  team: string;
  managerName?: string;
  joiningDate: string;
  location: string;
  phone: string;
  email: string;
  role: Role;
  skills: string[];
  aboutMe: string;
  education: string[];
  certifications: string[];
  experience: string[];
  emergencyContact: string;
  status: Status;
}

export interface MeetingItem {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  locationOrLink: string;
  organizerName: string;
  attendees: string[];
  description?: string;
  category: 'Sync' | 'Town Hall' | '1-on-1' | 'Client';
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  projectId?: string;
  projectName?: string;
  assigneeId: string;
  assigneeName: string;
  creatorName: string;
  dueDate: string;
  progress: number;
  commentsCount: number;
  tags?: string[];
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  leadName: string;
  teamName: string;
  progress: number;
  startDate: string;
  dueDate: string;
  membersCount: number;
  status: 'On Track' | 'At Risk' | 'Completed' | 'In Planning';
}

export interface AttendanceRecord {
  id: string;
  profileId?: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  totalHours?: number;
  location: string;
  status: 'Present' | 'Late' | 'Remote' | 'On Leave';
}

export interface LeaveItem {
  id: string;
  profileId: string;
  applicantName: string;
  applicantRole: string;
  applicantPhoto?: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: LeaveStatus;
  createdAt: string;
  approvedBy?: string;
}

export interface ApprovalRequest {
  id: string;
  category: 'Leave' | 'Expense' | 'Equipment' | 'Overtime';
  title: string;
  applicantName: string;
  applicantId: string;
  applicantRole: string;
  amountOrDetails: string;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  leaveRequestId?: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  category: 'Personal' | 'Company Policies' | 'Project Assets';
  fileUrl: string;
  fileSize: string;
  fileType: 'pdf' | 'docx' | 'xlsx' | 'zip' | 'png' | 'jpeg';
  isConfidential: boolean;
  uploadedById?: string;
  uploadedBy: string;
  uploadedAt: string;
  realDataUrl?: string;
}

export interface GoalOKRItem {
  id: string;
  profileId?: string;
  title: string;
  category: 'Company' | 'Team' | 'Personal';
  target: number;
  current: number;
  quarter: string;
  year: number;
  unit: string;
}

export interface RecognitionBadge {
  id: string;
  giverName: string;
  giverPhoto?: string;
  receiverName: string;
  receiverPhoto?: string;
  badgeType: 'Employee of the Month' | 'Achievement' | 'Appreciation' | 'Leadership';
  message: string;
  createdAt: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  author: string;
  target: string;
  date: string;
  tag: 'Important' | 'General' | 'Event';
}

export interface DeskAIMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}
