// Deskly Database Seeder
// Initializes the enterprise org structure with hashed password accounts,
// projects, tasks, today's attendance, and documents for instant exploration.
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const PASSWORD = 'Deskly@123';

interface SeedUserInput {
  email: string;
  fullName: string;
  employeeId: string;
  role: 'SUPER_ADMIN' | 'HR_ADMIN' | 'MANAGER' | 'EMPLOYEE';
  jobTitle: string;
  department: string;
  team: string;
  managerName?: string;
  location: string;
  phone: string;
  skills: string[];
  aboutMe: string;
  experience: string[];
  status: string;
}

async function seedUser(data: SeedUserInput) {
  const email = data.email.toLowerCase();
  const passwordHash = await bcrypt.hash(PASSWORD, 12);
  const payload = {
    passwordHash,
    role: data.role,
    fullName: data.fullName,
    employeeId: data.employeeId,
    photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.fullName)}`,
    jobTitle: data.jobTitle,
    department: data.department,
    team: data.team,
    managerName: data.managerName || null,
    joiningDate: new Date().toISOString().split('T')[0],
    location: data.location,
    phone: data.phone,
    skills: JSON.stringify(data.skills),
    aboutMe: data.aboutMe,
    education: JSON.stringify(["Bachelor's Degree"]),
    certifications: JSON.stringify([]),
    experience: JSON.stringify(data.experience),
    emergencyContact: '',
    status: data.status
  };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return prisma.user.update({ where: { email }, data: payload });
  }
  return prisma.user.create({ data: { email, ...payload } });
}

async function main() {
  console.log('🌱 Deskly Database Seeder v2.0\n');

  const sushmitha = await seedUser({
    email: 'sushmitha.rg@company.com',
    fullName: 'Sushmitha R G',
    employeeId: 'EMP1001',
    role: 'SUPER_ADMIN',
    jobTitle: 'Software Developer',
    department: 'Engineering',
    team: 'Platform Engineering',
    location: 'Bengaluru HQ',
    phone: '+91 98765 43210',
    skills: ['Node.js', 'TypeScript', 'PostgreSQL', 'Prisma', 'System Architecture'],
    aboutMe: 'Full-stack developer leading the Deskly platform, API services, and real-time attendance systems.',
    experience: ['Full-Stack Developer at Company (2023–Present)', 'Software Engineer at TechCorp (2020–2023)'],
    status: 'ACTIVE'
  });

  const priya = await seedUser({
    email: 'priya.sharma@company.com',
    fullName: 'Priya Sharma',
    employeeId: 'EMP1002',
    role: 'MANAGER',
    jobTitle: 'Engineering Manager',
    department: 'Engineering',
    team: 'Platform Engineering',
    managerName: 'Sushmitha R G',
    location: 'Bengaluru HQ',
    phone: '+91 91234 56789',
    skills: ['Agile Leadership', 'Team Management', 'System Design', 'DevOps'],
    aboutMe: 'Engineering manager overseeing the platform teams, sprint planning, and cross-functional delivery.',
    experience: ['Engineering Manager at Streamline (2021–Present)', 'Sr. Engineer at Nexus (2018–2021)'],
    status: 'ACTIVE'
  });

  const arjun = await seedUser({
    email: 'arjun.nair@company.com',
    fullName: 'Arjun Nair',
    employeeId: 'EMP1003',
    role: 'EMPLOYEE',
    jobTitle: 'Senior Backend Engineer',
    department: 'Engineering',
    team: 'Platform Engineering',
    managerName: 'Priya Sharma',
    location: 'Hyderabad',
    phone: '+91 98480 76555',
    skills: ['TypeScript', 'Express', 'Redis', 'Docker'],
    aboutMe: 'Backend engineer focused on scalable API design and microservices.',
    experience: ['Senior Backend Engineer at FinTrack (2021–2024)', 'Backend Engineer at CodeKraft (2019–2021)'],
    status: 'ACTIVE'
  });

  const kavya = await seedUser({
    email: 'kavya.menon@company.com',
    fullName: 'Kavya Menon',
    employeeId: 'EMP1004',
    role: 'EMPLOYEE',
    jobTitle: 'Frontend Engineer',
    department: 'Engineering',
    team: 'Frontend Engineering',
    managerName: 'Priya Sharma',
    location: 'Bengaluru HQ',
    phone: '+91 99887 12345',
    skills: ['React', 'TypeScript', 'TailwindCSS', 'Vite'],
    aboutMe: 'Frontend engineer crafting the Deskly UI with real-time dashboards.',
    experience: ['Frontend Engineer at PixelWorks (2020–Present)'],
    status: 'ACTIVE'
  });

  const rahul = await seedUser({
    email: 'rahul.verma@company.com',
    fullName: 'Rahul Verma',
    employeeId: 'EMP1005',
    role: 'EMPLOYEE',
    jobTitle: 'DevOps Engineer',
    department: 'Engineering',
    team: 'Infrastructure & Security',
    managerName: 'Priya Sharma',
    location: 'Bengaluru HQ',
    phone: '+91 95555 55555',
    skills: ['Kubernetes', 'AWS', 'CI/CD', 'Terraform'],
    aboutMe: 'DevOps engineer managing deployments and infra availability.',
    experience: ['DevOps Engineer at CloudNine (2019–Present)'],
    status: 'AWAY'
  });

  const nisha = await seedUser({
    email: 'nisha.patel@company.com',
    fullName: 'Nisha Patel',
    employeeId: 'EMP1006',
    role: 'EMPLOYEE',
    jobTitle: 'QA Engineer',
    department: 'Engineering',
    team: 'Quality Assurance',
    managerName: 'Priya Sharma',
    location: 'Pune',
    phone: '+91 94444 88888',
    skills: ['Playwright', 'Cypress', 'API Testing'],
    aboutMe: 'QA engineer automating end-to-end test coverage for Deskly.',
    experience: ['QA Engineer at TestOps (2021–Present)'],
    status: 'ACTIVE'
  });

  const allUsers = [sushmitha, priya, arjun, kavya, rahul, nisha];

  await prisma.project.createMany({
    data: [
      { name: 'Deskly Cloud Platform', description: 'Enterprise collaboration and management platform.', status: 'On Track', progress: 78, dueDate: '2026-10-30', ownerId: sushmitha.id, department: 'Engineering' },
      { name: 'Mobile App Refresh', description: 'Native mobile app redesign and Android/iOS release.', status: 'At Risk', progress: 42, dueDate: '2026-12-15', ownerId: priya.id, department: 'Engineering' },
      { name: 'Security & Compliance', description: 'SOC2 readiness and security hardening.', status: 'On Track', progress: 30, dueDate: '2027-01-10', ownerId: sushmitha.id, department: 'Security' }
    ]
  });

  await prisma.task.createMany({
    data: [
      { title: 'Design API v2 rate limiting', description: 'Handle high-volume API traffic with throttling.', status: 'IN_PROGRESS', priority: 'URGENT', projectName: 'Deskly Cloud Platform', assigneeId: sushmitha.id, creatorId: priya.id, dueDate: '2026-08-15', progress: 65, tags: JSON.stringify(['backend', 'api']) },
      { title: 'Prisma schema migration strategy', description: 'Production PostgreSQL migration plan.', status: 'TODO', priority: 'HIGH', projectName: 'Deskly Cloud Platform', assigneeId: arjun.id, creatorId: priya.id, dueDate: '2026-08-20', progress: 20, tags: JSON.stringify(['database']) },
      { title: 'Manager team-status endpoint', description: 'Live direct-report status aggregation API.', status: 'COMPLETED', priority: 'HIGH', projectName: 'Deskly Cloud Platform', assigneeId: sushmitha.id, creatorId: sushmitha.id, dueDate: '2026-08-08', progress: 100, tags: JSON.stringify(['backend']) },
      { title: 'Design new meeting scheduling UI', description: 'Revamped schedule calendar for the dashboard.', status: 'IN_PROGRESS', priority: 'MEDIUM', projectName: 'Mobile App Refresh', assigneeId: kavya.id, creatorId: priya.id, dueDate: '2026-08-25', progress: 55, tags: JSON.stringify(['frontend', 'ui']) }
    ]
  });

  const today = new Date().toISOString().split('T')[0];
  await prisma.attendance.createMany({
    data: [
      { userId: sushmitha.id, date: today, checkIn: '09:12 AM', checkOut: null, totalHours: null, location: 'Office', status: 'Present' },
      { userId: arjun.id, date: today, checkIn: '09:35 AM', checkOut: null, totalHours: null, location: 'Remote', status: 'Present' },
      { userId: kavya.id, date: today, checkIn: '08:58 AM', checkOut: null, totalHours: null, location: 'Office', status: 'Present' },
      { userId: nisha.id, date: today, checkIn: '09:02 AM', checkOut: null, totalHours: null, location: 'Office', status: 'Present' }
    ]
  });

  await prisma.document.createMany({
    data: [
      { title: 'Deskly HR Policy Handbook 2026', category: 'HR', fileUrl: '/uploads/hr-handbook-2026.pdf', fileSize: '1.2 MB', fileType: 'pdf', isConfidential: true, uploadedById: sushmitha.id },
      { title: 'Engineering Onboarding Guide', category: 'Team', fileUrl: '/uploads/onboarding-engineering.pdf', fileSize: '480 KB', fileType: 'pdf', isConfidential: false, uploadedById: priya.id },
      { title: 'Security & Access Policy', category: 'Security', fileUrl: '/uploads/security-policy.pdf', fileSize: '300 KB', fileType: 'pdf', isConfidential: true, uploadedById: sushmitha.id },
      { title: 'Leave Policy & Balances', category: 'HR', fileUrl: '/uploads/leave-policy.pdf', fileSize: '250 KB', fileType: 'pdf', isConfidential: false, uploadedById: priya.id }
    ]
  });

  await prisma.recognition.create({
    data: {
      giverId: sushmitha.id,
      receiverId: kavya.id,
      badgeType: 'Rising Star',
      message: 'Shipped the meeting scheduling UI two days ahead of schedule — brilliant work!'
    }
  });

  const announcementCount = await prisma.announcement.count();
  if (announcementCount === 0) {
    await prisma.announcement.createMany({
      data: [
        { title: 'Welcome to Deskly Enterprise v2.0!', content: 'Your company management platform is now live with real-time attendance, leave automation, and manager oversight.', author: 'Deskly Team', target: 'ALL', tag: 'Important' },
        { title: 'Getting Started', content: 'Use sushmitha.rg@company.com or priya.sharma@company.com to sign in. Try Clock-In/Out, apply for leave, and approve requests.', author: 'HR Department', target: 'ALL', tag: 'General' },
        { title: 'Security Reminder', content: 'Passwords are stored using bcrypt hashing. Never share your credentials. Login alerts are emailed to you.', author: 'IT Security', target: 'ALL', tag: 'Important' }
      ]
    });
  }

  console.log('✅ Database seeded:');
  console.log(`   • ${allUsers.length} users (password: ${PASSWORD})`);
  console.log('   • 3 projects, 4 tasks, today attendance, 4 documents, recognitions, announcements');

  console.log('\nAccounts:');
  allUsers.forEach(u => console.log(`   ${u.email.padEnd(32)} ${u.role.padEnd(12)} ${u.fullName}`));
  console.log('\n👉 Backend : http://localhost:5000');
  console.log('   Frontend: http://localhost:3001');
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async e => { console.error('❌ Seed error:', e); process.exit(1); });