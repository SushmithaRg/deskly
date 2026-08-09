import {
  UserProfile,
  TaskItem,
  ProjectItem,
  AttendanceRecord,
  LeaveItem,
  ApprovalRequest,
  DocumentItem,
  GoalOKRItem,
  RecognitionBadge,
  AnnouncementItem
} from './types';

export const CURRENT_EMPLOYEE_PROFILE: UserProfile = {
  id: 'prof-emp-1024',
  userId: 'usr-emp-1024',
  employeeId: 'EMP1024',
  fullName: 'Sushmitha R G',
  photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300',
  jobTitle: 'Software Developer',
  department: 'Engineering',
  departmentCode: 'ENG',
  team: 'Backend Engineering',
  managerName: 'Priya Sharma',
  joiningDate: '2026-08-01',
  location: 'Bengaluru, India',
  phone: '+91 91234 56789',
  email: 'sushmitha.rg@company.com',
  role: 'EMPLOYEE',
  skills: ['Python', 'SQL', 'React', 'PostgreSQL', 'TypeScript', 'Node.js', 'Redis'],
  aboutMe: 'Full-stack builder specializing in high-performance web APIs, resilient backend microservices, and slick reactive dashboards.',
  education: ['B.E. Computer Science - VTU (Visvesvaraya Technological University)'],
  certifications: ['Google UX Professional Certification', 'AWS Certified Developer Associate', 'Prisma Certified Developer'],
  experience: ['Software Engineering Developer at TechCorp (2025 - 2026)', 'Backend Engineering Intern at CloudPulse'],
  emergencyContact: '+91 91234 00000 (Parent)',
  status: 'ACTIVE'
};

export const CURRENT_MANAGER_PROFILE: UserProfile = {
  id: 'prof-mgr-1001',
  userId: 'usr-mgr-1001',
  employeeId: 'EMP1001',
  fullName: 'Priya Sharma',
  photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300',
  jobTitle: 'Engineering Manager',
  department: 'Engineering',
  departmentCode: 'ENG',
  team: 'Backend Engineering',
  managerName: 'Vikramaditya Roy (VP Engineering)',
  joiningDate: '2022-01-15',
  location: 'Bengaluru, India',
  phone: '+91 98765 43210',
  email: 'priya.sharma@company.com',
  role: 'MANAGER',
  skills: ['System Design', 'Python', 'Leadership', 'PostgreSQL', 'Microservices', 'Kubernetes'],
  aboutMe: 'Engineering leader passionate about resilient backend architectures, scaling developer platforms, and empowering high-impact technical teams.',
  education: ['M.Tech Computer Science - IISc Bengaluru', 'B.Tech CS - NIT Surathkal'],
  certifications: ['AWS Certified Solutions Architect Professional', 'Certified Scrum Master (CSM)'],
  experience: ['Engineering Manager at Deskly Inc (2024 - Present)', 'Lead Architect at Infotech Global (2020 - 2024)'],
  emergencyContact: '+91 98765 00000 (Spouse)',
  status: 'ACTIVE'
};

