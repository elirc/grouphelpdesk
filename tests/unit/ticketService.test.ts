// Author: Morgan Lee
// Issue: #10 â€” Test ticket service with mocked Prisma

import { describe, expect, it, vi } from 'vitest';
import { Priority, TicketStatus, UserRole } from '@helpdesk/shared';

import { createTicketService } from '../../packages/server/src/services/ticketService';
import { NotFoundError, ValidationError } from '../../packages/server/src/utils/errors';

const now = new Date('2026-05-20T12:00:00.000Z');

function mockTicket(overrides = {}) {
  return {
    id: 'ticket_1',
    title: 'Example',
    description: 'Example description',
    status: TicketStatus.OPEN,
    priority: Priority.MEDIUM,
    createdBy: 'user_requester_1',
    assigneeId: null,
    teamId: null,
    tags: ['access'],
    createdAt: now,
    updatedAt: now,
    resolvedAt: null,
    closedAt: null,
    ...overrides,
  };
}

function createMockPrisma() {
  return {
    user: {
      findUnique: vi.fn().mockResolvedValue({ id: 'user_requester_1', role: UserRole.REQUESTER }),
    },
    ticket: {
      create: vi.fn().mockResolvedValue(mockTicket()),
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([mockTicket()]),
      findUnique: vi.fn().mockResolvedValue(mockTicket()),
      update: vi
        .fn()
        .mockResolvedValue(mockTicket({ status: TicketStatus.IN_PROGRESS, assigneeId: 'agent_1' })),
      delete: vi.fn().mockResolvedValue(mockTicket()),
    },
    activityLog: {
      create: vi.fn().mockResolvedValue({ id: 'activity_1' }),
    },
  };
}

describe('ticketService', () => {
  it('creates a ticket and writes an activity log entry', async () => {
    const prisma = createMockPrisma();
    const service = createTicketService(prisma as never);

    const ticket = await service.createTicket({
      title: 'Need help',
      description: 'Something is broken',
      priority: Priority.HIGH,
      createdBy: 'user_requester_1',
      tags: ['help'],
    });

    expect(ticket.title).toBe('Example');
    expect(prisma.ticket.create).toHaveBeenCalled();
    expect(prisma.activityLog.create).toHaveBeenCalled();
  });

  it('rejects a ticket without a title', async () => {
    const service = createTicketService(createMockPrisma() as never);

    await expect(
      service.createTicket({
        title: '',
        description: 'Missing title',
        priority: Priority.LOW,
        createdBy: 'user_requester_1',
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('throws not found when updating a missing ticket', async () => {
    const prisma = createMockPrisma();
    prisma.ticket.findUnique.mockResolvedValueOnce(null);
    const service = createTicketService(prisma as never);

    await expect(service.updateTicket('missing', { title: 'Nope' })).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });
});
