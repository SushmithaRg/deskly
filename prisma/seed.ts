// Deskly Database Seed Script
// Creates initial announcement data (users are created via registration)
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding Deskly database...');

  // Create initial announcements
  const existing = await prisma.announcement.count();
  if (existing === 0) {
    await prisma.announcement.createMany({
      data: [
        {
          title: '🎉 Welcome to Deskly Enterprise v2.0!',
          content: 'Your company management platform is now live. Use the navigation to explore Tasks, Attendance, Documents, OKRs, and more. Sign up with your company email to get started.',
          author: 'Deskly Team',
          target: 'ALL',
          tag: 'Important'
        },
        {
          title: '📋 Getting Started Guide',
          content: 'Managers can approve leave requests, assign tasks, and post announcements. Employees can check in, apply for leave, upload documents, and track OKRs.',
          author: 'HR Department',
          target: 'ALL',
          tag: 'General'
        },
        {
          title: '🔐 Security: Set Up Your Profile',
          content: 'Please complete your profile with emergency contact details and update your skills. Your password is securely hashed with bcrypt — never share it.',
          author: 'IT Security',
          target: 'ALL',
          tag: 'Important'
        }
      ]
    });
    console.log('✅ Created initial announcements');
  } else {
    console.log('⏭️  Announcements already exist, skipping...');
  }

  console.log('\n✅ Database seeded successfully!');
  console.log('👉 Register your first account at http://localhost:3001');
}

seed()
  .catch(e => { console.error('❌ Seed error:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