export const TEAM_DIRECTORY_PROFILES: UserProfile[] = [
  CURRENT_EMPLOYEE_PROFILE,
  CURRENT_MANAGER_PROFILE,
  {
    id: 'prof-dev-1030',
    userId: 'usr-dev-1030',
    employeeId: 'EMP1030',
    fullName: 'Rohan Verma',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
    jobTitle: 'Senior Frontend Engineer',
    department: 'Engineering',
    departmentCode: 'ENG',
    team: 'Frontend Web & UI',
    managerName: 'Priya Sharma',
    joiningDate: '2023-04-10',
    location: 'Bengaluru, India',
    phone: '+91 99887 76655',
    email: 'rohan.verma@company.com',
    role: 'EMPLOYEE',
    skills: ['React', 'Next.js', 'Tailwind CSS', 'TypeScript', 'Framer Motion', 'Figma'],
    aboutMe: 'Passionate about crafting pixel-perfect web interfaces, design tokens, and smooth micro-animations.',
    education: ['B.Tech Information Technology - Manipal University'],
    certifications: ['Meta Front-End Developer Professional'],
    experience: ['UI Engineer at CreativeStack (2022-2024)'],
    emergencyContact: '+91 99887 00000',
    status: 'ACTIVE'
  },
  {
    id: 'prof-dev-1045',
    userId: 'usr-dev-1045',
    employeeId: 'EMP1045',
    fullName: 'Ananya Deshmukh',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
    jobTitle: 'DevOps & Cloud Specialist',
    department: 'Engineering',
    departmentCode: 'ENG',
    team: 'Infrastructure & Cloud',
    managerName: 'Priya Sharma',
    joiningDate: '2024-02-01',
    location: 'Mumbai, India',
    phone: '+91 98112 23344',
    email: 'ananya.d@company.com',
    role: 'EMPLOYEE',
    skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD', 'Python', 'Go'],
    aboutMe: 'Automating infrastructure pipelines, zero-downtime deployments, and cloud security compliance.',
    education: ['B.E Electronics & Telecom - Pune University'],
    certifications: ['CKA (Certified Kubernetes Administrator)', 'AWS DevOps Engineer Expert'],
    experience: ['Cloud Operations Engineer at DataCloud'],
    emergencyContact: '+91 98112 00000',
    status: 'ON_LEAVE'
  },
  {
    id: 'prof-hr-1005',
    userId: 'usr-hr-1005',
    employeeId: 'EMP1005',
    fullName: 'Kavita Menon',
    photoUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300',
    jobTitle: 'Lead HR Operations Partner',
    department: 'Human Resources',
    departmentCode: 'HR',
    team: 'People & Culture',
    managerName: 'Vikramaditya Roy',
    joiningDate: '2021-09-01',
    location: 'Bengaluru, India',
    phone: '+91 97766 55443',
    email: 'kavita.menon@company.com',
    role: 'HR_ADMIN',
    skills: ['Talent Acquisition', 'Employee Engagement', 'HR Policy', 'Conflict Resolution', 'Workplace Wellness'],
    aboutMe: 'Building inclusive, high-energy organizational culture and streamlining seamless employee journeys.',
    education: ['MBA Human Resources - XLRI Jamshedpur'],
    certifications: ['SHRM Senior Certified Professional (SHRM-SCP)'],
    experience: ['Senior HR Business Partner at TechEnterprises'],
    emergencyContact: '+91 97766 00000',
    status: 'ACTIVE'
  }
];

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'tsk-101',
    title: 'Fix Login & Dual-Token OAuth API',
    description: 'Implement JWT refresh token rotation with HttpOnly cookies and rate limiting via Redis.',
    status: 'IN_PROGRESS',
    priority: 'URGENT',
    projectId: 'proj-deskly-os',
    projectName: 'Deskly Operating System',
    assigneeId: 'prof-emp-1024',
    assigneeName: 'Sushmitha R G',
    creatorName: 'Priya Sharma',
    dueDate: '2026-08-12',
    progress: 80,
    commentsCount: 5,
    tags: ['Auth', 'Backend', 'Security']
  },
  {
    id: 'tsk-102',
    title: 'Dashboard Role-Based View Switcher',
    description: 'Complete animated status widgets and attendance clock-in toggle button with live geofence checks.',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    projectId: 'proj-deskly-os',
    projectName: 'Deskly Operating System',
    assigneeId: 'prof-emp-1024',
    assigneeName: 'Sushmitha R G',
    creatorName: 'Priya Sharma',
    dueDate: '2026-08-15',
    progress: 65,
    commentsCount: 3,
    tags: ['Frontend', 'UI/UX']
  },
  {
    id: 'tsk-103',
    title: 'Searchable Directory Skill Filtering',
    description: 'Enable multi-field natural language filtering across Name, Skill tags (Python, React), and Department.',
    status: 'REVIEW',
    priority: 'MEDIUM',
    projectId: 'proj-deskly-os',
    projectName: 'Deskly Operating System',
    assigneeId: 'prof-emp-1024',
    assigneeName: 'Sushmitha R G',
    creatorName: 'Priya Sharma',
    dueDate: '2026-08-14',
    progress: 90,
    commentsCount: 2,
    tags: ['Search', 'Frontend']
  },
  {
    id: 'tsk-104',
    title: 'Deskly AI RAG Knowledge Integration',
    description: 'Connect vector store indexed employee policies & task states to Deskly AI natural language endpoint.',
    status: 'TODO',
    priority: 'HIGH',
    projectId: 'proj-deskly-os',
    projectName: 'Deskly Operating System',
    assigneeId: 'prof-dev-1030',
    assigneeName: 'Rohan Verma',
    creatorName: 'Priya Sharma',
    dueDate: '2026-08-20',
    progress: 25,
    commentsCount: 1,
    tags: ['AI Engine', 'Python', 'LLM']
  },
  {
    id: 'tsk-105',
    title: 'PostgreSQL Database Indexing Optimization',
    description: 'Add composite indexes on Profile (fullName, jobTitle) and Attendance (profileId, date) for sub-10ms queries.',
    status: 'COMPLETED',
    priority: 'MEDIUM',
    projectId: 'proj-deskly-os',
    projectName: 'Deskly Operating System',
    assigneeId: 'prof-emp-1024',
    assigneeName: 'Sushmitha R G',
    creatorName: 'Priya Sharma',
    dueDate: '2026-08-08',
    progress: 100,
    commentsCount: 4,
    tags: ['Database', 'PostgreSQL']
  }
];

