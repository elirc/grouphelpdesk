// Author: Alex Chen
// Issue: #2 â€” Seed development data for tickets, users, and articles

import { PrismaClient } from '@prisma/client';
import { Priority, TicketStatus, UserRole } from '@helpdesk/shared';

import { hashPassword } from '../src/utils/password';

const prisma = new PrismaClient();

async function main() {
  await prisma.activityLog.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.article.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.user.deleteMany();

  const [customerPassword, agentPassword, adminPassword] = await Promise.all([
    hashPassword('customer123'),
    hashPassword('agent123'),
    hashPassword('admin123'),
  ]);

  const [requester, agent, admin] = await Promise.all([
    prisma.user.create({
      data: {
        id: 'user_requester_1',
        name: 'Riley Requester',
        email: 'riley.requester@example.com',
        passwordHash: customerPassword,
        role: UserRole.CUSTOMER,
        teamId: null,
      },
    }),
    prisma.user.create({
      data: {
        id: 'user_agent_1',
        name: 'Avery Agent',
        email: 'avery.agent@example.com',
        passwordHash: agentPassword,
        role: UserRole.AGENT,
        teamId: 'team-it',
      },
    }),
    prisma.user.create({
      data: {
        id: 'user_admin_1',
        name: 'Casey Admin',
        email: 'casey.admin@example.com',
        passwordHash: adminPassword,
        role: UserRole.ADMIN,
        teamId: 'team-ops',
      },
    }),
  ]);

  const sampleTickets = [
    ['Cannot access payroll dashboard', TicketStatus.OPEN, Priority.HIGH, ['payroll', 'access']],
    ['Laptop battery drains quickly', TicketStatus.IN_PROGRESS, Priority.MEDIUM, ['hardware']],
    ['VPN disconnects every hour', TicketStatus.WAITING, Priority.HIGH, ['network', 'vpn']],
    ['Request new design software', TicketStatus.RESOLVED, Priority.LOW, ['software']],
    ['Email forwarding broken', TicketStatus.CLOSED, Priority.URGENT, ['email']],
    ['Printer offline on floor 4', TicketStatus.OPEN, Priority.LOW, ['printer']],
    ['New hire needs account setup', TicketStatus.IN_PROGRESS, Priority.MEDIUM, ['onboarding']],
    ['Shared drive permission issue', TicketStatus.WAITING, Priority.MEDIUM, ['permissions']],
    ['Customer demo room display flickers', TicketStatus.OPEN, Priority.HIGH, ['av']],
    ['Knowledge base typo report', TicketStatus.RESOLVED, Priority.LOW, ['docs']],
  ] as const;

  for (const [title, status, priority, tags] of sampleTickets) {
    const now = new Date();
    await prisma.ticket.create({
      data: {
        title,
        description: `Sample seeded ticket for ${title.toLowerCase()}.`,
        status,
        priority,
        createdBy: requester.id,
        assigneeId: status === TicketStatus.OPEN ? null : agent.id,
        teamId: 'team-it',
        tags: JSON.stringify(tags),
        resolvedAt: status === TicketStatus.RESOLVED || status === TicketStatus.CLOSED ? now : null,
        closedAt: status === TicketStatus.CLOSED ? now : null,
      },
    });
  }

  await prisma.article.createMany({
    data: [
      {
        title: 'How to reset your VPN profile',
        body: '# Reset VPN\n\nDisconnect, remove the old profile, and sign in again.',
        category: 'Network',
        tags: JSON.stringify(['vpn', 'network']),
        authorId: admin.id,
      },
      {
        title: 'Payroll dashboard access checklist',
        body: '# Payroll Access\n\nConfirm SSO group membership and browser permissions.',
        category: 'Access',
        tags: JSON.stringify(['payroll', 'access']),
        authorId: admin.id,
      },
    ],
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
