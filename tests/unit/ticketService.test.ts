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
    ticketStatusHistory: {
      create: vi.fn().mockResolvedValue({ id: 'status_history_1' }),
    },
    ticketAssignmentHistory: {
      create: vi.fn().mockResolvedValue({ id: 'assignment_history_1' }),
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

  it('rejects a ticket when the creator does not exist', async () => {
    const prisma = createMockPrisma();
    prisma.user.findUnique.mockResolvedValueOnce(null);
    const service = createTicketService(prisma as never);

    await expect(
      service.createTicket({
        title: 'Need help',
        description: 'The requester id does not exist',
        priority: Priority.LOW,
        createdBy: 'missing_user',
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

  it('records structured history when a ticket status changes', async () => {
    const prisma = createMockPrisma();
    prisma.ticket.findUnique.mockResolvedValueOnce(
      mockTicket({ status: TicketStatus.IN_PROGRESS, assigneeId: 'agent_1' }),
    );
    prisma.ticket.update.mockResolvedValueOnce(
      mockTicket({ status: TicketStatus.RESOLVED, assigneeId: 'agent_1' }),
    );
    const service = createTicketService(prisma as never);

    await service.updateTicket('ticket_1', {
      status: TicketStatus.RESOLVED,
      actorId: 'user_agent_1',
    });

    expect(prisma.ticketStatusHistory.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        ticketId: 'ticket_1',
        changedBy: 'user_agent_1',
        fromStatus: TicketStatus.IN_PROGRESS,
        toStatus: TicketStatus.RESOLVED,
      }),
    });
  });
});