export const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: 'proj-deskly-os',
    name: 'Deskly Operating System',
    description: 'Unified enterprise company management platform with AI workspace context & RBAC controls.',
    leadName: 'Priya Sharma',
    teamName: 'Backend Engineering',
    progress: 74,
    startDate: '2026-05-01',
    dueDate: '2026-10-31',
    membersCount: 6,
    status: 'On Track'
  },
  {
    id: 'proj-cloud-auth',
    name: 'Zero-Trust SSO & IAM Integration',
    description: 'Migrating legacy identity providers to dual-token OAuth2 with FIDO2 hardware passkeys.',
    leadName: 'Priya Sharma',
    teamName: 'Infrastructure & Cloud',
    progress: 48,
    startDate: '2026-06-15',
    dueDate: '2026-11-15',
    membersCount: 4,
    status: 'On Track'
  },
  {
    id: 'proj-ai-analytics',
    name: 'Workload & Capacity Predictive Engine',
    description: 'Machine learning model predicting team bandwidth and burnout metrics from Jira/Git telemetry.',
    leadName: 'Rohan Verma',
    teamName: 'AI & Data Insights',
    progress: 30,
    startDate: '2026-07-01',
    dueDate: '2026-12-20',
    membersCount: 5,
    status: 'At Risk'
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  { id: 'att-1', date: '2026-08-09', checkIn: '09:15 AM', location: 'Bengaluru HQ (Validated IP)', status: 'Present' },
  { id: 'att-2', date: '2026-08-08', checkIn: '09:02 AM', checkOut: '06:30 PM', totalHours: 9.47, location: 'Remote (Bengaluru VPN)', status: 'Remote' },
  { id: 'att-3', date: '2026-08-07', checkIn: '08:55 AM', checkOut: '06:15 PM', totalHours: 9.33, location: 'Bengaluru HQ', status: 'Present' },
  { id: 'att-4', date: '2026-08-06', checkIn: '09:20 AM', checkOut: '06:40 PM', totalHours: 9.33, location: 'Bengaluru HQ', status: 'Present' },
  { id: 'att-5', date: '2026-08-05', checkIn: '09:10 AM', checkOut: '06:20 PM', totalHours: 9.17, location: 'Remote (Home Office)', status: 'Remote' }
];

export const INITIAL_LEAVE_REQUESTS: LeaveItem[] = [
  {
    id: 'lv-201',
    profileId: 'prof-dev-1045',
    applicantName: 'Ananya Deshmukh',
    applicantRole: 'DevOps Specialist',
    applicantPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    type: 'CASUAL',
    startDate: '2026-08-10',
    endDate: '2026-08-12',
    daysCount: 3,
    reason: 'Family event and personal work in Pune.',
    status: 'PENDING',
    createdAt: '2026-08-08'
  },
  {
    id: 'lv-202',
    profileId: 'prof-dev-1030',
    applicantName: 'Rohan Verma',
    applicantRole: 'Senior Frontend Engineer',
    applicantPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    type: 'SICK',
    startDate: '2026-08-18',
    endDate: '2026-08-19',
    daysCount: 2,
    reason: 'Scheduled dental procedure and recovery.',
    status: 'PENDING',
    createdAt: '2026-08-09'
  },
  {
    id: 'lv-200',
    profileId: 'prof-emp-1024',
    applicantName: 'Sushmitha R G',
    applicantRole: 'Software Developer',
    applicantPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    type: 'EARNED',
    startDate: '2026-07-01',
    endDate: '2026-07-03',
    daysCount: 3,
    reason: 'Annual vacation trip.',
    status: 'APPROVED',
    createdAt: '2026-06-20'
  }
];

