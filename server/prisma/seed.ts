import { PrismaClient } from '@prisma/client';
import crypto from 'node:crypto';

const prisma = new PrismaClient();

// Helper to hash password using Node built-in crypto (no external c++ build deps needed like bcrypt)
function hashPassword(password: string): string {
  const salt = 'acowale_salt_2026';
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

async function main() {
  console.log('🌱 Starting database seeding for Acowale Pulse CRM...');

  // Clean existing tables
  await prisma.auditLog.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.adminUser.deleteMany();

  // 1. Seed Admin User
  const demoAdmin = await prisma.adminUser.create({
    data: {
      email: 'admin@acowale.com',
      passwordHash: hashPassword('AcowaleDemo2026'),
      name: 'Abhishek (Product Lead)',
      role: 'SUPER_ADMIN',
    },
  });
  console.log(`👤 Created Demo Admin: ${demoAdmin.email} / AcowaleDemo2026`);

  // 2. Seed Realistic Customer Feedback spanning the last 14 days
  const categories = ['Bug Report', 'Feature Request', 'UI/UX', 'Performance', 'Praise', 'Other'];
  const statuses = ['NEW', 'REVIEWED', 'IN_PROGRESS', 'RESOLVED'];

  const sampleFeedbacks = [
    {
      title: 'Dashboard loading is slightly slow on mobile',
      category: 'Performance',
      rating: 3,
      comment: 'When I open the analytics console on my iPhone 15 Pro over 4G, it takes about 3 seconds to render the charts. Can we add skeleton loaders?',
      userEmail: 'devin@techflow.io',
      userName: 'Devin Vance',
      status: 'IN_PROGRESS',
      adminNotes: 'Assigned to Frontend optimization sprint. Implementing CSS skeleton shimmers.',
      daysAgo: 1,
    },
    {
      title: 'Dark mode colors are absolutely stunning!',
      category: 'Praise',
      rating: 5,
      comment: 'The new glassmorphism cards and vibrant neon accents on the feedback CRM are world-class. #TeamAcowale really nailed the aesthetics!',
      userEmail: 'sarah.k@acowale.com',
      userName: 'Sarah Jenkins',
      status: 'RESOLVED',
      adminNotes: 'Shared with the UI/UX design team during standup!',
      daysAgo: 2,
    },
    {
      title: 'Need ability to export category distribution to CSV',
      category: 'Feature Request',
      rating: 4,
      comment: 'Our product managers want to present the weekly trend analysis in quarterly stakeholder meetings. An export to CSV/PDF button would be amazing.',
      userEmail: 'marcus@globalscale.com',
      userName: 'Marcus Aurelius',
      status: 'REVIEWED',
      adminNotes: 'Added to Q3 roadmap backlog. High priority from enterprise users.',
      daysAgo: 3,
    },
    {
      title: 'Error when submitting feedback without an email',
      category: 'Bug Report',
      rating: 2,
      comment: 'Sometimes anonymous users try to submit feedback and get a generic validation toast. We should make it clearer that email is optional or required.',
      userEmail: 'alex.r@testinghub.net',
      userName: 'Alex Rivera',
      status: 'RESOLVED',
      adminNotes: 'Fixed Zod optional schema field in backend v1.0.2.',
      daysAgo: 4,
    },
    {
      title: 'Add emoji reaction picker for rating instead of just numbers',
      category: 'UI/UX',
      rating: 5,
      comment: 'Using mood emojis (😡 😕 😐 🙂 😍) makes feedback submission much more engaging than a plain 1-5 dropdown!',
      userEmail: 'elena@designstudio.org',
      userName: 'Elena Rostova',
      status: 'RESOLVED',
      adminNotes: 'Implemented interactive mood emojis in FeedbackForm component!',
      daysAgo: 5,
    },
    {
      title: 'Webhook integration for Slack notifications',
      category: 'Feature Request',
      rating: 4,
      comment: 'It would save us so much time if critical bug reports (rating <= 2) triggered an instant notification in our #eng-alerts Slack channel.',
      userEmail: 'chen.w@acowale.com',
      userName: 'Chen Wei',
      status: 'NEW',
      adminNotes: null,
      daysAgo: 6,
    },
    {
      title: 'Search bar autocomplete would improve UX',
      category: 'UI/UX',
      rating: 4,
      comment: 'When filtering through hundreds of submissions on the Admin Console, highlighting search keywords in real-time is great, but autocomplete would be even better.',
      userEmail: 'tanya@webmetrics.io',
      userName: 'Tanya Sharma',
      status: 'REVIEWED',
      adminNotes: 'Evaluating debounced search highlighting.',
      daysAgo: 7,
    },
    {
      title: 'API rate limiting works as expected during stress test',
      category: 'Praise',
      rating: 5,
      comment: 'We ran a quick load test against the /api/feedback endpoint and the 429 Too Many Requests response kicked in gracefully. Solid production engineering!',
      userEmail: 'sec-ops@acowale.com',
      userName: 'Acowale SecOps',
      status: 'RESOLVED',
      adminNotes: 'Verified with express-rate-limit 30 req/15min rule.',
      daysAgo: 8,
    },
    {
      title: 'Pagination limit toggle on dashboard',
      category: 'Feature Request',
      rating: 3,
      comment: 'Currently showing 10 items per page. Can we get a dropdown to select 25, 50, or 100 items per view?',
      userEmail: 'liam@dataops.co',
      userName: 'Liam O’Connor',
      status: 'NEW',
      adminNotes: null,
      daysAgo: 9,
    },
    {
      title: 'Memory leak check on long-running node process',
      category: 'Performance',
      rating: 4,
      comment: 'The health check endpoint (/api/health) is super helpful! We noticed heap memory stays stable at around 45MB even under steady load.',
      userEmail: 'infra@acowale.com',
      userName: 'DevOps Team',
      status: 'RESOLVED',
      adminNotes: 'Monitoring via automated uptime check.',
      daysAgo: 10,
    },
    {
      title: 'Category pills are easy to read and click',
      category: 'UI/UX',
      rating: 5,
      comment: 'Love the color-coded category tags on the dashboard. Makes scanning through bug reports versus feature requests effortless.',
      userEmail: 'claire@uxworld.com',
      userName: 'Claire Bennett',
      status: 'RESOLVED',
      adminNotes: null,
      daysAgo: 11,
    },
    {
      title: 'Need automated regression tests in CI/CD pipeline',
      category: 'Other',
      rating: 4,
      comment: 'To maintain high velocity as #TeamAcowale scales, let us ensure GitHub Actions runs Vitest on every pull request before merging.',
      userEmail: 'qa-lead@acowale.com',
      userName: 'QA Lead',
      status: 'RESOLVED',
      adminNotes: 'Implemented in .github/workflows/ci.yml!',
      daysAgo: 12,
    },
    {
      title: 'Slight delay when searching with special characters',
      category: 'Bug Report',
      rating: 3,
      comment: 'Searching for "%" or "_" in the search box caused a minor SQLite syntax wildcard glitch. Should escape search parameters.',
      userEmail: 'bug-hunter@sec.org',
      userName: 'Samira Khan',
      status: 'IN_PROGRESS',
      adminNotes: 'Sanitized search query in feedback repository.',
      daysAgo: 13,
    },
    {
      title: 'Overall platform feels snappy and responsive',
      category: 'Praise',
      rating: 5,
      comment: 'From submission to analytics computation, everything feels instantaneous. Great job on clean architecture and minimal overhead!',
      userEmail: 'vp-eng@acowale.com',
      userName: 'VP of Engineering',
      status: 'RESOLVED',
      adminNotes: 'Kudos to Abhishek for the machine test implementation!',
      daysAgo: 14,
    }
  ];

  for (const item of sampleFeedbacks) {
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - item.daysAgo);
    
    await prisma.feedback.create({
      data: {
        title: item.title,
        category: item.category,
        rating: item.rating,
        comment: item.comment,
        userEmail: item.userEmail,
        userName: item.userName,
        status: item.status,
        adminNotes: item.adminNotes,
        createdAt: createdAt,
        updatedAt: createdAt,
      },
    });
  }

  console.log(`✅ Successfully seeded ${sampleFeedbacks.length} feedback items spanning 14 days!`);
  console.log('🏁 Seeding complete.');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