export const INITIAL_APPROVALS: ApprovalRequest[] = [
  {
    id: 'app-301',
    category: 'Leave',
    title: '3 Days Casual Leave',
    applicantName: 'Ananya Deshmukh',
    applicantId: 'EMP1045',
    applicantRole: 'DevOps Specialist',
    amountOrDetails: 'Aug 10 - Aug 12 (3 Days)',
    date: '2026-08-08',
    status: 'PENDING'
  },
  {
    id: 'app-302',
    category: 'Expense',
    title: 'Cloud Certification Fee Reimbursement',
    applicantName: 'Sushmitha R G',
    applicantId: 'EMP1024',
    applicantRole: 'Software Developer',
    amountOrDetails: '₹14,500 ($175 USD) - AWS Exam',
    date: '2026-08-07',
    status: 'PENDING'
  },
  {
    id: 'app-303',
    category: 'Equipment',
    title: 'Ergonomic Chair & Dual Monitor Stand',
    applicantName: 'Rohan Verma',
    applicantId: 'EMP1030',
    applicantRole: 'Senior Frontend Engineer',
    amountOrDetails: 'Dell UltraSharp 27" + Ergonomic Setup',
    date: '2026-08-06',
    status: 'PENDING'
  }
];

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-1',
    title: 'Employment Offer Letter & Agreement',
    category: 'Personal',
    fileUrl: '#',
    fileSize: '1.4 MB',
    fileType: 'pdf',
    isConfidential: true,
    uploadedBy: 'HR Operations',
    uploadedAt: '2026-08-01'
  },
  {
    id: 'doc-2',
    title: 'July 2026 Salary Paystub & Tax Computation',
    category: 'Personal',
    fileUrl: '#',
    fileSize: '480 KB',
    fileType: 'pdf',
    isConfidential: true,
    uploadedBy: 'Finance Payroll',
    uploadedAt: '2026-08-02'
  },
  {
    id: 'doc-3',
    title: 'Deskly Enterprise Architecture Blueprint v2.4',
    category: 'Project Assets',
    fileUrl: '#',
    fileSize: '5.8 MB',
    fileType: 'pdf',
    isConfidential: false,
    uploadedBy: 'Priya Sharma',
    uploadedAt: '2026-08-05'
  },
  {
    id: 'doc-4',
    title: 'Global Remote Work & Security Compliance Policy',
    category: 'Company Policies',
    fileUrl: '#',
    fileSize: '2.1 MB',
    fileType: 'pdf',
    isConfidential: false,
    uploadedBy: 'HR Admin',
    uploadedAt: '2026-01-10'
  },
  {
    id: 'doc-5',
    title: 'PostgreSQL Database Schema & Migration Guide',
    category: 'Project Assets',
    fileUrl: '#',
    fileSize: '890 KB',
    fileType: 'docx',
    isConfidential: false,
    uploadedBy: 'Sushmitha R G',
    uploadedAt: '2026-08-06'
  }
];

export const INITIAL_OKRS: GoalOKRItem[] = [
  {
    id: 'okr-1',
    title: 'Deliver Deskly OS MVP with sub-100ms API latency',
    category: 'Company',
    target: 100,
    current: 78,
    quarter: 'Q3',
    year: 2026,
    unit: '%'
  },
  {
    id: 'okr-2',
    title: 'Achieve 95%+ Unit Test Coverage across Backend Services',
    category: 'Team',
    target: 95,
    current: 82,
    quarter: 'Q3',
    year: 2026,
    unit: '%'
  },
  {
    id: 'okr-3',
    title: 'Complete AWS Certified Developer & System Architecture Review',
    category: 'Personal',
    target: 100,
    current: 100,
    quarter: 'Q3',
    year: 2026,
    unit: '%'
  },
  {
    id: 'okr-4',
    title: 'Publish 3 Internal Technical Case Studies on Performance Tuning',
    category: 'Personal',
    target: 3,
    current: 2,
    quarter: 'Q3',
    year: 2026,
    unit: 'Papers'
  }
];

export const INITIAL_RECOGNITION: RecognitionBadge[] = [
  {
    id: 'rec-1',
    giverName: 'Priya Sharma',
    giverPhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    receiverName: 'Sushmitha R G',
    receiverPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    badgeType: 'Employee of the Month',
    message: 'Outstanding technical speed and leadership in building the Deskly core database and JWT token security layer!',
    createdAt: '2026-08-01'
  },
  {
    id: 'rec-2',
    giverName: 'Rohan Verma',
    giverPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    receiverName: 'Sushmitha R G',
    receiverPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    badgeType: 'Achievement',
    message: 'Great collaboration on solving complex layout states and seamless API data hydration!',
    createdAt: '2026-08-06'
  },
  {
    id: 'rec-3',
    giverName: 'Sushmitha R G',
    giverPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    receiverName: 'Ananya Deshmukh',
    receiverPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    badgeType: 'Appreciation',
    message: 'Kudos for debugging the Kubernetes ingress controller during midnight deployments!',
    createdAt: '2026-08-04'
  }
];

export const INITIAL_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'anc-1',
    title: 'Deskly OS v2.0 Platform Launch Town Hall',
    content: 'Join us this Thursday at 4:00 PM IST for a live demo of the new Deskly Enterprise platform and Q3 roadmap announcement.',
    author: 'Priya Sharma (Engineering Lead)',
    target: 'Engineering & Product',
    date: 'Today at 10:00 AM',
    tag: 'Important'
  },
  {
    id: 'anc-2',
    title: 'Annual Enterprise Hackathon 2026 Registration Open',
    content: 'Submit your AI & Automation team projects before August 25. Prizes up to ₹5,00,000 for winning enterprise innovations.',
    author: 'Kavita Menon (HR Ops)',
    target: 'All Organization',
    date: 'Yesterday',
    tag: 'Event'
  }
];
